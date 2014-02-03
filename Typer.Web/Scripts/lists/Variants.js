function VariantSet(editEntity, properties) {
    this.VariantSet = true;
    var self = this;
    self.eventHandler = new EventHandler();
    self.editEntity = editEntity;
    self.id = properties.Id;
    self.languageId = properties.LanguageId;
    self.wordtype = WORDTYPE.getItem(properties.WordType);
    self.tag = properties.VariantTag;

    self.params = properties.Params;

    self.raw = {
        variants: properties.Variants,
        related: properties.Related,
        dependants: properties.Dependants
    };

}
VariantSet.prototype.bind = function (e) {
    this.eventHandler.bind(e);
};
VariantSet.prototype.trigger = function (e) {
    this.eventHandler.trigger(e);
};
VariantSet.prototype.createDetails = function () {
    this.loadVariants(this.raw.variants);
    this.loadConnections(this.raw.related);
    this.loadDependants(this.raw.dependants);
    this.variants.each(function (key, value) {
        value.loadLimits();
    });
};
VariantSet.prototype.loadVariants = function (variants) {
    var self = this;
    this.variants = new HashTable(null);
    for (var i = 0; i < variants.length; i++) {
        var object = variants[i];
        var variant = new Variant(self.editEntity, self, object);
        self.variants.setItem(variant.id, variant);
        self.language.addVariant(variant);
    }
};
VariantSet.prototype.loadConnections = function (connections) {
    this.connections = new HashTable(null);
    for (var i = 0; i < connections.length; i++) {
        var connection = this.editEntity.getVariantSet(connections[i]);
        if (connection) {
            this.connections.setItem(connection.id, connection);
        }
    }
};
VariantSet.prototype.loadDependants = function (dependants) {
    var self = this;
    self.dependants = new HashTable(null);
    for (var i = 0; i < dependants.length; i++) {
        var dependant = self.editEntity.getVariantSet(dependants[i]);
        if (dependant) {
            self.dependants.setItem(dependant.id, dependant);
            dependant.setParent(self);
        }
    }
};
VariantSet.prototype.setParent = function (set, trigger) {
    this.parent = set;
    if (trigger) {
        this.trigger({
            type: 'setParent',
            parent: set
        });
    }

};
VariantSet.prototype.clearParent = function () {
    var self = this;
    if (this.parent) {
        this.parent.removeDependency(this);
    }
    this.trigger({
        type: 'clearParent',
        parent: self.parent
    });

    this.parent = null;

};
VariantSet.prototype.removeDependency = function (set) {
    this.dependants.removeItem(set.id);
    this.trigger({
        type: 'dependencyRemoved',
        dependant: set
    });

};
VariantSet.prototype.getLanguageId = function () {
    return this.languageId;
};
VariantSet.prototype.edit = function () {
    var panel = new VariantSetEditPanel(this);
    panel.display();
};
VariantSet.prototype.changeWordtype = function (wordtype) {
    var self = this;
    if (wordtype === this.wordtype) return;
    var wasDependable = self.language.isDependable(self.wordtype.id);
    self.wordtype = wordtype;
    var isDependable = self.language.isDependable(wordtype.id);
    self.trigger({
        type: 'changeWordtype',
        wordtype: wordtype,
        wasDependable: wasDependable,
        isDependable: isDependable
    });
};


function Variant(editEntity, set, properties) {
    this.Variant = true;
    var self = this;
    self.editEntity = editEntity;
    self.set = set;
    self.language = set.language;
    self.id = properties.Id;
    self.key = properties.Key;
    self.content = properties.Content;
    self.wordId = properties.wordId;
}
Variant.prototype.loadLimits = function () {
    this.excluded = new HashTable(null);
};


















function VariantPanel(properties) {
    this.VariantPanel = true;
    var self = this;
    self.events = new EventHandler();
    self.question = properties.question;
    self.editQuestion = properties.editQuestion;
    self.groups = new HashTable(null);
    self.counter = 0;

    this.loadGroups();

    this.validator = (function () {
        var invalid = new HashTable(null);

        return {
            validation: function (e) {
                if (e.status) {
                    invalid.removeItem(e.id);
                } else {
                    invalid.setItem(e.id, e.id);
                }

                self.editQuestion.trigger({
                    type: 'variantsValidation',
                    status: invalid.size() === 0
                });

            }
        };

    })();

    this.ui = (function () {
        var background = jQuery('<div/>', {
            'class': 'edit-background',
            'z-index': my.ui.addTopLayer()
        }).appendTo($(document.body));

        var frame = jQuery('<div/>', {
            'class': 'edit-frame'
        }).appendTo($(background));

        var container = jQuery('<div/>', {
            'class': 'edit-container'
        }).appendTo($(frame));

        // ReSharper disable once UnusedLocals
        var close = jQuery('<div/>', {
            'class': 'edit-close'
        }).bind({
            'click': function () {
                self.cancel();
            }
        }).appendTo($(frame));

        return {
            display: function () {
                $(background).css({
                    'visibility': 'visible',
                    'z-index': my.ui.addTopLayer()
                });
            },
            hide: function () {
                $(background).css({
                    'visibility': 'hidden'
                });
            },
            destroy: function () {
                $(background).remove();
            },
            append: function (element) {
                $(element).appendTo($(container));
            }
        };

    })();

    this.options = new VariantOptionsManager(this);

    this.connections = new VariantConnectionsManager(this);

    this.limits = new VariantLimitsManager(this);

    this.dependencies = new VariantDependenciesManager(this);

    this.loadDependenciesDefinitions = (function () {
        var languagesIds = self.editQuestion.getLanguagesIds();
        $.ajax({
            url: '/Questions/GetDependenciesDefinitions',
            type: "GET",
            data: {
                'languages': languagesIds
            },
            traditional: true,
            datatype: "json",
            async: true,
            cache: false,
            success: function (result) {
                for (var i = 0; i < result.length; i++) {
                    var definition = result[i];
                    var languageId = definition.LanguageId;
                    var masterId = definition.MasterWordtypeId;
                    var slaveId = definition.SlaveWordtypeId;
                    //Load this definition to the given language.
                    var language = self.editQuestion.getLanguage(languageId);
                    if (language) {
                        language.addDependencyDefinition({
                            master: masterId,
                            slave: slaveId
                        });
                    }
                }
                self.dependencies.initialize();
            },
            error: function (msg) {
                alert(msg.status + " | " + msg.statusText);
                return null;
            }
        });

    })();

    this.buttons = (function () {
        var panel = jQuery('<div/>', {
            'class': 'edit-buttons-panel'
        });

        var container = jQuery('<div/>', {
            'class': 'edit-buttons-container'
        }).appendTo($(panel));

        var ok = jQuery('<input/>', {
            'class': 'edit-button',
            'type': 'submit',
            'value': 'OK'
        }).bind({
            'click': function () {
                self.confirm();
            }
        }).appendTo($(container));

        // ReSharper disable once UnusedLocals
        var cancel = jQuery('<input/>', {
            'class': 'edit-button',
            'type': 'submit',
            'value': 'Cancel'
        }).bind({
            'click': function () {
                self.cancel();
            }
        }).appendTo($(container));

        self.ui.append(panel);

        self.editQuestion.bind({
            variantsValidation: function (e) {
                if (e.status) {
                    $(ok).removeAttr('disabled');
                } else {
                    $(ok).attr('disabled', 'disabled');
                }
            }
        });

    })();

}
VariantPanel.prototype.trigger = function (e) {
    this.events.trigger(e);
};
VariantPanel.prototype.bind = function (e) {
    this.events.bind(e);
};
VariantPanel.prototype.display = function () {
    this.ui.display();
};
VariantPanel.prototype.cancel = function () {
    this.ui.destroy();
};
VariantPanel.prototype.confirm = function () {
    //this.object.update(this.editObject, this.properties, this.details, this.isComplete());
    this.ui.destroy();
};
VariantPanel.prototype.isComplete = function () {
    //var forms = this.details.forms;
    //var complete = true;
    //forms.each(function (key, value) {
    //    if (complete && value.active && !value.header && !value.value) {
    //        complete = false;
    //    }
    //});
    //return complete;
};
VariantPanel.prototype.start = function () {
    this.display();
};
VariantPanel.prototype.loadGroups = function () {
    var self = this;
    var assigned = new HashTable(null);

    function addSet(group, set) {
        group.addSet(set);
        assigned.setItem(set.id, set);
    }

    this.editQuestion.variantsSets.each(function (key, value) {
        var id = value.id;
        if (!assigned.hasItem(id)) {
            var group = new VariantGroup({ id: ++self.counter });
            group.bind({
                remove: function () {
                    if (group.isEmpty()) self.removeGroup(group);
                }
            });
            addSet(group, value);
            value.connections.each(function ($key, $value) {
                addSet(group, $value);
            });
            self.groups.setItem(group.id, group);
        }
    });
};
VariantPanel.prototype.newGroup = function (set) {
    var self = this;
    var group = new VariantGroup({ id: ++self.counter });
    group.addSet(set);

    group.bind({
        remove: function () {
            if (group.isEmpty()) self.removeGroup(group);
        }
    });

    group.trigger({
        type: 'add',
        set: set
    });

    this.events.trigger({
        type: 'newGroup',
        group: group
    });

};
VariantPanel.prototype.removeGroup = function (group) {

    this.groups.removeItem(group.id);

    this.trigger({
        type: 'removeGroup',
        group: group
    });

};


function VariantGroup(properties) {
    this.VariantGroup = true;
    var self = this;
    self.id = properties.id;
    self.events = new EventHandler();
    self.sets = new HashTable(null);

    self.events.bind({
        add: function (e) {
            self.addSet(e.set);
        },
        remove: function (e) {
            self.removeSet(e.set);
        }
    });

}
VariantGroup.prototype.trigger = function (e) {
    this.events.trigger(e);
};
VariantGroup.prototype.bind = function (e) {
    this.events.bind(e);
};
VariantGroup.prototype.addSet = function (set) {
    this.sets.setItem(set.id, set);
};
VariantGroup.prototype.removeSet = function (set) {
    this.sets.removeItem(set.id);
};
VariantGroup.prototype.isEmpty = function () {
    return this.sets.size() === 0;
};


function VariantSubpanel(parent, name) {
    this.VariantSubpanel = true;
    var self = this;
    self.name = name;
    self.parent = parent;
    self.question = parent.question;
    self.editQuestion = parent.editQuestion;

    self.ui = (function () {
        var expanded = false;

        var container = jQuery('<div/>', {
            'class': 'variant-subpanel'
        });
        self.parent.ui.append(container);

        var header = jQuery('<div/>', {
            'class': 'variant-subpanel-header'
        }).appendTo(container);

        // ReSharper disable once UnusedLocals
        var expander = jQuery('<div/>', {
            'class': 'variant-subpanel-expander'
        }).bind({
            click: function () {
                if (expanded === true) {
                    collapse();
                } else {
                    expand();
                }
            }
        }).appendTo(header);


        // ReSharper disable once UnusedLocals
        var nameLabel = jQuery('<div/>', {
            'class': 'unselectable variant-subpanel-name',
            html: self.name
        }).appendTo(header);

        var content = jQuery('<div/>', {
            'class': 'variant-subpanel-content'
        }).css({
            'display': (expanded ? 'block' : 'none')
        }).appendTo(container);


        function collapse() {
            expanded = false;
            refresh();
        }

        function expand() {
            expanded = true;
            refresh();
        }

        function refresh() {
            $(content).css({
                'display': (expanded ? 'block' : 'none')
            });
        }

        return {
            content: content
        };

    })();

}
VariantSubpanel.prototype.contentPanel = function () {
    return this.ui.content;
};


function VariantOptionsManager(parent) {
    VariantSubpanel.call(this, parent, 'Options');
    this.VariantOptionsManager = true;
    var self = this;
    self.panel = self.ui.content;
    self.groups = new HashTable(null);      //connection groups

    var groupViews = (function () {
        var container = jQuery('<div/>', {
            'class': 'variant-options-groups'
        });
        $(container).appendTo(self.panel);

        return {
            clear: function () {
                $(container).empty();
            },
            add: function (element) {
                $(element).appendTo(container);
            }
        };

    })();

    var setBlock = function (set) {
        var group;
        var $self;
        var $set = set;

        var ui = (function () {
            var container = jQuery('<div/>', {
                'class': 'variant-set-block'
            });

            // ReSharper disable once UnusedLocals
            var flag = jQuery('<div/>', {
                'class': 'unselectable flag ' + set.language.language.flag + '-small'
            }).appendTo(container);

            var name = jQuery('<div/>', {
                'class': 'unselectable name',
                html: set.tag
            }).appendTo(container);

            set.bind({
                rename: function (e) {
                    $(name).html(e.name);
                }
            });

            return {
                container: function () {
                    return container;
                },
                destroy: function () {
                    $(container).remove();
                }
            };

        })();

        return {
            selfinject: function (me) {
                $self = me;
            },
            setGroup: function ($group) {
                group = $group;
            },
            id: $set.id,
            view: function () {
                return ui.container();
            },
            destroy: ui.destroy
        };

    };

    var connectionGroup = function (group) {
        var $self = null;
        var $index = group.id;
        var $blocks = new HashTable(null);
        var $active = false;
        var $group = group;
        var $optionsManager;

        var container = jQuery('<div/>', {
            'class': 'variant-options-group variant-connection-group'
        }).bind({
            click: function () {
                var previous = self.activeGroup;
                if (previous === $self) return;
                if (previous) {
                    previous.deactivate();
                }
                $self.activate();
            }
        });
        groupViews.add(container);

        function createBlocks() {
            $group.sets.each(function (key, value) {
                var block = setBlock(value);
                block.selfinject(block);
                addBlock(block);
            });
        }

        function refresh() {
            if ($active) {
                $(container).addClass('active');
            } else {
                $(container).removeClass('active');
            }

        }

        function addBlock(block) {
            $blocks.setItem(block.id, block);
            block.setGroup($self);
            block.view().appendTo(container);
        }

        function removeBlock(block) {
            $blocks.removeItem(block.id);
            block.destroy();
            if ($blocks.size() === 0) destroy();
        }

        function getBlock(id) {
            return $blocks.getItem(id);
        }

        function destroy() {
            $(container).remove();
            self.groups.removeItem($index);
        }

        function activate() {
            self.activeGroup = $self;
            $active = true;
            refresh();

            //Show options panel.
            if (!$optionsManager) {
                $optionsManager = new GroupOptionsManager({
                    parent: self,
                    group: $group
                });
            }
            $optionsManager.show();

        }

        function deactivate() {
            if (self.activeGroup === $self) {
                self.activeGroup = null;
                $active = false;
                refresh();
            }

            if ($optionsManager && $optionsManager.visible) {
                $optionsManager.hide();
            }

        }

        function refreshOptionsManager() {
            if ($optionsManager) {
                var visible = $optionsManager.visible;
                $optionsManager.destroy();
                $optionsManager = new GroupOptionsManager({
                    parent: self,
                    group: $group
                });
                if (visible) $optionsManager.show();
            }
        }


        // ReSharper disable once UnusedLocals
        var $events = (function () {
            $group.bind({
                remove: function (e) {
                    var block = getBlock(e.set.id);
                    removeBlock(block);
                    refreshOptionsManager();
                },
                add: function (e) {
                    var block = setBlock(e.set);
                    block.selfinject(block);
                    addBlock(block);
                    refreshOptionsManager();
                }
            });
        })();


        return {
            selfinject: function (me) {
                $self = me;
            },
            id: $index,
            createBlocks: createBlocks,
            addBlock: addBlock,
            removeBlock: removeBlock,
            getBlock: getBlock,
            activate: activate,
            deactivate: deactivate,
            hasSet: function (key) {
                return $blocks.hasItem(key);
            }
        };

    };


    // ReSharper disable once UnusedLocals
    var events = (function () {
        self.parent.bind({
            newGroup: function (e) {
                createNewGroup(e.group);
            }
        });
    })();

    var createNewGroup = function (group) {
        var $group = connectionGroup(group);
        $group.selfinject($group);
        $group.createBlocks();
        self.groups.setItem($group.id, $group);
    };

    function initialize() {
        //Clear previous selections.
        groupViews.clear();
        self.activeGroup = null;
        self.groups = new HashTable(null);

        self.parent.groups.each(function (key, value) {
            createNewGroup(value);
        });
    }

    initialize();

}
extend(VariantSubpanel, VariantOptionsManager);


function GroupOptionsManager(properties) {
    this.GroupOptionsManager = true;
    var self = this;
    self.parent = properties.parent;
    self.group = properties.group;
    self.visible = false;

    self.ui = (function () {
        var container = jQuery('<div/>', {
            'class': 'group-options-container'
        }).css({
            'display': 'none'
        });
        container.appendTo(self.parent.panel);

        var content = jQuery('<div/>', {
            'class': 'group-options-content'
        }).appendTo(container);

        var contentInside = jQuery('<div/>').css({
            'position': 'relative',
            'width': '100%',
            'height': '100%',
            'margin': 0,
            'padding': 0
        }).appendTo(content);

        var keys = jQuery('<div/>', {
            'class': 'keys-column'
        }).appendTo(contentInside);

        var groups = jQuery('<div/>', {
            'class': 'group-options'
        }).appendTo(contentInside);

        var buttons = jQuery('<div/>', {
            'class': 'group-options-buttons'
        }).appendTo(container);

        return {
            hide: function () {
                $(container).css({
                    'display': 'none'
                });
            },
            show: function () {
                $(container).css({
                    'display': 'block'
                });
            },
            appendKeys: function (element) {
                $(element).appendTo(keys);
            },
            appendGroup: function (element) {
                $(element).appendTo(groups);
            },
            appendButton: function (element) {
                $(element).appendTo(buttons);
            },
            destroy: function () {
                $(container).remove();
            }
        };

    })();

    self.keys = (function () {

        var keys = [];

        // ReSharper disable once UnusedLocals
        var ui = (function () {
            var container = jQuery('<div/>', {
                'class': 'fill'
            });
            self.ui.appendKeys(container);


            var header = jQuery('<div/>', {
                'class': 'column-header',
                html: 'Keys'
            });
            $(header).css({
                'border-color': 'transparent'
            });
            $(header).appendTo(container);

        })();

        function addKey(key) {
            keys.push(key);
        }

        function getKey(index) {
            if (index < 0 || index >= keys.length) return null;
            return keys[index];
        }

        return {
            addKey: addKey,
            getKey: getKey
        };

    })();

    self.columns = (function () {
        var columns = new HashTable(null);
        var size = self.group.sets.size();

        function initialize() {
            self.group.sets.each(function (key, set) {
                var column = setColumn(set);
                columns.setItem(column.id, column);
            });
        }

        var setColumn = function (set) {
            var $set = set;

            // ReSharper disable once UnusedLocals
            var ui = (function () {
                var container = jQuery('<div/>', {
                    'class': 'group-column'
                }).css({
                    'width': (100 / size).toFixed(2) + '%'
                });
                self.ui.appendGroup(container);

                // ReSharper disable once UnusedLocals
                var header = jQuery('<div/>', {
                    'class': 'column-header',
                    html: $set.tag
                });
                $(header).bind({
                    click: function () {
                        $set.edit();
                    }
                });
                $(header).appendTo(container);


            })();

            return {
                id: $set.id
            };

        };

        initialize();

        return {

        };

    })();

}
GroupOptionsManager.prototype.show = function () {
    this.visible = true;
    this.ui.show();
};
GroupOptionsManager.prototype.hide = function () {
    this.visible = false;
    this.ui.hide();
};
GroupOptionsManager.prototype.destroy = function () {
    this.ui.destroy();
};


function VariantConnectionsManager(parent) {
    VariantSubpanel.call(this, parent, 'Connections');
    this.VariantConnectionsManager = true;
    var self = this;
    self.panel = self.ui.content;
    self.groups = new HashTable(null);      //connection groups
    self.activeBlock = null;
    self.activeGroup = null;


    $(self.panel).bind({
        mousemove: function (e) {

            if (!self.activeBlock) return;

            var x = e.pageX;
            var y = e.pageY;

            self.activeBlock.move(x, y);

            if (self.activeGroup) {
                if (self.activeGroup.isHovered(x, y) === false) {
                    self.activeGroup.deactivate();
                    self.activeBlock.overEmpty();
                }
            } else {
                var active = false;
                self.groups.each(function (key, value) {
                    if (!active) {
                        active = value.isHovered(x, y);
                        if (active) {
                            value.activate();
                            self.activeBlock.overGroup();
                        }
                    }
                });
            }

        }
    });

    $(document).bind({
        mouseup: function () {
            if (self.activeBlock) {
                self.activeBlock.release();
            }

            if (self.activeGroup) {
                self.activeGroup.deactivate();
            }

        }
    });


    var setBlock = function (set) {
        var $group = null;
        var $self = null;
        var $set = set;
        var $active = false;
        var mover = null;

        var ui = (function () {

            var container;
            var flag;
            var name;

            function render() {

                if (container) {
                    $(container).remove();
                }

                container = jQuery('<div/>', {
                    'class': 'variant-set-block'
                });

                container.bind({
                    mousedown: function (e) {
                        $active = true;
                        self.activeBlock = $self;
                        refresh(e);
                    }
                });

                flag = jQuery('<div/>', {
                    'class': 'unselectable flag ' + set.language.language.flag + '-small'
                }).appendTo(container);

                name = jQuery('<div/>', {
                    'class': 'unselectable name',
                    html: set.tag
                }).appendTo(container);

                set.bind({
                    rename: function (e) {
                        $(name).html(e.name);
                    }
                });

            }

            function refresh(e) {

                $(container).css({
                    'visibility': ($active ? 'hidden' : 'visible')
                });

                if ($active) {
                    var blockOffset = $(container).offset();
                    var panelOffset = $(self.panel).offset();
                    var offset = {
                        left: blockOffset.left - panelOffset.left,
                        top: blockOffset.top - panelOffset.top
                    };
                    mover = shadow({
                        x: e.pageX,
                        y: e.pageY,
                        left: offset.left,
                        top: offset.top
                    });
                } else {
                    mover.destroy();
                    mover = null;
                }

            }

            return {
                container: function () {
                    return container;
                },
                deactivate: function () {
                    $active = false;
                    if (self.activeBlock === $self) self.activeBlock = null;
                    refresh();
                },
                render: render,
                destroy: function () {
                    $(container).remove();
                }
            };

        })();

        var shadow = function (position) {
            var $x = position.x;
            var $y = position.y;
            var $top = position.top;
            var $left = position.left;

            var container = jQuery('<div/>', {
                'class': 'variant-set-block variant-block-mover'
            }).css({
                'top': $top + 'px',
                'left': $left + 'px',
            }).appendTo(self.panel);

            var content = jQuery('<div/>').
                css({
                    'position': 'relative',
                    'width': '100%',
                    'height': '100%'
                }).appendTo(container);

            // ReSharper disable once UnusedLocals
            var flag = jQuery('<div/>', {
                'class': 'flag ' + set.language.language.flag + '-small'
            }).appendTo(content);

            // ReSharper disable once UnusedLocals
            var name = jQuery('<div/>', {
                'class': 'name',
                html: set.tag
            }).appendTo(content);

            var cancel = jQuery('<div/>', {
                'class': 'variant-set-block-cancel'
            }).appendTo(content);

            return {
                container: container,
                destroy: function () {
                    $(container).remove();
                },
                move: function (x, y) {
                    var left = $left + (x - $x);
                    var top = $top + (y - $y);
                    $(container).css({
                        'top': top + 'px',
                        'left': left + 'px'
                    });
                },
                overEmpty: function () {
                    $(cancel).css({
                        'visibility': 'visible'
                    });
                },
                overGroup: function () {
                    $(cancel).css({
                        'visibility': 'hidden'
                    });
                }
            };
        };

        function release() {
            if (!self.activeGroup) {
                if ($group.only($self)) {
                    ui.deactivate();
                } else {
                    separate();
                }
            } else if (self.activeGroup === $group) {
                ui.deactivate();
            } else {
                moveToOtherGroup(self.activeGroup);
            }
        }

        function separate() {
            var previousGroup = $group;
            previousGroup.removeBlock($self);
            ui.deactivate();

            previousGroup.group.trigger({
                type: 'remove',
                set: $set
            });

            self.parent.newGroup(set);

            ui.destroy();

        }

        function moveToOtherGroup(group) {
            var previousGroup = $group;
            previousGroup.removeBlock($self);
            $group = group;
            $group.addBlock($self);
            ui.deactivate();

            previousGroup.group.trigger({
                type: 'remove',
                set: $set
            });

            $group.group.trigger({
                type: 'add',
                set: $set
            });

        }

        return {
            selfinject: function (me) {
                $self = me;
            },
            set: $set,
            setGroup: function (group) {
                $group = group;
            },
            rerender: function () {
                ui.render();
            },
            id: $set.id,
            view: function () {
                return ui.container();
            },
            move: function (x, y) {
                mover.move(x, y);
            },
            release: release,
            overEmpty: function () {
                if (mover) mover.overEmpty();
            },
            overGroup: function () {
                if (mover) mover.overGroup();
            }
        };

    };

    var connectionGroup = function (group) {
        var $self = null;
        var $index = group.id;
        var $blocks = new HashTable(null);
        var $active = false;
        var $group = group;

        var container = jQuery('<div/>', {
            'class': 'variant-connection-group'
        }).appendTo(self.panel);


        function createBlocks() {
            $group.sets.each(function (key, value) {
                var block = setBlock(value);
                block.selfinject(block);
                addBlock(block);
            });
        }

        function refresh() {
            if ($active) {
                $(container).addClass('active');
            } else {
                $(container).removeClass('active');
            }

        }

        function isHovered(x, y) {
            var offset = $(container).offset();
            var left = offset.left;
            var top = offset.top;
            var right = left + $(container).width();
            var bottom = top + $(container).height();

            return (x >= left && x <= right && y >= top && y <= bottom);

        }

        function removeBlock(block) {
            $blocks.removeItem(block.id);
            if ($blocks.size() === 0) {
                destroy();
            }

            //trigger events for each set in this group.
            $blocks.each(function (key, value) {
                if (value !== block) {
                    triggerRemoveConnectionEvent(value.set, block.set);
                    triggerRemoveConnectionEvent(block.set, value.set);
                }
            });

            function triggerRemoveConnectionEvent(base, removed) {
                if (base.VariantSet) {
                    base.trigger({
                        type: 'removeConnection',
                        set: removed
                    });
                }
            }

        }

        function addBlock(block) {
            $blocks.setItem(block.id, block);
            block.setGroup($self);
            block.rerender();
            block.view().appendTo(container);
        }

        function destroy() {
            self.groups.removeItem($index);
            $(container).remove();
        }

        return {
            selfinject: function (me) {
                $self = me;
            },
            id: $index,
            group: $group,
            createBlocks: createBlocks,
            addBlock: addBlock,
            removeBlock: removeBlock,
            activate: function () {
                self.activeGroup = $self;
                $active = true;
                refresh();
            },
            deactivate: function () {
                if (self.activeGroup === $self) {
                    self.activeGroup = null;
                    $active = false;
                    refresh();
                }
            },
            isHovered: function (x, y) {
                return isHovered(x, y);
            },
            only: function (block) {
                return ($blocks.size() === 1 && $blocks.hasItem(block.id));
            }
        };

    };

    // ReSharper disable once UnusedLocals
    var events = (function () {
        self.parent.bind({
            newGroup: function (e) {
                createNewGroup(e.group);
            }
        });
    })();

    var createNewGroup = function (group) {
        var $group = connectionGroup(group);
        $group.selfinject($group);
        $group.createBlocks();
        self.groups.setItem($group.id, $group);
    };

    function initialize() {
        self.parent.groups.each(function (key, value) {
            createNewGroup(value);
        });
    }

    initialize();

}
extend(VariantSubpanel, VariantConnectionsManager);


function VariantLimitsManager(parent) {
    VariantSubpanel.call(this, parent, 'Limits');
    this.VariantLimitsManager = true;
    var self = this;
}
extend(VariantSubpanel, VariantLimitsManager);


function VariantDependenciesManager(parent) {
    VariantSubpanel.call(this, parent, 'Dependencies');
    this.VariantDependenciesManager = true;
    var self = this;
    self.panel = self.ui.content;
    self.lines = new HashTable(null);

    // ReSharper disable once UnusedLocals
    var events = (function () {
        self.parent.bind({

        });
    })();
    

    var dependencyLine = function (set) {
        var $self;
        var $set = set;
        var $slave;
        var $masters = new HashTable(null);

        var ui = (function () {
            var container = jQuery('<div/>', {
                'class': 'variant-dependency-line'
            });
            $(container).appendTo(self.panel);

            var slaveContainer = jQuery('<div/>', {
                'class': 'slave-container'
            }).appendTo(container);

            var masterContainer = jQuery('<div/>', {
                'class': 'master-container'
            }).appendTo(container);

            return {
                clear: function () {
                    $(slaveContainer).empty();
                    $(masterContainer).empty();
                },
                addSlave: function (block) {
                    block.appendTo(slaveContainer);
                },
                addMaster: function (block) {
                    block.appendTo(masterContainer);
                },
                destroy: function () {
                    $(container).remove();
                }
            };

        })();

        function loadMasters() {
            var wordtypeId = $set.wordtype.id;
            var mastersArray = $set.language.getMasters(wordtypeId);

            $masters.clear();
            if (!mastersArray || mastersArray.length === 0) return;

            self.editQuestion.variantsSets.each(function (key, variantSet) {
                var setWordtype = variantSet.wordtype.id;
                if (variantSet.languageId === $set.languageId && mastersArray.indexOf(setWordtype) >= 0) {
                    var masterBlock = new setBlock(variantSet, true, $set.parent === variantSet);

                    //Check if this variant set changed its wordtype.
                    variantSet.bind({
                        changeWordtype: function (e) {
                            var newWordtype = e.wordtype;

                            //Block with this variant set is removed.
                            if (mastersArray.indexOf(newWordtype.id) < 0) {
                                //Additionally, if this set was assigned as parent, parent is cleared.
                                if ($set.parent === variantSet) {
                                    $set.clearParent();
                                }

                                masterBlock.destroy();
                                $masters.removeItem(variantSet.id);
                            }
                        }
                    });

                    masterBlock.selfinject(masterBlock);
                    $masters.setItem(masterBlock.id, masterBlock);
                    masterBlock.bind({
                        click: function (e) {
                            blockClicked(e.block);
                        }
                    });
                }
            });

        }

        function blockClicked(block) {
            var previousParent = $set.parent;

            if (previousParent === block.set) {
                $set.clearParent();
                block.deactivate();
            } else {

                if (previousParent) {
                    $set.clearParent();
                    var previousBlock = $masters.getItem(previousParent.id);
                    if (previousBlock) previousBlock.deactivate();
                }

                $set.setParent(block.set, true);
                block.activate();

            }

        }

        function render() {

            ui.clear();

            $slave = new setBlock(set, false);
            $slave.selfinject($slave);
            ui.addSlave($slave.view());

            loadMasters();
            $masters.each(function (key, value) {
                ui.addMaster(value.view());
            });

        }

        render();

        // ReSharper disable once UnusedLocals
        var $events = (function () {
            $set.bind({
                changeWordtype: function () {
                    loadMasters();
                    if ($masters === undefined || $masters.size() === 0) {
                        $set.clearParent();
                        ui.destroy();
                    } else {
                        var previousParentId = $set.parent.id;
                        if (!$masters.hasItem(previousParentId)) {
                            $set.clearParent();
                        }
                        render();
                    }
                }
            });

            $set.language.bind({
                changeWordtype: function (e) {
                    if (!$masters.hasItem(e.set.id)) {
                        loadMasters();
                        render();
                    }
                }
            });

        })();


        return {
            selfinject: function (me) {
                $self = me;
            },
            id: $set.id,
            destroy: function () {
                ui.destroy();
            },
            refresh: function() {
                loadMasters();
                render();
            }
        };
    };

    var setBlock = function (set, isMaster, isActive) {
        var $line;
        var $self;
        var $set = set;
        var $active = isActive;
        var $events = new EventHandler();

        var ui = (function () {
            var container = jQuery('<div/>', {
                'class': 'variant-set-block'
            });
            $(container).bind({
                click: function () {
                    $events.trigger({
                        type: 'click',
                        block: $self
                    });
                }
            });

            // ReSharper disable once UnusedLocals
            var flag = jQuery('<div/>', {
                'class': 'unselectable flag ' + set.language.language.flag + '-small'
            }).appendTo(container);

            var name = jQuery('<div/>', {
                'class': 'unselectable name',
                html: set.tag
            }).appendTo(container);

            set.bind({
                rename: function (e) {
                    $(name).html(e.name);
                }
            });

            function refresh() {
                if ($active) {
                    $(container).addClass('active');
                } else {
                    $(container).removeClass('active');
                }
            }

            refresh();

            return {
                container: function () {
                    return container;
                },
                destroy: function () {
                    $(container).remove();
                },
                activate: function () {
                    $active = true;
                    refresh();
                },
                deactivate: function () {
                    $active = false;
                    refresh();
                }
            };

        })();

        return {
            selfinject: function (me) {
                $self = me;
            },
            id: $set.id,
            set: $set,
            view: function () {
                return ui.container();
            },
            destroy: ui.destroy,
            setLine: function (line) {
                $line = line;
            },
            bind: function (e) {
                $events.bind(e);
            },
            trigger: function (e) {
                $events.trigger(e);
            },
            activate: function () {
                ui.activate();
            },
            deactivate: function () {
                ui.deactivate();
            }
        };

    };

    function createNewLine(set) {
        var line = dependencyLine(set);
        line.selfinject(line);
        self.lines.setItem(line.id, line);
        return line;
    }

    function checkSet(set) {
        var language = set.language;
        var masters = language.getMasters(set.wordtype.id);
        if (masters && masters.length) {
            createNewLine(set);
        }

        set.bind({            
            changeWordtype: function (e) {
            
                if (!e.wasDependable && e.isDependable) {
                    checkSet(set);
                }

            }
        });

    }
    

    this.initialize = function () {
        self.parent.groups.each(function (groupKey, group) {
            group.sets.each(function (setKey, set) {
                checkSet(set);
            });
        });
    };
    

}
extend(VariantSubpanel, VariantDependenciesManager);




function VariantSetEditPanel(set) {
    this.VariantSetEditPanel = true;
    var self = this;
    self.set = set;
    self.events = new EventHandler();

    this.validator = (function () {
        var invalid = new HashTable(null);

        return {
            validation: function (e) {
                if (e.status) {
                    invalid.removeItem(e.id);
                } else {
                    invalid.setItem(e.id, e.id);
                }

                self.events.trigger({
                    type: 'validation',
                    status: invalid.size() === 0
                });

            }
        };

    })();

    this.ui = (function () {
        var background = jQuery('<div/>', {
            'class': 'edit-background',
            'z-index': my.ui.addTopLayer()
        }).appendTo($(document.body));

        var frame = jQuery('<div/>', {
            'class': 'edit-frame'
        }).appendTo($(background));

        var container = jQuery('<div/>', {
            'class': 'edit-container variant-set-edit-panel'
        }).appendTo($(frame));

        // ReSharper disable once UnusedLocals
        var close = jQuery('<div/>', {
            'class': 'edit-close'
        }).bind({
            'click': function () {
                self.cancel();
            }
        }).appendTo($(frame));


        return {
            display: function () {
                $(background).css({
                    'visibility': 'visible',
                    'z-index': my.ui.addTopLayer()
                });
            },
            hide: function () {
                $(background).css({
                    'visibility': 'hidden'
                });
            },
            destroy: function () {
                $(background).remove();
            },
            append: function (element) {
                $(element).appendTo($(container));
            }
        };

    })();

    this.meta = (function () {
        var timer;
        var container = jQuery('<div/>', {
            'class': 'meta-container'
        });

        self.ui.append(container);

        // ReSharper disable once UnusedLocals
        var flag = jQuery('<div/>', {
            'class': 'flag ' + set.language.language.flag
        }).appendTo(container);

        var errorContainer = jQuery('<div/>').addClass('error').appendTo($(container));
        var error = jQuery('<div/>', { 'class': 'error_content' }).appendTo(errorContainer);
        var errorIcon = jQuery('<span/>', { 'class': 'icon' }).appendTo($(container));

        var name = jQuery('<input/>', {
            'class': 'field default',
            'type': 'text'
        }).bind({
            'keydown': function (e) {
                if (e.which === 13) {
                    /* Jeżeli to nie jest ustawione, w IE 9 focus przeskakuje od razu
                        * na przycisk [Select categories] i wywołuje jego kliknięcie. */
                    e.preventDefault();
                    e.stopPropagation();
                }
            },
            'keyup': function () {
                var field = this;
                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(function () {
                    self.validate($(field).val());
                }, 150);
            },
            'change': function () {
                self.validate($(this).val());
            },
            'mouseup': function (e) {
                e.preventDefault();
            },
            'blur': function () {
                self.validate($(this).val());
            }
        }).on({
            'focus': function () {
                this.select();
            }
        });

        $(name).val(set.tag);

        //Append panel to span to center it vertically.
        var span = jQuery('<span/>', {
            'class': 'block'
        }).bind({
            'click': function () {
                $(name).focus();
            }
        }).appendTo($(container));

        $(name).appendTo($(span));


        function format(value) {
            if (value === true) {
                $(name).removeClass('invalid').addClass('valid');
                $(errorContainer).css({ 'display': 'none' });
                $(errorIcon).removeClass('iconInvalid').addClass('iconValid');
            } else {
                $(name).removeClass('valid').addClass('invalid');
                $(errorContainer).css({ 'display': 'table' });
                $(errorIcon).removeClass('iconValid').addClass('iconInvalid');
                $(error).text(value);
            }
        }

        function validate(value) {
            if (!value || value.trim().length === 0) return MessageBundle.get(dict.NameCannotBeEmpty);

            var sets = self.set.language.variantSets;
            for (var i = 0; i < sets.length; i++) {
                var $set = sets[i];
                if ($set.tag === value && $set !== set) {
                    return MessageBundle.get(dict.NameAlreadyExists);
                }
            }

            return true;

        }

        return {
            validate: validate,
            format: format
        };

    })();

    this.wordtypePanel = (function () {
        var value = self.set.wordtype;
        var container = jQuery('<div/>', {
            'class': 'wordtype-container'
        });

        self.ui.append(container);

        // ReSharper disable once UnusedLocals
        var name = jQuery('<div/>', {
            'class': 'name',
            html: 'Type'
        }).appendTo(container);

        var combobox = jQuery('<div/>', {
            'class': 'combobox'
        }).appendTo(container);

        var dropdown = new DropDown({
            container: combobox,
            data: WORDTYPE.getValues(),
            slots: 5,
            caseSensitive: false,
            confirmWithFirstClick: true
        });

        dropdown.select(value);

        dropdown.bind({
            change: function (e) {
                value = e.item;
            }
        });

        return {
            value: function () {
                return value;
            }
        };

    })();

    this.paramsPanel = (function() {
        var container = jQuery('<div/>', {            
           'class': 'variant-set-params-container' 
        });

        self.ui.append(container);

        function load() {
            loadDefinitions();
            loadValues();
        }
        
        function loadDefinitions() {
            var x = 1;
        }
        
        function loadValues() {
            var x = 1;
        }
        
        function render() {
            var x = 2;
        }

        (function ini() {
            load();
            render();
        })();

    })();


    this.buttons = (function () {
        var panel = jQuery('<div/>', {
            'class': 'edit-buttons-panel'
        });

        var container = jQuery('<div/>', {
            'class': 'edit-buttons-container'
        }).appendTo($(panel));

        var ok = jQuery('<input/>', {
            'class': 'edit-button',
            'type': 'submit',
            'value': 'OK'
        }).bind({
            'click': function () {
                self.confirm();
            }
        }).appendTo($(container));

        // ReSharper disable once UnusedLocals
        var cancel = jQuery('<input/>', {
            'class': 'edit-button',
            'type': 'submit',
            'value': 'Cancel'
        }).bind({
            'click': function () {
                self.cancel();
            }
        }).appendTo($(container));

        self.events.bind({
            validation: function (e) {
                if (e.status) {
                    $(ok).removeAttr('disabled');
                } else {
                    $(ok).attr('disabled', 'disabled');
                }
            }
        });

        self.ui.append(panel);

    })();

    self.validate();

}
VariantSetEditPanel.prototype.display = function () {
    this.ui.display();
};
VariantSetEditPanel.prototype.cancel = function () {
    this.ui.destroy();
};
VariantSetEditPanel.prototype.confirm = function () {
    this.set.changeWordtype(this.wordtypePanel.value());
    this.cancel();
};
VariantSetEditPanel.prototype.validate = function (tag) {
    var self = this;
    var validationResult = self.meta.validate(tag !== undefined ? tag : self.set.tag);

    self.meta.format(validationResult);

    self.validator.validation({
        id: self.set.id,
        status: (validationResult === true ? true : false)
    });

};
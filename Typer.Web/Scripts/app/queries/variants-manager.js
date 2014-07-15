

function VariantsManager(query) {

    'use strict';

    var self = this;
    self.VariantsManager = true;
    self.query = mielk.objects.clone(query, true);

    self.events = mielk.eventHandler();
    self.groups = mielk.hashTable();
    self.counter = 0;
    self.validator = mielk.validation.validator(self.query);

    self.ui = (function () {
        var window;

        var container = jQuery('<div/>', {
            'class': 'edit-container'
        });

        // ReSharper disable once UnusedLocals
        var content = jQuery('<div/>').appendTo(container);

        // ReSharper disable once UnusedLocals
        var buttons = (function () {
            var panel = jQuery('<div/>', {
                'class': 'edit-buttons-panel'
            }).appendTo(container);

            var buttonsContainer = jQuery('<div/>', {
                'class': 'edit-buttons-container'
            }).appendTo(panel);

            var ok = jQuery('<input/>', {
                'class': 'edit-button',
                'type': 'submit',
                'value': 'OK'
            }).bind({
                'click': function () {
                    self.confirm();
                }
            }).appendTo(buttonsContainer);

            // ReSharper disable once UnusedLocals
            var cancel = jQuery('<input/>', {
                'class': 'edit-button',
                'type': 'submit',
                'value': 'Cancel'
            });
            cancel.bind({
                'click': function() {
                    self.cancel();
                }
            });
            cancel.appendTo(buttonsContainer);

            self.query.bind({
                validation: function (e) {
                    if (e.status) {
                        $(ok).removeAttr('disabled');
                    } else {
                        $(ok).attr('disabled', 'disabled');
                    }
                }
            });

        })();


        return {
            display: function () {
                window = mielk.ui.modalPopup(container);
            },
            
            append: function (element) {
                $(element).appendTo(content);
            },
            
            destroy: function() {
                if (window) window.destroy();
            }
            
        };

    })();
    


    (function initialize() {
        self.divideIntoGroups();
        
        //Parts.
        self.addSubpanel('connections', new VariantConnectionsManager(self));
        //self.options = new VariantOptionsManager(self);
        //self.connections = new VariantConnectionsManager(self);
        //self.limits = new VariantLimitsManager(self);
        //self.dependencies = new VariantDependenciesManager(self);
        
    })();

}

VariantsManager.prototype = {
    
    trigger: function(e) {
        this.events.trigger(e);
    },
    
    bind: function(e) {
        this.events.bind(e);
    },
    
    start: function() {
        this.display();
    },

    display: function () {
        this.ui.display();
    },
    
    confirm: function() {
        var self = this;
        self.trigger({
            type: 'confirm',
            query: self.query
        });
    },

    cancel: function () {
        this.ui.destroy();
        this.trigger({ type: 'cancel' });
    },
    
    //Dzieli VariantSety przypisane do rozpatrywanego Query na grupę
    //według powiązań pomiędzy tymi VariantSetami.
    divideIntoGroups: function() {
        var self = this;
        var assigned = mielk.hashTable();

        self.query.sets.each(function(key, set) {
            var id = set.id;
            
            //Jeżeli taki element jest już rozpatrzony, 
            //zostaje pominięty.
            if (!assigned.hasItem(id)) {
                
                //Tworzy nową grupę i dodaje ją do
                //odpowiednich kolekcji.
                var group = self.addNewGroup();
                group.loadSet(set);
                assigned.setItem(set.id, set);
                

                //Do tej grupy, oprócz aktualnego VariantSetu,
                //dodawane są również VariantSety powiązane.
                set.related.each(function(k, connected) {
                    assigned.setItem(connected.id, connected);
                    group.loadSet(connected);
                });
                

                //Usuwa widok grupy, jeżeli została ona pusta
                //(usunięto z niej wszystkie elementy).
                group.bind({
                    remove: function() {
                        if (group.isEmpty()) self.removeGroup(group);
                    }
                });

            }

        });

        self.groups.each(function(key, value) {
            value.loadMissingVariants();
        });

    },

    addNewGroup: function () {
        var self = this;
        var group = new VariantSetsGroup({ manager: self, id: mielk.numbers.generateUUID() });
        group.bind({
            setSeparated: function (e) {
                var newGroup = self.addNewGroup();
                newGroup.loadSet(e.set);
                self.trigger({ type: 'setSeparated', set: e.set, oldGroup: group, newGroup: newGroup });
            }
        });
        self.groups.setItem(group.id, group);

        return group;

    },
    
    addSubpanel: function(name, panel) {
        this[name] = panel;
        this.ui.append(panel.view());
    },
    
    createNewGroup: function(set) {
        var self = this;
        var group = new VariantSetsGroup({ manager: self, id: mielk.numbers.generateUUID() });
        group.loadSet(set);

        self.groups.setItem(group.id, group);
        self.trigger({
            type: 'createNewGroup',
            group: group
        });
        
    },
    
    removeGroup: function(group) {
        this.groups.removeItem(group.id);
        this.trigger({
             type: 'removeGroup'
            ,group: group
        });
    }

};




function VariantSetsGroup(params) {

    'use strict';

    var self = this;
    self.VariantSetsGroup = true;
    
    //Instance properties.
    self.manager = params.manager;
    self.id = params.id;
    self.events = mielk.eventHandler();
    self.sets = mielk.hashTable();
    self.keys = mielk.hashTable();

}
VariantSetsGroup.prototype = {
    trigger: function(e) {
        this.events.trigger(e);
    },
    
    bind: function(e) {
        this.events.bind(e);
    },
    
    loadSet: function(set) {
        var self = this;

        self.sets.setItem(set.id, set);

        //Add events.
        set.bind({

            separate: function () {
                
                //Jeżeli ta grupa została usunięta, poniższe eventy nie powinny już być wywoływane.
                if (self.destroyed) return;
                
                self.trigger({ type: 'setSeparated', set: set, group: self });
                self.removeSet(set);
            },
            
            move: function (e) {
                
                //Jeżeli ta grupa została usunięta, poniższe eventy nie powinny już być wywoływane.
                if (self.destroyed) return;
                
                self.removeSet(set);
                e.group.addSet(set);
            }
            
        });

    },
    
    addSet: function(set) {
        this.loadSet(set);
        this.trigger({ type: 'addSet', set: set });
    },

    removeSet: function(set) {
        this.sets.removeItem(set.id);
        this.removeEmptyVariants(set);
        this.trigger({ type: 'setRemoved', set: set });

        if (this.isEmpty()) this.destroy();

    },
    
    removeEmptyVariants: function(removedSet) {
        //Przy tworzeniu grup, każdy set oprócz swojego zestawu
        //wariantów otrzymuje również warianty z powiązanych setów.
        //W momencie usuwania seta i przeniesienia go do innej grupy,
        //puste warianty (dodane do tego setu tylko z uwagi na to, 
        //że był powiązany z jakimiś innymi) są usuwane, bo powiązanie
        //pomiędzy setami już nie występuje.
        
        this.sets.each(function (key, value) {
            //value.variants.each(function ($key, variant) {
            //    if (variant.isNew && !variant.updated.content && !variant.updated.wordId) {
            //        var linked = removedSet.updated.variants.getItem(variant.key);
            //        if (linked && !linked.isNew) {
            //            value.removeVariant(variant.key);
            //        }
            //    }
            //});
        });

        removedSet.variants.each(function (key, variant) {
            ////if (variant.isNew && !variant.content && !variant.wordId) {
            //if (!variant.updated.content && !variant.updated.wordId) {
            //    removedSet.removeVariant(key);
            //}
        });


    },
    
    destroy: function () {
        this.trigger({ type: 'remove' });
        this.manager.removeGroup(this);
        this.destroyed = true;
    },

    isEmpty: function() {
        return this.sets.size() === 0;
    },
    
    getConnectionPairs: function () {
        var results = mielk.hashTable();
        var array = this.sets.values();

        for (var i = 0; i < array.length; i++) {
            var parent = array[i];
            for (var j = i + 1; j < array.length; j++) {
                var connected = array[j];
                var connectionKey = parent.id + '|' + connected.id;
                results.setItem(connectionKey, [parent, connected]);
            }
        }

        return results;

    },
    
    getKeys: function () {
        if (!this.keys) {
            this.loadKeys();
        }
        return this.keys;
    },
    
    //Tworzy kolekcję wszystkich kluczy wariantów
    //występujących w VariantSetach tej grupy.
    loadKeys: function () {
        var self = this;
        self.keys = mielk.hashTable();

        self.sets.each(function (key, value) {
            value.variants.each(function ($key) {
                if (!self.keys.hasItem($key)) {
                    self.keys.setItem($key, $key);
                }
            });
        });
    },
    
    //Rozpowszechnia warianty pomiędzy VariantSetami,
    //np. jeżeli wariant z jakimś kluczem występuje
    //tylko w jednym VariantSecie, w pozostałych setach
    //zostaje stworzony pusty wariant o takim samym
    //kluczu.
    loadMissingVariants: function () {
        var self = this;

        if (!self.keys) {
            self.loadKeys();
        }

        self.keys.each(function (key) {
            self.sets.each(function (setKey, set) {
                if (!set.variants.hasItem(key)) {
                    var variant = new Variant(set, {
                        Id: set.id + ':' + key,
                        Key: key,
                        IsNew: true
                    });
                    set.variants.setItem(variant.key, variant);
                }
            });
        });

    }
    
};



function VariantSetGroupPanel(params) {

    'use strict';

    var self = this;
    self.VariantSetGroupPanel = true;

    self.panel = params.panel;
    self.group = params.group;

    self.blocks = mielk.hashTable();
    self.active = false;

    self.ui = (function() {
        var container;

        function createContainer() {
            container = jQuery('<div/>', {
                'class': 'variant-connection-group'
            });
        }

        function defaultEvents() {
            self.group.bind({
                destroy: function () {
                    $(container).remove();
                }
            });
        }

        function bindEvents(ev) {
            //Custom.
            if (ev && ev.HashTable) {
                var events = {};
                ev.each(function (key, event) {
                    events[key] = event;
                });
                $(container).bind(events);
            }
        }


        function refresh() {
            if (self.active) {
                $(container).addClass('active');
            } else {
                $(container).removeClass('active');
            }
        }
        
        function isHovered(x, y) {
            var offset = $(container).offset();
            var left = offset.left;
            var top = offset.top;
            var right = left + $(container).outerWidth();
            var bottom = top + $(container).outerHeight();

            return (x >= left && x <= right && y >= top && y <= bottom);
        }

        function destroy() {
            $(container).remove();
        }


        (function initialize() {
            createContainer();
            defaultEvents();
        })();


        return {
            view: container,
            bindEvents: bindEvents,
            refresh: refresh,
            isHovered: isHovered,
            destroy: destroy
        };

    })();

    self.events = (function() {

        self.group.bind({

            //Zdarzenie odpalane w momencie usunięcia grupy 
            //reprezentowanej przez ten panel.
            remove: function() {
                self.destroy();
            },

            //Zdarzenie odpalane w momencie usunięcia jakiegoś seta.
            setRemoved: function (e) {
                self.removeSet(e.set.id);
            },
            
            //Zdarzenie odpalane w momencie dodania jakiegoś seta.
            addSet: function(e) {
                self.addBlock(e.set);
            }

        });
        

    })();

    (function initialize() {
        self.loadBlocks(params.movable);
    })();

}
VariantSetGroupPanel.prototype = {    
    
    destroy: function() {
        this.ui.destroy();
        this.destroyed = true;
    },

    bindBlocksEvents: function(events, uiEvents) {
        this.blocks.each(function (k, v) {
            v.bind(events);
            v.bindEvents(uiEvents);
        });
    },
    
    bindEvents: function(events) {
        this.ui.bindEvents(events);
    },
    
    loadBlocks: function (movable) {
        var self = this;
        self.blocks.clear();

        //Load blocks.
        self.group.sets.each(function (key, set) {
            self.addBlock(set, movable);
        });
    },
    
    addBlock: function (set, movable) {
        var self = this;
        var block = new VariantSetBlock(set, { movable: movable === undefined ? true: movable, panel: self.ui.view });
        block.bind({
            //release: function() {
            //    self.group.trigger({ type: 'blockReleased', block: block });
            //},
            activate: function (e) {
                //Jeżeli ten panel został usunięty, poniższe eventy nie powinny już być wywoływane.
                if (self.destroyed) return;
                
                if (e.value) {
                    self.group.trigger({ type: 'blockActivated', block: block });
                } else {
                    self.group.trigger({ type: 'blockDeactivated', block: block });
                }
            }
        });
        self.blocks.setItem(set.id, block);
    },

    view: function () {
        return this.ui.view;
    },
    
    removeSet: function (key) {
        var block = this.blocks.getItem(key);
        block.destroy();
        this.blocks.removeItem(key);
    },
    
    isHovered: function(x, y) {
        return this.ui.isHovered(x, y);
    },
    
    activate: function() {
        this.active = true;
        this.ui.refresh();
    },
    
    deactivate: function() {
        this.active = false;
        this.ui.refresh();
    }
    
};


//        function addBlock(block) {
//            $blocks.setItem(block.id, block);
//            block.setGroup($self);

//            $blocks.each(function (key, value) {
//                if (value != block) {
//                    value.set.addConnection(block.set);
//                    block.set.addConnection(value.set);
//                }
//            });

//            block.rerender();
//            block.view().appendTo(container);
//        }







//    var connectionGroup = function (group) {
//        var $self = null;
//        var $index = group.id;
//        var $blocks = new HashTable(null);
//        var $active = false;
//        var $group = group;




//        function removeBlock(block) {
//            $blocks.removeItem(block.id);
//            $group.sets.removeItem(block.id);

//            if ($blocks.size() === 0) {
//                destroy();
//            }

//            //trigger events for each set in this group.
//            $blocks.each(function (key, value) {
//                if (value !== block) {
//                    triggerRemoveConnectionEvent(value.set, block.set);
//                    triggerRemoveConnectionEvent(block.set, value.set);
//                }
//            });

//            function triggerRemoveConnectionEvent(base, removed) {
//                if (base.VariantSet) {
//                    base.removeConnection(removed);
//                    base.trigger({
//                        type: 'removeConnection',
//                        set: removed
//                    });
//                }
//            }

//        }

//        return {
//            selfinject: function (me) {
//                $self = me;
//            },
//            id: $index,
//            group: $group,
//            createBlocks: createBlocks,
//            addBlock: addBlock,
//            removeBlock: removeBlock,
//            activate: function () {
//                self.activeGroup = $self;
//                $active = true;
//                refresh();
//            },
//            deactivate: function () {
//                if (self.activeGroup === $self) {
//                    self.activeGroup = null;
//                    $active = false;
//                    refresh();
//                }
//            },
//            isHovered: function (x, y) {
//                return isHovered(x, y);
//            },
//            only: function (block) {
//                return ($blocks.size() === 1 && $blocks.hasItem(block.id));
//            }
//        };

//    };






















function VariantSubpanel(parent, name) {

    'use strict';

    var self = this;
    self.VariantSubpanel = true;
    self.name = name;
    self.parent = parent;
    self.question = parent.query;
    self.events = mielk.eventHandler();

    self.ui = (function () {
        var expanded = false;

        var container = jQuery('<div/>', {
            'class': 'variant-subpanel'
        });
        //self.parent.ui.append(container);

        var header = jQuery('<div/>', {
            'class': 'variant-subpanel-header'
        }).appendTo(container);

        // ReSharper disable once UnusedLocals
        var expander = jQuery('<div/>', {
            'class': 'variant-subpanel-expander'
        }).bind({
            click: function (e) {
                e.stopPropagation();
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

        function insert(element) {
            $(element).appendTo(content);
        }

        return {
            view: container,
            insert: insert
        };

    })();

}
VariantSubpanel.prototype = {    
    view: function () {
        return this.ui.view;
    },
    bind: function (e) {
        this.eventHandler.bind(e);
    },
    trigger: function (e) {
        this.eventHandler.trigger(e);
    }
};







function VariantConnectionsManager(parent) {

    'use strict';

    var self = this;
    self.VariantConnectionsManager = true;
    VariantSubpanel.call(this, parent, 'Connections');
    self.query = parent.query;

    //Temporary.
    self.groupPanels = mielk.hashTable();
    self.activeBlock = null;
    self.activeGroup = null;

    //UI
    self.content = (function() {
        var container = jQuery('<div/>').css({
            'width': '100%'
        });

        function add(groupView) {
            $(groupView).appendTo(container);
        }

        function append() {
            self.ui.insert(container);
        }
        
        function css(styles) {
            $(container).css(styles);
        }

        return {            
              view: container
            , add: add
            , append: append
            , css: css
        };

    })();

    self.events = (function() {
        $(document).bind({            
            mouseup: function () {
                if (self.activeBlock) {
                    self.releaseBlock();
                }
            },
            mousemove: function (e) {
                if (self.activeBlock) {
                    self.activeBlock.handleMove(e.pageX, e.pageY);
                    self.findActiveGroup(e.pageX, e.pageY);
                }
            }
        });

        self.parent.bind({
            setSeparated: function (e) {
                self.addNewPanel(e.newGroup);
                self.reset();
            }
        });

    })();

    (function initialize() {
        self.render();
    })();

}
mielk.objects.extend(VariantSubpanel, VariantConnectionsManager);
mielk.objects.addProperties(VariantConnectionsManager.prototype, {    

    render: function () {
        var self = this;
        self.parent.groups.each(function (key, value) {
            self.addNewPanel(value);
        });
        self.content.append();
    },

    addNewPanel: function (group) {
        var self = this;
        var groupPanel = new VariantSetGroupPanel({ panel: self, group: group, movable: true });

        group.bind({
            blockActivated: function (e) {
                //Deactivate the previously active block.
                if (self.activeBlock) self.activeBlock.activate(false);
                self.activeBlock = e.block;
            },
            blockDeactivated: function () {
                self.reset();
            }
        });

        self.groupPanels.setItem(group.id, groupPanel);
        self.content.add(groupPanel.view());

    },
    
    releaseBlock: function() {
        var block = this.activeBlock;

        if (!block) return;

        if (block.isRemovable) {
            //Jeżeli ten set nie ma żadnych powiązań,
            //nie ma potrzeby go separować.
            if (!block.isAlone()) {
                block.separate();
                //block.destroy();
            } else {
                block.activate(false);
            }
        } else if (this.activeGroup === block.group) {  //Nothing has changed.
            block.activate(false);
        } else {
            //Move block to the new group.
            block.move(this.activeGroup.group);
            //block.destroy();
        }
        
    },
    
    findActiveGroup: function(x, y) {
        //Find hovered panel.
        var found = null;
        this.groupPanels.each(function (key, group) {
            if (!found) {
                if (group.isHovered(x, y)) {
                    found = group;
                }
            }
        });

        if (found !== this.activeGroup) {

            if (this.activeGroup) this.activeGroup.deactivate();
            this.activeGroup = found;
            
            if (found) {
                found.activate();
                this.activeBlock.setAsRemovable(false);
            } else {
                this.activeBlock.setAsRemovable(true);
            }
            
        }

    },

    reset: function () {
        //Deactivating blocks.
        this.activeBlock = null;
        
        //Deactivating groups.
        if (this.activeGroup) {
            this.activeGroup.deactivate();
        }
        this.activeGroup = null;
    }

});


//function VariantConnectionsManager(parent) {
//    
//    this.VariantConnectionsManager = true;
//    var self = this;
//    self.panel = self.ui.content;
//    self.groups = new HashTable(null);      //connection groups
//    self.activeBlock = null;
//    self.activeGroup = null;


//    $(self.panel).bind({
//        mousemove: function (e) {

//            if (!self.activeBlock) return;

//            var x = e.pageX;
//            var y = e.pageY;

//            self.activeBlock.move(x, y);

//            if (self.activeGroup) {
//                if (self.activeGroup.isHovered(x, y) === false) {
//                    self.activeGroup.deactivate();
//                    self.activeBlock.overEmpty();
//                }
//            } else {
//                var active = false;
//                self.groups.each(function (key, value) {
//                    if (!active) {
//                        active = value.isHovered(x, y);
//                        if (active) {
//                            value.activate();
//                            self.activeBlock.overGroup();
//                        }
//                    }
//                });
//            }

//        }
//    });

//    $(document).bind({
//        mouseup: function () {
//            if (self.activeBlock) {
//                self.activeBlock.release();
//            }

//            if (self.activeGroup) {
//                self.activeGroup.deactivate();
//            }

//        }
//    });


//    var setBlock = function (set) {
//        var $group = null;
//        var $self = null;
//        var $set = set;
//        var $active = false;
//        var mover = null;

//        var ui = (function () {

//            var container;
//            var flag;
//            var name;

//            function render() {

//                if (container) {
//                    $(container).remove();
//                }

//                container = jQuery('<div/>', {
//                    'class': 'variant-set-block'
//                });

//                container.bind({
//                    mousedown: function (e) {
//                        $active = true;
//                        self.activeBlock = $self;
//                        refresh(e);
//                    }
//                });

//                flag = jQuery('<div/>', {
//                    'class': 'unselectable flag ' + set.language.language.flag + '-small'
//                }).appendTo(container);

//                name = jQuery('<div/>', {
//                    'class': 'unselectable name',
//                    html: set.updated.tag
//                }).appendTo(container);

//                set.bind({
//                    rename: function (e) {
//                        $(name).html(e.name);
//                    }
//                });

//            }

//            function refresh(e) {

//                $(container).css({
//                    'visibility': ($active ? 'hidden' : 'visible')
//                });

//                if ($active) {
//                    var blockOffset = $(container).offset();
//                    var panelOffset = $(self.panel).offset();
//                    var offset = {
//                        left: blockOffset.left - panelOffset.left,
//                        top: blockOffset.top - panelOffset.top
//                    };
//                    mover = shadow({
//                        x: e.pageX,
//                        y: e.pageY,
//                        left: offset.left,
//                        top: offset.top
//                    });
//                } else {
//                    mover.destroy();
//                    mover = null;
//                }

//            }

//            return {
//                container: function () {
//                    return container;
//                },
//                deactivate: function () {
//                    $active = false;
//                    if (self.activeBlock === $self) self.activeBlock = null;
//                    refresh();
//                },
//                render: render,
//                destroy: function () {
//                    $(container).remove();
//                }
//            };

//        })();

//        var shadow = function (position) {
//            var $x = position.x;
//            var $y = position.y;
//            var $top = position.top;
//            var $left = position.left;

//            var container = jQuery('<div/>', {
//                'class': 'variant-set-block variant-block-mover'
//            }).css({
//                'top': $top + 'px',
//                'left': $left + 'px'
//            }).appendTo(self.panel);

//            var content = jQuery('<div/>').
//                css({
//                    'position': 'relative',
//                    'width': '100%',
//                    'height': '100%'
//                }).appendTo(container);

//            // ReSharper disable once UnusedLocals
//            var flag = jQuery('<div/>', {
//                'class': 'flag ' + set.language.language.flag + '-small'
//            }).appendTo(content);

//            // ReSharper disable once UnusedLocals
//            var name = jQuery('<div/>', {
//                'class': 'name',
//                html: set.updated.tag
//            }).appendTo(content);

//            var cancel = jQuery('<div/>', {
//                'class': 'variant-set-block-cancel'
//            }).appendTo(content);

//            return {
//                container: container,
//                destroy: function () {
//                    $(container).remove();
//                },
//                move: function (x, y) {
//                    var left = $left + (x - $x);
//                    var top = $top + (y - $y);
//                    $(container).css({
//                        'top': top + 'px',
//                        'left': left + 'px'
//                    });
//                },
//                overEmpty: function () {
//                    $(cancel).css({
//                        'visibility': 'visible'
//                    });
//                },
//                overGroup: function () {
//                    $(cancel).css({
//                        'visibility': 'hidden'
//                    });
//                }
//            };
//        };

//        function release() {

//            //self.parent.connectionsChanged = true;

//            if (!self.activeGroup) {
//                if ($group.only($self)) {
//                    ui.deactivate();
//                } else {
//                    separate();
//                }
//            } else if (self.activeGroup === $group) {
//                ui.deactivate();
//            } else {
//                moveToOtherGroup(self.activeGroup);
//            }
//        }

//        function separate() {
//            var previousGroup = $group;
//            previousGroup.removeBlock($self);
//            ui.deactivate();

//            previousGroup.group.trigger({
//                type: 'remove',
//                set: $set
//            });

//            self.parent.newGroup(set);

//            ui.destroy();

//        }

//        function moveToOtherGroup(group) {
//            var previousGroup = $group;
//            previousGroup.removeBlock($self);
//            $group = group;
//            $group.addBlock($self);
//            ui.deactivate();

//            previousGroup.group.trigger({
//                type: 'remove',
//                set: $set
//            });

//            $group.group.trigger({
//                type: 'add',
//                set: $set
//            });

//        }

//        return {
//            selfinject: function (me) {
//                $self = me;
//            },
//            set: $set,
//            setGroup: function (group) {
//                $group = group;
//            },
//            rerender: function () {
//                ui.render();
//            },
//            id: $set.id,
//            view: function () {
//                return ui.container();
//            },
//            move: function (x, y) {
//                mover.move(x, y);
//            },
//            release: release,
//            overEmpty: function () {
//                if (mover) mover.overEmpty();
//            },
//            overGroup: function () {
//                if (mover) mover.overGroup();
//            }
//        };

//    };


//    // ReSharper disable once UnusedLocals
//    var events = (function () {
//        self.parent.bind({
//            newGroup: function (e) {
//                createNewGroup(e.group);
//            }
//        });
//    })();

//    var createNewGroup = function (group) {
//        var $group = connectionGroup(group);
//        $group.selfinject($group);
//        $group.createBlocks();
//        self.groups.setItem($group.id, $group);
//    };

//    function initialize() {
//        self.parent.groups.each(function (key, value) {
//            createNewGroup(value);
//        });
//    }

//    initialize();

//}
//










































//function VariantPanel(properties) {
//    this.VariantPanel = true;
//    var self = this;
//    self.events = new EventHandler();
//    self.question = properties.question;
//    self.editQuestion = properties.editQuestion;
//    self.groups = new HashTable(null);
//    self.counter = 0;
//    //self.connectionsChanged = false;

//    this.loadGroups();

//    this.loadDependenciesDefinitions = (function () {
//        var languagesIds = self.editQuestion.getLanguagesIds();
//        $.ajax({
//            url: '/Questions/GetDependenciesDefinitions',
//            type: "GET",
//            data: {
//                'languages': languagesIds
//            },
//            traditional: true,
//            datatype: "json",
//            async: true,
//            cache: false,
//            success: function (result) {
//                for (var i = 0; i < result.length; i++) {
//                    var definition = result[i];
//                    var languageId = definition.LanguageId;
//                    var masterId = definition.MasterWordtypeId;
//                    var slaveId = definition.SlaveWordtypeId;
//                    //Load this definition to the given language.
//                    var language = self.editQuestion.getLanguage(languageId);
//                    if (language) {
//                        language.addDependencyDefinition({
//                            master: masterId,
//                            slave: slaveId
//                        });
//                    }
//                }
//                self.dependencies.initialize();
//            },
//            error: function (msg) {
//                alert(msg.status + " | " + msg.statusText);
//                return null;
//            }
//        });

//    })();

//}

//VariantPanel.prototype.confirm = function () {

//    //tworzy logi o zmianach (które będą przekazane do kontrolera w celu wykonania na bazie danych)
//    this.editQuestion.variantsSets.each(function (key, set) {
//        set.updateMeta();
//        set.updateProperties();
//        set.updateDependencies();
//        set.updateConnections();
//        set.updateLimits();
//        set.updateVariants();
//        //set.sendLogsToParent();
//    });

//    //this.editQuestion.variantsSets.each(function (key, value) {
//    //    
//    //});

//    //zamyka panel.
//    this.ui.destroy();

//};


//VariantPanel.prototype.isComplete = function () {
//    //var forms = this.details.forms;
//    //var complete = true;
//    //forms.each(function (key, value) {
//    //    if (complete && value.active && !value.header && !value.value) {
//    //        complete = false;
//    //    }
//    //});
//    //return complete;
//};
//VariantPanel.prototype.start = function () {
//    this.display();
//};

//};
















//function VariantOptionsManager(parent) {
//    VariantSubpanel.call(this, parent, 'Options');
//    this.VariantOptionsManager = true;
//    var self = this;
//    self.eventHandler = new EventHandler();
//    self.panel = self.ui.content;
//    self.groups = new HashTable(null);      //connection groups

//    var groupViews = (function () {
//        var container = jQuery('<div/>', {
//            'class': 'variant-options-groups'
//        });
//        $(container).appendTo(self.panel);

//        return {
//            clear: function () {
//                $(container).empty();
//            },
//            add: function (element) {
//                $(element).appendTo(container);
//            }
//        };

//    })();

//    var setBlock = function (set) {
//        var group;
//        var $self;
//        var $set = set;

//        var ui = (function () {
//            var container = jQuery('<div/>', {
//                'class': 'variant-set-block'
//            });

//            // ReSharper disable once UnusedLocals
//            var flag = jQuery('<div/>', {
//                'class': 'unselectable flag ' + set.language.language.flag + '-small'
//            }).appendTo(container);

//            var name = jQuery('<div/>', {
//                'class': 'unselectable name',
//                html: set.updated.tag
//            }).appendTo(container);

//            set.bind({
//                rename: function (e) {
//                    $(name).html(e.name);
//                }
//            });

//            return {
//                container: function () {
//                    return container;
//                },
//                destroy: function () {
//                    $(container).remove();
//                }
//            };

//        })();

//        return {
//            selfinject: function (me) {
//                $self = me;
//            },
//            setGroup: function ($group) {
//                group = $group;
//            },
//            id: $set.id,
//            view: function () {
//                return ui.container();
//            },
//            destroy: ui.destroy
//        };

//    };

//    var connectionGroup = function (group) {
//        var $self = null;
//        var $index = group.id;
//        var $blocks = new HashTable(null);
//        var $active = false;
//        var $group = group;
//        var $optionsManager;

//        var container = jQuery('<div/>', {
//            'class': 'variant-options-group variant-connection-group'
//        }).bind({
//            click: function () {
//                var previous = self.activeGroup;
//                if (previous === $self) return;
//                if (previous) {
//                    previous.deactivate();
//                }
//                $self.activate();
//            }
//        });
//        groupViews.add(container);

//        function createBlocks() {
//            $group.sets.each(function (key, value) {
//                var block = setBlock(value);
//                block.selfinject(block);
//                addBlock(block);
//            });
//        }

//        function refresh() {
//            if ($active) {
//                $(container).addClass('active');
//            } else {
//                $(container).removeClass('active');
//            }

//        }

//        function addBlock(block) {
//            $blocks.setItem(block.id, block);
//            block.setGroup($self);
//            block.view().appendTo(container);
//        }

//        function removeBlock(block) {
//            $blocks.removeItem(block.id);
//            block.destroy();
//            if ($blocks.size() === 0) destroy();
//        }

//        function getBlock(id) {
//            return $blocks.getItem(id);
//        }

//        function destroy() {
//            $(container).remove();
//            self.groups.removeItem($index);
//        }

//        function activate() {
//            self.activeGroup = $self;
//            $active = true;
//            refresh();

//            //Show options panel.
//            if (!$optionsManager) {
//                $optionsManager = new GroupOptionsManager({
//                    parent: self,
//                    group: $group
//                });
//            }
//            $optionsManager.show();

//        }

//        function deactivate() {
//            if (self.activeGroup === $self) {
//                self.activeGroup = null;
//                $active = false;
//                refresh();
//            }

//            if ($optionsManager && $optionsManager.visible) {
//                $optionsManager.hide();
//            }

//        }

//        function refreshOptionsManager() {
//            if ($optionsManager) {
//                var visible = $optionsManager.visible;
//                $optionsManager.destroy();
//                $optionsManager = new GroupOptionsManager({
//                    parent: self,
//                    group: $group
//                });
//                if (visible) $optionsManager.show();
//            }
//        }


//        // ReSharper disable once UnusedLocals
//        var $events = (function () {
//            $group.bind({
//                remove: function (e) {
//                    var block = getBlock(e.set.id);
//                    removeBlock(block);
//                    refreshOptionsManager();
//                },
//                add: function (e) {
//                    var block = setBlock(e.set);
//                    block.selfinject(block);
//                    addBlock(block);
//                    refreshOptionsManager();
//                }
//            });
//        })();


//        return {
//            selfinject: function (me) {
//                $self = me;
//            },
//            id: $index,
//            createBlocks: createBlocks,
//            addBlock: addBlock,
//            removeBlock: removeBlock,
//            getBlock: getBlock,
//            activate: activate,
//            deactivate: deactivate,
//            hasSet: function (key) {
//                return $blocks.hasItem(key);
//            }
//        };

//    };


//    // ReSharper disable once UnusedLocals
//    var events = (function () {
//        self.parent.bind({
//            newGroup: function (e) {
//                createNewGroup(e.group);
//            }
//        });

//        self.bind({
//            selectGroup: function (e) {
//                var previous = self.activeGroup;
//                if (previous === e.connectionGroup) return;
//                if (previous) {
//                    previous.deactivate();
//                }
//            }
//        });

//    })();

//    var createNewGroup = function (group) {
//        var $group = connectionGroup(group);
//        $group.selfinject($group);
//        $group.createBlocks();
//        self.groups.setItem($group.id, $group);
//    };

//    function initialize() {
//        //Clear previous selections.
//        groupViews.clear();
//        self.activeGroup = null;
//        self.groups = new HashTable(null);

//        self.parent.groups.each(function (key, value) {
//            createNewGroup(value);
//        });
//    }

//    initialize();

//}
//mielk.objects.extend(VariantSubpanel, VariantOptionsManager);




//function GroupOptionsManager(properties) {
//    this.GroupOptionsManager = true;
//    var self = this;
//    self.parent = properties.parent;
//    self.group = properties.group;
//    self.visible = false;
//    self.keysMap = new HashTable(null);
//    self.keysArray = [];

//    self.ui = (function () {
//        var container = jQuery('<div/>', {
//            'class': 'group-options-container'
//        }).css({
//            'display': 'none'
//        });
//        container.appendTo(self.parent.panel);

//        var content = jQuery('<div/>', {
//            'class': 'group-options-content'
//        }).appendTo(container);

//        var keys = jQuery('<div/>', {
//            'class': 'keys-column'
//        }).appendTo(content);

//        var groups = jQuery('<div/>', {
//            'class': 'group-options'
//        }).appendTo(content);

//        var buttons = jQuery('<div/>', {
//            'class': 'group-options-buttons'
//        }).appendTo(container);

//        // ReSharper disable once UnusedLocals
//        var add = jQuery('<input/>', {
//            'class': 'button add-variant'
//        }).appendTo(buttons);


//        return {
//            hide: function () {
//                $(container).css({
//                    'display': 'none'
//                });
//            },
//            show: function () {
//                $(container).css({
//                    'display': 'block'
//                });
//            },
//            appendKeys: function (element) {
//                $(element).appendTo(keys);
//            },
//            appendGroup: function (element) {
//                $(element).appendTo(groups);
//            },
//            appendButton: function (element) {
//                $(element).appendTo(buttons);
//            },
//            destroy: function () {
//                $(container).remove();
//            }
//        };

//    })();

//    self.keys = (function () {

//        // ReSharper disable once UnusedLocals
//        var ui = (function () {
//            var container = jQuery('<div/>', {
//                'class': 'fill'
//            });
//            self.ui.appendKeys(container);


//            var header = jQuery('<div/>', {
//                'class': 'column-header',
//                html: 'Keys'
//            });
//            $(header).css({
//                'border-color': 'transparent'
//            });
//            $(header).appendTo(container);


//            var content = jQuery('<div/>', {
//                'class': 'keys-content'
//            }).appendTo(container);



//            function renderKeys() {
//                //Clearing previous key labels.
//                $(content).empty();

//                //Adding new labels.
//                for (var i = 0; i < self.keysArray.length; i++) {
//                    var key = self.keysArray[i];

//                    var keySet = (function (value) {
//                        var $key = value;
//                        var keyContainer = jQuery('<div/>', {
//                            'class': 'variant-key-container'
//                        }).appendTo(content);

//                        var deleteButton = jQuery('<div/>', {
//                            'class': 'key-remove-button'
//                        }).bind({
//                            click: function () {
//                                $(keyContainer).remove();
//                                self.removeKey($key);
//                            }
//                        }).appendTo(keyContainer);

//                        var keyField = jQuery('<input/>', {
//                            'class': 'variant-key-field',
//                            'type': 'text'
//                        });
//                        keyField.val($key);
//                        keyField.appendTo(keyContainer);
//                    })(key);

//                }

//            }


//            (function ini() {
//                renderKeys();
//            });


//            return {
//                renderKeys: renderKeys
//            };

//        })();

//        function addKey(key) {
//            if (!self.keysMap.hasItem(key)) {
//                self.keysMap.setItem(key, key);
//                self.keysArray.push(key);
//            }
//        }

//        function getKey(index) {
//            if (index < 0 || index >= self.keysArray.length) return null;
//            return self.keysArray[index];
//        }

//        function loadKeys() {
//            //Reset keys collections.
//            //self.keysMap = new HashTable(null);
//            //self.keysArray = [];
//            self.keysMap = self.group.getKeys();
//            self.keysArray = self.keysMap.values();
//            self.keysArray.sort();

//            //self.group.sets.each(function (key, value) {
//            //    value.variants.each(function ($key) {
//            //        if (!self.keysMap.hasItem($key)) {
//            //            self.keysMap.setItem($key, $key);
//            //            self.keysArray.push($key);
//            //        }
//            //    });
//            //    self.keysArray.sort();
//            //});

//            ui.renderKeys();

//        }

//        return {
//            addKey: addKey,
//            getKey: getKey,
//            loadKeys: loadKeys
//        };

//    })();

//    self.columns = (function () {
//        var columns = new HashTable(null);
//        var size = self.group.sets.size();

//        function initialize() {
//            self.group.sets.each(function (key, set) {
//                var column = setColumn(set);
//                columns.setItem(column.id, column);
//            });
//        }

//        var setColumn = function (set) {
//            var $set = set;

//            // ReSharper disable once UnusedLocals
//            var ui = (function () {

//                var valueFields = new HashTable(null);

//                var container = jQuery('<div/>', {
//                    'class': 'group-column'
//                }).css({
//                    'width': (100 / size).toFixed(2) + '%'
//                });
//                self.ui.appendGroup(container);

//                // ReSharper disable once UnusedLocals
//                var header = jQuery('<div/>', {
//                    'class': 'column-header',
//                    html: $set.updated.tag
//                });
//                $(header).bind({
//                    click: function () {
//                        $set.edit();
//                    }
//                });
//                $(header).appendTo(container);

//                $set.bind({
//                    rename: function (e) {
//                        $(header).html(e.name);
//                    }
//                });

//                var content = jQuery('<div/>', {
//                    'class': 'variants-content'
//                }).appendTo(container);


//                function renderVariants() {
//                    //Clearing previous key labels.
//                    $(content).empty();

//                    //Adding new labels.
//                    for (var i = 0; i < self.keysArray.length; i++) {
//                        var key = self.keysArray[i];
//                        var field = valueField(key);
//                        valueFields.setItem(key, field);
//                        field.appendTo(content);
//                    }

//                }

//                function valueField(key) {
//                    var variant = $set.updated.variants.getItem(key);
//                    var control = jQuery('<input/>', {
//                        'class': 'default variant-value-field',
//                        'type': 'text'
//                    });



//                    function checkVariant() {
//                        if (!variant) {
//                            variant = new Variant($set.editEntity, $set, {
//                                Key: key,
//                                IsNew: true
//                            });
//                            $set.updated.variants.setItem(variant.key, variant);
//                        }
//                    }

//                    function setValue(val) {
//                        $(control).val(val);
//                        if (val) {
//                            $(control).removeClass('invalid');
//                            $(control).addClass('valid');
//                        } else {
//                            $(control).removeClass('valid');
//                            $(control).addClass('invalid');
//                        }
//                    }

//                    function fetchValue() {
//                        //First check if this variant's value is anchored
//                        if (variant) {
//                            if (variant.updated.anchored) {
//                                return variant.updated.content;
//                            } else if (variant.updated.wordId) { //if (variant.anchored || (!variant.wordId && variant.content)) {
//                                //to be loaded by the separate process (for performance reasons).
//                            } else {
//                                //try to get the value based on the connected variantSets
//                            }
//                        }

//                        return '';

//                    }

//                    function bindEvents() {
//                        if (variant) {
//                            variant.bind({
//                                loadValue: function (e) {
//                                    setValue(e.value);
//                                }
//                            });
//                        }

//                        $(control).bind({
//                            change: function (e) {
//                                variant.changeContent(e.target.value);
//                            }
//                        });

//                    }

//                    function destroy() {
//                        $(control).remove();
//                    }

//                    (function $initialize() {
//                        checkVariant();
//                        setValue(fetchValue());
//                        bindEvents();
//                    })();



//                    return {
//                        appendTo: function (parent) {
//                            $(control).appendTo(parent);
//                        },
//                        setValue: setValue,
//                        remove: destroy
//                    };


//                }

//                function remove(key) {
//                    var field = valueFields.getItem(key);
//                    if (field) {
//                        field.remove();
//                    }
//                }

//                return {
//                    renderVariants: renderVariants,
//                    removeKey: remove
//                };


//            })();

//            return {
//                id: $set.id,
//                loadVariants: function () {
//                    $set.loadWordsForms();
//                },
//                renderVariants: function () {
//                    ui.renderVariants();
//                },
//                removeKey: function (key) {
//                    ui.removeKey(key);
//                }
//            };

//        };

//        initialize();

//        function loadVariants() {
//            columns.each(function (key, value) {
//                value.renderVariants();
//                value.loadVariants();
//            });
//        }

//        function removeKey(key) {
//            columns.each(function (colKey, col) {
//                col.removeKey(key);
//            });
//        }

//        return {
//            loadVariants: loadVariants,
//            removeKey: removeKey
//        };

//    })();

//    self.loadData = function () {
//        self.keys.loadKeys();
//        self.columns.loadVariants();
//    };

//}
//GroupOptionsManager.prototype.show = function () {
//    this.visible = true;
//    this.loadData();
//    this.ui.show();
//};
//GroupOptionsManager.prototype.hide = function () {
//    this.visible = false;
//    this.ui.hide();
//};
//GroupOptionsManager.prototype.destroy = function () {
//    this.ui.destroy();
//};
//GroupOptionsManager.prototype.removeKey = function (key) {
//    this.group.sets.each(function (setKey, set) {
//        set.removeVariant(key);
//    });
//    this.columns.removeKey(key);
//};




//function VariantDependenciesManager(parent) {
//    VariantSubpanel.call(this, parent, 'Dependencies');
//    this.VariantDependenciesManager = true;
//    var self = this;
//    self.panel = self.ui.content;
//    self.lines = new HashTable(null);

//    // ReSharper disable once UnusedLocals
//    var events = (function () {
//        self.parent.bind({

//        });
//    })();

//    var dependencyLine = function (set) {
//        var $self;
//        var $set = set;
//        var $slave;
//        var $masters = new HashTable(null);

//        var ui = (function () {
//            var container = jQuery('<div/>', {
//                'class': 'variant-dependency-line'
//            });
//            $(container).appendTo(self.panel);

//            var slaveContainer = jQuery('<div/>', {
//                'class': 'slave-container'
//            }).appendTo(container);

//            var masterContainer = jQuery('<div/>', {
//                'class': 'master-container'
//            }).appendTo(container);

//            return {
//                clear: function () {
//                    $(slaveContainer).empty();
//                    $(masterContainer).empty();
//                },
//                addSlave: function (block) {
//                    block.appendTo(slaveContainer);
//                },
//                addMaster: function (block) {
//                    block.appendTo(masterContainer);
//                },
//                destroy: function () {
//                    $(container).remove();
//                }
//            };

//        })();

//        function loadMasters() {
//            var wordtypeId = $set.updated.wordtype.id;
//            var mastersArray = $set.language.getMasters(wordtypeId);

//            $masters.clear();
//            if (!mastersArray || mastersArray.length === 0) return;

//            self.editQuestion.variantsSets.each(function (key, variantSet) {
//                var setWordtype = variantSet.updated.wordtype.id;
//                if (variantSet.languageId === $set.languageId && mastersArray.indexOf(setWordtype) >= 0) {
//                    var masterBlock = new setBlock(variantSet, true, $set.updated.parent === variantSet);

//                    //Check if this variant set changed its wordtype.
//                    variantSet.bind({
//                        changeWordtype: function (e) {
//                            var newWordtype = e.wordtype;

//                            //Block with this variant set is removed.
//                            if (mastersArray.indexOf(newWordtype.id) < 0) {
//                                //Additionally, if this set was assigned as parent, parent is cleared.
//                                if ($set.updated.parent === variantSet) {
//                                    $set.clearParent();
//                                }

//                                masterBlock.destroy();
//                                $masters.removeItem(variantSet.id);
//                            }
//                        }
//                    });

//                    masterBlock.selfinject(masterBlock);
//                    $masters.setItem(masterBlock.id, masterBlock);
//                    masterBlock.bind({
//                        click: function (e) {
//                            blockClicked(e.block);
//                        }
//                    });
//                }
//            });

//        }

//        function blockClicked(block) {
//            var previousParent = $set.updated.parent;

//            if (previousParent === block.set) {
//                $set.clearParent();
//                block.deactivate();
//            } else {

//                if (previousParent) {
//                    $set.clearParent();
//                    var previousBlock = $masters.getItem(previousParent.id);
//                    if (previousBlock) previousBlock.deactivate();
//                }

//                $set.setParent(block.set);
//                block.activate();

//            }

//        }

//        function render() {

//            ui.clear();

//            $slave = new setBlock(set, false);
//            $slave.selfinject($slave);
//            ui.addSlave($slave.view());

//            loadMasters();
//            $masters.each(function (key, value) {
//                ui.addMaster(value.view());
//            });

//        }

//        render();

//        // ReSharper disable once UnusedLocals
//        var $events = (function () {
//            $set.bind({
//                changeWordtype: function () {
//                    loadMasters();
//                    if ($masters === undefined || $masters.size() === 0) {
//                        $set.clearParent();
//                        ui.destroy();
//                    } else {
//                        var previousParentId = $set.parent.id;
//                        if (!$masters.hasItem(previousParentId)) {
//                            $set.clearParent();
//                        }
//                        render();
//                    }
//                }
//            });

//            $set.language.bind({
//                changeWordtype: function (e) {
//                    if (!$masters.hasItem(e.set.id)) {
//                        loadMasters();
//                        render();
//                    }
//                }
//            });

//        })();


//        return {
//            selfinject: function (me) {
//                $self = me;
//            },
//            id: $set.id,
//            destroy: function () {
//                ui.destroy();
//            },
//            refresh: function () {
//                loadMasters();
//                render();
//            }
//        };

//    };

//    var setBlock = function (set, isMaster, isActive) {
//        var $line;
//        var $self;
//        var $set = set;
//        var $active = isActive;
//        var $events = new EventHandler();

//        var ui = (function () {
//            var container = jQuery('<div/>', {
//                'class': 'variant-set-block'
//            });
//            $(container).bind({
//                click: function () {
//                    $events.trigger({
//                        type: 'click',
//                        block: $self
//                    });
//                }
//            });

//            // ReSharper disable once UnusedLocals
//            var flag = jQuery('<div/>', {
//                'class': 'unselectable flag ' + set.language.language.flag + '-small'
//            }).appendTo(container);

//            var name = jQuery('<div/>', {
//                'class': 'unselectable name',
//                html: set.updated.tag
//            }).appendTo(container);

//            set.bind({
//                rename: function (e) {
//                    $(name).html(e.name);
//                }
//            });

//            function refresh() {
//                if ($active) {
//                    $(container).addClass('active');
//                } else {
//                    $(container).removeClass('active');
//                }
//            }

//            refresh();

//            return {
//                container: function () {
//                    return container;
//                },
//                destroy: function () {
//                    $(container).remove();
//                },
//                activate: function () {
//                    $active = true;
//                    refresh();
//                },
//                deactivate: function () {
//                    $active = false;
//                    refresh();
//                }
//            };

//        })();

//        return {
//            selfinject: function (me) {
//                $self = me;
//            },
//            id: $set.id,
//            set: $set,
//            view: function () {
//                return ui.container();
//            },
//            destroy: ui.destroy,
//            setLine: function (line) {
//                $line = line;
//            },
//            bind: function (e) {
//                $events.bind(e);
//            },
//            trigger: function (e) {
//                $events.trigger(e);
//            },
//            activate: function () {
//                ui.activate();
//            },
//            deactivate: function () {
//                ui.deactivate();
//            }
//        };

//    };

//    function createNewLine(set) {
//        var line = dependencyLine(set);
//        line.selfinject(line);
//        self.lines.setItem(line.id, line);
//        return line;
//    }

//    function checkSet(set) {
//        var language = set.language;
//        var masters = language.getMasters(set.updated.wordtype.id);
//        if (masters && masters.length) {
//            createNewLine(set);
//        }

//        set.bind({
//            changeWordtype: function (e) {

//                if (!e.wasDependable && e.isDependable) {
//                    checkSet(set);
//                }

//            }
//        });

//    }

//    this.initialize = function () {
//        self.parent.groups.each(function (groupKey, group) {
//            group.sets.each(function (setKey, set) {
//                checkSet(set);
//            });
//        });
//    };

//}
//mielk.objects.extend(VariantSubpanel, VariantDependenciesManager);




//function VariantSetEditPanel(set) {
//    this.VariantSetEditPanel = true;
//    var self = this;
//    self.set = set;
//    self.events = new EventHandler();

//    this.validator = (function () {
//        var invalid = new HashTable(null);

//        return {
//            validation: function (e) {
//                if (e.status) {
//                    invalid.removeItem(e.id);
//                } else {
//                    invalid.setItem(e.id, e.id);
//                }

//                self.events.trigger({
//                    type: 'validation',
//                    status: invalid.size() === 0
//                });

//            }
//        };

//    })();

//    this.ui = (function () {
//        var background = jQuery('<div/>', {
//            'class': 'edit-background',
//            'z-index': my.ui.addTopLayer()
//        }).appendTo($(document.body));

//        var frame = jQuery('<div/>', {
//            'class': 'edit-frame'
//        }).appendTo($(background));

//        var container = jQuery('<div/>', {
//            'class': 'edit-container variant-set-edit-panel'
//        }).appendTo($(frame));

//        // ReSharper disable once UnusedLocals
//        var close = jQuery('<div/>', {
//            'class': 'edit-close'
//        }).bind({
//            'click': function () {
//                self.cancel();
//            }
//        }).appendTo($(frame));


//        return {
//            display: function () {
//                $(background).css({
//                    'visibility': 'visible',
//                    'z-index': my.ui.addTopLayer()
//                });
//            },
//            hide: function () {
//                $(background).css({
//                    'visibility': 'hidden'
//                });
//            },
//            destroy: function () {
//                $(background).remove();
//            },
//            append: function (element) {
//                $(element).appendTo($(container));
//            }
//        };

//    })();

//    this.meta = (function () {
//        var timer;
//        var container = jQuery('<div/>', {
//            'class': 'meta-container'
//        });

//        self.ui.append(container);

//        // ReSharper disable once UnusedLocals
//        var flag = jQuery('<div/>', {
//            'class': 'flag ' + set.language.language.flag
//        }).appendTo(container);

//        var errorContainer = jQuery('<div/>').addClass('error').appendTo($(container));
//        var error = jQuery('<div/>', { 'class': 'error_content' }).appendTo(errorContainer);
//        var errorIcon = jQuery('<span/>', { 'class': 'icon' }).appendTo($(container));

//        var name = jQuery('<input/>', {
//            'class': 'field default',
//            'type': 'text'
//        }).bind({
//            'keydown': function (e) {
//                if (e.which === 13) {
//                    /* Jeżeli to nie jest ustawione, w IE 9 focus przeskakuje od razu
//                        * na przycisk [Select categories] i wywołuje jego kliknięcie. */
//                    e.preventDefault();
//                    e.stopPropagation();
//                }
//            },
//            'keyup': function () {
//                var field = this;
//                if (timer) {
//                    clearTimeout(timer);
//                }
//                timer = setTimeout(function () {
//                    self.validate($(field).val());
//                }, 150);
//            },
//            'change': function () {
//                self.validate($(this).val());
//            },
//            'mouseup': function (e) {
//                e.preventDefault();
//            },
//            'blur': function () {
//                self.validate($(this).val());
//            }
//        }).on({
//            'focus': function () {
//                this.select();
//            }
//        });

//        $(name).val(set.updated.tag);

//        //Append panel to span to center it vertically.
//        var span = jQuery('<span/>', {
//            'class': 'block'
//        }).bind({
//            'click': function () {
//                $(name).focus();
//            }
//        }).appendTo($(container));

//        $(name).appendTo($(span));


//        function format(value) {
//            if (value === true) {
//                $(name).removeClass('invalid').addClass('valid');
//                $(errorContainer).css({ 'display': 'none' });
//                $(errorIcon).removeClass('iconInvalid').addClass('iconValid');
//            } else {
//                $(name).removeClass('valid').addClass('invalid');
//                $(errorContainer).css({ 'display': 'table' });
//                $(errorIcon).removeClass('iconValid').addClass('iconInvalid');
//                $(error).text(value);
//            }
//        }

//        function validate(value) {
//            if (!value || value.trim().length === 0) return MessageBundle.get(dict.NameCannotBeEmpty);

//            var sets = self.set.language.variantSets;
//            for (var i = 0; i < sets.length; i++) {
//                var $set = sets[i];
//                if ($set.updated.tag === value && $set !== set) {
//                    return MessageBundle.get(dict.NameAlreadyExists);
//                }
//            }

//            return true;

//        }

//        return {
//            validate: validate,
//            format: format,
//            name: function () {
//                return $(name).val();
//            }
//        };

//    })();

//    this.wordtypePanel = (function () {
//        var value = self.set.updated.wordtype;
//        var container = jQuery('<div/>', {
//            'class': 'wordtype-container'
//        });

//        self.ui.append(container);

//        // ReSharper disable once UnusedLocals
//        var name = jQuery('<div/>', {
//            'class': 'name',
//            html: 'Type'
//        }).appendTo(container);

//        var combobox = jQuery('<div/>', {
//            'class': 'combobox'
//        }).appendTo(container);

//        var dropdown = new DropDown({
//            container: combobox,
//            data: WORDTYPE.getValues(),
//            slots: 5,
//            caseSensitive: false,
//            confirmWithFirstClick: true
//        });

//        dropdown.select(value);

//        dropdown.bind({
//            change: function (e) {
//                value = e.item;
//                self.paramsPanel.refresh(value.id);
//            }
//        });

//        return {
//            value: function () {
//                return value;
//            }
//        };

//    })();

//    this.paramsPanel = (function () {

//        var params = new HashTable(null);

//        var container = jQuery('<div/>', {
//            'class': 'variant-set-params-container'
//        });

//        self.ui.append(container);

//        function load(wordtypeId) {
//            loadDefinitions(wordtypeId);
//            loadValues();
//        }

//        function loadDefinitions(wordtypeId) {
//            var definitions = my.db.fetch('Questions', 'GetVariantSetPropertiesDefinitions', {
//                'languageId': self.set.languageId,
//                'wordtypeId': wordtypeId || self.set.updated.wordtype.id
//            });

//            for (var i = 0; i < definitions.length; i++) {
//                var definition = definitions[i];
//                var p = param({
//                    id: definition.Id,
//                    propertyId: definition.PropertyId
//                });
//                params.setItem(definition.Id, p);
//            }
//        }

//        function loadValues() {
//            self.set.updated.properties.each(function (key, value) {
//                var property = params.getItem(key);
//                if (property) {
//                    property.setValue(value);
//                }
//            });
//        }

//        function render() {
//            params.each(function (key, value) {
//                value.render();
//            });
//        }

//        function param(properties) {
//            var id = properties.id;
//            var propertyId = properties.propertyId;
//            var property = my.grammarProperties.get(propertyId);
//            var value;
//            var selectedOption;
//            var events = new EventHandler();

//            var ui = (function () {
//                var $container = jQuery('<div/>', {
//                    'class': 'variant-set-single-param'
//                }).appendTo(container);

//                var name = jQuery('<div/>', {
//                    'class': 'name'
//                }).appendTo($container);

//                var controlContainer = jQuery('<div/>', {
//                    'class': 'control-container'
//                }).appendTo($container);

//                var control;

//                function renderAsCheckbox() {
//                    control = my.ui.checkbox({
//                        name: property.name,
//                        caption: property.caption,
//                        checked: value,
//                        container: controlContainer
//                    });
//                    control.bind({
//                        change: function (e) {
//                            value = e.value;
//                        }
//                    });

//                    events.bind({
//                        change: function (e) {
//                            control.change(e.value);
//                        }
//                    });

//                }

//                function renderAsDropdown() {
//                    var data = [];
//                    property.options.each(function ($key, $value) {
//                        data.push({
//                            key: $value.id,
//                            name: $value.name,
//                            object: $value
//                        });
//                    });

//                    control = new DropDown({
//                        container: controlContainer,
//                        data: data
//                    });
//                    control.bind({
//                        change: function (e) {
//                            value = e.value;
//                        }
//                    });

//                    if (value) {
//                        control.select(value);
//                    }

//                    events.bind({
//                        change: function (e) {
//                            control.select(e.value);
//                        }
//                    });

//                }

//                return {
//                    render: function () {

//                        $(name).html(property.name);

//                        switch (property.type) {
//                            case 1:
//                                renderAsCheckbox();
//                                break;
//                            case 2:
//                                renderAsDropdown();
//                                break;
//                        }
//                    }
//                };

//            })();

//            return {
//                id: id,
//                property: property,
//                value: function () {
//                    return value;
//                },
//                setValue: function (val) {
//                    value = val;
//                    if (property.options) {
//                        selectedOption = property.options.getItem(value);
//                    }
//                    events.trigger({
//                        type: 'change',
//                        value: val
//                    });
//                },
//                render: function () {
//                    ui.render();
//                }
//            };

//        }

//        function refresh(wordtypeId) {
//            //Clear previous params.
//            $(container).empty();
//            params = new HashTable(null);

//            load(wordtypeId);
//            render();
//        }

//        (function ini() {
//            refresh();
//        })();


//        return {
//            getParams: function () {
//                var result = [];
//                params.each(function ($key, $value) {
//                    result.push({
//                        key: $key,
//                        value: $value.value()
//                    });
//                });
//                return result;
//            },
//            refresh: refresh
//        };

//    })();

//    this.buttons = (function () {
//        var panel = jQuery('<div/>', {
//            'class': 'edit-buttons-panel'
//        });

//        var container = jQuery('<div/>', {
//            'class': 'edit-buttons-container'
//        }).appendTo($(panel));

//        var ok = jQuery('<input/>', {
//            'class': 'edit-button',
//            'type': 'submit',
//            'value': 'OK'
//        }).bind({
//            'click': function () {
//                self.confirm();
//            }
//        }).appendTo($(container));

//        // ReSharper disable once UnusedLocals
//        var cancel = jQuery('<input/>', {
//            'class': 'edit-button',
//            'type': 'submit',
//            'value': 'Cancel'
//        }).bind({
//            'click': function () {
//                self.cancel();
//            }
//        }).appendTo($(container));

//        self.events.bind({
//            validation: function (e) {
//                if (e.status) {
//                    $(ok).removeAttr('disabled');
//                } else {
//                    $(ok).attr('disabled', 'disabled');
//                }
//            }
//        });

//        self.ui.append(panel);

//    })();

//    self.validate();

//}
//VariantSetEditPanel.prototype.display = function () {
//    this.ui.display();
//};
//VariantSetEditPanel.prototype.cancel = function () {
//    this.ui.destroy();
//};
//VariantSetEditPanel.prototype.confirm = function () {
//    var self = this;
//    self.set.rename(this.meta.name());
//    self.set.changeWordtype(this.wordtypePanel.value());
//    self.set.setProperties(self.paramsPanel.getParams());
//    self.cancel();
//};
//VariantSetEditPanel.prototype.validate = function (tag) {
//    var self = this;
//    var validationResult = self.meta.validate(tag !== undefined ? tag : self.set.updated.tag);

//    self.meta.format(validationResult);

//    self.validator.validation({
//        id: self.set.id,
//        status: (validationResult === true ? true : false)
//    });

//};




//function VariantLimitsManager(parent) {
//    VariantSubpanel.call(this, parent, 'Limits');
//    this.VariantLimitsManager = true;
//    var self = this;
//    self.panel = self.ui.content;

//    var groups = function ($isBase) {
//        var isBase = $isBase;
//        var items = new HashTable(null);
//        var selectedConnectionGroup = null;
//        var container = jQuery('<div/>', {
//            'class': 'variant-options-groups'
//        }).css({
//            'display': isBase ? 'block' : 'none'
//        });
//        $(container).appendTo(self.panel);

//        function add(item) {
//            items.setItem(item.id, item);
//            item.appendTo(container);
//        }

//        function createNew(group) {
//            var $group = new ConnectionGroup(self, group, isBase);
//            add($group);
//        }

//        function clear() {
//            $(container).empty();
//        }

//        function select(group) {
//            if (selectedConnectionGroup !== group) {
//                selectedConnectionGroup = group;

//                self.trigger({
//                    type: isBase ? 'changeBaseGroup' : 'changeCheckGroup',
//                    group: group
//                });

//            }
//        }

//        function unselect(group) {
//            if (selectedConnectionGroup === group) {
//                selectedConnectionGroup = null;
//            }
//        }

//        function show() {
//            $(container).css({
//                'display': 'block'
//            });
//        }

//        return {
//            show: show,
//            clear: clear,
//            add: add,
//            createNew: createNew,
//            select: select,
//            unselect: unselect,
//            getSelected: function () {
//                return selectedConnectionGroup;
//            }
//        };
//    };

//    var populateCheckGroupsPanel = function (base) {
//        self.checkedGroups.clear();
//        self.checkedGroups.show();
//        self.parent.groups.each(function (key, value) {
//            if (value.id !== base.id) {
//                self.checkedGroups.createNew(value);
//            }
//        });
//    };



//    // ReSharper disable once UnusedLocals
//    var shortcutsPanel = (function () {
//        var container = jQuery('<div/>', {
//            'class': 'limit-shortcuts-panel'
//        });

//        function render() {
//            $(container).appendTo(self.panel);
//        }

//        return {
//            render: render
//        };

//    })();



//    var limitGrid = (function () {
//        var base = null;
//        var checked = null;
//        var baseKeys = new HashTable(null);
//        var checkedKeys = new HashTable(null);

//        var container = jQuery('<div/>', {
//            'class': 'limit-grid-container'
//        }).css({
//            'display': 'none'
//        });

//        var headerColumn = jQuery('<div/>', {
//            'class': 'limit-grid-header-column'
//        }).appendTo(container);

//        var content = jQuery('<div/>', {
//            'class': 'absolute limit-grid-content'
//        }).appendTo(container);

//        function render() {
//            $(container).appendTo(self.panel);
//        }

//        function show() {
//            $(container).css({
//                'display': 'block'
//            });
//        }

//        function hide() {
//            $(container).css({
//                'display': 'none'
//            });
//        }

//        function populate($checked) {
//            loadKeys($checked);
//            renderHeaderColumn();
//            renderContent();
//            show();
//        }

//        function loadKeys($checked) {
//            base = self.baseGroups.getSelected();
//            checked = $checked;

//            baseKeys = base.group.getKeys();
//            checkedKeys = checked.group.getKeys();
//        }

//        function renderHeaderColumn() {
//            //Clear previous entries.
//            $(headerColumn).empty();

//            //First empty header cell is added.
//            // ReSharper disable once UnusedLocals
//            var headerCell = jQuery('<div/>', {
//                'class': 'limit-grid-header-cell'
//            }).appendTo(headerColumn);

//            baseKeys.each(function (key) {
//                var $label = label(key);
//                $label.append(headerColumn);
//            });

//        }

//        function renderContent() {
//            //Clear previous entries.
//            $(content).empty();

//            checkedKeys.each(function (key) {
//                var column = jQuery('<div/>', {
//                    'class': 'limit-grid-column'
//                });
//                $(column).appendTo(content);

//                var headerCell = jQuery('<div/>', {
//                    'class': 'limit-grid-header-cell',
//                    'html': key
//                });
//                $(headerCell).appendTo(column);


//                //Render cells.
//                baseKeys.each(function ($key) {
//                    // ReSharper disable once UnusedLocals
//                    var $cell = cell({
//                        baseGroup: base,
//                        checkedGroup: checked,
//                        baseKey: $key,
//                        checkedKey: key,
//                        column: column
//                    });
//                });


//            });

//        }

//        function clear() {

//        }


//        var label = function (key) {
//            var control = jQuery('<div/>', {
//                'class': 'limit-grid-label',
//                'html': key
//            });

//            return {
//                append: function ($container) {
//                    $(control).appendTo($container);
//                }
//            };

//        };

//        var cell = function (params) {
//            var baseGroup = params.baseGroup;
//            var checkedGroup = params.checkedGroup;
//            var baseKey = params.baseKey;
//            var checkedKey = params.checkedKey;
//            var column = params.column;
//            var excluded = false;

//            function isExcluded() {
//                var result = false;
//                baseGroup.group.sets.each(function (setKey, set) {
//                    var variant = set.getVariantByKey(baseKey);
//                    if (variant && !result) {
//                        checkedGroup.group.sets.each(function (checkedSetKey, checkedSet) {
//                            if (!result) {
//                                result = variant.isExcluded(checkedSet, checkedKey);
//                            }
//                        });
//                    }
//                });

//                return result;

//            }

//            function check() {
//                var $excluded = isExcluded();
//                update($excluded);
//            }

//            function updateLinked() {
//                baseGroup.group.sets.each(function (setKey, set) {
//                    var variant = set.getVariantByKey(baseKey);
//                    if (variant) {
//                        checkedGroup.group.sets.each(function (checkedSetKey, checkedSet) {
//                            variant.exclude(checkedSet, checkedKey, excluded);
//                        });
//                    }
//                });
//            }

//            function update($excluded) {
//                excluded = $excluded;
//                updateLinked();
//                $(control).css({
//                    'background-color': excluded ? 'red' : 'green'
//                });
//            }

//            var control = jQuery('<div/>', {
//                'class': 'limit-grid-cell',
//                'title': baseKey + ' | ' + checkedKey
//            });

//            $(control).bind({
//                click: function () {
//                    update(!excluded);
//                }
//            });
//            $(control).appendTo(column);


//            (function ini() {
//                check();
//            })();

//        };

//        return {
//            render: render,
//            populate: populate,
//            clear: clear,
//            hide: hide,
//            show: show
//        };

//    })();





//    // ReSharper disable once UnusedLocals
//    var events = (function () {
//        self.parent.bind({
//            newGroup: function (e) {
//                self.baseGroups.createNew(e.group);
//            }
//        });

//        self.bind({
//            selectGroup: function (e) {
//                var $groups = e.isBase ? self.baseGroups : self.checkedGroups;
//                var previous = $groups.getSelected();
//                if (previous !== e.connectionGroup) {
//                    $groups.select(e.connectionGroup);
//                    if (previous) {
//                        previous.deactivate();
//                    }
//                }
//            },
//            unselectGroup: function (e) {
//                var $groups = e.isBase ? self.baseGroups : self.checkedGroups;
//                if ($groups.getSelected() === e.connectionGroup) {
//                    $groups.unselect(e.connectionGroup);
//                }
//            },
//            changeBaseGroup: function (e) {
//                populateCheckGroupsPanel(e.group);
//                limitGrid.clear();
//                limitGrid.hide();
//            },
//            changeCheckGroup: function (e) {
//                limitGrid.populate(e.group);
//            }
//        });

//    })();

//    function initialize() {
//        //Clear previous selections.
//        self.baseGroups = groups(true);
//        self.checkedGroups = groups(false);

//        self.parent.groups.each(function (key, value) {
//            self.baseGroups.createNew(value);
//        });

//        //shortcutsPanel.render();
//        limitGrid.render();

//    }

//    initialize();

//}


//mielk.objects.extend(VariantSubpanel, VariantLimitsManager);



//function ConnectionGroup(parent, group, isBase) {
//    this.ConnectionGroup = true;
//    var self = this;
//    this.parent = parent;
//    this.group = group;
//    this.id = group.id;
//    this.blocks = new HashTable(null);
//    this.active = false;
//    this.isBase = isBase ? true : false;

//    this.ui = (function () {
//        var container = jQuery('<div/>', {
//            'class': 'variant-options-group variant-connection-group'
//        }).bind({
//            click: function () {
//                if (self.active) {
//                    //self.deactivate();
//                } else {
//                    self.activate();
//                }
//            }
//        });

//        return {
//            refresh: function () {
//                if (self.active) {
//                    $(container).addClass('active');
//                } else {
//                    $(container).removeClass('active');
//                }
//            },
//            addBlock: function (block) {
//                block.view().appendTo(container);
//            },
//            destroy: function () {
//                $(container).remove();
//            },
//            appendTo: function (parentContainer) {
//                $(container).appendTo(parentContainer);
//            }
//        };

//    })();

//    //groupViews.add(container);

//    function createBlocks() {
//        self.group.sets.each(function (key, value) {
//            var block = new SetBlock(value);
//            self.addBlock(block);
//        });
//    }



//    // ReSharper disable once UnusedLocals
//    this.events = (function () {
//        self.group.bind({
//            remove: function (e) {
//                var block = self.getBlock(e.set.id);
//                self.removeBlock(block);
//            },
//            add: function (e) {
//                var block = new SetBlock(e.set);
//                self.addBlock(block);
//            }
//        });
//    })();

//    //Initializing.
//    (function () {
//        createBlocks();
//    })();


//}
//ConnectionGroup.prototype.destroy = function () {
//    this.ui.destroy();
//};
//ConnectionGroup.prototype.getBlock = function (id) {
//    return this.blocks.getItem(id);
//};
//ConnectionGroup.prototype.addBlock = function (block) {
//    this.blocks.setItem(block.id, block);
//    block.setGroup(this);
//    this.ui.addBlock(block);
//};
//ConnectionGroup.prototype.removeBlock = function (block) {
//    this.blocks.removeItem(block.id);
//    block.destroy();
//    if (this.blocks.size() === 0) this.ui.destroy();
//};
//ConnectionGroup.prototype.hasSet = function (key) {
//    return this.blocks.hasItem(key);
//};
//ConnectionGroup.prototype.appendTo = function (container) {
//    this.ui.appendTo(container);
//};
//ConnectionGroup.prototype.deactivate = function () {
//    var self = this;
//    self.active = false;
//    self.ui.refresh();
//    self.parent.trigger({
//        type: 'unselectGroup',
//        connectionGroup: self,
//        group: self.group,
//        isBase: self.isBase
//    });
//};
//ConnectionGroup.prototype.activate = function () {
//    var self = this;
//    self.active = true;
//    self.ui.refresh();
//    self.parent.trigger({
//        type: 'selectGroup',
//        connectionGroup: self,
//        group: self.group,
//        isBase: self.isBase
//    });
//};


//function SetBlock(set) {
//    this.SetBlock = true;
//    var self = this;
//    this.set = set;
//    this.id = set.id;

//    this.ui = (function () {
//        var container = jQuery('<div/>', {
//            'class': 'variant-set-block'
//        });

//        // ReSharper disable once UnusedLocals
//        var flag = jQuery('<div/>', {
//            'class': 'unselectable flag ' + self.set.language.language.flag + '-small'
//        }).appendTo(container);

//        var name = jQuery('<div/>', {
//            'class': 'unselectable name',
//            html: self.set.updated.tag
//        }).appendTo(container);

//        self.set.bind({
//            rename: function (e) {
//                $(name).html(e.name);
//            }
//        });

//        return {
//            container: function () {
//                return container;
//            },
//            destroy: function () {
//                $(container).remove();
//            }
//        };

//    })();

//}
//SetBlock.prototype.setGroup = function (group) {
//    this.group = group;
//};
//SetBlock.prototype.view = function () {
//    return this.ui.container();
//};
//SetBlock.prototype.destroy = function () {
//    this.ui.destroy();
//};
function VariantSet(query, params) {

    'use strict';

    var self = this;
    self.VariantSet = true;

    self.query = query;
    self.eventHandler = mielk.eventHandler();

    //Instance properties.
    self.id = params.Id || 0;
    self.tag = params.VariantTag || '';
    self.wordtype = Ling.Enums.Wordtypes.getItem(params.WordType);
    self.language = Ling.Languages.getLanguage(params.LanguageId);
    self.grammarFormId = params.GrammarFormId;
    self.isActive = (params.IsActive !== undefined ? params.IsActive : true);
    self.creatorId = params.CreatorId || 1;
    self.createDate = params.CreateDate || new Date();
    self.isApproved = params.IsApproved || false;
    self.positive = params.Positive || 0;
    self.negative = params.Negative || 0;
    self.isNew = params.isNew || params.IsNew || false;

    //Variants.
    self.variants = mielk.hashTable();
    self.variantsById = mielk.hashTable();

    //Interaction with other variant sets.
    self.related = mielk.hashTable();
    self.dependants = mielk.hashTable();
    self.master = null;


    (function initialize() {
        self.loadVariants(params.Variants);
    })();

}
VariantSet.prototype = {

    bind: function(e) {
        this.eventHandler.bind(e);
    },
    
    trigger: function(e) {
        this.eventHandler.trigger(e);
    },

    addRelated: function (set) {
        this.related.setItem(set.id, set);
    },

    addDependant: function (set) {
        this.dependants.setItem(set.id, set);
    },

    setMaster: function (set) {
        this.master = set;
    },

    clone: function () {
        var self = this;

        //Create a copy instance of Query with all primitive
        //properties given as initialize parameters.
        var obj = new VariantSet(self.query, {
              Id: self.id
            , VariantTag: self.tag
            , WordType: self.wordtype.id
            , LanguageId: self.language.id
            , GrammarFormId: self.grammarFormId
            , IsActive: self.isActive
            , CreatorId: self.creatorId
            , CreateDate: self.createDate
            , IsApproved: self.isApproved
            , Positive: self.positive
            , Negative: self.negative
            , IsNew: self.isNew
        });

        //Complex properties are set directly.
        obj.cloned = true;
        obj.variants = self.variants.clone(true);
        obj.related = self.related.clone(false);
        obj.dependants = self.dependants.clone(false);
        obj.master = self.master;


        //Refresh Variants
        obj.variants.each(function (key, variant) {
            variant.injectSet(obj);
        });

        return obj;

    },

    refreshQuery: function (query) {
        var self = this;

        self.query = query;

        //Overwrite master with cloned version.
        if (self.master) {
            self.master = query.getVariantSet(self.master.id);
        }

        //Overwrite dependants with cloned versions.
        self.dependants.each(function (dependant) {
            self.dependants.setItem(dependant, query.getVariantSet(dependant));
        });

        //Overwrite related with cloned versions.
        self.related.each(function (related) {
            self.related.setItem(related, query.getVariantSet(related));
        });

    },

    loadVariants: function(variants) {
        var self = this;
        self.variants = mielk.hashTable();
        self.variantsById = mielk.hashTable();

        mielk.arrays.each(variants, function(v) {
            var variant = new Variant(self, v);
            self.variants.setItem(variant.key, variant);
            self.variantsById.setItem(variant.id, variant);            
        });

    },
    
    rename: function(name) {
        this.tag = name;
        this.trigger({
            type: 'name',
            name: name
        });
    },

    separate: function () {
        var self = this;

        self.related.each(function (key, value) {
            self.removeConnection(key);
            value.removeConnection(self.id);
        });
        self.trigger({ type: 'separate' })
    },

    removeConnection: function (connected) {
        var connectedId = $.isNumeric(connected) ? Number(connected) : connected.id;
        this.related.removeItem(connectedId);
    },

    isAlone: function () {
        return this.related.size() === 0;
    }

};




function VariantSetBlock(set, params) {

    'use strict';

    var self = this;
    self.VariantSetBlock = true;

    self.set = set;
    self.panel = params.panel;
    self.eventHandler = mielk.eventHandler();
    self.isActive = false;
    self.isMovable = params.movable || false;
    self.isRemovable = false;

    self.ui = (function() {
        var container;
        var flag;
        var tag;
        var mover;

        function render() {
            container = jQuery('<div/>', {
                'class': 'unselectable variant-set-block'
            }).appendTo(self.panel);

            flag = jQuery('<div/>', {
                'class': 'unselectable flag ' + self.set.language.flag + '-small'
            });
            flag.appendTo(container);

            tag = jQuery('<div/>', {
                'class': 'unselectable name',
                html: self.set.tag
            });
            tag.appendTo(container);

        }

        function events() {
            //Set events.
            self.set.bind({
                rename: function (e) {
                    $(tag).html(e.name);
                }
            });
            
            //This events.
            self.bind({                
                activate: function (e) {
                    activate(e.value, e.x, e.y);
                }
            });
            
            //Controls events.
            $(container).bind({                
                mousedown: function (e) {
                    var value = !self.isActive;
                    self.activate(value, e.pageX, e.pageY);
                }
            });

            //if (self.isMovable) {
            //    $(document).bind({
            //        mousemove: function (e) {
            //            handleMove(e.pageX, e.pageY);
            //        }
            //    });
            //}

        }

        function activate(value, x, y) {
            if (self.isMovable) {
                activateMover(value, x, y);
            } else {
                activatePanel(value);
            }
        }
        
        function activateMover(value, x, y) {
            $(container).css({
                'visibility': (value ? 'hidden' : 'visible')
            });

            if (value) {
                mover = createMover(x, y);
            } else {
                destroyMover();
            }
        }
        
        function activatePanel(value) {
            var activeClassName = 'active-variant-set-block';
            if (value) {
                $(container).addClass(activeClassName);
            } else {
                $(container).removeClass(activeClassName);
            }
        }

        function createMover(x, y) {
            var blockOffset = $(container).offset();
            var panelOffset = $(self.panel).offset();

            return shadow({
                x: x,
                y: y,
                left: blockOffset.left - panelOffset.left,
                top: blockOffset.top - panelOffset.top
            });

        }
        
        function destroyMover() {
            if (mover) mielk.fn.run(mover.destroy);
            mover = null;
        }

        function bind(e) {
            $(container).bind(e);
        }

        function trigger(e) {
            $(container).trigger(e);
        }

        function bindEvents(bindings) {
            if (bindings && bindings.HashTable) {
                var $events = {};
                bindings.each(function (key, binding) {
                    $events[key] = binding;
                });
                bind($events);
            }
        }
        
        function destroy() {
            destroyMover();
            $(container).remove();
        }
        
        function handleMove(x, y) {
            if (self.isActive && mover) {
                mover.move(x, y);
            }
        }

        function shadow(position) {
            var clickX = position.x;
            var clickY = position.y;
            var divTop = position.top;
            var divLeft = position.left;

            var shadowContainer;
            var shadowContent;
            var shadowFlag;
            var shadowName;
            var shadowCancel;


            function renderShadow() {
                shadowContainer = jQuery('<div/>', {
                    'class': 'unselectable variant-set-block variant-block-mover'
                }).css({
                    'top': divTop + 'px',
                    'left': divLeft + 'px'
                }).appendTo(self.panel);

                shadowContent = jQuery('<div/>', {
                    'class': 'relative full-size'
                });
                shadowContent.appendTo(shadowContainer);

                shadowFlag = jQuery('<div/>', {
                    'class': 'flag ' + set.language.flag + '-small'
                });
                shadowFlag.appendTo(shadowContent);

                shadowName = jQuery('<div/>', {
                    'class': 'name',
                    html: self.set.tag
                });
                shadowName.appendTo(shadowContent);

                shadowCancel = jQuery('<div/>', {
                    'class': 'variant-set-block-cancel'
                });
                shadowCancel.appendTo(shadowContent);

            }

            function shadowEvents() {
                self.bind({
                    removableStatusChanged: function() {
                        refreshStatus();
                    }
                });
            }

            function destroyShadow() {
                $(shadowContainer).remove();
            }
            
            function move(x, y) {
                var left = divLeft + (x - clickX);
                var top = divTop + (y - clickY);
                $(shadowContainer).css({
                    'top': top + 'px',
                    'left': left + 'px'
                });
            }
            
            function refreshStatus() {
                $(shadowCancel).css({
                    'visibility': (self.isRemovable ? 'visible' : 'hidden')
                });
            }


            (function initialize() {
                renderShadow();
                shadowEvents();
            })();

            return {                
                 view: shadowContainer
                ,destroy: destroyShadow
                ,move: move
                ,refreshStatus: refreshStatus
            };

        }

        (function initialize() {
            render();
            events();
        })();

        return {
              view: container
            , bind: bind
            , trigger: trigger
            , set: set
            , bindEvents: bindEvents
            , destroy: destroy
            , handleMove: handleMove
        };

    })();

}
VariantSetBlock.prototype = {    
    
    bind: function(e) {
        this.eventHandler.bind(e);
    },
    
    trigger: function(e) {
        this.eventHandler.trigger(e);
    },
    
    activate: function (value, x, y) {
        this.isActive = (value === undefined ? !this.isActive : value);
        this.trigger({
            type: 'activate',
            value: this.isActive,
            x: x,
            y: y
        });
    },
    
    bindEvents: function(events) {
        this.ui.bindEvents(events);
    },
    
    view: function() {
        return this.ui.view;
    },
    
    setAsRemovable: function(value) {
        this.isRemovable = value;
        this.trigger({ type: 'removableStatusChanged' });
    },
    
    handleMove: function (x, y) {
        var self = this;
        if (self.isMovable) {
            self.ui.handleMove(x, y);
        }
        
    },

    separate: function () {
        this.set.separate();
    },

    destroy: function () {
        this.ui.destroy();
    },

    isAlone: function () {
        return this.set.isAlone();
    },

    move: function (group) {
        
    }

};



//    var setBlock = function (set) {
//        var $group = null;
//        var $self = null;
//        var $set = set;
//        var $active = false;
//        var mover = null;

//        var ui = (function () {


//        })();

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




function Variant(set, params) {

    'use strict';

    var self = this;
    self.Variant = true;
    self.events = mielk.eventHandler();
    
    //Instance properties.
    self.set = set;
    self.language = set.language;
    self.id = params.Id;
    self.key = params.Key;
    self.content = params.Content || '';
    self.anchored = params.IsAnchored || false;
    self.isNew = params.IsNew ? true : false;
    self.excluded = mielk.hashTable();
    self.words = mielk.hashTable();

}
Variant.prototype = {    
    
    bind: function(e) {
        this.events.bind(e);
    },
    
    trigger: function(e) {
        this.events.trigger(e);
    },
    
    clone: function () {
        var self = this;
        var variant = new Variant(self.set, {
            Id: self.id
            , Key: self.key
            , Content: self.content
            , IsAnchored: self.anchored
            , IsNew: self.isNew
        });
        variant.cloned = true;
        return variant;
    },
    
    injectSet: function(set) {
        this.set = set;

        this.excluded.each(function (k, v) {
            //Convert excluded.
            //var excluded = set.get
        });

    }
    
};

//Variant.prototype.loadLimits = function () {
//    this.excluded = new HashTable(null);

//    for (var i = 0; i < this.raw.excluded.length; i++) {
//        var exclusion = this.raw.excluded[i];
//        var splitted = exclusion.split('|');
//        var excludedSet = Number(splitted[0]);
//        var excludedId = Number(splitted[1]);
//        var set = this.editEntity.variantsSets.getItem(excludedSet);
//        if (set) {
//            var variant = set.getVariantById(excludedId);
//            this.excluded.setItem(excludedId, variant);
//        }
//    }

//    this.updated.excluded = this.excluded.clone();

//};
//Variant.prototype.value = function () {
//    return this.updated.content;
//};
//Variant.prototype.isExcluded = function (set, key) {
//    var variant = set.getVariantByKey(key);
//    if (variant) {
//        var id = variant.id;
//        return this.updated.excluded.hasItem(id);
//    } else {
//        return false;
//    }
//};
//Variant.prototype.exclude = function (set, key, value) {
//    var variant = set.getVariantByKey(key);
//    if (variant) {
//        var id = variant.id;
//        if (value) {
//            this.updated.excluded.setItem(id, variant);
//            variant.updated.excluded.setItem(this.id, this);
//        } else {
//            this.updated.excluded.removeItem(id);
//            variant.updated.excluded.removeItem(this.id);
//        }
//    }
//};
//Variant.prototype.changeContent = function (value) {
//    this.updated.content = value;
//};
//Variant.prototype.changeWordId = function (wordId) {
//    this.updated.wordId = wordId;
//};
//Variant.prototype.confirmChanges = function () {
//    //var ch = this.change;
//    //this.key = (ch.key ? ch.key : this.key);
//    //this.content = (ch.content ? ch.content : this.content);
//    //this.wordId = (ch.wordId ? ch.wordId : this.wordId);
//    //this.exclusion = (ch.exclusion ? ch.exclusion : this.excluded);
//};
//Variant.prototype.updateLimits = function () {
//    var self = this;
//    var removeTag = 'removeLimit';
//    var addTag = 'addLimit';

//    var differences = this.excluded.differences(this.updated.excluded);

//    //Removed.
//    for (var i = 0; i < differences.removed.length; i++) {
//        var removed = differences.removed[i];

//        this.editEntity.addLog({
//            event: removeTag,
//            question: self.editEntity.id,
//            variantId: self.id,
//            excludedId: removed.id
//        });
//    }

//    //Added.
//    for (var j = 0; j < differences.added.length; j++) {
//        var added = differences.added[j];

//        this.editEntity.addLog({
//            event: addTag,
//            question: self.editEntity.id,
//            variantId: self.id,
//            excludedId: added.id
//        });
//    }

//    this.excluded = this.updated.excluded;

//};
//Variant.prototype.reset = function () {
//    var self = this;
//    self.updated = {
//        key: self.key,
//        content: self.content,
//        wordId: self.wordId,
//        anchored: self.anchored,
//        excluded: self.excluded.clone()
//    };
//};
//Variant.prototype.checkForUpdates = function () {
//    var self = this;
//    var tagForAdding = 'addVariant';
//    var tagForEdit = 'editVariant';

//    if (self.isNew) {
//        self.editEntity.addLog({
//            event: tagForAdding,
//            key: self.updated.key,
//            content: self.updated.content,
//            wordId: self.updated.wordId,
//            anchored: self.updated.anchored
//        });
//    } else if (!self.equal(self.updated)) {
//        self.editEntity.addLog({
//            event: tagForEdit,
//            id: self.id,
//            key: self.updated.key,
//            content: self.updated.content,
//            wordId: self.updated.wordId,
//            anchored: self.updated.anchored
//        });
//    }

//};
//Variant.prototype.equal = function (object) {
//    if (this.key !== object.key) return false;
//    if (this.content !== object.content) return false;
//    if (this.wordId !== object.wordId) return false;
//    if (this.anchored !== object.anchored) return false;

//    return true;

//};



function VariantSet2(editEntity, properties) {
    var self = this;
    this.VariantSet = true;
    self.eventHandler = new EventHandler();

    (function setParameters() {
        self.editEntity = editEntity;
        self.id = properties.Id;
        self.languageId = properties.LanguageId;
        self.wordtype = WORDTYPE.getItem(properties.WordType);
        self.tag = properties.VariantTag;
        self.params = properties.Params;
        self.grammarDefinitionId = 0;
        self.raw = {
            variants: properties.Variants,
            related: properties.Related,
            dependants: properties.Dependants
        };
    })();
    
    self.logs = [];
    self.contentChangesLogs = [];

    self.updated = {        
        wordtype: self.wordtype,
        tag: self.tag,
        parent: self.parent,
        params: self.params,
        grammarDefinitionId: self.grammarDefinitionId
    };

}

//VariantSet.prototype.reset = function () {
//    var self = this;
//    self.updated = {
//        wordtype: self.wordtype,
//        tag: self.tag,
//        parent: self.parent,
//        params: self.params,
//        grammarDefinitionId: self.grammarDefinitionId,
//        variants: self.variants.clone(),
//        variantsById: self.variantsById.clone(),
//        connections: self.connections.clone(),
//        dependants: self.dependants.clone(),
//        properties: self.properties.clone()
//    };

//    self.variants.each(function(key, value) {
//        value.reset();
//    });

//};

//VariantSet.prototype.updateMeta = function () {
//    var self = this;
//    var tag = 'editVariantSet';
    
//    if (self.updated.tag !== self.tag || self.updated.wordtype !== self.wordtype) {
//        self.editEntity.addLog({            
//            event: tag,
//            set: self.id,
//            tag: self.updated.tag,
//            wordtype: self.updated.wordtype.id
//        });

//        self.tag = self.updated.tag;
//        self.wordtype = self.updated.wordtype;

//    }

//};

//VariantSet.prototype.updateLimits = function () {
//    this.updated.variants.each(function(key, value) {
//        value.updateLimits();
//    });
//};

//VariantSet.prototype.updateProperties = function () {
//    var self = this;
//    var removeTag = 'removeVariantProperty';
//    var editTag = 'editVariantProperty';

//    var differences = this.properties.differences(this.updated.properties, true);

//    //Removed.
//    for (var i = 0; i < differences.removed.length; i++) {
//        var removed = differences.removed[i];
//        self.editEntity.addLog({
//            event: removeTag,
//            setId: self.id,
//            property: removed
//        });
//    }


//    //Added/Edited
//    this.updated.properties.each(function (key, value) {
//        self.editEntity.addLog({
//            event: editTag,
//            setId: self.id,
//            property: key,
//            value: value
//        });
//    });
    
//};

//VariantSet.prototype.updateDependencies = function () {
//    var self = this;
//    var tagForRemoving = 'dependencyRemoved';
//    var tagForAdding = 'dependencyAdded';

//    var differences = this.dependants.differences(this.updated.dependants);

//    //Removed.
//    for (var i = 0; i < differences.removed.length; i++) {
//        var removed = differences.removed[i];
//        this.editEntity.addLog({
//            event: tagForRemoving,
//            masterId: self.id,
//            slaveId: removed.id
//        });
//    }
    
//    //Added.
//    for (var j = 0; j < differences.added.length; j++) {
//        var added = differences.added[j];
//        this.editEntity.addLog({
//            event: tagForAdding,
//            masterId: self.id,
//            slaveId: added.id
//        });
//    }


//    this.dependants = this.updated.dependants;

//};

//VariantSet.prototype.updateConnections = function () {
//    var self = this;
//    var tagForRemoving = 'removeConnection';
//    var tagForAdding = 'addConnection';
    
//    var differences = this.connections.differences(this.updated.connections);

//    //Removed.
//    for (var i = 0; i < differences.removed.length; i++) {
//        var removed = differences.removed[i];
//        this.editEntity.addLog({
//            event: tagForRemoving,
//            parent: self,
//            connected: removed
//        });
//    }

//    //Added.
//    for (var j = 0; j < differences.added.length; j++) {
//        var added = differences.added[j];
//        this.editEntity.addLog({
//            event: tagForAdding,
//            parent: self,
//            connected: added
//        });
//    }

//    this.connections = this.updated.connections;

//};

//VariantSet.prototype.updateVariants = function() {
//    var self = this;
//    var tagForRemoving = 'removeVariant';

//    var differences = this.variants.differences(this.updated.variants);
    
//    //Removed.
//    for (var i = 0; i < differences.removed.length; i++) {
//        var removed = differences.removed[i];
//        self.editEntity.addLog({
//            event: tagForRemoving,
//            variantId: removed.id
//        });
//    }
    
//    //Added + edited.
//    self.updated.variants.each(function(key, variant) {
//        variant.checkForUpdates();
//    });

//    self.variants = self.updated.variants;

//};

//VariantSet.prototype.bind = function (e) {
//    this.eventHandler.bind(e);
//};
//VariantSet.prototype.trigger = function (e) {
//    this.eventHandler.trigger(e);
//};
//VariantSet.prototype.createDetails = function () {
//    this.loadVariants(this.raw.variants);
//    this.loadConnections(this.raw.related);
//    this.loadDependants(this.raw.dependants);
//    this.loadProperties();
//};

//VariantSet.prototype.loadConnections = function (connections) {
//    this.connections = new HashTable(null);
//    for (var i = 0; i < connections.length; i++) {
//        var connection = this.editEntity.getVariantSet(connections[i]);
//        if (connection) {
//            this.connections.setItem(connection.id, connection);
//        }
//    }
    
//    this.updated.connections = this.connections.clone();

//};
//VariantSet.prototype.loadDependants = function (dependants) {
//    var self = this;
//    self.dependants = new HashTable(null);
//    for (var i = 0; i < dependants.length; i++) {
//        var dependant = self.editEntity.getVariantSet(dependants[i]);
//        if (dependant) {
//            dependant.setParent(self, true);
//            self.dependants.setItem(dependant.id, dependant);
//        }
//    }

//    this.updated.dependants = this.dependants.clone();

//};
//VariantSet.prototype.loadLimits = function () {
//    this.updated.variants.each(function (key, value) {
//        value.loadLimits();
//    });
//};
//VariantSet.prototype.loadProperties = function () {
//    var self = this;
//    self.properties = new HashTable(null);
//    var values = my.db.fetch('Questions', 'GetVariantSetPropertiesValues', {
//        'id': self.id
//    });

//    for (var i = 0; i < values.length; i++) {
//        var value = values[i];
//        self.properties.setItem(value.PropertyId, value.Value);
//    }
    

//    //Assign a proper grammar definition.
//    var grammarId = my.db.fetch('Questions', 'GetGrammarDefinitionId', {
//        'variantSetId': self.id
//    });
//    self.grammarDefinitionId = grammarId;

//    this.updated.properties = this.properties.clone();

//};
//VariantSet.prototype.getConnectionPairs = function () {
//    var self = this;
//    var pairs = new HashTable(null);
//    self.updated.connections.each(function (key, value) {
//        var connectionKey = self.id + '|' + value.id;
//        var connection = [self, value];
//        pairs.setItem(connectionKey, connection);
//    });
//    return pairs;
    
//};
//VariantSet.prototype.clearLogs = function() {
//    this.logs = [];
//};
//VariantSet.prototype.sendLogsToParent = function () {

//    alert('VariantSet.sendLogsToParent');

//    //var self = this;

//    ////zmiany we właściwościach seta
//    //for (var i = 0; i < self.logs.length; i++) {
//    //    var log = self.logs[i];
//    //    log.setId = self.id;
//    //    self.editEntity.addLog(log);
//    //}

//    ////sprawdzić zmiany w zestawach opcji
//    //self.variants.each(function (key, variant) {
//    //    if (variant.isNew) {
//    //        if (variant.content || variant.wordId) {
//    //            var variantLog = {
//    //                event: 'addVariant',
//    //                setId: self.id,
//    //                variant: variant
//    //            };
//    //            self.editEntity.addLog(variantLog);
//    //        }
//    //    }
//    //});

//    ////sprawdzić zmiany w zawartości wariantów
//    //self.variants.each(function(key, variant) {
//    //    if (!variant.isNew && variant.change.meta) {
//    //        var variantLog = {                
//    //            event: 'editVariant',
//    //            setId: self.id,
//    //            variant: variant
//    //        };
//    //        self.editEntity.addLog(variantLog);
//    //    }
//    //});

//    ////usunięte warianty
//    //for (var j = 0; j < self.contentChangesLogs.length; j++) {
//    //    alert('variant removed - log needs to be added');
//    //}

//    ////sprawdzić zmiany w wykluczeniach


//};
//VariantSet.prototype.setParent = function (set, initial) {
    
//    this.updated.parent = set;
//    if (initial) {
//        this.parent = set;
//    } else {
//        this.trigger({
//            type: 'setParent',
//            parent: set
//        });
//        //this.parentChanged = true;
//        set.addDependency(this);

//        //this.updated.parent = this.parent;
        
//    }

//};
//VariantSet.prototype.clearParent = function () {
//    var self = this;
//    if (this.updated.parent) {
//        this.updated.parent.removeDependency(this);
//    }
//    this.trigger({
//        type: 'clearParent',
//        parent: self.updated.parent
//    });
//    //this.parentChanged = true;
//    //this.parent = null;

//    this.updated.parent = null;

//};
//VariantSet.prototype.removeDependency = function (set) {
//    this.updated.dependants.removeItem(set.id);
//    this.trigger({
//        type: 'dependencyRemoved',
//        dependant: set
//    });

//    //this.logs.push({
//    //    event: 'dependencyRemoved',
//    //    set: set.id
//    //});

//};
//VariantSet.prototype.addDependency = function (set) {
//    this.updated.dependants.setItem(set.id, set);
//    this.trigger({
//        type: 'dependencyAdded',
//        dependant: set
//    });

//    //this.logs.push({
//    //    event: 'dependencyAdded',
//    //    set: set.id
//    //});

//};
//VariantSet.prototype.getLanguageId = function () {
//    return this.languageId;
//};
//VariantSet.prototype.edit = function () {
//    var panel = new VariantSetEditPanel(this);
//    panel.display();
//};
//VariantSet.prototype.changeWordtype = function (wordtype) {
//    var self = this;
//    var tag = 'editWordtype';
    
//    if (wordtype === this.wordtype) return;

//    //this.logs.push({
//    //    event: tag,
//    //    wordtype: wordtype.id
//    //});

//    var wasDependable = self.language.isDependable(self.wordtype.id);
//    self.updated.wordtype = wordtype;
//    var isDependable = self.language.isDependable(wordtype.id);
//    self.trigger({
//        type: 'changeWordtype',
//        wordtype: wordtype,
//        wasDependable: wasDependable,
//        isDependable: isDependable
//    });
//};
//VariantSet.prototype.setProperties = function (properties) {
//    this.updated.properties.clear();
//    for (var i = 0; i < properties.length; i++) {
//        var property = properties[i];
//        this.updated.properties.setItem(property.key, property.value);
//    }


//    //var tag = 'editVariantSet';
    
//    //for (var i = 0; i < properties.length; i++) {
//    //    var object = properties[i];
//    //    var property = this.updated.properties.getItem(object.key);
        
//    //    if (property != object.value) {
//    //        this.updated.properties.setItem(object.key, object.value);
//    //        this.logs.push({
//    //            event: tag,
//    //            property: object.key,
//    //            value: object.value
//    //        });
//    //    }
        
//    //}
//};
//VariantSet.prototype.rename = function (name) {
//    this.updated.tag = name;
//    this.trigger({
//        type: 'rename',
//        name: name
//    });
//};
//VariantSet.prototype.addConnection = function (set) {
//    this.updated.connections.setItem(set.id, set);
//};
//VariantSet.prototype.removeConnection = function (set) {
//    this.updated.connections.removeItem(set.id);
//};
//VariantSet.prototype.loadWordsForms = function () {
//    var self = this;
//    var wordVariants = new HashTable(null);
//    var wordsIds = (function () {
//        var array = [];
//        self.updated.variants.each(function (key, value) {
//            var wordId = value.wordId;
//            if (wordId && !value.anchored) {
//                array.push(wordId);
//                wordVariants.setItem(wordId, value);
//            }
//        });

//        return array;

//    })();
    


//    if (wordsIds.length) {
//        $.ajax({
//            url: '/Words/GetGrammarFormsForWords',
//            type: "GET",
//            data: {
//                'grammarForm': self.updated.grammarDefinitionId,
//                'words': wordsIds
//            },
//            traditional: true,
//            datatype: "json",
//            async: true,
//            cache: false,
//            success: function (result) {
//                for (var i = 0; i < result.length; i++) {
//                    var object = result[i];
//                    var variant = wordVariants.getItem(object.WordId);
//                    if (variant) {
//                        variant.content = object.Content;
//                        variant.trigger({
//                            type: 'loadValue',
//                            value: object.Content
//                        });
//                    }
//                }
//                //column.renderVariants();
                
//                //Clear collection.
//                wordVariants = null;
                
//            },
//            error: function (msg) {
//                alert(msg.status + " | " + msg.statusText);
//                return null;
//            }
//        });
//    }

//};
//VariantSet.prototype.getVariantById = function(id) {
//    return this.updated.variantsById.getItem(id);
//};
//VariantSet.prototype.getVariantByKey = function(key) {
//    return this.updated.variants.getItem(key);
//};
//VariantSet.prototype.addContentChangeLog = function (log) {
//    //this.contentChangesLogs.push(log);
//};
//VariantSet.prototype.removeVariant = function (key) {
//    var self = this;
//    //var variant = self.updated.variants.getItem(key);
    
//    //Jeżeli nie był to nowy variant, to dodawany jest 
//    //log o konieczności usunięcia go z bazy.
//    //if (variant && !variant.isNew) {
//    //    self.addContentChangeLog({
//    //        event: 'removeVariant',
//    //        setId: self.id,
//    //        key: key
//    //    });
//    //}
    
//    this.updated.variants.removeItem(key);
    
//};

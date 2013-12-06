﻿
var MODE = {
    NONE: 0,
    SINGLE: 1,
    MULTI: 2
};


$(function () {
    //Switching off selecting text.
    $(document).
        bind({
            'mousedown': function (e) {
                var $this = $(this);
                e.preventDefault();

                // Make every element on page unselectable
                //$('*').addClass('unselectable');
                $(document.body).addClass('unselectable');

                // Some setup here, like remembering the original location, etc
                $(window).on('mousemove', function (e) {
                    // Do the thing!
                    $this.on('mouseup', function (e) {
                        $(document.body).removeClass('unselectable');
                        //$('*').removeClass('unselectable');
                        // Other clean-up tasks here
                    });
                });
            }
        });

});




function TreeView(properties){
    var me = this;
    this.visible = (properties.hidden === true ? false : true);
    this.isEmbedded = (properties.container !== undefined);
    this.mode = properties.mode ? properties.mode : MODE.SINGLE;
    this.options = {
        expandWhenAddingNewNode: true,
        doubleClickDelay: 500,
    }


    this.ui = (function () {
        if (properties.blockOtherElements) {
            me.background = jQuery('<div/>', {
                id: 'tree-background',
                'class': 'tree-background'
            }).
            css({
                'z-index': my.ui.addTopLayer()
            }).
            appendTo($(document.body));
        }

        if (me.isEmbedded) {
            me.background = jQuery('<div/>').
            css({
                'width': '100%',
                'height': '100%',
                'position': 'relative',
                'display': 'block'
            }).
            appendTo($(properties.container));
        }

        var background = (me.background || $(document.body));

        var frame = jQuery('<div/>', {
            id: 'tree-container-frame',
            'class': 'tree-container-frame'
        }).appendTo($(background));


        
        //Change styling if tree is embedded.
        if (me.isEmbedded) {
            $(frame).css({
                'position': 'relative',
                'float': 'left',
                'width': '100%',
                'height': '100%',
                'left': '0px',
                'top': '0px',
                'padding': '0px'
            });
        }

        me.container = jQuery('<div/>', {
            id: 'tree-container',
            'class': 'tree-container'
        }).
        appendTo($(frame));


        if (!me.isEmbedded) {
            var btnQuit = jQuery('<div/>', {
                id: 'tree-container-exit',
                'class': 'tree-container-exit'
            }).
            bind({
                'click': function () {
                    me.events.trigger({
                        'type': 'cancel'
                    });
                }
            }).
            appendTo($(me.container));
        }


        me._searchPanel = jQuery('<div/>', {
            id: 'tree-search-panel',
            'class': 'tree-search-panel'
        }).
        css({
            'display': 'none'
        }).
        appendTo($(me.container));
        me.searchMode = false;


        //Place container inside the screen.
        if (properties.x !== undefined) {
            me.container.css('left', properties.x);
        }
        if (properties.y !== undefined) {
            me.container.css('top', properties.y);
        }

        return {
            destroy: function () {
                if (me.background) {
                    $(me.background).remove();
                } else {
                    $(frame).remove();
                }
            }
        }

    })();

    this.events = (function () {
        var _container = jQuery('<div/>', {
            'class': 'events-container'
        }).appendTo(me.container);


        _container.bind({
            expand: function (e) {
                me.root.dropArea.recalculate();
            },
            collapse: function (e) {
                me.root.dropArea.recalculate();
            },
            activate: function (e) {
                if (me.activeNode && me.activeNode != e.node) {
                    me.activeNode.inactivate();
                }
                me.activeNode = e.node;
            },
            inactivate: function (e) {
                if (me.activeNode === e.node) {
                    me.activeNode = null;
                }
            },
            'delete': function (e) {
            },
            newNode: function (e) {
                e.node.activate();
            },
            confirm: function (e) {
                alert('confirm');
                if (!me.isEmbedded) {
                    me.hide();
                }
            },
            cancel: function (e) {
                if (!me.isEmbedded) {
                    me.hide();
                }
            }
            //rename: [node], [name]
            //tranfer: [node], [to]
        });


        return {
            trigger: function (e) {
                _container.trigger(e);
            },
            bind: function (a) {
                $(_container).bind(a);
            }
        }

    })();

    this.getContainer = function () {
        return this.container;
    }

    this.root = new TreeNode(me, null, properties.root);

    this.root.loadData(properties.data);


    //Selection panel.
    this.showSelection = properties.showSelection;
    if (this.showSelection) {
        this.selection = (function () {
            var _container = jQuery('<div/>', {
                    id: 'tree-selection-container',
                    'class': 'tree-selection-container'
                }).appendTo($(me.container));

            var _header = jQuery('<div/>', {
                id: 'tree-selection-header',
                'class': 'tree-selection-header',
                html: 'Selected'
            }).appendTo($(_container));

            var _nodes = jQuery('<div/>', {
                id: 'tree-selection-nodes',
                'class': 'tree-selection-nodes'
            }).appendTo($(_container));

            var selected = [];

            function _refresh() {
                $(_nodes).empty();
                selected = me.root.getSelectedArray();

                for (var i = 0; i < selected.length; i++) {
                    var node = selected[i];
                    var line = nodeLine(node, i);
                }

            }

            var nodeLine = function (node, index) {
                var $node = node;
                var $index = index;
                var $container = jQuery('<div/>', {
                        'class': 'tree-selection-line'
                }).appendTo(_nodes);

                var $remover = jQuery('<div/>', {
                    'class': 'tree-selection-line-remover'
                }).
                bind({
                    'click': function () {
                        $node.unselect();
                    }
                }).appendTo($container);

                var $caption = jQuery('<div/>', {
                    'class': 'tree-selection-line-caption',
                    'html': node.name
                }).appendTo($container);

            }


            return {
                refresh: function () {
                    _refresh();
                }
            }

        })();
    }

    if (!me.isEmbedded) {
        this.buttons = (function () {
            me.buttonsPanel = jQuery('<div/>', {
                id: 'tree-buttons-panel',
                'class': 'tree-buttons-panel'
            }).appendTo($(me.container));

            var buttonsContainer = jQuery('<div/>', {
                id: 'tree-buttons-container',
                'class': 'tree-buttons-container'
            }).appendTo($(me.buttonsPanel));

            var btnOk = jQuery('<input/>', {
                id: 'tree-button-ok',
                'class': 'tree-button',
                'type': 'submit',
                'value': 'OK'
            }).
            bind({
                'click': function () {
                    var items = me.root.getSelectedArray();
                    if (items && items.length) {
                        me.events.trigger({
                            'type': 'confirm',
                            'items': items
                        });
                    } else {
                        me.events.trigger({
                            'type': 'cancel'
                        });
                    }


                }
            }).appendTo($(buttonsContainer));

            var btnCancel = jQuery('<input/>', {
                id: 'tree-button-cancel',
                'class': 'tree-button',
                'type': 'submit',
                'value': 'Cancel'
            }).
            bind({
                'click': function () {
                    me.events.trigger({
                        'type': 'cancel'
                    });
                }
            }).appendTo($(buttonsContainer));
        })();
    }



    this.dragDropManager = (function () {
        var drag = null;
        var drop = null;

        $(document).bind({
            'mousemove': function (e) {

                e.preventDefault();
                if (e && drag) {

                    var x = e.pageX;
                    var y = e.pageY;

                    if (drop) {
                        var previousArea = drop.dropArea;
                        if (previousArea.isHovered(x, y)) {
                            return;
                        } else {
                            previousArea.unselect();
                        }
                    } else {
                        me.root.dropArea.check(x, y);
                    }
                }
            }
        });

        me.events.bind({
            dropin: function (e) {
                if (e.node !== drag) {
                    drop = e.node;
                }
            },
            dropout: function (e) {
                if (drop === e.node) {
                    drop = null;
                }
            },
            dragin: function (e) {
                drag = e.node;
            },
            dragout: function (e) {
                if (drag && drop) {
                    me.trigger({
                        type: 'transfer',
                        node: drag,
                        to: drop
                    });
                    drag = null;
                }
            },
            inactivate: function(e){
                if (drag === e.node) {
                    drag = null;
                }
            },
            transfer: function (e) {
                if (e.node && e.to) {
                    e.node.transfer(e.to);
                }
            }
        });


        return {
            hasDropArea: function () {
                return (drop ? true : false);
            },
            getDrag: function () {
                return drag;
            }
        }

    })();

    this.activeNode = null;

    this.navigator = (function () {

        $(document).bind({
            'keydown': function (e) {

                if (!me.visible) {
                    return;
                }
                
                //Special shortcuts.
                if (e.ctrlKey) {
                    //Search panel (Ctrl + F/f)
                    switch (e.which) {
                        case 70:
                        case 102:
                            //search panel.
                            e.preventDefault();
                            e.stopPropagation();
                            me.showSearchPanel();
                            break;
                    }
                }


                if (me.searchMode || (me.activeNode != null && me.activeNode.renamer.isActive())) {
                    return;
                }

                //Escape applies even for the case if none node is selected.
                if (e.which === 27) {
                    me.events.trigger({
                        'type' : 'cancel'
                    });
                }

                if (me.activeNode) {
                    switch (e.which) {
                        case 37: //Arrow left
                            _collapse();
                            e.stopPropagation();
                            break;
                        case 38: //Arrow up
                            e.stopPropagation();
                            e.preventDefault();
                            _moveUp();
                            break;
                        case 39: //Arrow right
                            _expand();
                            e.stopPropagation();
                            break;
                        case 40: //Arrow down
                            e.stopPropagation();
                            e.preventDefault();
                            _moveDown();
                            break;
                        case 36: //Home
                            e.stopPropagation();
                            e.preventDefault();
                            _moveToParent();
                            break;
                        case 35: //End
                            e.stopPropagation();
                            e.preventDefault();
                            break;
                        case 33: //PageUp
                            e.stopPropagation();
                            e.preventDefault();
                            _moveToRoot();
                            break;
                        case 34: //PageDown
                            e.stopPropagation();
                            e.preventDefault();
                            _moveToLastItem();
                            break;
                        case 113: //F2
                            e.stopPropagation();
                            e.preventDefault();
                            me.activeNode.renamer.activate();
                            break;
                        case 46: //Delete
                            e.stopPropagation();
                            e.preventDefault();
                            me.activeNode.delete();
                            _moveToParent();
                            break;
                        case 45: //Insert
                            e.stopPropagation();
                            e.preventDefault();
                            _addNewNode();
                            break;
                        case 13: //Enter
                            e.stopPropagation();
                            e.preventDefault();
                            switch (me.mode) {
                                case MODE.SINGLE: _selectActive(); break;
                                case MODE.MULTI: _confirm(); break;
                            }
                            break;
                            //Confirmation.
                        case 32: //Space
                            e.stopPropagation();
                            e.preventDefault();
                            switch (me.mode) {
                                case MODE.SINGLE: _selectActive(); break;
                                case MODE.MULTI: me.activeNode.select(); break;
                            }
                            break;
                    }
                }

            }

        });

        function _confirm() {
            me.trigger({
                'type': 'confirm',
                'items': _getSelectedArray()
            });
        }

        
        function _getSelectedArray() {
            return me.root.getSelectedArray();
        }


        function _selectActive() {
            me.trigger({
                'type': 'confirm',
                'item' : me.activeNode
            });
        }

        function _addNewNode() {
            var expander = me.activeNode.expander;
            if (!expander.isExpanded()) {
                expander.expand();
            }
            me.activeNode.addNewNode();
        }

        function _expand() {
            if (me.activeNode.expander) {
                me.activeNode.expander.expand();
            }
        }

        function _collapse() {
            if (me.activeNode.expander) {
                me.activeNode.expander.collapse();
            }
        }

        function _moveToParent() {
            if (!me.activeNode.isRoot()) {
                changeSelection(me.activeNode.parent);
            }
        }

        function _moveToRoot() {
            changeSelection(me.root);
        }

        function _moveToLastItem() {
            var node = me.root;
            while (node.expander.isExpanded()) {
                node = node.getLastChild();
            }
            changeSelection(node);
        }

        function _moveUp() {
            var previousNode = me.activeNode.previousNode();
            if (previousNode) {

                var node = previousNode;
                while (node.expander.isExpanded()) {
                    node = node.getLastChild();
                }
                changeSelection(node);
            } else {
                if (!me.activeNode.isRoot()) {
                    changeSelection(me.activeNode.parent);
                }
            }
        }

        function _moveDown() {
            if (me.activeNode.expander && me.activeNode.expander.isExpanded()) {
                var childNode = me.activeNode.getChildNode(0);
                if (childNode) {
                    changeSelection(childNode);
                }
            } else {
                if (!me.activeNode.isRoot()) {
                    var nextNode = me.activeNode.nextNode();

                    var parent = me.activeNode.parent;
                    while (nextNode === null && parent.isNode) {
                        nextNode = parent.nextNode();
                        parent = parent.parent;
                    }

                    if (nextNode) {
                        changeSelection(nextNode);
                    }

                }
            }
        }

        function changeSelection(node) {
            me.activeNode.inactivate();
            node.activate();
        }

    })();

    this.root.activate();

    if (!this.visible) {
        this.hide();
    }

}
TreeView.prototype.trigger = function (e) {
    this.events.trigger(e);
}
TreeView.prototype.bind = function (e) {
    this.events.bind(e);
}
TreeView.prototype.hide = function () {

    this.visible = false;

    if (this.background) {
        $(this.background).css({
            'display': 'none'
        });
    }

    $(this.container).css({
        'display' : 'none'
    });
}
TreeView.prototype.showSearchPanel = function () {
    this.searchPanel = (this.searchPanel || new SearchPanel(this));
    this.searchMode = true;
    this.searchPanel.show();
}
TreeView.prototype.hideSearchPanel = function () {
    if (this.searchPanel) {
        this.searchPanel.hide();
    }
    this.searchPanel = null;
    this.searchMode = false;
}
TreeView.prototype.show = function () {

    this.visible = true;

    if (this.background) {
        $(this.background).css({
            'display': 'block',
            'z-index' : my.ui.addTopLayer()
        });
    }

    $(this.container).css({
        'display': 'block'
    });
}
TreeView.prototype.reset = function () {
    if (this.node) {
        this.node.unselect();
        this.node.collapse();
    }
}
TreeView.prototype.destroy = function () {
    this.ui.destroy();
}









function TreeNode(tree, parent, object){
    var me = this;

    this.tree = tree;

    //Node properties.
    this.key = (typeof(object.key) === "function" ? object.key() : object.key) || '';
    this.name = (typeof (object.name) === "function" ? object.name() : object.name) || '';
    this.object = object;
    this.parent = parent;


    this.mouseClicked = false;
    this.isActive = false;
    this.isNode = true;


    var $events = (function () {
        var _listener = {};
        //var _container = jQuery('<div/>', {
        //    'class': 'events-container'
        //});

        $(_listener).bind({
            'addNode': function (e) {
                if (me.object.events) {
                    me.object.events().trigger({
                        'type': 'add',
                        'value': e.node.object
                    });
                }
            },
            'removeNode': function (e) {
                if (me.object.events) {
                    me.object.events().trigger({
                        'type': 'remove',
                        'value': e.node.object
                    });
                }
            }
            //rename: [node], [name]
            //tranfer: [node], [to]
        });

        return {
            trigger: function (e) {
                $(_listener).trigger(e);
            },
            bind: function (a) {
                $(_listener).bind(a);
            }
        }

    })();
    this.trigger = function (e) {
        $events.trigger(e);
    }
    this.bind = function (e) {
        $events.bind(e);
    }

    var $ui = (function () {
        var _container = jQuery('<div/>', {
            'class': 'node-container'
        });

        var _line = jQuery('<div/>', {
            'class': 'tree-line'
        }).appendTo(_container);

        var _children = jQuery('<div/>', {
            'class': 'children-container'
        }).appendTo(_container);


        //Events listeners.
        var _listener = (function () {
            $events.bind({
                expand: function (e) {
                    show(_children);
                },
                collapse: function (e) {
                    hide(_children);
                },
                addNode: function(e){
                    _addChild(e.container);
                }
            });
        })();


        function _addChild(object){
            $(object).appendTo(_children);
        }


        return {
            container: _container,
            line: _line,
            children: _children
        }

    }());

    var $nodes = (function () {
        var _items = {};
        var _sorted = [];

        //(function ini() {
        //    var $items = (typeof (me.object.items) === "function" ? me.object.items() : me.object.items);
        //    for (var i = 0; i < $items.length; i++) {
        //        var node = new TreeNode(me.tree, me, $items[i]);
        //        _items[node.key] = node;
        //        _sorted[i] = node;
        //    }
        //    _sort();
        //})();

        function _sort() {
            _sorted.sort(function(a, b){
                return a.key - b.key;
            });
        }

        var _events = (function () {
            $events.bind({
                'addNode': function (e) {
                    _addNode(e.node);
                },
                'removeNode': function (e) {
                    if (e.node) {
                        _removeNode(e.node)
                    } else if (e.key) {
                        _removeNodeByKey(e.key);
                    }
                    _refreshArray();
                }
            });
        })();

        function _addNode(node){
            _items[node.key] = node;
            _refreshArray();
        }

        function _removeNode(node){
            for (var key in _items) {
                if (_items.hasOwnProperty(key)) {
                    var _node = _items[key];
                    if (_node === node) {
                        delete _items[key];
                    }
                }
            }
            _refreshArray();
        }

        function _removeNodeByKey(key){
            delete _items[key];
        }

        function _refreshArray(){
            _sorted = my.array.objectToArray(_items);
            _sorted.sort();
        }


        return {
            size: function () {
                return _sorted.length;
            },
            each: function (fn) {
                for (var key in _items) {
                    if (_items.hasOwnProperty(key)){
                        var item = _items[key];
                        fn(item);
                    }
                }
            },
            countSelected: function(){
                var _counter = 0;
                for (var key in _items) {
                    if (_items.hasOwnProperty(key)){
                        var item = _items[key];
                        if (item.isSelected()){
                            counter++;
                        }
                    }
                }
                return counter;
            }
        }

    })();
    
    var $expander = (function (value) {
        var _expandable = false;
        var _expanded = value ? true : false;
        var _button = jQuery('<div/>', {
            'class': 'icon '
        }).bind({
            'click': function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (_expandable) {
                    _revertStatus();
                }
            }
        }).appendTo($ui.line);



        var _events = (function () {
            $events.bind({
                'addNode': function () {
                    _expandable = true;
                    if (me.tree.options.expandWhenAddingNewNode) {
                        _expanded = true;
                    }
                    _render();
                },
                'removeNode': function () {
                    _expandable = ($nodes.size() > 0);
                    _render();
                },
                'expand': function () {
                    _expanded = true;
                    _render();

                    if (me.parent) {
                        me.parent.trigger({
                            'type': 'expand'
                        });
                    }

                },
                'collapse': function () {
                    _expanded = false;
                    _render();
                }
            });
        })();

        
        function _revertStatus() {
            if (_expanded) {
                _collapse();
            } else {
                _expand();
            }
        }

        function _expand() {
            if (_expandable && !_expanded) {
                me.events.trigger({
                    'type': 'expand'
                });
            }
        }

        function _collapse() {
            if (_expandable && _expanded) {
                me.events.trigger({
                    'type': 'collapse'
                });
            }
        }

        function _render() {
            if (_expandable) {
                $(button).html(_expanded ? '-' : '+');
            } else {
                $(button).html('.');
            }
        }

        function _expand() {
            if (_expandable) {
                return;
            }

            expanded = true;
            $(button).html('-');
            display(me.container, true);

            if (!me.isRoot()) {
                me.parent.expander.expand();
            }

            me.tree.trigger({
                type: 'expand',
                node: me
            });
        }

        return {
            isExpandable: function(){
                return _expandable;
            },
            isExpanded: function(){
                return (_expandable ? _expanded : false);
            }
        }

    })(object.expanded);

    var $selector = (function (value) {
        var _selected = value;
        var _hasSelectedChildren = false;

        var _ui = (function () {
            var _box = jQuery('<input/>', {
                type: 'checkbox',
                'class': 'select-checkbox',
                'value': _selected
            }).css({
                'display': (me.tree.mode === MODE.MULTI ? 'block' : 'none')
            }).bind({
                'click': function () {
                    $events.trigger({
                        'type' : 'statusChanged',
                        'applyForChildren': true,
                        'applyForParent': true
                    });
                }
            }).appendTo($ui.line);

            return {
                check: function (value) {
                    $(_box).prop({
                        'checked': value
                    });
                }
            }

        })();

        var _events = (function () {
            $events.bind({
                'select unselect': function (e) {
                    _ui.check(e.type === 'select');
                    if (e.applyForChildren){
                        _applyForChildren(e.type);
                    }
                    if (e.applyForParent){
                        _applyForParent(e.type);
                    }
                },
                'statusChanged': function(e){
                    me.events.trigger({
                        'type': _selected ? 'unselect' : 'select',
                        'applyForParent' : true,
                        'applyForChildren' : true
                    });
                },
                'childStatusChanged' : function(){
                    var selectedChildren = $nodes.countSelected();
                    if (selectedChildren){
                        me.events.trigger({
                            'type' : (selectedChildren === $nodes.size() ? 'select' : 'hasSelectedChildren'),
                            'applyForChildren' : false,
                            'applyForParent': true
                        });
                    } else {
                        me.events.trigger({
                            'type': 'unselect',
                            'applyForChildren' : false,
                            'applyForParent': true
                        });
                    }
                }
            });
        })();

        function _applyForChildren(type) {
            $nodes.each(function (node) {
                node.trigger({
                    'type' : type,
                    'applyForChildren': true,
                    'applyForParent': false
                });
            });
        }

        function _applyForParent(){
            if (me.parent){
                me.parent.trigger({
                    'type' : 'childStatusChanged'
                });
            }
        }

        return{
            isSelected: function(){
                return _selected;
            },
            hasSelectedChildren: function(){
                return _hasSelectedChildren;
            }
        }

    })(object.selected);
    this.isSelected = function(){
        $selector.isSelected();
    }


    var $caption = (function () {
        var _active = false;

        var _ui = (function () {
            var _caption = jQuery('<div/>', {
                'class': 'caption',
                html: me.name
            }).bind({
                'mousedown': function (e) {
                    me.events.trigger({
                        'type' : 'click'
                    });
                    //e.preventDefault();
                    //me.mouseClicked = true;
                    //if (me.isActive) {

                    //    if (me.tree.mode === MODE.SINGLE) {
                    //        me.select();
                    //    } else {
                    //        e.preventDefault;
                    //        me.renamer.activate();
                    //        me.inactivate();
                    //        me.tree.trigger({
                    //            'type': 'dragout',
                    //            'node': me
                    //        });
                    //        e.stopPropagation();
                    //    }
                    //}
                },
                'mouseup': function (e) {
                    if (!me.mover.isActive() && me.mouseClicked) {
                        me.activate();
                    }
                    me.mouseClicked = false;
                }
            }).appendTo($ui.line);

            return {
                caption: function () {
                    return _caption;
                }
            }

        })();

        var _events = (function () {
            $events.bind({
                'click': function () {
                    if (_active) {
                        if (me.tree.mode === MODE.SINGLE) {
                            //Select and confirm.
                        } else {
                            //Activate renamer.
                        }
                    } else {
                        _active = true;
                        setTimeout(function () {
                            _active = false;
                        }, me.tree.options.doubleClickDelay || 250);
                    }
                },
                'select hasSelectedChildren': function () {
                    $(_ui.caption).css({
                        'font-weight' : 'bold'
                    });
                },
                'unselect': function () {
                    $(_ui.caption).css({
                        'font-weight': 'normal'
                    });
                }
            });
        })();

    })();


    this.caption = jQuery('<div/>', {
        'class': 'caption',
        html: me.name
    }).
    bind({
        'mousedown': function (e) {
            e.preventDefault();
            me.mouseClicked = true;
            if (me.isActive) {

                if (me.tree.mode === MODE.SINGLE) {
                    me.select();
                } else {
                    e.preventDefault;
                    me.renamer.activate();
                    me.inactivate();
                    me.tree.trigger({
                        'type': 'dragout',
                        'node': me
                    });
                    e.stopPropagation();
                }
            }
        },
        'mouseup': function (e) {
            if (!me.mover.isActive() && me.mouseClicked) {
                me.activate();
            }
            me.mouseClicked = false;
        }
    }).
    appendTo(this.line);




    $(document).bind({
        'mousedown' : function(e){
            if (me.renamer && me.renamer.isActive()) {
                if (e && me.renamer.isOutside(e.pageX, e.pageY)) {
                    me.renamer.escape();
                }
            }
        },
        'mousemove': function (e) {
            e.preventDefault();
            if (me.mouseClicked) {
                me.mover.move(e);
            }
        },
        'mouseup': function (e) {
            e.preventDefault();
            me.mover.drop(e);
            me.mouseClicked = false;
        }
    });


    this.getContainer = function () {
        return this.container;
    };


    this.position = function (div) {
        return $(div).offset();
    }

    this.dropArea = (function () {
        var visible = false;
        var selected = false;
        var xa = 0;
        var xz = 0;
        var ya = 0;
        var yz = 0;

        function _calculatePosition() {
            var caption = me.caption;
            var position = $(caption).offset();
            var width = $(caption).width();
            var height = $(caption).height();

            if (width === 0 || height === 0) {
                visible = false;
            } else {
                visible = true;
                xa = position.left;
                ya = position.top;
                xz = xa + width;
                yz = ya + height;
            }
        };

        function _isHovered(x, y) {
            if (visible) {
                if (x >= xa && x <= xz && y >= ya && y <= yz) {
                    return true;
                }
            }
            return false;
        }

        function _check(x, y) {
            if (me.tree.dragDropManager.hasDropArea()) {
                return;
            } else if (_isHovered(x, y) && me.tree.dragDropManager.getDrag() !== me) {
                _select();
            } else {
                for (var key in me.nodes) {
                    if (me.nodes.hasOwnProperty(key)) {
                        var node = me.nodes[key];
                        if (node) {
                            node.dropArea.check(x, y);
                        }
                    }
                }
            }
        }

        function _unselect() {
            //Switch off as drop area.
            $(me.caption).removeClass('drop-area');
            me.tree.trigger({
                type: 'dropout',
                node: me
            });
        }

        function _select() {
            $(me.caption).addClass('drop-area');
            me.tree.trigger({
                type: 'dropin',
                node: me
            });
        }

        //Setting initial position.
        _calculatePosition();


        return {
            calculatePosition: function () {
                _calculatePosition();
            },
            unselect: function () {
                _unselect();
            },
            isHovered: function(x, y){
                return _isHovered(x, y);
            },
            check: function (x, y) {
                _check(x, y);
            },
            recalculate: function () {
                _calculatePosition();
                for (var key in me.nodes) {
                    if (me.nodes.hasOwnProperty(key)) {
                        var node = me.nodes[key];
                        if (node) {
                            node.dropArea.recalculate();
                        }
                    }
                }
            }
        }

    })();

    this.mover = (function () {
        var active = false;
        var x = 0;
        var y = 0;
        var left = 0;
        var top = 0;

        var div = null;

        function createDiv() {
            var control = jQuery('<div/>', {
                'class': 'move',
                html: me.name
            }).
            css({
                'visibility': 'hidden'
            }).
            appendTo(me.mainContainer);
            return control;
        }


        function activate(left, top) {
            if (div === null) {
                div = createDiv();
            }
            active = true;
            show(div);
            x = left;
            y = top;
            moveDiv($(me.caption).offset());
        }

        function deactivate() {
            active = false;
            hide(div);
        }

        function _move(e) {
            var _x = e.pageX;
            var _y = e.pageY;

            moveDiv({
                left: left + (_x - x),
                top: top + (_y - y)
            });

            x = _x;
            y = _y;

            $('#debug').html('X: ' + e.pageX + ' | Y: ' + e.pageY);

        }


        function moveDiv(position) {
            left = position.left;
            top = position.top;
            $(div).css(position);
        }

        return {
            move: function (e) {
                if (!active) {
                    activate(e.pageX, e.pageY);
                    me.tree.trigger({
                        type: 'dragin',
                        node: me
                    });
                }
                _move(e);
            },
            isActive: function () {
                return active;
            },
            drop: function (e) {
                if (active) {
                    deactivate();
                    me.tree.trigger({
                        type: 'dragout',
                        node: me
                    });
                }
            }
        }

    })();

    this.renamer = (function () {
        var active = false;
        var textbox = null;

        function createTextbox() {
            var control = jQuery('<input/>', {
                'class': 'edit-name'
            }).
            css({
                'visibility': 'hidden'
            }).
            bind({
                'keydown': function (e) {
                    switch (e.which) {
                        case 13: //Enter
                            e.preventDefault();
                            e.stopPropagation();
                            var value = $(this).val();
                            var validation = validateName(value);
                            if (validation === true) {
                                applyNewName(value);
                            }
                            break;
                        case 27: //Escape
                            e.preventDefault();
                            e.stopPropagation();
                            _escape();
                            break;
                    }
                }
            }).
            appendTo(me.mainContainer);
            return control;
        }

        function validateName(name) {
            return true;
        }

        function applyNewName(name) {

            if (name.length) {
                if (me.key.length === 0) {
                    me.key = name;
                    me.changeName(name);
                    me.parent.addNode(me);
                    me.parent.expander.expand();
                    _escape();
                    me.tree.trigger({
                        'type': 'newNode',
                        'node': me,
                        'parentId': me.parent.id
                    });
                } else {
                    if (me.name !== name) {
                        var prevName = me.name;
                        me.changeName(name);
                        me.tree.trigger({
                            'type': 'rename',
                            'node': me,
                            'name': name,
                            'prevName': prevName
                        });
                    }
                    _escape();
                }
            } else {
                if (me.key.length === 0) {
                    me.cancel();
                }
            }

        }

        function destroy() {
            $(textbox).remove();
            textbox = null;
        }

        function _activate() {
            if (textbox === null) {
                textbox = createTextbox();
            }
            active = true;
            show(textbox);
            $(textbox).css($(me.caption).offset()).val(me.name).focus().select();
        }

        function _escape() {
            active = false;
            destroy();
            if (me.key.length === 0) {
                me.parent.activate();
                me.cancel();
            }
        }

        return {
            activate: function (e) {
                if (!active) {
                    _activate();
                    me.tree.trigger({
                        type: 'edit_name'
                    });
                }
            },
            isActive: function () {
                return active;
            },
            escape: function () {
                _escape();
            },
            isOutside: function (x, y) {
                var position = $(textbox).offset();
                var xa = position.left;
                var ya = position.top;
                var xz = xa + $(textbox).width();
                var yz = ya + $(textbox).height();

                if (x >= xa && x <= xz && y >= ya && y <= yz) {
                    return false;
                }

                return true;

            }
        }

    })();

    this.sorter = (function () {
        me.nodesArray = []

        var createNodesTable = function () {
            for (var key in me.nodes) {
                var index = 0;
                if (me.nodes.hasOwnProperty(key)) {
                    var node = me.nodes[key];
                    me.nodesArray.push(node);
                }
            }
        }

        var sort = function () {
            me.nodesArray.sort(function (obj1, obj2) {
                return (obj1.name < obj2.name ? -1 : 1);
            });
        }

        var rearrange = function () {
            for (var i = me.nodesArray.length - 1; i > 0; i--) {
                $(me.nodesArray[i].mainContainer).before($(me.nodesArray[i - 1].mainContainer));
                me.nodesArray[i].index = i;
            }
        }

        return {
            sort: function () {
                me.nodesArray = [];
                createNodesTable();
                if (Object.keys(me.nodes).length > 1) {
                    sort();
                    rearrange();
                }
            }
        }

    })();

    this.path = function (thisInclude) {
        var node;
        var path = '';

        if (thisInclude) {
            node = this;
        } else {
            node = this.parent
        }

        if (node.isRoot()) {
            return '';
        }

        while (!node.isRoot()) {
            path = node.name + (path ? '  >  ' + path : '');
            node = node.parent;
        }
        return path;
    }

}
TreeNode.prototype.loadData = function (data) {
    var me = this;
    if (data && data.length) {
        this.expander.setExpandableStatus(true);
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                var item = data[key];
                var node = new TreeNode({
                    tree: me.tree,
                    key: item.key,
                    name: item.caption,
                    parent: me,
                    expanded: item.expanded,
                    object: item.object
                });
                this.nodes[item.key] = node;
                node.selector.setValue(item.selected);
                node.loadData(item.items);
            }
        }

        this.sorter.sort();

    } else {

        this.expander.setExpandableStatus(false);

    }
}


TreeNode.prototype.getName = function () {
    return this.name;
}
TreeNode.prototype.getKey = function () {
    return this.key;
}
TreeNode.prototype.transfer = function (destination) {
    if (this === destination) {
        this.isActive = false;
    } else {
        if (!this.isRoot()) {
            this.parent.removeNode(this);
            destination.addNode(this);
        }
    }
}
TreeNode.prototype.addNode = function (node) {
    //alert('moving node ' + node.name + ' to ' + this.name);
    node.moveTo(this);
    this.nodes[node.getKey()] = node;
    this.sorter.sort();
    this.resetStatus();
    this.dropArea.unselect();
    this.dropArea.recalculate();
}
TreeNode.prototype.moveTo = function (newParent) {
    if (this.parent) {
        this.parent.removeNode(this.key);
    }
    this.parent = newParent;
    this.mainContainer.appendTo($(newParent.getContainer()));
}
TreeNode.prototype.isRoot = function () {
    var value = (this.parent.isNode ? false : true);
    return value;
}
TreeNode.prototype.resetStatus = function () {
    if (Object.keys(this.nodes).length > 0) {
        this.expander.setExpandableStatus(true);
    } else {
        this.expander.setExpandableStatus(false);
    }
}
TreeNode.prototype.getChildNode = function (i) {
    if (i >= 0 && i < this.nodesArray.length) {
        return this.nodesArray[i];
    }
    return null;
}
TreeNode.prototype.getLastChild = function () {
    if (this.nodesArray.length < 1) {
        return null;
    } else {
        return this.nodesArray[this.nodesArray.length - 1];
    }
}
TreeNode.prototype.activate = function () {
    this.isActive = true;

    if (this.parent.isNode){ // && !this.parent.expander.isExpanded()) {
        this.parent.expander.expand();
    }

    $(this.caption).addClass('selected');

    this.tree.trigger({
        'type': 'activate',
        'node': this
    });
}
TreeNode.prototype.inactivate = function () {
    this.isActive = false;
    $(this.caption).removeClass('selected');
    this.tree.trigger({
        'type': 'inactivate',
        'node': this
    });
}
TreeNode.prototype.nextNode = function () {
    if (this.isRoot() === true) {
        return null;
    } else {
        return this.parent.getChildNode(this.index + 1);
    }
}
TreeNode.prototype.previousNode = function () {
    if (this.isRoot() === true) {
        return null;
    } else {
        return this.parent.getChildNode(this.index - 1);
    }
}
TreeNode.prototype.delete = function () {
    if (!this.isRoot()) {
        this.parent.removeNode(this.key);
        this.parent.resetStatus();

        $(this.mainContainer).css({
            'display' : 'none'
        });

        this.tree.trigger({
            'type': 'delete',
            'node': this
        });

    }
}
TreeNode.prototype.removeNode = function (key) {
    delete this.nodes[key];
    this.sorter.sort();
}
TreeNode.prototype.addNewNode = function () {
    var me = this;
    var node = new TreeNode({
            tree: me.tree,
            parent: me,
            expanded: false
        });
    this.tree.trigger({
        'type': 'activate',
        'node': node
    });
    node.renamer.activate();
}
TreeNode.prototype.cancel = function () {
    $(this.mainContainer).remove();
    this.parent.removeNode(this.key);
}
TreeNode.prototype.changeName = function (name) {
    this.name = name;
    $(this.caption).html(name);
}
TreeNode.prototype.select = function () {
    if (this.tree.mode === MODE.SINGLE) {
        this.tree.trigger({
            'type': 'confirm',
            'item': this
        });
    } else if (this.tree.mode === MODE.MULTI) {
        this.selector.click();
        if (this.tree.selection) {
            this.tree.selection.refresh();
        }
    }
}
TreeNode.prototype.unselect = function () {
    if (this.tree.mode === MODE.MULTI) {
        this.selector.unselect();
        this.tree.selection.refresh();
    }
}
TreeNode.prototype.getNodesForSearching = function () {
    var a = [];
    var counter = 0;

    if (!this.isRoot()) {
        //Add itself (except for root).
        a[counter++] = this.getSearchObject();
    }

    //Add nodes.
    for (var key in this.nodes) {
        if (this.nodes.hasOwnProperty(key)) {
            var node = this.nodes[key];
            var arr = node.getNodesForSearching();

            for (var i = 0; i < arr.length; i++) {
                a[counter++] = arr[i];
            }
        }
    }

    return a;

}
TreeNode.prototype.getSearchObject = function () {
    return {
        object: this,
        name: this.name,
        prepend: this.path() + (this.parent.isRoot() ? '' : '  >  '),
        displayed: this.name
    }
}
TreeNode.prototype.getSelectedArray = function () {
    var a = [];
    var counter = 0;

    if (this.selector.isSelected()) {
        a[counter++] = this;
    } else if (this.selector.hasSelectedChildren()) {
        for (var key in this.nodes) {
            if (this.nodes.hasOwnProperty(key)) {
                var node = this.nodes[key];
                var arr = node.getSelectedArray();

                for (var i = 0; i < arr.length; i++) {
                    a[counter++] = arr[i];
                }
            }
        }
    }

    return a;

}


function SearchPanel(tree) {
    var me = this;
    this.tree = tree;
    this.dropdown = null;

    $(this.tree._searchPanel).empty();
    this.container = this.tree._searchPanel;

}
SearchPanel.prototype.show = function () {
    var me = this;

    $(this.container).css({
        'display': 'block',
        'z-index': 2
    });

    var searchData = this.tree.root.getNodesForSearching();

    var properties = {
        parent: $(this.container),
        'data': searchData,
        background: false,
        displayed: 'displayed'
    };
    
    if (this.dropdown === null) {
        this.dropdown = new DropDown(properties);
    }

    this.dropdown.listener().bind({
        'deactivate': function () {
            me.tree.hideSearchPanel();
        },
        'selected' : function(e){
            me.tree.hideSearchPanel();
            var node = e.object.object;
            node.activate();
        }
    });

    this.dropdown.activate();

}
SearchPanel.prototype.hide = function(){
    $(this.container).css({
        'display': 'none'
    });
}


function hide(div) {
    $(div).css({
        'visibility': 'hidden'
    });
}
function show(div) {
    $(div).css({
        'visibility': 'visible'
    });
}
function display(div, value) {
    $(div).css({
        'display' : (value ? 'block' : 'none')
    });
}
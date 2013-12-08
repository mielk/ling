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



/* TreeView
   
   Events:
   #expand
   #collapse
   #activate
   #deactivate
   #delete
   #newNode
   #confirm
   #select
   #unselect
   #cancel
   #transfer            
 */
function TreeView(properties){
    var me = this;

    //Public properties.
    this.mode = properties.mode ? properties.mode : MODE.SINGLE;
    this.options = {
        expandWhenAddingNewNode: true,
        doubleClickDelay: 500,
    }

    //Private properties.
    var $visible = (properties.hidden === true ? false : true);
    var $isEmbedded = (properties.container !== undefined);
    var $activeNode = null;


    var $events = (function () {
        var _listener = {};

        $(_listener).bind({
            select: function (e) {
                if (e.active === false) return;
                if (me.mode === MODE.SINGLE) {
                    $(_listener).trigger({
                        'type': 'confirm',
                        'item': e.node
                    });
                }
            },
            activate: function (e) {
                if (e.active === false) return;
                if ($activeNode && $activeNode != e.node) {
                    $activeNode.inactivate();
                }
                $activeNode = e.node;
            },
            inactivate: function (e) {
                if (e.active === false) return;
                if ($activeNode === e.node) {
                    $activeNode = null;
                }
            },
            'delete': function (e) {
                if (e.active === false) return;
            },
            newNode: function (e) {
                if (e.active === false) return;
                e.node.activate();
            },
            confirm: function (e) {
                if (e.active === false) return;
                alert('Confirm: ' + (e.item ? e.item.name : e.items.length));
                if (!$isEmbedded) {
                    me.hide();
                }
            },
            cancel: function (e) {
                if (e.active === false) return;
                if (!$isEmbedded) {
                    me.hide();
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
        var _background;

        if (properties.blockOtherElements) {
            _background = jQuery('<div/>', {
                'class': 'tree-background'
            }).
            css({
                'z-index': my.ui.addTopLayer()
            }).
            appendTo($(document.body));
        }

        if ($isEmbedded) {
            _background = jQuery('<div/>').
            css({
                'width': '100%',
                'height': '100%',
                'position': 'relative',
                'display': 'block'
            }).
            appendTo($(properties.container));
        }

        _background = (_background || $(document.body));

        var _frame = jQuery('<div/>', {
            'class': 'tree-container-frame'
        }).appendTo($(_background));


        
        //Change styling if tree is embedded.
        if ($isEmbedded) {
            $(_frame).css({
                'position': 'relative',
                'float': 'left',
                'width': '100%',
                'min-height': '100%',
                'height': 'auto',
                'left': '0px',
                'top': '0px',
                'padding': '0px'
            });
        }

        var _container = jQuery('<div/>', {
            'class': 'tree-container'
        }).appendTo($(_frame));

        //Place container inside the screen.
        if (properties.x !== undefined) {
            $(_container).css('left', properties.x);
        }
        if (properties.y !== undefined) {
            $(_container).css('top', properties.y);
        }


        if (!$isEmbedded) {
            var btnQuit = jQuery('<div/>', {
                'class': 'tree-container-exit'
            }).
            bind({
                'click': function (e) {
                    if (e.active === false) return;
                    $events.trigger({
                        'type': 'cancel'
                    });
                }
            }).appendTo($(_container));
        }

        return {
            destroy: function () {
                if (_background !== document.body) {
                    $(_background).remove();
                } else {
                    $(_frame).remove();
                }
            },
            hide: function(){
                $visible = false;
                hide(_background);
                hide(_container);
            },
            show: function(){
                $visible = true;
                show(_background);
                show(_container);
                $(_background).css({
                    'z-index': my.ui.addTopLayer()
                });
            },
            append: function (element) {
                $(element).appendTo(_container);
            },
            container: function(){
                return _container;
            }
        }

    })();
    this.hide = function () {
        $ui.hide();
    }
    this.show = function () {
        $ui.show();
    }
    this.destroy = function () {
        $ui.destroy();
    }
    this.reset = function (e) {
        if (e.unselect) {
            $root.trigger({ 'type': 'unselect' });
        }
        if (e.collapse) {
            $root.trigger({ 'type': 'collapse' });
        }
    }
    //TreeView.prototype.reset = function () {
    //    if (this.node) {
    //        this.node.unselect();
    //        this.node.collapse();
    //    }
    //}


    var $root = new TreeNode(me, null, properties.root);

    var $searchPanel = (function () {
        var _active = false;

        var _ui = (function () {
            var _container = jQuery('<div/>', {
                'class': 'tree-search-panel'
            }).css({
                'display': 'none'
            });

            $ui.append(_container);

            return {
                hide: function () {
                    display(_container, false);
                },
                show: function () {
                    display(_container, true);
                    $(_container).css({
                        'z-index': my.ui.addTopLayer()
                    });
                },
                container: function () {
                    return _container;
                }
            }

        })();

        var _dropdown;

        function _activate() {
            _dropdown = _dropdown || new DropDown({
                parent: _ui.container(),
                data: $root.getNodesForSearching(),
                background: false,
                displayed: 'displayed'
            });

            _dropdown.bind({
                'deactivate': function (e) {
                    $events.trigger({
                        'type': 'endSearching'
                    });
                },
                'selected': function (e) {
                    $events.trigger({
                        'type': 'searchSelection',
                        'node': e.object.object
                    });
                }
            });

            _ui.show();
        }

        var _events = (function () {
            $events.bind({
                'startSearching': function (e) {
                    if (e.active === false) return;
                    _active = true;
                },
                'endSearching searchSelection': function (e) {
                    if (e.active === false) return;
                    _active = false;
                    _ui.hide();
                }
            });

        })();

        (function ini(){
            $ui.append(_ui.container());
        })();

        return {
            isActive: function () {
                return _active;
            }
        }

    })();

    var $children = (function(){

        var _ui = (function () {

            var _container = jQuery('<div/>');

            $ui.append(_container);

            return {
                container: function () {
                    return _container;
                }
            }

        })();

        (function ini() {
            $ui.append(_ui.container());
        })();

        return {
            container: function () {
                return _ui.container();
            }
        }

    })();

    var $selection = (function () {
        var _active = properties.showSelection;

        var _events = (function () {
            $events.bind({
                'select unselect': function (e) {
                    if (e.active === false) return;
                    _refresh();
                }
            });

        })();

        var _ui = (function () {

            var _container = jQuery('<div/>', {
                'class': 'tree-selection-container'
            }).css({
                'display': _active ? 'block' : 'none'
            });

            var _header = jQuery('<div/>', {
                'class': 'tree-selection-header',
                html: 'Selected'
            }).appendTo($(_container));

            var _nodes = jQuery('<div/>', {
                id: 'tree-selection-nodes',
                'class': 'tree-selection-nodes'
            }).appendTo($(_container));

            $ui.append(_container);


            function _refresh() {
                _nodes.empty();

                var selected = $root.util.getSelectedArray();
                for (var i = 0; i < selected.length; i++) {
                    var node = selected[i];
                    var line = nodeLine(node);
                    line.appendTo(_nodes);
                }
            }


            function nodeLine(node) {
                var _node = node;
                var _ui = (function () {
                    var _container = jQuery('<div/>', {
                        'class': 'tree-selection-line'
                    });

                    var _remover = jQuery('<div/>', {
                        'class': 'tree-selection-line-remover'
                    }).
                    bind({
                        'click': function () {
                            _node.trigger({
                                'type': 'unselect'
                            });
                        }
                    }).appendTo(_container);

                    var _caption = jQuery('<div/>', {
                        'class': 'tree-selection-line-caption',
                        'html': _node.name
                    }).appendTo(_container);

                    return {
                        appendTo: function (container) {
                            $(_container).appendTo(container);
                        }
                    }

                })();

                return {
                    appendTo: function (container) {
                        _ui.appendTo(container)
                    }
                }

            }


            return {
                hide: function () {
                    display(_container, false);
                },
                show: function () {
                    display(_container, true);
                    $(_container).css({
                        'z-index': my.ui.addTopLayer()
                    });
                },
                container: function () {
                    return _container;
                },
                refresh: function () {
                    _refresh();
                }
            }

        })();



        function _refresh() {
            _ui.refresh();
        }

        (function ini(){
            $ui.append(_ui.container());
        })();

    })();
    
    var $buttons = (function () {
        //this.buttons = (function () {
        //    me.buttonsPanel = jQuery('<div/>', {
        //        id: 'tree-buttons-panel',
        //        'class': 'tree-buttons-panel'
        //    }).appendTo($(me.container));

        //    var buttonsContainer = jQuery('<div/>', {
        //        id: 'tree-buttons-container',
        //        'class': 'tree-buttons-container'
        //    }).appendTo($(me.buttonsPanel));

        //    var btnOk = jQuery('<input/>', {
        //        id: 'tree-button-ok',
        //        'class': 'tree-button',
        //        'type': 'submit',
        //        'value': 'OK'
        //    }).
        //    bind({
        //        'click': function () {
        //            var items = me.root.getSelectedArray();
        //            if (items && items.length) {
        //                $events.trigger({
        //                    'type': 'confirm',
        //                    'items': items
        //                });
        //            } else {
        //                $events.trigger({
        //                    'type': 'cancel'
        //                });
        //            }


        //        }
        //    }).appendTo($(buttonsContainer));

        //    var btnCancel = jQuery('<input/>', {
        //        id: 'tree-button-cancel',
        //        'class': 'tree-button',
        //        'type': 'submit',
        //        'value': 'Cancel'
        //    }).
        //    bind({
        //        'click': function () {
        //            $events.trigger({
        //                'type': 'cancel'
        //            });
        //        }
        //    }).appendTo($(buttonsContainer));
        //})();
    })();

    var $dragdrop = (function () {
        //var drag = null;
        //var drop = null;

        //$(document).bind({
        //    'mousemove': function (e) {

        //        e.preventDefault();
        //        if (e && drag) {

        //            var x = e.pageX;
        //            var y = e.pageY;

        //            if (drop) {
        //                var previousArea = drop.dropArea;
        //                if (previousArea.isHovered(x, y)) {
        //                    return;
        //                } else {
        //                    previousArea.unselect();
        //                }
        //            } else {
        //                me.root.dropArea.check(x, y);
        //            }
        //        }
        //    }
        //});

        //$events.bind({
        //    dropin: function (e) {
        //        if (e.node !== drag) {
        //            drop = e.node;
        //        }
        //    },
        //    dropout: function (e) {
        //        if (drop === e.node) {
        //            drop = null;
        //        }
        //    },
        //    dragin: function (e) {
        //        drag = e.node;
        //    },
        //    dragout: function (e) {
        //        if (drag && drop) {
        //            me.trigger({
        //                type: 'transfer',
        //                node: drag,
        //                to: drop
        //            });
        //            drag = null;
        //        }
        //    },
        //    inactivate: function(e){
        //        if (drag === e.node) {
        //            drag = null;
        //        }
        //    },
        //    transfer: function (e) {
        //        if (e.node && e.to) {
        //            e.node.transfer(e.to);
        //        }
        //    }
        //});


        //return {
        //    hasDropArea: function () {
        //        return (drop ? true : false);
        //    },
        //    getDrag: function () {
        //        return drag;
        //    }
        //}

    })();

    var $navigator = (function () {

        //$(document).bind({
        //    'keydown': function (e) {

        //        if (!me.visible) {
        //            return;
        //        }
                
        //        //Special shortcuts.
        //        if (e.ctrlKey) {
        //            //Search panel (Ctrl + F/f)
        //            switch (e.which) {
        //                case 70:
        //                case 102:
        //                    //search panel.
        //                    e.preventDefault();
        //                    e.stopPropagation();
        //                    me.showSearchPanel();
        //                    break;
        //            }
        //        }


        //        if (me.searchMode || (me.activeNode != null && me.activeNode.renamer.isActive())) {
        //            return;
        //        }

        //        //Escape applies even for the case if none node is selected.
        //        if (e.which === 27) {
        //            $events.trigger({
        //                'type' : 'cancel'
        //            });
        //        }

        //        if (me.activeNode) {
        //            switch (e.which) {
        //                case 37: //Arrow left
        //                    _collapse();
        //                    e.stopPropagation();
        //                    break;
        //                case 38: //Arrow up
        //                    e.stopPropagation();
        //                    e.preventDefault();
        //                    _moveUp();
        //                    break;
        //                case 39: //Arrow right
        //                    _expand();
        //                    e.stopPropagation();
        //                    break;
        //                case 40: //Arrow down
        //                    e.stopPropagation();
        //                    e.preventDefault();
        //                    _moveDown();
        //                    break;
        //                case 36: //Home
        //                    e.stopPropagation();
        //                    e.preventDefault();
        //                    _moveToParent();
        //                    break;
        //                case 35: //End
        //                    e.stopPropagation();
        //                    e.preventDefault();
        //                    break;
        //                case 33: //PageUp
        //                    e.stopPropagation();
        //                    e.preventDefault();
        //                    _moveToRoot();
        //                    break;
        //                case 34: //PageDown
        //                    e.stopPropagation();
        //                    e.preventDefault();
        //                    _moveToLastItem();
        //                    break;
        //                case 113: //F2
        //                    e.stopPropagation();
        //                    e.preventDefault();
        //                    me.activeNode.renamer.activate();
        //                    break;
        //                case 46: //Delete
        //                    e.stopPropagation();
        //                    e.preventDefault();
        //                    me.activeNode.delete();
        //                    _moveToParent();
        //                    break;
        //                case 45: //Insert
        //                    e.stopPropagation();
        //                    e.preventDefault();
        //                    _addNewNode();
        //                    break;
        //                case 13: //Enter
        //                    e.stopPropagation();
        //                    e.preventDefault();
        //                    switch (me.mode) {
        //                        case MODE.SINGLE: _selectActive(); break;
        //                        case MODE.MULTI: _confirm(); break;
        //                    }
        //                    break;
        //                    //Confirmation.
        //                case 32: //Space
        //                    e.stopPropagation();
        //                    e.preventDefault();
        //                    switch (me.mode) {
        //                        case MODE.SINGLE: _selectActive(); break;
        //                        case MODE.MULTI: me.activeNode.select(); break;
        //                    }
        //                    break;
        //            }
        //        }

        //    }

        //});

        //function _confirm() {
        //    me.trigger({
        //        'type': 'confirm',
        //        'items': _getSelectedArray()
        //    });
        //}

        
        //function _getSelectedArray() {
        //    return me.root.getSelectedArray();
        //}


        //function _selectActive() {
        //    me.trigger({
        //        'type': 'confirm',
        //        'item' : me.activeNode
        //    });
        //}

        //function _addNewNode() {
        //    var expander = me.activeNode.expander;
        //    if (!expander.isExpanded()) {
        //        expander.expand();
        //    }
        //    me.activeNode.addNewNode();
        //}

        //function _expand() {
        //    if (me.activeNode.expander) {
        //        me.activeNode.expander.expand();
        //    }
        //}

        //function _collapse() {
        //    if (me.activeNode.expander) {
        //        me.activeNode.expander.collapse();
        //    }
        //}

        //function _moveToParent() {
        //    if (!me.activeNode.isRoot()) {
        //        changeSelection(me.activeNode.parent);
        //    }
        //}

        //function _moveToRoot() {
        //    changeSelection(me.root);
        //}

        //function _moveToLastItem() {
        //    var node = me.root;
        //    while (node.expander.isExpanded()) {
        //        node = node.getLastChild();
        //    }
        //    changeSelection(node);
        //}

        //function _moveUp() {
        //    var previousNode = me.activeNode.previousNode();
        //    if (previousNode) {

        //        var node = previousNode;
        //        while (node.expander.isExpanded()) {
        //            node = node.getLastChild();
        //        }
        //        changeSelection(node);
        //    } else {
        //        if (!me.activeNode.isRoot()) {
        //            changeSelection(me.activeNode.parent);
        //        }
        //    }
        //}

        //function _moveDown() {
        //    if (me.activeNode.expander && me.activeNode.expander.isExpanded()) {
        //        var childNode = me.activeNode.getChildNode(0);
        //        if (childNode) {
        //            changeSelection(childNode);
        //        }
        //    } else {
        //        if (!me.activeNode.isRoot()) {
        //            var nextNode = me.activeNode.nextNode();

        //            var parent = me.activeNode.parent;
        //            while (nextNode === null && parent.isNode) {
        //                nextNode = parent.nextNode();
        //                parent = parent.parent;
        //            }

        //            if (nextNode) {
        //                changeSelection(nextNode);
        //            }

        //        }
        //    }
        //}

        //function changeSelection(node) {
        //    me.activeNode.inactivate();
        //    node.activate();
        //}

    })();

    //this.root.activate();
    (function ini() {
        $root.render($children.container());
        if (!$visible) $ui.hide();
    })();

    

}


//TreeNode
//Represents a single line in a tree view.
//Events generated:
// expand
// collapse
// move
// select
// unselect
// childStatusChanged
// hasSelectedChildren
// activateDroparea
// deactivateDroparea
// addNode
// removeNode
// sort
// statusChanged
// move
// click
// release
// startRenamer
// escapeRenamer
// rename
// load
//=================
//TreeView:
// editName
function TreeNode(tree, parent, object){
    var me = this;
    //Parental tree.
    this.tree = tree;
    //Node properties.
    this.key = (typeof(object.key) === 'function' ? object.key() : object.key) || '';
    this.name = (typeof (object.name) === 'function' ? object.name() : object.name) || '';
    this.object = object;
    this.parent = parent;
    //State variables.
    this.new = false;


    var $events = (function () {
        var _listener = {};

        $(_listener).bind({
            'addNode': function (e) {
                if (e.active === false) return;
                if (me.object.events) {
                    var _events = (typeof (me.object.events) === 'function' ? object.events() : object.events);
                    _events.trigger({
                        'type': 'add',
                        'value': e.node.object
                    });
                }
            },
            'removeNode': function (e) {
                if (e.active === false) return;
                if (me.object.events) {
                    var _events = (typeof (me.object.events) === 'function' ? object.events() : object.events);
                    _events.trigger({
                        'type': 'remove',
                        'value': e.node.object
                    });
                }
            },
            'activateDroparea': function(e){
                me.tree.trigger({
                    'type' : 'dropin',
                    'node': me
                });
            },
            'deactivateDroparea': function(e){
                me.tree.trigger({
                    'type' : 'dropout',
                    'node': me
                });
            },
            'select': function (e) {
                me.tree.trigger({
                    'type': 'select'
                });
            },
            'unselect': function (e) {
                me.tree.trigger({
                    'type': 'unselect'
                });
            },
            'expand': function (e) {
                me.tree.trigger({
                    'type': 'expand',
                    'node': me
                });
            },
            'collapse': function (e) {
                me.tree.trigger({
                    'type': 'collapse',
                    'node': me
                });
            },
            'rename': function (e) {
                me.name = e.name;
                me.tree.trigger({
                    'type': 'rename',
                    'node': me,
                    'oldName': e.oldName,
                    'name': e.name
                });
            }
            //rename: [node], [name]
            //tranfer: [node], [to]
        });

        return {
            trigger: function (e) {
                $(_listener).trigger(e);
            },
            bind: function (e) {
                $(_listener).bind(e);
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
        //Define if this element is visible on the screen.
        //If parent is not defined, this node is root node and
        //it is always visible.
        var _visible = (me.parent ? me.parent.isExpanded() : true);

        var _position = {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
        };

        var _container = jQuery('<div/>', {
            'class': 'node-container'
        });

        var _line = jQuery('<div/>', {
            'class': 'tree-line'
        }).appendTo(_container);

        var _children = jQuery('<div/>', {
            'class': 'children-container'
        }).appendTo(_container);

        function _calculatePosition() {
            var _pos = $(_container).offset();
            var _width = $(_container).width();
            var _height = $(_container).height();
            _position = {
                left: _pos.left,
                top: _pos.top,
                width: _width,
                height: _height,
                right: _pos.left + _width,
                bottom: _pos.top + _height
            }
        };

        //Events listeners.
        var _listener = (function () {
            $events.bind({
                expand: function (e) {
                    if (e.active === false) return;
                    display(_children, true);
                },
                collapse: function (e) {
                    if (e.active === false) return;
                    display(_children, false);
                },
                addNode: function (e) {
                    if (e.active === false) return;
                    _addChild(e.container);
                },
                sort: function (e) {
                    var _array = e.array;
                    if (_array.length > 1) {
                        for (var i = _array.length - 1; i > 0; i--) {
                            $(_array[i].container()).before($(_array[i - 1].container));
                        }
                    }
                }
            });

            me.tree.bind({
                'expand collapse': function (e) {
                    _calculatePosition();
                }
            });

            if (me.parent) {
                me.parent.bind({
                    'expand': function () {
                        _visible = true;
                    },
                    'collapse': function () {
                        _visible = false;
                    }
                });
            }

        })();


        function _addChild(object){
            $(object).appendTo(_children);
        }

        function _isHovered(x, y) {
            if (_visible) {
                if (x >= _position.left && x <= _position.right && y >= _position.top && y <= _position.bottom) {
                    return true;
                }
            }
            return false;
        }


        return {
            container: _container,
            line: _line,
            children: _children,
            isHovered: function (x, y) {
                return _isHovered(x, y);
            },
            append: function (container) {
                $(_container).appendTo(container);
            }
        }

    }());
    this.container = function () {
        return $ui.container;
    }
    this.render = function (container) {
        $ui.append(container);
        $nodes.each(function (node) {
            node.render($ui.children);
        });
    }


    var $nodes = (function () {
        var _items = {};
        var _sorted = [];

        var _events = (function () {
            $events.bind({
                'addNode': function (e) {
                    if (e.active === false) return;
                    _addNode(e.node, e.sort);
                },
                'removeNode': function (e) {
                    if (e.active === false) return;
                    if (e.node) {
                        _removeNode(e.node)
                    } else if (e.key) {
                        _removeNodeByKey(e.key);
                    }
                    _refreshArray();
                }
            });
        })();

        function _sort() {
            _sorted.sort(function (a, b) {
                return a.key - b.key;
            });
            $events.trigger({
                'type': 'sort',
                'array': _sorted
            });
        }

        function _addNode(node, sort){
            _items[node.key] = node;
            if (sort !== false) _refreshArray();
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

        function _load() {
            var $items = (typeof (me.object.items) === "function" ? me.object.items() : me.object.items);
            for (var i = 0; i < $items.length; i++) {
                var node = new TreeNode(me.tree, me, $items[i]);
                _items[node.key] = node;
                _sorted.push(node);
            }

            $events.trigger({
                'type': 'load'
            });

            _sort();

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
            countSelected: function(includePartiallySelected){
                var _counter = 0;
                for (var key in _items) {
                    if (_items.hasOwnProperty(key)){
                        var item = _items[key];
                        if (item.isSelected()){
                            _counter += 1;
                        } else if (includePartiallySelected && item.hasSelectedChildren()) {
                            _counter += 0.5;
                        }
                    }
                }
                return _counter;
            },
            load: function () {
                _load();
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
                if (e.active === false) return;
                e.preventDefault();
                e.stopPropagation();
                if (_expandable) {
                    _revertStatus();
                }
            }
        }).appendTo($ui.line);

        var _events = (function () {
            $events.bind({
                'addNode': function (e) {
                    if (e.active === false) return;
                    _expandable = true;
                    if (me.tree.options.expandWhenAddingNewNode) {
                        _expanded = true;
                    }
                    _render();
                },
                'removeNode load': function (e) {
                    if (e.active === false) return;
                    _expandable = ($nodes.size() > 0);
                    _render();
                },
                'expand': function (e) {
                    if (e.active === false) return;
                    _expanded = true;
                    _render();

                    if (me.parent) {
                        me.parent.trigger({
                            'type': 'expand'
                        });
                    }

                },
                'collapse': function (e) {
                    if (e.active === false) return;
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
                $events.trigger({
                    'type': 'expand'
                });
            }
        }

        function _collapse() {
            if (_expandable && _expanded) {
                $events.trigger({
                    'type': 'collapse'
                });
            }
        }

        function _render() {
            if (_expandable) {
                $(_button).html(_expanded ? '-' : '+');
            } else {
                $(_button).html('.');
            }
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
    this.isExpanded = function () {
        return $expander.isExpanded();
    }


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
                'click': function (e) {
                    if (e.active === false) return;
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
                'select hasSelectedChildren': function (e) {
                    _hasSelectedChildren = true;
                },
                'unselect': function (e) {
                    _hasSelectedChildren = false;
                },
                'select': function (e) {
                    _selected = true;
                    _ui.check(true);
                    if (me.tree.mode === MODE.SINGLE) {
                        me.tree.trigger({
                            'type': 'select',
                            'node': me
                        });
                    }
                },
                'unselect hasSelectedChildren': function (e) {
                    _selected = false;
                    _ui.check(false);
                },
                'select unselect hasSelectedChildren': function (e) {
                    if (e.active === false) return;
                    
                    if (e.applyForChildren){
                        _applyForChildren(e.type);
                    }
                    if (e.applyForParent){
                        _applyForParent(e.type);
                    }
                },
                'statusChanged': function (e) {
                    if (e.active === false) return;
                    $events.trigger({
                        'type': _selected ? 'unselect' : 'select',
                        'applyForParent': true,
                        'applyForChildren' : true
                    });
                },
                'childStatusChanged': function (e) {
                    if (e.active === false) return;
                    var selectedChildren = $nodes.countSelected(true);
                    if (selectedChildren){
                        $events.trigger({
                            'type' : (selectedChildren === $nodes.size() ? 'select' : 'hasSelectedChildren'),
                            'applyForChildren' : false,
                            'applyForParent': true
                        });
                    } else {
                        $events.trigger({
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
        return $selector.isSelected();
    }
    this.hasSelectedChildren = function () {
        return $selector.hasSelectedChildren();
    }


    var $caption = (function () {
        var _active = false;

        var _ui = (function () {
            var _caption = jQuery('<div/>', {
                'class': 'caption',
                html: me.name
            }).bind({
                'mousedown': function (e) {
                    if (e.active === false) return;
                    $events.trigger({
                        'type': 'click',
                        'x': e.pageX,
                        'y': e.pageY
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
                    if (e.active === false) return;
                    $events.trigger({
                        'type' : 'release'
                    });
                    //if (!me.mover.isActive() && me.mouseClicked) {
                    //    me.activate();
                    //}
                    //me.mouseClicked = false;
                }
            }).appendTo($ui.line);

            return {
                textbox: function () {
                    return _caption;
                },
                position: function(){
                    var _position = $(_caption).offset();
                    var _width = $(_caption).width();
                    var _height = $(_caption).height();
                    return {
                        left: _position.left,
                        top: _position.top,
                        width: _width,
                        height: _height,
                        right: _position.left + _width,
                        bottom: _position.top + _height
                    }
                },
                append: function (control) {
                    $(control).appendTo(_caption);
                },
                rename: function (name) {
                    $(_caption).html(name);
                }
            }

        })();

        var _events = (function () {
            $events.bind({
                'click': function (e) {
                    if (e.active === false) return;
                    if (_active) {
                        if (me.tree.mode === MODE.SINGLE) {
                            $events.trigger({
                                'type': 'select'
                            });
                        } else {
                            $events.trigger({
                                'type': 'startRenamer'
                            });
                        }
                    } else {
                        _active = true;
                        setTimeout(function () {
                            _active = false;
                        }, me.tree.options.doubleClickDelay || 250);
                    }
                },
                'select hasSelectedChildren': function (e) {
                    if (e.active === false) return;
                    $(_ui.textbox()).css({
                        'font-weight' : 'bold'
                    });
                },
                'unselect': function (e) {
                    if (e.active === false) return;
                    $(_ui.textbox()).css({
                        'font-weight': 'normal'
                    });
                },
                'activateDroparea': function (e) {
                    if (e.active === false) return;
                    $(_ui.textbox()).addClass('drop-area');
                },
                'deactivateDroparea': function (e) {
                    if (e.active === false) return;
                    $(_ui.textbox()).removeClass('drop-area');
                },
                'rename': function(e){
                    if (e.active === false) return;
                    _ui.rename(e.name);
                }
            });
        })();

        return {
            position: function(){
                return _ui.position();
            },
            append: function (control) {
                _ui.append(control);
            }
        }

    })();

    var $renamer = (function () {
        var _active = false;

        var _listener = (function () {
            $events.bind({
                'startRenamer': function (e) {
                    if (e.active === false) return;
                    _activate();
                },
                'escapeRenamer': function (e) {
                    if (e.active === false) return;
                    _escape();
                }
            });

            $(document).bind({
                'mousedown': function (e) {
                    if (_active && e && _ui.isOutside(e.pageX, e.pageY)) {
                        e.preventDefault();
                        e.stopPropagation();
                        $events.trigger({
                            'type': 'escapeRenamer'
                        });
                    }
                }
            });

        })();

        var _ui = (function () {
            var _textbox;
            
            function createTextbox(){
                _textbox = _textbox || jQuery('<input/>', {
                    'class': 'edit-name'
                }).css({
                    'visibility': 'hidden'
                }).bind({
                    'keydown': function (e) {
                        switch (e.which) {
                            case 13: //Enter
                                e.preventDefault();
                                e.stopPropagation();
                                _confirm($(this).val());
                                break;
                            case 27: //Escape
                                e.preventDefault();
                                e.stopPropagation();
                                $events.trigger({
                                    'type': 'escapeRenamer'
                                });
                                break;
                        }
                    }
                });
                $caption.append(_textbox);
            }

            function _isOutside(x, y){
                var _position = $(_textbox).offset();
                var _xa = _position.left;
                var _ya = _position.top;
                var _xz = _xa + $(_textbox).width();
                var _yz = _ya + $(_textbox).height();

                if (x >= _xa && x <= _xz && y >= _ya && y <= _yz) {
                    return false;
                }

                return true;
            }

            return {
                destroy: function () {
                    $(_textbox).remove();
                    _textbox = null;
                },
                render: function () {
                    if (!_textbox) createTextbox();
                    show(_textbox);
                    $(_textbox).val(me.name).focus().select();
                    me.tree.trigger({
                        'type': 'editName'
                    });
                },
                isOutside: function(x, y){
                    return _isOutside(x, y);
                },
            }

        })();

        function _activate() {
            _active = true;
            _ui.render();
        }

        function _validate(name) {
            return true;
        }

        function _confirm(value) {
            var validation = _validateName(value);
            if (validation === true) {
                _applyNewName(value);
                //applyNewName(value);
            }
        }

        function _validateName(name) {
            //To be implemented.
            return true;
        }

        function _escape() {
            _active = false;
            _ui.destroy();

            //Kasowanie jeżeli jest to nowy node.
            //if (me.key.length === 0) {
            //    me.parent.activate();
            //    me.cancel();
            //}
        }


        function _applyNewName(name) {

            if (!me.new) {
                $events.trigger({
                    'type': 'rename',
                    'oldName': me.name,
                    'name': name
                });
            }

        //    if (name.length) {
        //        if (me.key.length === 0) {
        //            me.key = name;
        //            me.changeName(name);
        //            me.parent.addNode(me);
        //            me.parent.expander.expand();
        //            _escape();
        //            me.tree.trigger({
        //                'type': 'newNode',
        //                'node': me,
        //                'parentId': me.parent.id
        //            });
        //        } else {
        //            if (me.name !== name) {
        //                var prevName = me.name;
        //                me.changeName(name);
        //                me.tree.trigger({
        //                    'type': 'rename',
        //                    'node': me,
        //                    'name': name,
        //                    'prevName': prevName
        //                });
        //            }
        //            _escape();
        //        }
        //    } else {
        //        if (me.key.length === 0) {
        //            me.cancel();
        //        }
        //    }

        }


        return {
            isActive: function () {
                return _active;
            }
        }

    })();
    this.isBeingRenamed = function () {
        return $renamer.isActive();
    };


    var $droparea = (function () {
        var _visible = false;
        var _position = {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
        };

        var _listener = (function () {
            me.tree.bind({
                'expand collapse': function () {
                    _calculatePosition();
                }
            });
        })();

        function _calculatePosition() {
            _position = $caption.position();
            _visible = (_position.width && _position.height);
        };

        function _isHovered(x, y) {
            if (_visible) {
                if (x >= _position.left && x <= _position.right && y >= _position.top && y <= _position.bottom) {
                    return true;
                }
            }
            return false;
        }

        function _select() {
            $events.trigger({
                'type' : 'activateDroparea'
            });
        }

        function _unselect() {
            $events.trigger({
                'type': 'deactivateDroparea'
            });
        }


        //function _check(x, y) {
        //    if (me.tree.dragDropManager.hasDropArea()) {
        //        return;
        //    } else if (_isHovered(x, y) && me.tree.dragDropManager.getDrag() !== me) {
        //        _select();
        //    } else {
        //        for (var key in me.nodes) {
        //            if (me.nodes.hasOwnProperty(key)) {
        //                var node = me.nodes[key];
        //                if (node) {
        //                    node.dropArea.check(x, y);
        //                }
        //            }
        //        }
        //    }
        //}


    })();

    var $mover = (function () {
        var _active = false;
        var _inProgress = false;
        var _position = {
            caption: {
                top: 0,
                left: 0
            },
            click: {
                top: 0,
                left: 0
            }
        }

        var _events = (function () {
            $(document).bind({
                'mousemove': function (e) {
                    e.preventDefault();
                    if (_active) {
                        $events.trigger({
                            'type': 'move',
                            'x': e.pageX,
                            'y': e.pageY,
                        });
                    }
                },
                'mouseup': function (e) {
                    e.preventDefault();
                    $events.trigger({
                        'type' : 'release'
                    });
                }
            });

            $events.bind({
                'click': function (e) {
                    _active = true;
                    _position.caption = $caption.position();
                    _position.click = {
                        'left': e.x,
                        'top': e.y
                    }
                },
                'startRenamer': function (e) {
                    _active = false;
                },
                'move': function (e) {
                    if (e.active === false) return;
                    if (!_active) return;

                    if (!_inProgress) {
                        _inProgress = true;
                        _activate();
                        me.tree.trigger({
                            'type': 'dragin',
                            node: me
                        });
                    }
                    _ui.move(e.x, e.y);
                },
                'release': function (e) {
                    if (e.active === false) return;
                    if (_active) {
                        _ui.hide();
                        me.tree.trigger({
                            type: 'dragout',
                            node: me
                        });
                    }
                    _active = false;
                    _inProgress = false;
                }
            });

        })();

        var _ui = (function () {
            var _control;

            function createControl() {
                _control = _control || jQuery('<div/>', {
                    'class': 'move',
                    html: me.name
                }).css({
                    'visibility': 'hidden'
                }).appendTo($ui.container);
            }

            function _move(x, y) {
                var _x = x - _position.click.left + _position.caption.left;
                var _y = y - _position.click.top + _position.caption.top;
                $(_control).css({ left: _x, top: _y });
            }

            return {
                hide: function () {
                    hide(_control);
                },
                render: function () {
                    if (!_control) createControl();
                    show(_control);
                },
                move: function (x, y) {
                    if (!_control) return;
                    _move(x, y);
                }
            }

        })();
        
        function _activate(x, y) {
            _active = true;
            _ui.render();
            //my.notify.display("Mover activated");
        }

        return {
            isActive: function () {
                return _active;
            }
        }

    })();


    //Util functions.
    this.util = {
        getNodesForSearching: function () {
            return [];
        }
        //getNodesForSearching: function () {
        //    var array = [];

        //    if (me.parent) {    //Add itself (except for root).
        //        //array.push(me.getSearchObject);
        //    }

        //    //Add nodes.
        //    $nodes.each(function (node) {
        //        var _array = node.getNodesForSearching();
        //        array.push(_array);
        //    });

        //    return array;

        //},
        //getSelectedArray: function () {
        //    var array = [];

        //    if ($selector.isSelected()) {
        //        array.push(me);
        //    } else if ($selector.hasSelectedChildren()) {
        //        $nodes.each(function (node) {
        //            var _array = node.getSelectedArray();
        //            array.push(_array);
        //        });
        //    }

        //    return array;

        //}

    }
    


    

    //this.path = function (thisInclude) {
    //    var node;
    //    var path = '';

    //    if (thisInclude) {
    //        node = this;
    //    } else {
    //        node = this.parent
    //    }

    //    if (node.isRoot()) {
    //        return '';
    //    }

    //    while (!node.isRoot()) {
    //        path = node.name + (path ? '  >  ' + path : '');
    //        node = node.parent;
    //    }
    //    return path;
    //}


    //Initializing functions.
    (function ini() {
        $nodes.load();
    })();


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

TreeNode.prototype.getSearchObject = function () {
    return {
        object: this,
        name: this.name,
        prepend: this.path() + (this.parent.isRoot() ? '' : '  >  '),
        displayed: this.name
    }
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
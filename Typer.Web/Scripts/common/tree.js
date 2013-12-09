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
    }; //Private properties.
    var $visible = (properties.hidden === true ? false : true);
    var $isEmbedded = (properties.container !== undefined);
    var $activeNode = null;


    var $events = (function () {
        var listener = {};

        $(listener).bind({
            select: function (e) {
                if (e.active === false) return;
                if (me.mode === MODE.SINGLE) {
                    $(listener).trigger({
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
            },
            transfer: function (e) {
                $events.trigger({
                    'type': 'rearrange',
                    'recalculate': true
                });
            }
            

            

            //rename: [node], [name]
            //tranfer: [node], [to]
        });


        return {
            trigger: function (e) {
                $(listener).trigger(e);
            },
            bind: function (a) {
                $(listener).bind(a);
            }
        };
    })();
    this.trigger = function (e) {
        $events.trigger(e);
    };
    this.bind = function (e) {
        $events.bind(e);
    };
    var $ui = (function () {
        var background;

        if (properties.blockOtherElements) {
            background = jQuery('<div/>', {
                'class': 'tree-background'
            }).
            css({
                'z-index': my.ui.addTopLayer()
            }).
            appendTo($(document.body));
        }

        if ($isEmbedded) {
            background = jQuery('<div/>').
            css({
                'width': '100%',
                'height': '100%',
                'position': 'relative',
                'display': 'block'
            }).
            appendTo($(properties.container));
        }

        background = (background || $(document.body));

        var frame = jQuery('<div/>', {
            'class': 'tree-container-frame'
        }).appendTo($(background));


        
        //Change styling if tree is embedded.
        if ($isEmbedded) {
            $(frame).css({
                'position': 'relative',
                'float': 'left',
                'width': '100%',
                'min-height': '100%',
                'height': 'auto',
                'left': 0,
                'top': 0,
                'padding': 0
            });
        }

        var container = jQuery('<div/>', {
            'class': 'tree-container'
        }).appendTo($(frame));

        //Place container inside the screen.
        if (properties.x !== undefined) {
            $(container).css('left', properties.x);
        }
        if (properties.y !== undefined) {
            $(container).css('top', properties.y);
        }


        if (!$isEmbedded) {
            var quit = jQuery('<div/>', {
                'class': 'tree-container-exit'
            }).bind({
                'click': function(e) {
                    if (e.active === false) return;
                    $events.trigger({
                        'type': 'cancel'
                    });
                }
            });
            quit.appendTo($(container));
        }

        return {
            destroy: function () {
                if (background !== document.body) {
                    $(background).remove();
                } else {
                    $(frame).remove();
                }
            },
            hide: function(){
                $visible = false;
                hide(background);
                hide(container);
            },
            show: function(){
                $visible = true;
                show(background);
                show(container);
                $(background).css({
                    'z-index': my.ui.addTopLayer()
                });
            },
            append: function (element) {
                $(element).appendTo(container);
            },
            container: function(){
                return container;
            }
        };
    })();
    this.hide = function () {
        $ui.hide();
    };
    this.show = function () {
        $ui.show();
    };
    this.destroy = function () {
        $ui.destroy();
    };
    this.reset = function (e) {
        if (e.unselect) {
            $root.trigger({ 'type': 'unselect' });
        }
        if (e.collapse) {
            $root.trigger({ 'type': 'collapse' });
        }
    };
    

    var $root = new TreeNode(me, null, properties.root);

    var $searchPanel = (function () {
        var active = false;

        var ui = (function () {
            var container = jQuery('<div/>', {
                'class': 'tree-search-panel'
            }).css({
                'display': 'none'
            });

            $ui.append(container);

            return {
                hide: function () {
                    display(container, false);
                },
                show: function () {
                    display(container, true);
                    $(container).css({
                        'z-index': my.ui.addTopLayer()
                    });
                },
                container: function () {
                    return container;
                }
            };
        })();

        var dropdown;

        function activate() {
            dropdown = dropdown || new DropDown({
                parent: ui.container(),
                data: $root.getNodesForSearching(),
                background: false,
                displayed: 'displayed'
            });

            dropdown.bind({
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

            ui.show();
        }

        var events = (function () {
            $events.bind({
                'startSearching': function (e) {
                    if (e.active === false) return;
                    active = true;
                },
                'endSearching searchSelection': function (e) {
                    if (e.active === false) return;
                    active = false;
                    ui.hide();
                }
            });

        })();

        (function ini(){
            $ui.append(ui.container());
        })();

        return {
            isActive: function () {
                return active;
            }
        };
    })();

    var $children = (function(){

        var ui = (function () {

            var container = jQuery('<div/>');

            $ui.append(container);

            return {
                container: function () {
                    return container;
                }
            };
        })();

        (function ini() {
            $ui.append(ui.container());
        })();

        return {
            container: function () {
                return ui.container();
            }
        };
    })();

    var $selection = (function () {
        var active = properties.showSelection;

        var events = (function () {
            $events.bind({
                'select unselect': function (e) {
                    if (e.active === false) return;
                    refresh();
                }
            });

        })();

        var ui = (function () {

            var container = jQuery('<div/>', {
                'class': 'tree-selection-container'
            }).css({
                'display': active ? 'block' : 'none'
            });

            var header = jQuery('<div/>', {
                'class': 'tree-selection-header',
                html: 'Selected'
            }).appendTo($(container));

            var nodes = jQuery('<div/>', {
                id: 'tree-selection-nodes',
                'class': 'tree-selection-nodes'
            }).appendTo($(container));

            $ui.append(container);


            function _refresh() {
                nodes.empty();

                var selected = $root.util.getSelectedNodes();
                for (var i = 0; i < selected.length; i++) {
                    var node = selected[i];
                    var line = nodeLine(node);
                    line.appendTo(nodes);
                }
            }


            function nodeLine(node) {
                var _node = node;
                var _ui = (function () {
                    var _container = jQuery('<div/>', {
                        'class': 'tree-selection-line'
                    });

                    var remover = jQuery('<div/>', {
                        'class': 'tree-selection-line-remover'
                    }).
                    bind({
                        'click': function () {
                            _node.select(false);
                        }
                    }).appendTo(_container);

                    var caption = jQuery('<div/>', {
                        'class': 'tree-selection-line-caption',
                        'html': _node.name
                    }).appendTo(_container);

                    return {
                        appendTo: function ($container) {
                            $(_container).appendTo($container);
                        }
                    };
                })();

                return {
                    appendTo: function ($container) {
                        _ui.appendTo($container);
                    }
                };
            }


            return {
                hide: function () {
                    display(container, false);
                },
                show: function () {
                    display(container, true);
                    $(container).css({
                        'z-index': my.ui.addTopLayer()
                    });
                },
                container: function () {
                    return container;
                },
                refresh: function () {
                    _refresh();
                }
            };
        })();



        function refresh() {
            ui.refresh();
        }

        (function ini(){
            $ui.append(ui.container());
        })();

    })();
    
    var $buttons = (function () {

        var ui = (function () {
            var panel = jQuery('<div/>', {
                'class': 'tree-buttons-panel'
            });
            var container = jQuery('<div/>', {
                id: 'tree-buttons-container',
                'class': 'tree-buttons-container'
            });
            var ok = jQuery('<input/>', {
                'class': 'tree-button',
                'type': 'submit',
                'value': 'OK'
            }).bind({
                'click': function () {
                    var items = $root.util.getSelectedNodes();
                    if (items) {
                        $events.trigger({
                            'type': 'confirm',
                            'items': items
                        });
                    } else {
                        $events.trigger({
                            'type': 'cancel'
                        });
                    }


                }
            }).appendTo($(container));

            var cancel = jQuery('<input/>', {
                'class': 'tree-button',
                'type': 'submit',
                'value': 'Cancel'
            }).
            bind({
                'click': function () {
                    $events.trigger({
                        'type': 'cancel'
                    });
                }
            }).appendTo($(container));

            return {
                panel: function () {
                    return panel;
                }
            };
        })();

        (function ini(){
            $ui.append(ui.panel());
        })();

    })();

    var $dragdrop = (function () {
        var drag = null;
        var drop = null;

        var events = (function () {
            $(document).bind({
                'mousemove': function (e) {
                    e.preventDefault();
                    if (drag) {
                        var $drop = findDropArea(e.pageX, e.pageY);
                        changeDroparea($drop);
                    }
                },
                'mouseup': function (e) {
                    e.preventDefault();
                    if (drag) {
                        drag.trigger({
                            'type': 'release'
                        });
                    }
                }
            });

            $events.bind({    
                dropin: function (e) {
                    if (e.active === false) return;
                    if (e.node !== drag) {      //Prevent from transfering node to itself.
                        drop = e.node;
                    }
                },
                dropout: function (e) {
                    if (e.active === false) return;
                    if (drop === e.node) {
                        drop = null;
                    }
                },
                dragin: function (e) {
                    if (e.active === false) return;
                    drag = e.node;
                },
                dragout: function (e) {
                    if (e.active === false) return;
                    if (drop && drag) {
                        drag.trigger({
                            type: 'transfer',
                            to: drop
                        });
                    }
                    drag = null;
                    drop = null;
                }
            });

        })();


        function findDropArea(x, y) {
            //First check the current droparea.
            if (drop) {
                if (drop.isHovered(x, y)) {
                    return drop;
                }
            }
            return $root.findHovered(x, y);
        }
        

        function changeDroparea($drop) {
            if ($drop !== drop) {
                //Deactivate the previous droparea...
                if (drop){
                    drop.trigger({
                        'type': 'deactivateDroparea'
                    });
                }

            //and activate the new one.
                drop = $drop;
                if (drop) {
                    drop.trigger({
                        'type': 'activateDroparea'
                    });
                }

            }
        }


        return {
            isActive: function() {
                return (drop ? true : false);
            },
            drag: function() {
                return drag;
            }
        };

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
        $events.trigger({
            'type': 'afterRendering',
            'recalculate' : true
        });

        if (!$visible) $ui.hide();

    })();

    

}


//TreeNode
//Represents a single line in a tree view.
//Events generated:
// expand
// collapse
// transfer
// select
// unselect
// childStatusChanged
// hasSelectedChildren
// activateDroparea
// deactivateDroparea
// move
// addNode
// removeNode
// sort
// statusChanged
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


    //Events handler and listener.
    var $events = (function () {
        var listener = {};

        $(listener).bind({
            'addNode': function (e) {
                if (e.active === false) return;
                if (me.object.events) {
                    var events = (typeof (me.object.events) === 'function' ? object.events() : object.events);
                    events.trigger({
                        'type': 'add',
                        'value': e.node.object
                    });
                }
                
                if ($expander.isExpanded()) {
                    me.tree.trigger({                        
                       'type': 'rearrange' 
                    });
                }

            },
            'removeNode': function (e) {
                if (e.active === false) return;
                if (me.object.events) {
                    var events = (typeof (me.object.events) === 'function' ? object.events() : object.events);
                    events.trigger({
                        'type': 'remove',
                        'value': e.node.object
                    });
                }
                
                if ($expander.isExpanded()) {
                    me.tree.trigger({
                        'type': 'rearrange'
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
            'rename': function (e) {
                me.name = e.name;
                me.tree.trigger({
                    'type': 'rename',
                    'node': me,
                    'oldName': e.oldName,
                    'name': e.name
                });
            },
            'transfer': function (e) {
                if (e.active === false) return;

                var previous = me.parent;

                if (previous) {
                    previous.trigger({
                        'type': 'removeNode',
                        'node': me
                    });
                }
                if (e.to) {
                    e.to.trigger({                        
                        'type': 'addNode',
                        'node': me,
                        'sort': true
                    });
                    e.to.trigger({                        
                        'type': 'deactivateDroparea'
                    });
                }
                
                //Inform parental tree object.
                me.tree.trigger({                    
                    'type': 'transfer',
                    'node': me,
                    'from': previous,
                    'to': e.to
                });

            }
        });

        return {
            trigger: function (e) {
                $(listener).trigger(e);
            },
            bind: function (e) {
                $(listener).bind(e);
            }
        };
    })();
    this.trigger = function (e) {
        $events.trigger(e);
    };
    this.bind = function (e) {
        $events.bind(e);
    };
    

    //User interface module.
    var $ui = (function () {
        //Define if this element is visible on the screen.
        //If parent is not defined, this node is root node and
        //it is always visible.
        var visible = (me.parent ? me.parent.isExpanded() : true);

        var position = {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
        };

        var container = jQuery('<div/>', {
            'class': 'node-container'
        });

        var line = jQuery('<div/>', {
            'class': 'tree-line'
        }).appendTo(container);

        var children = jQuery('<div/>', {
            'class': 'children-container'
        }).appendTo(container);

        function calculatePosition() {
            var pos = $(container).offset();
            var width = $(container).width();
            var height = $(container).height();
            position = {
                left: pos.left,
                top: pos.top,
                width: width,
                height: height,
                right: pos.left + width,
                bottom: pos.top + height
            };
        };

        //Events listeners.
        var listener = (function () {
            $events.bind({
                expand: function (e) {
                    if (e.active === false) return;
                    display(children, true);
                    me.tree.trigger({
                        'type': 'expand',
                        'node': me,
                        'recalculate': e.recalculate
                    });

                },
                collapse: function (e) {
                    if (e.active === false) return;
                    display(children, false);
                    me.tree.trigger({
                        'type': 'expand',
                        'node': me,
                        'recalculate': e.recalculate
                    });
                },
                addNode: function (e) {
                    if (e.active === false) return;
                    addChild(e.node.container());
                    //my.notify.display('Adding node ' + e.node.name + ' to ' + me.name);
                },
                sort: function (e) {
                    var array = e.array;
                    if (array.length > 1) {
                        for (var i = array.length - 1; i > 0; i--) {
                            $(array[i].container()).before($(array[i - 1].container()));
                        }
                    }
                },
                removeNode: function(e) {
                    if (e.active === false) return;
                    //my.notify.display('Removing node ' + e.node.name + ' from ' + me.name);
                }
            });

            me.tree.bind({
                'expand collapse afterRendering rearrange': function (e) {
                    if (e.active === false) return;
                    if (e.recalculate) {
                        calculatePosition();
                    }
                }
            });

            if (me.parent) {
                me.parent.bind({
                    'expand': function () {
                        visible = true;
                    },
                    'collapse': function () {
                        visible = false;
                    }
                });
            }

        })();


        function addChild($object){
            $($object).appendTo(children);
        }

        function isHovered(x, y) {
            if (visible) {
                if (x >= position.left && x <= position.right && y >= position.top && y <= position.bottom) {
                    return true;
                }
            }
            return false;
        }


        return {
            container: function() {
                return container;
            },
            line: function() {
                return line;
            },
            children: function() {
                return children;
            },
            isHovered: function (x, y) {
                return isHovered(x, y);
            },
            append: function ($container) {
                $(container).appendTo($container);
            }
        };
    }());
    this.container = function () {
        return $ui.container();
    };
    this.render = function ($container) {
        $ui.append($container);
        $nodes.each(function (node) {
            node.render($ui.children());
        });
        $events.trigger({
            'type': 'render'
        });
    };
    

    //Children nodes module.
    var $nodes = (function () {
        var items = {};
        var sorted = [];

        var events = (function () {
            $events.bind({
                'addNode': function (e) {
                    if (e.active === false) return;
                    addNode(e.node, e.sort);
                },
                'removeNode': function (e) {
                    if (e.active === false) return;
                    if (e.node) {
                        removeNode(e.node);
                    } else if (e.key) {
                        removeNodeByKey(e.key);
                    }
                    refreshArray();
                },
                'render': function(e) {
                    if (e.active === false) return;
                    sort();
                }
            });

        })();

        function sort() {
            sorted.sort(function (a, b) {
                return a.name < b.name ? -1 : 1;
            });
            $events.trigger({
                'type': 'sort',
                'array': sorted
            });
        }

        function addNode($node, $sort){
            items[$node.key] = $node;
            if ($sort !== false) refreshArray();
        }

        function removeNode(node){
            for (var key in items) {
                if (items.hasOwnProperty(key)) {
                    var $node = items[key];
                    if ($node === node) {
                        delete items[key];
                    }
                }
            }
            refreshArray();
        }

        function removeNodeByKey(key){
            delete items[key];
        }

        function refreshArray(){
            sorted = my.array.objectToArray(items);
            sort();
        }

        function load() {
            var $items = (typeof (me.object.items) === "function" ? me.object.items() : me.object.items);
            for (var i = 0; i < $items.length; i++) {
                var node = new TreeNode(me.tree, me, $items[i]);
                items[node.key] = node;
                sorted.push(node);
            }

            $events.trigger({
                'type': 'load'
            });

            //sort();

        }

        return {
            size: function () {
                return sorted.length;
            },
            each: function (fn) {
                for (var key in items) {
                    if (items.hasOwnProperty(key)){
                        var item = items[key];
                        fn(item);
                    }
                }
            },
            countSelected: function(includePartiallySelected){
                var counter = 0;
                for (var key in items) {
                    if (items.hasOwnProperty(key)){
                        var item = items[key];
                        if (item.isSelected()){
                            counter += 1;
                        } else if (includePartiallySelected && item.hasSelectedChildren()) {
                            counter += 0.5;
                        }
                    }
                }
                return counter;
            },
            load: function () {
                load();
            }
        };
    })();
    this.isDescendant = function (node) {
        if (node.parent) {
            if (node.parent === me) {
                return true;
            } else {
                return (me.isDescendant(node.parent));
            }
        } else {
            return false;
        }
    };
    

    //Expander module.
    var $expander = (function () {
        var expandable = false;
        var expanded = false;
        var button = jQuery('<div/>', {
            'class': 'icon '
        }).bind({
            'click': function (e) {
                if (e.active === false) return;
                e.preventDefault();
                e.stopPropagation();
                if (expandable) {
                    revertStatus();
                }
            }
        }).appendTo($ui.line());

        var events = (function () {
            $events.bind({
                'addNode': function (e) {
                    if (e.active === false) return;
                    expandable = true;
                    if (me.tree.options.expandWhenAddingNewNode) {
                        expanded = true;
                    }
                    render();
                },
                'removeNode load': function (e) {
                    if (e.active === false) return;
                    expandable = ($nodes.size() > 0);
                    render();
                },
                'expand': function (e) {
                    if (e.active === false) return;
                    expanded = true;
                    render();

                    if (me.parent) {
                        me.parent.trigger({
                            'type': 'expand'
                        });
                    }

                },
                'collapse': function (e) {
                    if (e.active === false) return;
                    expanded = false;
                    render();
                }
            });

        })();
        
        function revertStatus() {
            if (expanded) {
                collapse();
            } else {
                expand();
            }
        }

        function expand() {
            if (expandable && !expanded) {
                $events.trigger({
                    'type': 'expand',
                    'recalculate': true
                });
            }
        }

        function collapse() {
            if (expandable && expanded) {
                $events.trigger({
                    'type': 'collapse',
                    'recalculate': true
                });
            }
        }

        function render() {
            if (expandable) {
                $(button).html(expanded ? '-' : '+');
            } else {
                $(button).html('.');
            }
        }


        return {
            isExpandable: function(){
                return expandable;
            },
            isExpanded: function(){
                return (expandable ? expanded : false);
            }
        };
    })();
    this.isExpanded = function () {
        return $expander.isExpanded();
    };
    


    //Selecting module.
    var $selector = (function (value) {
        var selected = value || false;
        var hasSelectedChildren = false;

        var ui = (function () {
            var box = jQuery('<input/>', {
                type: 'checkbox',
                'class': 'select-checkbox',
                'value': selected
            }).css({
                'display': (me.tree.mode === MODE.MULTI ? 'block' : 'none')
            }).bind({
                'click': function (e) {
                    if (e.active === false) return;
                    _select();
                }
            }).appendTo($ui.line());

            return {
                check: function ($value) {
                    $(box).prop({
                        'checked': $value
                    });
                }
            };
        })();

        var events = (function () {
            $events.bind({
                'select hasSelectedChildren': function (e) {
                    hasSelectedChildren = true;
                },
                'unselect': function (e) {
                    hasSelectedChildren = false;
                },
                'select': function (e) {
                    selected = true;
                    ui.check(true);
                    if (me.tree.mode === MODE.SINGLE) {
                        me.tree.trigger({
                            'type': 'select',
                            'node': me
                        });
                    }
                },
                'unselect hasSelectedChildren': function (e) {
                    selected = false;
                    ui.check(false);
                },
                'select unselect hasSelectedChildren': function (e) {
                    if (e.active === false) return;
                    
                    if (e.applyForChildren){
                        applyForChildren(e.type);
                    }
                    if (e.applyForParent){
                        applyForParent(e.type);
                    }
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

        function applyForChildren(type) {
            $nodes.each(function (node) {
                node.trigger({
                    'type' : type,
                    'applyForChildren': true,
                    'applyForParent': false
                });
            });
        }

        function applyForParent(){
            if (me.parent){
                me.parent.trigger({
                    'type' : 'childStatusChanged'
                });
            }
        }

        function _select(value) {
            selected = (value === undefined ? !selected : value);
            var _type = selected ? 'select' : 'unselect';
            $events.trigger({
                'type': _type,
                'applyForParent': true,
                'applyForChildren': true
            });
            me.tree.trigger({
                'type': _type,
                'node': me
            });
        }

        return{
            isSelected: function () {
                var name = me.name;
                return selected;
            },
            hasSelectedChildren: function () {
                var name = me.name;
                return hasSelectedChildren;
            },
            select: function (value) {
                _select(value);
            }
        };
    })(object.selected);
    this.isSelected = function () {
        return $selector.isSelected();
    };
    this.hasSelectedChildren = function () {
        return $selector.hasSelectedChildren();
    };
    this.select = function (value) {
        $selector.select(value);
    };



    var $caption = (function () {
        var active = false;

        var ui = (function () {
            var caption = jQuery('<div/>', {
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
            }).appendTo($ui.line());

            return {
                textbox: function () {
                    return caption;
                },
                position: function(){
                    var position = $(caption).offset();
                    var width = $(caption).width();
                    var height = $(caption).height();
                    return {
                        left: position.left,
                        top: position.top,
                        width: width,
                        height: height,
                        right: position.left + width,
                        bottom: position.top + height
                    };
                },
                append: function (control) {
                    $(control).appendTo(caption);
                },
                rename: function (name) {
                    $(caption).html(name);
                }
            };
        })();

        var events = (function () {
            $events.bind({
                'click': function (e) {
                    if (e.active === false) return;
                    if (active) {
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
                        active = true;
                        setTimeout(function () {
                            active = false;
                        }, me.tree.options.doubleClickDelay || 250);
                    }
                },
                'select hasSelectedChildren': function (e) {
                    if (e.active === false) return;
                    $(ui.textbox()).css({
                        'font-weight' : 'bold'
                    });
                },
                'unselect': function (e) {
                    if (e.active === false) return;
                    $(ui.textbox()).css({
                        'font-weight': 'normal'
                    });
                },
                'activateDroparea': function (e) {
                    if (e.active === false) return;
                    $(ui.textbox()).addClass('drop-area');
                },
                'deactivateDroparea': function (e) {
                    if (e.active === false) return;
                    $(ui.textbox()).removeClass('drop-area');
                },
                'rename': function(e){
                    if (e.active === false) return;
                    ui.rename(e.name);
                }
            });
        })();

        return {
            position: function(){
                return ui.position();
            },
            append: function (control) {
                ui.append(control);
            }
        };
    })();



    var $renamer = (function () {
        var active = false;

        var listener = (function () {
            $events.bind({
                'startRenamer': function (e) {
                    if (e.active === false) return;
                    activate();
                },
                'escapeRenamer': function (e) {
                    if (e.active === false) return;
                    escape();
                }
            });

            $(document).bind({
                'mousedown': function (e) {
                    if (active && e && ui.isOutside(e.pageX, e.pageY)) {
                        e.preventDefault();
                        e.stopPropagation();
                        $events.trigger({
                            'type': 'escapeRenamer'
                        });
                    }
                }
            });

        })();

        var ui = (function () {
            var textbox;
            
            function createTextbox(){
                textbox = textbox || jQuery('<input/>', {
                    'class': 'edit-name'
                }).css({
                    'visibility': 'hidden'
                }).bind({
                    'keydown': function (e) {
                        switch (e.which) {
                            case 13: //Enter
                                e.preventDefault();
                                e.stopPropagation();
                                confirm($(this).val());
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
                $caption.append(textbox);
            }

            function isOutside(x, y){
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

            return {
                destroy: function () {
                    $(textbox).remove();
                    textbox = null;
                },
                render: function () {
                    if (!textbox) createTextbox();
                    show(textbox);
                    $(textbox).val(me.name).focus().select();
                    me.tree.trigger({
                        'type': 'editName'
                    });
                },
                isOutside: function(x, y){
                    return isOutside(x, y);
                },
            };
        })();

        function activate() {
            active = true;
            ui.render();
        }

        function confirm(value) {
            var validation = validateName(value);
            if (validation === true) {
                applyNewName(value);
                //applyNewName(value);
            }
        }

        function validateName(name) {
            //To be implemented.
            return true;
        }

        function escape() {
            active = false;
            ui.destroy();

            //Kasowanie jeżeli jest to nowy node.
            //if (me.key.length === 0) {
            //    me.parent.activate();
            //    me.cancel();
            //}
        }


        function applyNewName(name) {

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
                return active;
            }
        };
    })();
    this.isBeingRenamed = function () {
        return $renamer.isActive();
    };



    var $droparea = (function () {
        var visible = false;
        var position = {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
        };

        var listener = (function () {
            me.tree.bind({
                'expand collapse afterRendering rearrange': function (e) {
                    if (e.active === false) return;
                    if (e.recalculate) {
                        calculatePosition();
                    }
                }
            });
        })();

        function calculatePosition() {
            position = $caption.position();
            visible = (position.width && position.height);
        };

        function isHovered(x, y) {
            if (visible) {
                if (x >= position.left && x <= position.right && y >= position.top && y <= position.bottom) {
                    return true;
                }
            }
            return false;
        }


        function findHovered(x, y) {
            var name = me.name;
            if (isHovered(x, y)) {
                return me;
            } else if ($ui.isHovered(x, y)) {
                var hovered = null;
                $nodes.each(function (node) {
                    if (hovered === null) {
                        hovered = node.findHovered(x, y);
                    }
                });
                return hovered;
            }
            return null;
        }

        return {
            isHovered: function (x, y) {
                return isHovered(x, y);
            },
            findHovered: function (x, y) {
                return findHovered(x, y);
            }
        };
    })();
    this.isHovered = function (x, y) {
        return $droparea.isHovered(x, y);
    };
    this.findHovered = function (x, y) {
        return $droparea.findHovered(x, y);
    };
    
    var $mover = (function () {
        var active = false;
        var inProgress = false;
        var position = {
            caption: {
                top: 0,
                left: 0
            },
            click: {
                top: 0,
                left: 0
            }
        };
        var events = (function () {
            $(document).bind({
                'mousemove': function (e) {
                    e.preventDefault();
                    if (active) {
                        $events.trigger({
                            'type': 'move',
                            'x': e.pageX,
                            'y': e.pageY,
                        });
                    }
                }
            });

            $events.bind({
                'click': function (e) {
                    active = true;
                    position.caption = $caption.position();
                    position.click = {
                        'left': e.x,
                        'top': e.y
                    };
                },
                'startRenamer': function (e) {
                    active = false;
                },
                'move': function (e) {
                    if (e.active === false) return;
                    if (!active) return;

                    if (!inProgress) {
                        inProgress = true;
                        activate();
                        me.tree.trigger({
                            'type': 'dragin',
                            node: me
                        });
                    }
                    ui.move(e.x, e.y);
                },
                'release': function (e) {
                    if (e.active === false) return;
                    if (active) {
                        ui.hide();
                        me.tree.trigger({
                            type: 'dragout',
                            node: me
                        });
                    }
                    active = false;
                    inProgress = false;
                }
            });

        })();

        var ui = (function () {
            var control;

            function createControl() {
                control = control || jQuery('<div/>', {
                    'class': 'move',
                    html: me.name
                }).css({
                    'visibility': 'hidden'
                }).appendTo($ui.container());
            }

            function move(x, y) {
                var $x = x - position.click.left + position.caption.left;
                var $y = y - position.click.top + position.caption.top;
                $(control).css({ left: $x, top: $y });
            }

            return {
                hide: function () {
                    hide(control);
                },
                render: function () {
                    if (!control) createControl();
                    show(control);
                },
                move: function (x, y) {
                    if (!control) return;
                    move(x, y);
                }
            };
        })();
        
        function activate(x, y) {
            active = true;
            ui.render();
        }

        return {
            isActive: function () {
                return active;
            }
        };
    })();




    //Util functions.
    this.util = (function () {
        return {
            getSelectedNodes: function () {
                var array = [];
                array.length = 0;

                if ($selector.isSelected()) {
                    //array[0] = me;
                    array.push(me);
                } else if ($selector.hasSelectedChildren()) {
                    $nodes.each(function (node) {
                        var $array = node.util.getSelectedNodes();
                        Array.prototype.push.apply(array, $array);
                    });
                }

                return array;
            },
            getNodesForSearching: function () {
                var array = [];

                if (me.parent) {    //Add itself (except for root).
                    //array.push(me.getSearchObject);
                }

                //Add nodes.
                $nodes.each(function (node) {
                    var $array = node.util.getNodesForSearching();
                    Array.prototype.push.apply(array, $array);
                });

                return array;

            }
        };
    })();
    

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
        if (object.expanded) {
            var name = me.name;
            $events.trigger({
                'type': 'expand',
                'recalculate': me.parent ? false : true
            });
        }
    })();


}








//TreeNode.prototype.transfer = function (destination) {
//    if (this === destination) {
//        this.isActive = false;
//    } else {
//        if (!this.isRoot()) {
//            this.parent.removeNode(this);
//            destination.addNode(this);
//        }
//    }
//};
//TreeNode.prototype.addNode = function (node) {
//    //alert('moving node ' + node.name + ' to ' + this.name);
//    node.moveTo(this);
//    this.nodes[node.getKey()] = node;
//    this.sorter.sort();
//    this.resetStatus();
//    this.dropArea.unselect();
//    this.dropArea.recalculate();
//};
TreeNode.prototype.moveTo = function (newParent) {
    if (this.parent) {
        this.parent.removeNode(this.key);
    }
    this.parent = newParent;
    this.mainContainer.appendTo($(newParent.getContainer()));
};
//TreeNode.prototype.isRoot = function () {
//    var value = (this.parent.isNode ? false : true);
//    return value;
//};
TreeNode.prototype.resetStatus = function () {
    if (Object.keys(this.nodes).length > 0) {
        this.expander.setExpandableStatus(true);
    } else {
        this.expander.setExpandableStatus(false);
    }
};
TreeNode.prototype.getChildNode = function (i) {
    if (i >= 0 && i < this.nodesArray.length) {
        return this.nodesArray[i];
    }
    return null;
};
TreeNode.prototype.getLastChild = function () {
    if (this.nodesArray.length < 1) {
        return null;
    } else {
        return this.nodesArray[this.nodesArray.length - 1];
    }
};
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
};
TreeNode.prototype.inactivate = function () {
    this.isActive = false;
    $(this.caption).removeClass('selected');
    this.tree.trigger({
        'type': 'inactivate',
        'node': this
    });
};
TreeNode.prototype.nextNode = function () {
    if (this.isRoot() === true) {
        return null;
    } else {
        return this.parent.getChildNode(this.index + 1);
    }
};
TreeNode.prototype.previousNode = function () {
    if (this.isRoot() === true) {
        return null;
    } else {
        return this.parent.getChildNode(this.index - 1);
    }
};
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
};
//TreeNode.prototype.removeNode = function (key) {
//    delete this.nodes[key];
//    this.sorter.sort();
//};
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
};
TreeNode.prototype.cancel = function () {
    $(this.mainContainer).remove();
    this.parent.removeNode(this.key);
};
//TreeNode.prototype.changeName = function (name) {
//    this.name = name;
//    $(this.caption).html(name);
//};
//TreeNode.prototype.select = function () {
//    if (this.tree.mode === MODE.SINGLE) {
//        this.tree.trigger({
//            'type': 'confirm',
//            'item': this
//        });
//    } else if (this.tree.mode === MODE.MULTI) {
//        this.selector.click();
//        if (this.tree.selection) {
//            this.tree.selection.refresh();
//        }
//    }
//};
TreeNode.prototype.unselect = function () {
    if (this.tree.mode === MODE.MULTI) {
        this.selector.unselect();
        this.tree.selection.refresh();
    }
};
TreeNode.prototype.getSearchObject = function () {
    return {
        object: this,
        name: this.name,
        prepend: this.path() + (this.parent.isRoot() ? '' : '  >  '),
        displayed: this.name
    };
};

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
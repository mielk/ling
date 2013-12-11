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


function Tree(properties) {
    // ReSharper disable once UnusedLocals
    var me = this;
    //Public properties.
    this.mode = properties.mode ? properties.mode : MODE.SINGLE;
    this.options = {
        expandWhenAddingNewNode: true,
        doubleClickDelay: 500,
    };
    //Private properties.
    this.visible = (properties.hidden === true ? false : true);


    // ReSharper disable once UseOfImplicitGlobalInFunctionScope
    // EventHandler class is defined in global.js.
    this.eventHandler = new EventHandler();
    //Declare events specific for this class.
    this.eventHandler.bind({
        //select
        //activate
        //inactivate
        //delete
        //newNode
        //confirm
        //cancel
        //transfer
        //rename
        //select: function (e) {
        //    if (e.active === false) return;
        //    if (me.mode === MODE.SINGLE) {
        //        $(listener).trigger({
        //            'type': 'confirm',
        //            'item': e.node
        //        });
        //    }
        //},
        //activate: function (e) {
        //    if (e.active === false) return;
        //    if ($activeNode && $activeNode != e.node) {
        //        $activeNode.inactivate();
        //    }
        //    $activeNode = e.node;
        //},
        //inactivate: function (e) {
        //    if (e.active === false) return;
        //    if ($activeNode === e.node) {
        //        $activeNode = null;
        //    }
        //},
        //'delete': function (e) {
        //    if (e.active === false) return;
        //},
        //newNode: function (e) {
        //    if (e.active === false) return;
        //    e.node.activate();
        //},
        //confirm: function (e) {
        //    if (e.active === false) return;
        //    alert('Confirm: ' + (e.item ? e.item.name : e.items.length));
        //    if (!$isEmbedded) {
        //        me.hide();
        //    }
        //},
        //cancel: function (e) {
        //    if (e.active === false) return;
        //    if (!$isEmbedded) {
        //        me.hide();
        //    }
        //},
        //transfer: function (e) {
        //    $events.trigger({
        //        'type': 'rearrange',
        //        'recalculate': true
        //    });
        //}
        //rename: [node], [name]
        //tranfer: [node], [to]
    });

    

    this.view = new TreeView(this, properties.container, properties.x, properties.y);

    this.search = new SearchPanel(this);

    this.children = jQuery('<div/>');
    this.view.append(this.children);

    this.selection = new SelectionPanel(this, properties.showSelection);

    this.buttons = new ButtonsPanel(this);

    this.dragdrop = new DropArea(this);

    this.navigator = new TreeNavigator(this);


    //Data.
    this.root = new TreeNode(me, null, properties.root);
    

    //Initializing function.
    this.root.view.append(this.children);
    if (!this.visible) {
        this.hide();
    }

}

Tree.prototype.hide = function() {
    this.view.hide();
};
Tree.prototype.show = function () {
    this.view.show();
};
Tree.prototype.destroy = function () {
    this.view.destroy();
};
Tree.prototype.reset = function (properties) {
    if (properties.unselect) {
        
    }
    
    if (properties.collapse) {
        
    }

};
Tree.prototype.confirm = function () {
    
};
Tree.prototype.cancel = function() {

};


function TreeView(tree, container, x, y) {
    var me = this;
    this.tree = tree;
    this.embedded = (container ? true : false);
    this.background = (function() {
        if (me.embedded) {
            return jQuery('<div/>').
            css({
                'width': '100%',
                'height': '100%',
                'position': 'relative',
                'display': 'block'
            }).
            appendTo($(container));
        } else {
            return jQuery('<div/>', {
                 'class': 'tree-background'
            }).
            css({ 'z-index': my.ui.addTopLayer() }).
            appendTo($(document.body));
        }
    })(); 

    var $frame = jQuery('<div/>', {
        'class': 'tree-container-frame'
    }).appendTo($(this.background));


    //Change styling if tree is embedded.
    if (this.embedded) {
        $($frame).css({
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

    //Create main container...
    this.$container = jQuery('<div/>', {
        'class': 'tree-container'
    }).appendTo($($frame));

    //and place it inside the screen.
    if (x !== undefined && x !== null) {
        $(this.$container).css('left', x);
    }
    if (y !== undefined && y != null) {
        $(this.$container).css('top', y);
    }



    //Create exit button.
    if (!this.embedded) {
        var $quit = jQuery('<div/>', {
            'class': 'tree-container-exit'
        }).bind({
            'click': function(e) {
                if (e.active === false) return;
                me.tree.cancel();
            }
        });
        
        $quit.appendTo($(this.$container));
        
    }

};
TreeView.prototype.destroy = function() {
    if (this.background) {
        $(this.background).remove();
    }
};
TreeView.prototype.hide = function () {
    this.tree.visible = false;
    hide(this.background);
    hide(this.container);
};
TreeView.prototype.show = function () {
    this.tree.visible = true;
    show(this.background);
    show(this.container);
    $(this.background).css({        
       'z-index': my.ui.addTopLayer() 
    });
};
TreeView.prototype.append = function (element) {
    $(element).appendTo(this.$container);
};


function SearchPanel(tree) {
    // ReSharper disable once UnusedLocals
    var me = this;
    this.tree = tree;
    this.active = false;
    
    this.container = jQuery('<div/>', {
        'class': 'tree-search-panel'
    }).css({
        'display': 'none'
    });
    this.tree.view.append(this.container);

    this.dropdown = null;

}
SearchPanel.prototype.hide = function() {
    this.active = false;
    display(this.container, false);
};
SearchPanel.prototype.show = function() {
    display(this.container, true);
    $(this.container).css({
        'z-index': my.ui.addTopLayer()
    });    
};
SearchPanel.prototype.activate = function () {
    this.active = true;

    this.dropdown = this.dropdown || new DropDown({
        parent: this.container,
        data: this.tree.root.getNodesForSearching(),
        background: false,
        displayed: 'displayed'
    });
    
    this.dropdown.bind({
        'deactivate': function () {
            this.deactivate();
        },
        'selected': function (e) {
            this.selected(e.object.object);
        }
    });

    this.show();

};
SearchPanel.prototype.deactivate = function() {
    this.active = false;
    this.hide();
};
SearchPanel.prototype.select = function($node) {
    //Object selected.
    this.deactivate();
};

function SelectionPanel(tree, showSelection) {
    var me = this;
    this.tree = tree;
    this.active = showSelection;
    
    //UI components.
    var container = jQuery('<div/>', {
        'class': 'tree-selection-container'
    }).css({
        'display': this.active ? 'block' : 'none'
    });
    
    // ReSharper disable once UnusedLocals
    var header = jQuery('<div/>', {
        'class': 'tree-selection-header',
        html: 'Selected'
    }).appendTo($(container));

    this.nodes = jQuery('<div/>', {
        id: 'tree-selection-nodes',
        'class': 'tree-selection-nodes'
    }).appendTo($(container));

    this.tree.view.append($(container));

}
SelectionPanel.prototype.refresh = function () {
    //Clear previous selection.
    this.nodes.empty();

    var selected = this.tree.root.getSelectedNodes();
    for (var i = 0; i < selected.length; i++) {
        var node = selected[i];
        var line = new NodeLine(node);
        line.container.appendTo(this.nodes);
    }
};

function NodeLine(node) {
    var me = this;
    this.node = node;
    
    //UI components.
    this.container = jQuery('<div/>', {
        'class': 'tree-selection-line'
    });
    
    // ReSharper disable once UnusedLocals
    var remover = jQuery('<div/>', {
        'class': 'tree-selection-line-remover'
    }).
    bind({
        'click': function () {
            me.node.select(false);
        }
    }).appendTo(container);
    

    // ReSharper disable once UnusedLocals
    var caption = jQuery('<div/>', {
        'class': 'tree-selection-line-caption',
        'html': me.node.name
    }).appendTo(container);
}

function ButtonsPanel(tree) {
    var me = this;
    this.tree = tree;
    
    //UI components.
    var panel = jQuery('<div/>', {
        'class': 'tree-buttons-panel'
    }).appendTo(me.tree.view.container);
    
    var container = jQuery('<div/>', {
        id: 'tree-buttons-container',
        'class': 'tree-buttons-container'
    }).appendTo(panel);
    
    // ReSharper disable once UnusedLocals
    var ok = jQuery('<input/>', {
        'class': 'tree-button',
        'type': 'submit',
        'value': 'OK'
    }).bind({
        'click': function () {
            me.tree.confirm();
        }
    }).appendTo(container);

    // ReSharper disable once UnusedLocals
    var cancel = jQuery('<input/>', {
        'class': 'tree-button',
        'type': 'submit',
        'value': 'Cancel'
    }).bind({
        'click': function () {
            me.tree.cancel();
        }
    }).appendTo(container);

}

function DropArea(tree) {
    // ReSharper disable once UnusedLocals
    var me = this;
    this.tree = tree;
    //Node objects.
    this.drag = null;
    this.drop = null;
    
    //Listening for mouse events.
    $(document).bind({        
        'mousemove': function (e) {
            e.preventDefault();
            if (me.drag) {
                var $drop = findDropArea(e.pageX, e.pageY);
                changeDroparea($drop);
            }
        },
        'mouseup': function (e) {
            e.preventDefault();
            if (me.drag) {
                release();
            }
        }
    });

    function findDropArea(x, y) {
        //First check the current droparea.
        if (me.drop) {
            if (me.drop.isHovered(x, y)) {
                return me.drop;
            }
        }
        return me.tree.root.findHovered(x, y);
    }
    
    function changeDroparea($drop) {
        if ($drop !== me.drop) {
            //Deactivate the previous droparea...
            if (me.drop) {
                me.drop.deactivateDroparea();
            }

            //and activate the new one (even if it is null).
            me.drop = $drop;
            if (me.drop) {
                me.drop.activateDroparea();
            }

        }
    }

    function release() {
        if (me.drop && me.drag) {

            if (me.drag === me.drop) {
                my.notify.display(MessageBundle.get(dict.NodeCannotBeMovedToItself), false);
            } else if (me.drag.isDescendant(me.drop)) {
                my.notify.display(MessageBundle.get(dict.NodeCannotBeMovedToDescendant), false);
            } else {
                me.drag.transfer(me.drop);
            }
        }

        if (me.drop) {
            me.drop.deactivateDroparea();
        }
        me.drop = null;
        me.drag = null;
        
    }

}
DropArea.prototype.setDragNode = function(node) {
    this.drag = node;
};
DropArea.prototype.isActive = function() {
    return (drop ? true : false);
};

function TreeNavigator(tree) {
    var me = this;
    this.tree = tree;


    $(document).bind({        
        'keydown': function(e) {
            if (!me.tree.visible) return;
            
            if (e.ctrlKey) {
                //Search panel (Ctrl + F/f)
                switch(e.which) {
                    case 70:
                    case 102:
                        //Search panel.
                        e.preventDefault();
                        e.stopPropagation();
                        me.tree.search.activate();
                        break;
                }
            }
            


        }
    });

    //$(document).bind({
    //    'keydown': function (e) {

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
function TreeNode(tree, parent, object) {
    var me = this;
    //Parental tree.
    this.tree = tree;
    //Node properties.
    this.key = (typeof (object.key) === 'function' ? object.key() : object.key) || '';
    this.name = (typeof (object.name) === 'function' ? object.name() : object.name) || '';
    this.object = object;
    this.parent = parent;
    //State variables.
    this.new = false;
    this.active = false;
    this.clicked = false;

    this.view = new TreeNodeView(this);

    this.nodes = new NodesManager(this);

    this.expander = new NodeExpander(this);

    this.selector = new NodeSelector(this);

    this.caption = new NodeCaption(this);

    this.load(object.items);

}

TreeNode.prototype.load = function(items) {
    var $items = (typeof(items) === "function" ? items() : items);
    for (var i = 0; i < $items.length; i++) {
        var node = new TreeNode(this.tree, this, $items[i]);
        this.addNode(node, false);
    }
    this.nodes.sort();
    this.expander.adjustButton();
};
TreeNode.prototype.addNode = function (node, sort) {
    this.view.addChild(node.view.container);
    this.nodes.addNode(node, sort);
    if (this.tree.options.expandWhenAddingNewNode) {
        this.expand();
    }
    this.expander.expandable = true;
    this.expander.render();

};
TreeNode.prototype.removeNode = function(node) {
    this.nodes.removeNode(node);
    this.expander.adjustButton();
};
TreeNode.prototype.isExpandable = function() {
    return (this.expander.expandable ? true : false);
};
TreeNode.prototype.isExpanded = function() {
    return this.expander.expanded;
};
TreeNode.prototype.expand = function() {
    this.view.expand();
    this.expander.setState(true);
    this.expander.render();
    this.nodes.each(function(node) {
        node.view.visible = true;
    });
};
TreeNode.prototype.collapse = function() {
    this.view.collapse();
    this.expander.setState(false);
    this.expander.render();
    this.nodes.each(function (node) {
        node.view.visible = false;
    });
};
TreeNode.prototype.isSelected = function() {
    return this.selector.selected;
};
TreeNode.prototype.hasSelectedChildren = function () {
    return this.selector.hasSelectedChildren;
};
TreeNode.prototype.select = function (value, applyForChildren, applyForParent) {
    this.selector.select(value, applyForChildren, applyForParent);
    if (value && this.tree.mode === MODE.SINGLE) {
        alert('Trigger tree select');
    }
    this.caption.refresh();
};
TreeNode.prototype.partiallySelected = function() {
    this.selector.hasSelectedChildren = true;
    this.selector.check(false);
    if (this.parent) {
        this.parent.partiallySelected();
    }
    this.caption.refresh();
};
TreeNode.prototype.click = function (x, y) {
    var me = this;
    if (this.clicked) {
        if (this.node.tree.mode === MODE.SINGLE) {
            //Select.
        } else {
            //Start renamer.
        }
    } else {
        this.clicked = true;
        setTimeout(function () {
            me.clicked = false;
        }, me.tree.options.doubleClickDelay || 250);
        this.mover.activate(x, y);
    }
};
TreeNode.prototype.release = function() {

};


function TreeNodeView(node) {
    var me = this;
    this.node = node;
    //Define if this node is visible on the screen.
    //If parent is not defined, this node is root node and
    //it is always visible.    
    this.visible = this.node.parent ? this.node.parent.isExpanded() : true;
    //Define position of the children panel of this node.
    this.position = {        
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    };
    
    this.container = jQuery('<div/>', {
        'class': 'node-container'
    });
    this.line = jQuery('<div/>', {
        'class': 'tree-line'
    }).appendTo(me.container);

    this.children = jQuery('<div/>', {
        'class': 'children-container'
    }).appendTo(me.container);
    

    //Events listeners.
    var listener = (function () {
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


}
TreeNodeView.prototype.sort = function(array) {
    if (array.length > 1) {
        for (var i = array.length - 1; i > 0; i--) {
            $(array[i].view.container).before($(array[i - 1].view.container));
        }
    }
};
TreeNodeView.prototype.calculatePosition = function() {
    var pos = $(this.container).offset();
    var width = $(this.container).width();
    var height = $(this.container).height();
    this.position = {
        left: pos.left,
        top: pos.top,
        width: width,
        height: height,
        right: pos.left + width,
        bottom: pos.top + height
    };
};
TreeNodeView.prototype.addChild = function(child) {
    $(child).appendTo(this.children);
};
TreeNodeView.prototype.isHovered = function (x, y) {
    var p = this.position;
    this.calculatePosition();
    if (this.visible) {
        if (x >= p.left && x <= p.right && y >= p.top && y <= p.bottom) {
            return true;
        }
    }
    return false;
};
TreeNodeView.prototype.expand = function() {
    display(this.children, true);
};
TreeNodeView.prototype.collapse = function () {
    display(this.children, false);
};
TreeNodeView.prototype.append = function($container) {
    $(this.container).appendTo($container);
};


function NodesManager(node) {
    this.node = node;
    this.items = {};
    this.sorted = [];
}
NodesManager.prototype.addNode = function(node, sort) {
    this.items[node.key] = node;
    this.sorted.push(node);
    if (sort !== false) {
        this.sort();
    }
};
NodesManager.prototype.sort = function () {
    this.sorted.sort(function (a, b) {
        return a.name < b.name ? -1 : 1;
    });
    this.node.view.sort(this.sorted);
};
NodesManager.prototype.refreshArray = function () {
    this.sorted = my.array.objectToArray(this.items);
    this.sort();
};
NodesManager.prototype.removeNode = function (node) {
    for (var key in items) {
        if (this.items.hasOwnProperty(key)) {
            var $node = this.items[key];
            if ($node === node) {
                delete this.items[key];
            }
        }
    }
    this.refreshArray();
};
NodesManager.prototype.removeNodeByKey = function (key) {
    delete this.items(key);
    this.refreshArray();
};
NodesManager.prototype.size = function() {
    return this.sorted.length;
};
NodesManager.prototype.each = function(fn) {
    for (var key in this.items) {
        if (this.items.hasOwnProperty(key)) {
            var item = this.items[key];
            fn(item);
        }
    }
};
NodesManager.prototype.countSelected = function(includePartiallySelected) {
    var counter = 0;
    for (var key in this.items) {
        if (this.items.hasOwnProperty(key)) {
            var item = this.items[key];
            if (item.isSelected()) {
                counter += 1;
            } else if (includePartiallySelected && item.hasSelectedChildren()) {
                counter += 0.5;
            }
        }
    }
    return counter;
};
NodesManager.prototype.isDescendant = function(node) {
    if (this.node.parent) {
        if (node.parent === this.node) {
            return true;
        } else {
            return (this.isDescendant(node.parent));
        }
    } else {
        return false;
    }
};


function NodeExpander(node) {
    var me = this;
    this.node = node;
    this.expandable = false;
    this.expanded = false;
    this.button = jQuery('<div/>', {
        'class': 'icon '
    }).bind({
        'click': function (e) {
            if (e.active === false) return;
            e.preventDefault();
            e.stopPropagation();
            me.revertStatus();
        }
    }).appendTo(me.node.view.line);
}
NodeExpander.prototype.revertStatus = function () {
    if (this.expandable) {
        if (this.expanded) {
            this.node.collapse();
        } else {
            this.node.expand();
        }
    }
};
NodeExpander.prototype.render = function() {
    if (this.expandable) {
        $(this.button).html(this.expanded ? '-' : '+');
    } else {
        $(this.button).html('.');
    }
};
NodeExpander.prototype.setState = function (value) {
    this.expanded = value;
};
NodeExpander.prototype.adjustButton = function () {
    this.expandable = (this.node.nodes.size() > 0);
    this.render();
};


function NodeSelector(node, value) {
    var me = this;
    this.node = node;
    this.selected = value || false;
    this.hasSelectedChildren = false;
    
    this.box = jQuery('<input/>', {
        type: 'checkbox',
        'class': 'select-checkbox',
        'value': me.selected
    }).css({
        'display': (me.node.tree.mode === MODE.MULTI ? 'block' : 'none')
    }).bind({
        'click': function (e) {
            if (e.active === false) return;
            me.revert();
        }
    }).appendTo(me.node.view.line);

}
NodeSelector.prototype.check = function(value) {
    $(this.box).prop({        
       'checked': value
    });
};
NodeSelector.prototype.revert = function() {
    this.node.select(!this.selected, true, true);
};
NodeSelector.prototype.select = function(value, applyForChildren, applyForParent) {
    this.selected = value;
    this.hasSelectedChildren = value;
    this.check(value);
    if (applyForChildren) {
        this.applyForChildren(value);
    }
    if (applyForParent) {
        this.applyForParent();
    }
};
NodeSelector.prototype.applyForChildren = function (value) {
    this.node.nodes.each(function(node) {
        node.select(value, true, false);
    });
};
NodeSelector.prototype.applyForParent = function () {
    if (this.node.parent) {
        this.node.parent.selector.checkChildrenStatus();
    }
};
NodeSelector.prototype.checkChildrenStatus = function () {
    var selectedChildren = this.node.nodes.countSelected(true);
    if (selectedChildren) {
        if (selectedChildren === this.node.nodes.size()) {
            this.node.select(true, false, true);
        } else {
            this.node.partiallySelected();
        }
    } else {
        this.node.select(false, false, true);
    }
    
    if (this.node.parent) {
        this.node.parent.selector.checkChildrenStatus();
    }
};


function NodeCaption(node) {
    var me = this;
    this.node = node;
    this.caption = jQuery('<div/>', {
        'class': 'caption',
        html: me.node.name
    }).bind({
        'mousedown': function (e) {
            if (e.active === false) return;
            me.node.click(e.pageX, e.pageY);
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
            me.node.release();
            //if (!me.mover.isActive() && me.mouseClicked) {
            //    me.activate();
            //}
            //me.mouseClicked = false;
        }
    }).appendTo(me.node.view.line);
}
NodeCaption.prototype.refresh = function() {
    var me = this;
    $(this.caption).css({
        'font-weight':  me.node.selector.hasSelectedChildren ? 'bold' : 'normal'
    });
};
NodeCaption.prototype.dropArea = function(value) {
    var $class = 'drop-area';
    if (value) {
        $(this.caption).addClass($class);
    } else {
        $(this.caption).removeClass($class);
    }
};
NodeCaption.prototype.rename = function(name) {
    $(this.caption).html(name);
};
//            position: function () {
//                var position = $(caption).offset();
//                var width = $(caption).width();
//                var height = $(caption).height();
//                return {
//                    left: position.left,
//                    top: position.top,
//                    width: width,
//                    height: height,
//                    right: position.left + width,
//                    bottom: position.top + height
//                };
//            },


function NodeRenamer(node) {
    var me = this;
    this.node = node;
    this.active = false;

    //UI components.
    this.textbox = null;

    function createTextbox() {
        this.textbox = this.textbox || jQuery('<input/>', {
            'class': 'edit-name'
        }).css({
            'visibility': 'hidden'
        }).bind({
            'keydown': function (e) {
                switch (e.which) {
                    case 13: //Enter
                        e.preventDefault();
                        e.stopPropagation();
                        this.confirm($(this).val());
                        break;
                    case 27: //Escape
                        e.preventDefault();
                        e.stopPropagation();
                        this.escape();
                        break;
                }
            }
        });
        $caption.append(textbox);
        
    }

}
NodeRenamer.prototype.activate = function () {
    this.active = true;
    
    render: function () {
        if (!textbox) createTextbox();
        show(textbox);
        $(textbox).val(me.name).focus().select();
        me.tree.trigger({
            'type': 'editName'
        });
    }
}
NodeRenamer.prototype.confirm = function (name) {

}
NodeRenamer.prototype.escape = function () {
    this.active = false;
    $(this.textbox).remove();
    this.textbox = null;
}
NodeRenamer.prototype.isOutside = function (x, y) {
    var position = $(this.textbox).offset();
    var xa = position.left;
    var ya = position.top;
    var xz = xa + $(this.textbox).width();
    var yz = ya + $(this.textbox).height();

    if (x >= xa && x <= xz && y >= ya && y <= yz) {
        return false;
    }

    return true;
}


    var $renamer = (function () {

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

            return {

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



//function TreeNode(tree, parent, object) {

//    //Events handler and listener.
//    var $events = (function () {
//        var listener = {};

//        $(listener).bind({
//            'addNode removeNode': function (e) {
//                if (e.active === false) return;
//                if (me.object.events) {
//                    var events = (typeof (me.object.events) === 'function' ? object.events() : object.events);
//                    events.trigger({
//                        'type': e.type === 'addNode' ? 'add' : 'remove',
//                        'value': e.node.object
//                    });
//                }
                
//                if ($expander.isExpanded()) {
//                    me.tree.trigger({                        
//                       'type': 'rearrange' 
//                    });
//                }

//            },
//            'activateDroparea': function(e){
//                me.tree.trigger({
//                    'type' : 'dropin',
//                    'node': me
//                });
//            },
//            'deactivateDroparea': function(e){
//                me.tree.trigger({
//                    'type' : 'dropout',
//                    'node': me
//                });
//            },
//            'rename': function (e) {
//                me.name = e.name;
//                me.tree.trigger({
//                    'type': 'rename',
//                    'node': me,
//                    'oldName': e.oldName,
//                    'name': e.name
//                });
//            },
//            'transfer': function (e) {
//                if (e.active === false) return;

//                var previous = me.parent;
//                me.parent = e.to;

//                if (e.to) {
//                    e.to.trigger({
//                        'type': 'addNode',
//                        'node': me,
//                        'sort': true
//                    });
//                }

//                if (previous) {
//                    previous.trigger({
//                        'type': 'removeNode',
//                        'node': me
//                    });
//                }
                
//                //Inform parental tree object.
//                me.tree.trigger({                    
//                    'type': 'transfer',
//                    'node': me,
//                    'from': previous,
//                    'to': e.to
//                });

//            }
//        });

//        return {
//            trigger: function (e) {
//                $(listener).trigger(e);
//            },
//            bind: function (e) {
//                $(listener).bind(e);
//            }
//        };
//    })();
//    this.trigger = function (e) {
//        $events.trigger(e);
//    };
//    this.bind = function (e) {
//        $events.bind(e);
//    };
    







//    var $droparea = (function () {
//        var visible = false;
//        var position = {
//            left: 0,
//            right: 0,
//            top: 0,
//            bottom: 0
//        };

//        var listener = (function () {
//            //me.tree.bind({
//            //    'expand collapse afterRendering rearrange': function (e) {
//            //        if (e.active === false) return;
//            //        if (e.recalculate) {
//            //            calculatePosition();
//            //        }
//            //    }
//            //});
//        })();

//        function calculatePosition() {
//            position = $caption.position();
//            visible = (position.width && position.height);
//        };

//        function isHovered(x, y) {
//            calculatePosition();
//            if (visible) {
//                if (x >= position.left && x <= position.right && y >= position.top && y <= position.bottom) {
//                    return true;
//                }
//            }
//            return false;
//        }


//        function findHovered(x, y) {
//            var name = me.name;
//            if (isHovered(x, y)) {
//                return me;
//            } else if ($ui.isHovered(x, y)) {
//                var hovered = null;
//                $nodes.each(function (node) {
//                    if (hovered === null) {
//                        hovered = node.findHovered(x, y);
//                    }
//                });
//                return hovered;
//            }
//            return null;
//        }

//        return {
//            isHovered: function (x, y) {
//                return isHovered(x, y);
//            },
//            findHovered: function (x, y) {
//                return findHovered(x, y);
//            }
//        };
//    })();
//    this.isHovered = function (x, y) {
//        return $droparea.isHovered(x, y);
//    };
//    this.findHovered = function (x, y) {
//        return $droparea.findHovered(x, y);
//    };
    
//    var $mover = (function () {
//        var active = false;
//        var inProgress = false;
//        var position = {
//            caption: {
//                top: 0,
//                left: 0
//            },
//            click: {
//                top: 0,
//                left: 0
//            }
//        };
//        var events = (function () {
//            $(document).bind({
//                'mousemove': function (e) {
//                    e.preventDefault();
//                    if (active) {
//                        $events.trigger({
//                            'type': 'move',
//                            'x': e.pageX,
//                            'y': e.pageY,
//                        });
//                    }
//                }
//            });

//            $events.bind({
//                'click': function (e) {
//                    active = true;
//                    position.caption = $caption.position();
//                    position.click = {
//                        'left': e.x,
//                        'top': e.y
//                    };
//                },
//                'startRenamer': function (e) {
//                    active = false;
//                },
//                'move': function (e) {
//                    if (e.active === false) return;
//                    if (!active) return;

//                    if (!inProgress) {
//                        inProgress = true;
//                        activate();
//                        me.tree.trigger({
//                            'type': 'dragin',
//                            node: me
//                        });
//                    }
//                    ui.move(e.x, e.y);
//                },
//                'release': function (e) {
//                    if (e.active === false) return;
//                    if (active) {
//                        ui.hide();
//                        me.tree.trigger({
//                            type: 'dragout',
//                            node: me
//                        });
//                    }
//                    active = false;
//                    inProgress = false;
//                }
//            });

//        })();

//        var ui = (function () {
//            var control;

//            function createControl() {
//                control = control || jQuery('<div/>', {
//                    'class': 'move',
//                    html: me.name
//                }).css({
//                    'visibility': 'hidden'
//                }).appendTo($ui.container());
//            }

//            function move(x, y) {
//                var $x = x - position.click.left + position.caption.left;
//                var $y = y - position.click.top + position.caption.top;
//                $(control).css({ left: $x, top: $y });
//            }

//            return {
//                hide: function () {
//                    hide(control);
//                },
//                render: function () {
//                    if (!control) createControl();
//                    show(control);
//                },
//                move: function (x, y) {
//                    if (!control) return;
//                    move(x, y);
//                }
//            };
//        })();
        
//        function activate(x, y) {
//            active = true;
//            ui.render();
//        }

//        return {
//            isActive: function () {
//                return active;
//            }
//        };
//    })();




//    //Util functions.
//    this.util = (function () {
//        return {
//            getSelectedNodes: function () {
//                var array = [];
//                array.length = 0;

//                if ($selector.isSelected()) {
//                    array.push(me);
//                } else if ($selector.hasSelectedChildren()) {
//                    $nodes.each(function (node) {
//                        var $array = node.util.getSelectedNodes();
//                        Array.prototype.push.apply(array, $array);
//                    });
//                }

//                return array;
//            },
//            isRoot: function() {
//                return (me.parent === null);
//            },
//            getNodesForSearching: function () {
//                var array = [];

//                if (me.parent) {    //Add itself (except for root).
//                    array.push(me.util.getSearchObject());
//                }

//                //Add nodes.
//                $nodes.each(function (node) {
//                    var $array = node.util.getNodesForSearching();
//                    Array.prototype.push.apply(array, $array);
//                });

//                return array;

//            },
//            path: function (thisInclude) {
//                var $node;
//                var $path = '';

//                if (thisInclude) {
//                    $node = me;
//                } else {
//                    $node = me.parent;
//                }

//                if ($node.util.isRoot()) {
//                    return '';
//                }

//                while (!$node.util.isRoot()) {
//                    $path = $node.name + ($path ? '  >  ' + $path : '');
//                    $node = $node.parent;
//                }
//                return $path;
//            },
//            getSearchObject: function() {
//                return {
//                    object: this,
//                    name: me.name,
//                    prepend: me.util.path() + (me.parent.util.isRoot() ? '' : '  >  '),
//                    displayed: me.name
//                };
//            }
            


//        };
//    })();


//    //Initializing functions.
//    (function ini() {
//        $nodes.load();
//        if (object.expanded) {
//            var name = me.name;
//            $events.trigger({
//                'type': 'expand',
//                'recalculate': me.parent ? false : true
//            });
//        }
//    })();


//}








////TreeNode.prototype.transfer = function (destination) {
////    if (this === destination) {
////        this.isActive = false;
////    } else {
////        if (!this.isRoot()) {
////            this.parent.removeNode(this);
////            destination.addNode(this);
////        }
////    }
////};
////TreeNode.prototype.addNode = function (node) {
////    //alert('moving node ' + node.name + ' to ' + this.name);
////    node.moveTo(this);
////    this.nodes[node.getKey()] = node;
////    this.sorter.sort();
////    this.resetStatus();
////    this.dropArea.unselect();
////    this.dropArea.recalculate();
////};
//TreeNode.prototype.moveTo = function (newParent) {
//    if (this.parent) {
//        this.parent.removeNode(this.key);
//    }
//    this.parent = newParent;
//    this.mainContainer.appendTo($(newParent.getContainer()));
//};
////TreeNode.prototype.isRoot = function () {
////    var value = (this.parent.isNode ? false : true);
////    return value;
////};
//TreeNode.prototype.resetStatus = function () {
//    if (Object.keys(this.nodes).length > 0) {
//        this.expander.setExpandableStatus(true);
//    } else {
//        this.expander.setExpandableStatus(false);
//    }
//};
//TreeNode.prototype.getChildNode = function (i) {
//    if (i >= 0 && i < this.nodesArray.length) {
//        return this.nodesArray[i];
//    }
//    return null;
//};
//TreeNode.prototype.getLastChild = function () {
//    if (this.nodesArray.length < 1) {
//        return null;
//    } else {
//        return this.nodesArray[this.nodesArray.length - 1];
//    }
//};
//TreeNode.prototype.activate = function () {
//    this.isActive = true;

//    if (this.parent.isNode){ // && !this.parent.expander.isExpanded()) {
//        this.parent.expander.expand();
//    }

//    $(this.caption).addClass('selected');

//    this.tree.trigger({
//        'type': 'activate',
//        'node': this
//    });
//};
//TreeNode.prototype.inactivate = function () {
//    this.isActive = false;
//    $(this.caption).removeClass('selected');
//    this.tree.trigger({
//        'type': 'inactivate',
//        'node': this
//    });
//};
//TreeNode.prototype.nextNode = function () {
//    if (this.isRoot() === true) {
//        return null;
//    } else {
//        return this.parent.getChildNode(this.index + 1);
//    }
//};
//TreeNode.prototype.previousNode = function () {
//    if (this.isRoot() === true) {
//        return null;
//    } else {
//        return this.parent.getChildNode(this.index - 1);
//    }
//};
//TreeNode.prototype.delete = function () {
//    if (!this.isRoot()) {
//        this.parent.removeNode(this.key);
//        this.parent.resetStatus();

//        $(this.mainContainer).css({
//            'display' : 'none'
//        });

//        this.tree.trigger({
//            'type': 'delete',
//            'node': this
//        });

//    }
//};
////TreeNode.prototype.removeNode = function (key) {
////    delete this.nodes[key];
////    this.sorter.sort();
////};
//TreeNode.prototype.addNewNode = function () {
//    var me = this;
//    var node = new TreeNode({
//            tree: me.tree,
//            parent: me,
//            expanded: false
//        });
//    this.tree.trigger({
//        'type': 'activate',
//        'node': node
//    });
//    node.renamer.activate();
//};
//TreeNode.prototype.cancel = function () {
//    $(this.mainContainer).remove();
//    this.parent.removeNode(this.key);
//};
////TreeNode.prototype.changeName = function (name) {
////    this.name = name;
////    $(this.caption).html(name);
////};
////TreeNode.prototype.select = function () {
////    if (this.tree.mode === MODE.SINGLE) {
////        this.tree.trigger({
////            'type': 'confirm',
////            'item': this
////        });
////    } else if (this.tree.mode === MODE.MULTI) {
////        this.selector.click();
////        if (this.tree.selection) {
////            this.tree.selection.refresh();
////        }
////    }
////};
//TreeNode.prototype.unselect = function () {
//    if (this.tree.mode === MODE.MULTI) {
//        this.selector.unselect();
//        this.tree.selection.refresh();
//    }
//};


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
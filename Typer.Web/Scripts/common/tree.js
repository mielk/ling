var MODE = {
    NONE: 0,
    SINGLE: 1,
    MULTI: 2
};


/* TreeView
   
   Events:
   !confirm
   !add
   !remove
   !rename
   !transfer
   #expand
   #collapse
   #activate
   #deactivate
 */
function Tree(properties) {
    // ReSharper disable once UnusedLocals
    var me = this;
    //Public properties.
    this.mode = properties.mode ? properties.mode : MODE.SINGLE;
    this.options = {
        expandWhenAddingNewNode: properties.expandWhenAddingNewNode || true,
        doubleClickDelay: properties.doubleClickDelay || 500,
        buttons: properties.buttons || (properties.container ? false : true) || false
    };
    //Private properties.
    this.visible = (properties.hidden === true ? false : true);


    // ReSharper disable once UseOfImplicitGlobalInFunctionScope
    // EventHandler class is defined in global.js.
    this.eventHandler = new EventHandler();
    //Declare events specific for this class.
    this.eventHandler.bind({
        // transfer
        // rename
        // remove
        // add
    });

    

    this.view = new TreeView(this, properties.container, properties.x, properties.y);

    this.search = new SearchPanel(this);

    this.children = jQuery('<div/>');
    this.view.append(this.children);

    this.selection = new SelectionPanel(this, properties.showSelection);

    if (this.options.buttons) {
        this.buttons = new ButtonsPanel(this);
    }

    this.dragdrop = new DropArea(this);

    this.navigator = new TreeNavigator(this);


    //Data.
    this.root = new TreeNode(me, null, properties.root);

    this.node = null;
    

    //Initializing function.
    this.root.view.append(this.children);
    this.root.activate();
    this.initialSelection(properties.selected);
    if (!this.visible) {
        this.hide();
    }

}
Tree.prototype.initialSelection = function (selected) {
    if (selected) {
        for (var i = 0; i < selected.length; i++) {
            var object = selected[i];
            object.node.select(true, true, true, true);
        }
    }
};
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
        this.root.select(false);
    }
    
    if (properties.collapse) {
        this.root.collapse();
    }

};
Tree.prototype.cancel = function() {
    this.view.hide();
};
Tree.prototype.bind = function(e) {
    this.eventHandler.bind(e);
};
Tree.prototype.trigger = function(e) {
    this.eventHandler.trigger(e);
};
Tree.prototype.setActiveNode = function (node) {
    var previous = this.node;
    this.node = node;
    if (previous && previous !== node) {
        previous.deactivate();
    }
};
Tree.prototype.clearActiveNode = function() {
    if (this.node) {
        this.node.deactivate();
    }
    this.node = null;
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
    if (!this.embedded) {
        $(this.background).css({
            'z-index': my.ui.addTopLayer()
        });
    }
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
    var me = this;
    this.active = true;
    
    this.dropdown = this.dropdown || new DropDown({
        container: me.container,
        data: this.tree.root.getNodesForSearching(),
        placeholder: 'Select option',
        allowClear: true
    });
    
    this.dropdown.bind({
        change: function (e) {
            me.select(e.object);
            me.dropdown.deactivate();
        }
    });

    this.show();
    //this.dropdown.activate();

};
SearchPanel.prototype.deactivate = function() {
    this.active = false;
    this.hide();
};
SearchPanel.prototype.select = function(node) {
    node.activate();
    if (node.parent) {
        node.parent.expand();
    }
    this.deactivate();
};


function SelectionPanel(tree, showSelection) {
    // ReSharper disable once UnusedLocals
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
            me.node.select(false, true, true, true);
        }
    }).appendTo(this.container);
    

    // ReSharper disable once UnusedLocals
    var caption = jQuery('<div/>', {
        'class': 'tree-selection-line-caption',
        'html': me.node.name
    }).appendTo(this.container);
}


function ButtonsPanel(tree) {
    var me = this;
    this.tree = tree;
    
    //UI components.
    var panel = jQuery('<div/>', {
        'class': 'tree-buttons-panel'
    });
    
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
            me.tree.trigger({
                type: 'confirm',
                item: me.tree.root.getSelectedNodes()
            });
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

    this.tree.view.append($(panel));

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
                var x = e.pageX;
                var y = e.pageY;
                me.drag.move(x, y);
                var $drop = findDropArea(x, y);
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
            me.drop = null;
        }
        
        if (me.drag) {
            me.drag.release();
            me.drag = null;
        }
        
    }

}
DropArea.prototype.setDragNode = function(node) {
    this.drag = node;
};
DropArea.prototype.isActive = function() {
    return (this.drop ? true : false);
};


function TreeNavigator(tree) {
    var me = this;
    this.tree = tree;

    $(document).bind({        
        'keydown': function(e) {
            if (!me.tree.visible) return;
            
            var node = me.tree.node;

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
            
            //Keyboard events are not active if search or renaming mode is on.
            if (me.tree.search.active || (node && node.renamer.active)) {
                return;
            }
            

            //Escape applies even for the case if none node is selected.
            if (e.which === 27) {
                me.tree.cancel();
            }

            function preventDefault() {
                e.preventDefault();
                e.stopPropagation();
            }

            //Definition of key shortcuts.
            if (node) {
                switch (e.which) {
                    case 37: //Arrow left
                        preventDefault();
                        node.collapse();
                        break;
                    case 38: //Arrow up
                        preventDefault();
                        moveUp();
                        break;
                    case 39: //Arrow right
                        preventDefault();
                        node.expand();
                        break;
                    case 40: //Arrow down
                        preventDefault();
                        moveDown();
                        break;
                    case 36: //Home
                        preventDefault();
                        if (node.parent) {
                            node.parent.activate();
                        }
                        break;
                    case 35: //End
                        preventDefault();
                        break;
                    case 33: //PageUp
                        preventDefault();
                        me.tree.root.activate();
                        break;
                    case 34: //PageDown
                        preventDefault();
                        moveToLastItem();
                        break;
                    case 113: //F2
                        preventDefault();
                        node.renamer.activate();
                        break;
                    case 46: //Delete
                        e.stopPropagation();
                        e.preventDefault();
                        node.parent.activate();
                        node.delete();
                        break;
                    case 45: //Insert
                        e.stopPropagation();
                        e.preventDefault();
                        node.addNewNode();
                        break;
                    case 13: //Enter
                        e.stopPropagation();
                        e.preventDefault();
                        confirm();
                        break;
                    case 32: //Space
                        e.stopPropagation();
                        e.preventDefault();
                        switch (me.tree.mode) {
                            case MODE.SINGLE: selectActive(); break;
                            case MODE.MULTI: node.selector.revert(); break;
                        }
                        break;
                }
            }

        }        
    });


    function moveUp() {
        var node = me.tree.node;
        var previous = node.getPreviousSibling();
        
        if (previous) {
            node = previous;
            while (node.isExpanded()) {
                node = node.getLastChild();
            }
            node.activate();
        } else {
            if (!node.isRoot()) {
                node.parent.activate();
            }
        }
    }


    function moveDown() {
        var node = me.tree.node;
        if (node.isExpanded()) {
            var childNode = node.getChildNode(0);
            if (childNode) {
                childNode.activate();
                return true;
            }
        }

        var parent = node;
        var next = null;
        
        while (next === null && parent) {
            next = parent.getNextSibling();
            parent = parent.parent;
        }

        if (next) {
            next.activate();
            return true;
        }

        return false;

    }

    function moveToLastItem() {
        var node = me.tree.root;
        while (node.isExpanded()) {
            node = node.getLastChild();
        }
        node.activate();
    }

    function confirm() {
        switch (me.tree.mode) {
            case MODE.SINGLE:
                selectActive();
                break;
            case MODE.MULTI:
                me.tree.trigger({
                    type: 'confirm',
                    item: me.tree.root.getSelectedNodes()
                });
        }
    }

    function selectActive() {
        var node = me.tree.node;
        if (node) {
            me.tree.trigger({
                type: 'confirm',
                node: node
            });
        }
    }

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
    // ReSharper disable once UnusedLocals
    var me = this;
    //Parental tree.
    this.tree = tree;
    //Node properties.
    this.key = (typeof (object.key) === 'function' ? object.key() : object.key) || '';
    this.name = (typeof (object.name) === 'function' ? object.name() : object.name) || '';
    this.object = object;
    this.object.node = this;
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

    this.renamer = new NodeRenamer(this);

    this.droparea = new NodeDropArea(this);

    this.mover = new NodeDragMover(this);

    this.load(object.items);

}

TreeNode.prototype.load = function(items) {
    var $items = (typeof (items) === "function" ? items() : items);
    
    //Applying for newly created nodes.
    if (!$items) return;
    
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
    
    this.triggerObjectEvent({
        type: 'add',
        object: node.object
    });
};
TreeNode.prototype.removeNode = function(node) {
    this.nodes.removeNode(node);
    this.expander.adjustButton();
    this.triggerObjectEvent({
        type: 'remove',
        object: node.object
    });
};
TreeNode.prototype.delete = function () {

    this.nodes.each(function(node) {
        node.delete();
    });

    if (this.parent) {
        this.parent.removeNode(this);
        this.view.delete();
    }
    this.tree.trigger({
        type: 'remove',
        node: this
    });
};
TreeNode.prototype.triggerObjectEvent = function(e) {
    if (this.object.trigger && typeof (this.object.trigger) === 'function') {
        this.object.trigger(e);
    }
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
    if (this.parent && !this.parent.isExpanded()) {
        this.parent.expand();
    }
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
TreeNode.prototype.select = function (value, applyForChildren, applyForParent, refreshSelected) {
    if (value && this.tree.mode === MODE.SINGLE) {
        var me = this;
        me.tree.trigger({
            type: 'confirm',
            item: me
        });
    } else {
        this.selector.select(value, applyForChildren, applyForParent);
        this.caption.refresh();
        if (refreshSelected) {
            this.tree.selection.refresh();
        }
    }
};
TreeNode.prototype.partiallySelected = function () {
    this.selector.selected = false;
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
        if (this.tree.mode === MODE.SINGLE) {
            me.select(true, true, true, true);
        } else {
            me.renamer.activate();
        }
    } else {
        this.clicked = true;
        setTimeout(function () {
            me.clicked = false;
        }, me.tree.options.doubleClickDelay || 250);
        this.mover.activate(x, y);
        this.tree.dragdrop.setDragNode(this);
    }
};
TreeNode.prototype.move = function(x, y) {
    if (this.mover.active) {
        this.mover.move(x, y);
    }
};
TreeNode.prototype.release = function() {
    this.mover.escape();
};
TreeNode.prototype.activateDroparea = function () {
    this.droparea.activate();
};
TreeNode.prototype.deactivateDroparea = function () {
    this.droparea.escape();
};
TreeNode.prototype.isHovered = function(x, y) {
    return this.droparea.isHovered(x, y);
};
TreeNode.prototype.isDescendant = function(node) {
    return this.nodes.isDescendant(node);
};
TreeNode.prototype.findHovered = function(x, y) {
    return this.droparea.findHovered(x, y);
};
TreeNode.prototype.transfer = function (to) {
    
    //Root node cannot be transferred.
    if (this.isRoot()) {
        my.notify.display('Root node cannot be transferred', false);
        return;
    };
    
    this.tree.trigger({
        type: 'transfer',
        node: this,
        from: this.parent,
        to: to
    });
    if (this.parent) {
        this.parent.removeNode(this);
    }
    
    //Set new parent.
    this.parent = to;
    to.addNode(this);
    
};

//Applied for newly created nodes.
TreeNode.prototype.insert = function(name) {
    this.key = name;
    this.name = name;

    if (this.parent) {
        this.parent.triggerObjectEvent({
            type: 'newItem',
            name: name
        });
    }

    this.parent.addNode(this, true);
    this.caption.rename(name);
    this.expander.adjustButton();
    this.activate();

    this.tree.trigger({
        type: 'add',
        node: this
    });

};
//Applied for newly created nodes.
TreeNode.prototype.cancel = function() {
    if (this.parent) {
        this.parent.newNode = null;
        this.parent.activate();
    }
    this.view.delete();
};

TreeNode.prototype.changeName = function (name) {
    
    if (this.new) {
        this.insert(name);
    } else {
        this.tree.trigger({
            type: 'rename',
            node: this,
            previous: this.name,
            name: name
        });
        this.name = name;
        this.caption.rename(name);
        this.triggerObjectEvent({
            type: 'rename',
            name: name
        });
        
        if (this.parent) {
            this.parent.nodes.sort();
        }

    }

};

TreeNode.prototype.getSelectedNodes = function() {
    var array = [];
    array.length = 0;

    if (this.isSelected()) {
        array.push(this);
    } else if (this.hasSelectedChildren()) {
        this.nodes.each(function (node) {
            var $array = node.getSelectedNodes();
            Array.prototype.push.apply(array, $array);
        });
    }

    return array;

};
TreeNode.prototype.getNodesForSearching = function() {
    var array = [];

    if (this.parent) {    //Add itself (except for root).
        array.push(this.getSearchObject());
    }

    //Add nodes.
    this.nodes.each(function (node) {
        var $array = node.getNodesForSearching();
        Array.prototype.push.apply(array, $array);
    });

    return array;
};
TreeNode.prototype.isRoot = function () {
    return (this.parent === null);
};
TreeNode.prototype.path = function (includeThis) {
    var node;
    var path = '';

    node = includeThis ? this : this.parent;
    if (node.isRoot()) {
        return '';
    }
    while (!node.isRoot()) {
        path = node.name + (path ? '  >  ' + path : '');
        node = node.parent;
    }
    return path;
};
TreeNode.prototype.getSearchObject = function() {
    return {
        key: this.key,
        name: this.name,
        object: this,
        prepend: this.path() + (this.parent.isRoot() ? '' : '  >  ')
    };
};
TreeNode.prototype.getChildNode = function(i) {
    return this.nodes.get(i);
};
TreeNode.prototype.getLastChild = function() {
    var size = this.nodes.size();
    if (size) {
        return this.nodes.get(size - 1);
    } else {
        return null;
    }
};
TreeNode.prototype.getFirstChild = function() {
    if (this.nodes.size()) {
        return this.nodes.get(0);
    } else {
        return null;
    }
};
TreeNode.prototype.getPreviousSibling = function() {
    var parent = this.parent;
    if (parent) {
        var index = parent.nodes.index(this);
        return index < 0 ? null : parent.getChildNode(index - 1);
    } else {
        return null;
    }
};
TreeNode.prototype.getNextSibling = function() {
    var parent = this.parent;
    if (parent) {
        var index = parent.nodes.index(this);
        return index < 0 ? null : parent.getChildNode(index + 1);
    } else {
        return null;
    }
};
TreeNode.prototype.activate = function() {
    this.active = true;
    if (this.parent) {
        this.parent.expand();
    }
    this.caption.activate(true);
    this.tree.setActiveNode(this);
};
TreeNode.prototype.deactivate = function() {
    this.active = false;
    this.caption.activate(false);
};
TreeNode.prototype.addNewNode = function() {
    this.newNode = new TreeNode(this.tree, this, {});
    this.newNode.new = true;
    this.view.addChild(this.newNode.view.container);
    this.tree.clearActiveNode();
    this.newNode.renamer.activate();
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

}
TreeNodeView.prototype.sort = function(array) {
    if (array.length > 1) {
        
        for (var i = array.length - 1; i > 0; i--) {
            var up = array[i - 1];
            var down = array[i];
            $(down.view.container).before($(up.view.container));
        }

        //var children = jQuery('<div/>', {
        //    'class': 'children-container'
        //});

        //for (var i = 0; i < array.length; i++) {
        //    var node = array[i];
        //    node.view.container.appendTo($(children));
        //}

        //$(this.children).remove();
        //this.children = $(children).appendTo($(this.container));

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
TreeNodeView.prototype.delete = function() {
    $(this.container).remove();
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
        return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
    });
    this.node.view.sort(this.sorted);
};
NodesManager.prototype.refreshArray = function () {
    this.sorted = my.array.objectToArray(this.items);
    this.sort();
};
NodesManager.prototype.removeNode = function (node) {
    for (var key in this.items) {
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
NodesManager.prototype.isDescendant = function (node) {
    if (!node) return false;
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
NodesManager.prototype.get = function (i) {
    if (i >= 0 && i < this.sorted.length) {
        return this.sorted[i];
    }
    return null;
};
NodesManager.prototype.index = function(node) {
    for (var i = 0; i < this.sorted.length; i++) {
        var item = this.sorted[i];
        if (item === node) {
            return i;
        }
    }
    return -1;
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
NodeSelector.prototype.revert = function () {
    var value = !this.selected;
    this.check(value);
    this.node.select(value, true, true, true);
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
        node.select(value, true, false, false);
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
            this.node.select(true, false, true, false);
        } else {
            this.node.partiallySelected();
            return;
        }
    } else {
        this.node.select(false, false, true, false);
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
            me.node.activate();
        },
        'mouseup': function (e) {
            if (e.active === false) return;
            me.node.release();
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
NodeCaption.prototype.getPosition = function() {
    var position = $(this.caption).offset();
    var width = $(this.caption).width();
    var height = $(this.caption).height();
    return {
        left: position.left,
        top: position.top,
        width: width,
        height: height,
        right: position.left + width,
        bottom: position.top + height
    };
};
NodeCaption.prototype.activate = function (value) {
    var className = 'selected';
    if (value) {
        $(this.caption).addClass(className);
    } else {
        $(this.caption).removeClass(className);
    }
};


function NodeRenamer(node) {
    var me = this;
    this.node = node;
    this.active = false;

    //UI components.
    this.textbox = null;

    //Events.
    $(document).bind({
        'mousedown': function (e) {
            if (me.active && e && me.isOutside(e.pageX, e.pageY)) {
                e.preventDefault();
                e.stopPropagation();
                me.escape();
                me.node.activate();
            }
        }
    });

}
NodeRenamer.prototype.createTextbox = function () {
    var me = this;
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
                    me.confirm($(this).val());
                    break;
                case 27: //Escape
                    e.preventDefault();
                    e.stopPropagation();
                    me.escape();
                    if (me.node.new) me.node.cancel();
                    break;
            }
        }
    }).appendTo(me.node.caption.caption);
            
};
NodeRenamer.prototype.activate = function() {
    this.active = true;
    this.createTextbox();
    show(this.textbox);
    $(this.textbox).val(this.node.name).focus().select();
};
NodeRenamer.prototype.confirm = function(name) {
    var validation = this.validateName(name);
    if (validation === true) {
        this.node.changeName(name);
    }
    this.escape();
};
NodeRenamer.prototype.validateName = function(name) {
    my.notify.display('To be implemented -> NodeRenamer.prototype.validateName');
    return name ? true : false;
};
NodeRenamer.prototype.escape = function() {
    this.active = false;
    $(this.textbox).remove();
    this.textbox = null;
};
NodeRenamer.prototype.isOutside = function(x, y) {
    var position = $(this.textbox).offset();
    var xa = position.left;
    var ya = position.top;
    var xz = xa + $(this.textbox).width();
    var yz = ya + $(this.textbox).height();

    if (x >= xa && x <= xz && y >= ya && y <= yz) {
        return false;
    }

    return true;
};


function NodeDropArea(node) {
    this.node = node;
    this.visible = false;
    this.position = {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
        };
}
NodeDropArea.prototype.calculatePosition = function () {
    this.position = this.node.caption.getPosition();
    this.visible = (this.position.width && this.position.height);
};
NodeDropArea.prototype.isHovered = function (x, y) {
    var p = this.position;
    this.calculatePosition();
    if (this.visible) {
        if (x >= p.left && x <= p.right && y >= p.top && y <= p.bottom) {
            return true;
        }
    }
    return false;
};
NodeDropArea.prototype.findHovered = function(x, y) {
    if (this.isHovered(x, y)) {
        return this.node;
    } else if (this.node.view.isHovered(x, y)) {
        var hovered = null;
        this.node.nodes.each(function (node) {
            if (hovered === null) {
                hovered = node.findHovered(x, y);
            }
        });
        return hovered;
    }
    return null;
};
NodeDropArea.prototype.activate = function () {
    this.node.caption.dropArea(true);
};
NodeDropArea.prototype.escape = function () {
    this.node.caption.dropArea(false);
};



function NodeDragMover(node) {
    this.node = node;
    this.active = false;
    this.inProgress = false;
    this.position = {
        caption: { top: 0, left: 0 },
        click: { top: 0, left: 0 }
    };
    this.control = null;
}
NodeDragMover.prototype.createControl = function() {
    this.control = this.control || jQuery('<div/>', {
                        'class': 'move',
                        html: this.node.name
                    }).css({
                        'visibility': 'hidden'
                    }).appendTo(this.node.view.container);
};
NodeDragMover.prototype.activate = function (x, y) {
    this.active = true;
    this.position.click = { left: x, top: y };
};
NodeDragMover.prototype.start = function() {
    this.inProgress = true;
    this.position.caption = this.node.caption.getPosition();
    this.createControl();
    show($(this.control));
};
NodeDragMover.prototype.escape = function() {
    this.active = false;
    this.inProgress = false;
    if (this.control) {
        $(this.control).remove();
    }
    this.control = null;
};
NodeDragMover.prototype.move = function (x, y) {
    if (this.active && !this.inProgress) {
        this.start();
    }
    var p = this.position;
    var $x = x - p.click.left + p.caption.left;
    var $y = y - p.click.top + p.caption.top;
    $(this.control).css({ left: $x, top: $y });
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
var data = [
                    {
                        key: 1,
                        caption: 'a',
                        expanded: true,
                        items: [
                            { key: 11, caption: 'aa', expanded: true, items: [] },
                            { key: 12, caption: 'ab', expanded: true, items: [] }
                        ]
                    },
                    {
                        key: 2,
                        caption: 'b',
                        expanded: false,
                        items: [
                            {
                                key: 21, caption: 'ba', expanded: true, items: [
                                    { key: 211, caption: 'bjtaa', expanded: true, items: [] },
                                    {
                                        key: 212, caption: 'bab', expanded: false, items: [
                                                                            { key: 2221, caption: 'baaa', expanded: true, items: [] },
                                                                            {
                                                                                key: 2222, caption: 'baab', expanded: true, items: [
                                                                                    {
                                                                                        key: 22221, caption: 'baaba', expanded: true, items: [

                                                                                        ]
                                                                                    }
                                                                                ]
                                                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                key: 22, caption: 'bb', expanded: true, items: [
                                    { key: 221, caption: 'bba', expanded: true, items: [] },
                                    {
                                        key: 222, caption: 'bbb', expanded: false, items: [
                                                                            { key: 2221, caption: 'baba', expanded: true, items: [] },
                                                                            {
                                                                                key: 2222, caption: 'babb', expanded: true, items: [
                                                                                    {
                                                                                        key: 22221, caption: 'babba', expanded: true, items: [

                                                                                        ]
                                                                                    }
                                                                                ]
                                                                            }
                                        ]
                                    },
                                    { key: 223, caption: 'bbc', expanded: true, items: [] }
                                ]
                            },
                            { key: 23, caption: 'bc', expanded: true, items: [] },
                        ]
                    },
                    {
                        key: 3,
                        caption: 'c',
                        expanded: true,
                        items: [
                                    { key: 311, caption: 'caa', expanded: true, items: [] },
                                    {
                                        key: 312, caption: 'cab', expanded: false, items: [
                                                                            { key: 3121, caption: 'cabd', expanded: true, items: [] }
                                        ]
                                    },
                        ]
                    },
                    {
                        key: 4,
                        caption: 'd',
                        expanded: true,
                        items: [
                            {
                                key: 41, caption: 'da', expanded: true, items: [
                                    {
                                        key: 411, caption: 'daa', expanded: true, items: [
                                            { key: 4121, caption: 'dabd', expanded: true, items: [] }
                                        ]
                                    },
                                    {
                                        key: 412, caption: 'dab', expanded: false, items: [
                                                                            { key: 4121, caption: 'dabd', expanded: true, items: [] }
                                        ]
                                    },
                                ]
                            }
                        ]
                    }
];





$(function () {
    var container = $('#tree_container')[0];
    var tree = new TreeView(container, true, data, true);



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




function TreeView(container, selectable) {
    var me = this;
    this.container = container;
    this.selectable = selectable;
    this.events = jQuery('<div/>', {
        'class': 'events-container'
    }).appendTo(this.container);
    this.transfer = new NodesTransferManager(this, this.events);


    this.getContainer = function () {
        return this.container;
    }

    this.root = new TreeNode(me, 'root', 'root', me, true);
    this.root.loadData(data);

}
TreeView.prototype.trigger = function (e) {
    this.events.trigger(e);
}


function NodesTransferManager(tree, listener) {
    var drag = null;
    var drop = null;

    $(listener).bind({
        dropin: function (e) {
            drop = e.node;
            //$('#drop').html('Drop: ' + drop.getName());
        },
        dropout: function (e) {
            if (drop === e.node) {
                drop = null;
                //$('#drop').html('Drop: ' + 'null');
            }
        },
        dragin: function (e) {
            drag = e.node;
            //$('#drag').html('Drag: ' + drag.getName());
        },
        dragout: function (e) {
            //$('#drag').html('Drag: ' + 'null');
            if (drag && drop) {
                tree.trigger({
                    type: 'transfer',
                    node: drag,
                    to: drop
                });
                drag = null;
            }
        },
        transfer: function (e) {
            if (e.node && e.to) {
                e.node.transfer(e.to);
            }
        }
    });

}


function TreeNode(tree, key, name, parent, expanded) {
    var me = this;
    this.isNode = function () { return true; }
    this.tree = tree;
    this.key = key;
    this.name = name;
    this.parent = parent;
    this.nodes = {};
    this.mouseClicked = false;
    this.isSelected = false;

    this.mainContainer = jQuery('<div/>', {
        id: key + '_container',
        'class': 'node-container'
    }).appendTo($(this.parent.getContainer()));


    this.line = jQuery('<div/>', {
        id: key,
        'class': 'line'
    }).appendTo(this.mainContainer);

    this.container = jQuery('<div/>', {
        id: key,
        'class': 'children-container'
    }).appendTo(this.mainContainer);



    this.expander = (function (value) {
        //var _ = this;
        var expandable = false;
        var expanded = value;
        var button = jQuery('<div/>', {
                id: me.key + '_expand-collapse-button',
                'class': 'icon '
            }).
            bind({
                'click': function (e) {
                    if (expandable) {
                        e.preventDefault();
                        _revertStatus();
                    }
                }
            }).
            appendTo(me.line);

        function expand () {
            expanded = true;
            $(button).html('-');
            display(me.container, true);
        }

        function collapse() {
            expanded = false;
            $(button).html('+');
            display(me.container, false);
        }

        function _revertStatus() {
            if (expanded === true) {
                collapse();
            } else if (expanded === false) {
                expand();
            }
        }


        function _setStatus(value) {
            if (value === true) {
                expand();
            } else if (value === false) {
                collapse();
            }
        }


        //Sets initial status.
        (function () {
            _setStatus(expanded);
        })();


        return {
            setExpandableStatus: function (value) {
                show(this.expandButton);
                expandable = value;
                if (!expandable) {
                    $(button).html('.');
                } else {
                    _setStatus(expanded);
                }
            },
            revertStatus : function () {
                _revertStatus();
            },
            setStatus: function (value) {
                _setStatus(value);
            }

        }

    })(expanded);



    this.caption = jQuery('<div/>', {
        id: key + '_caption',
        'class': 'caption',
        html: name
    }).
    bind({
        'mousedown': function (e) {
            e.preventDefault();

            me.mouseClicked = true;
            if (me.isSelected) {
                e.preventDefault;
                me.renamer.activate();
                me.unselect();
                me.mouseClicked = false;
            }
        },
        'mouseup': function (e) {
            if (!me.mover.isActive() && me.mouseClicked) {
                me.select();
            }
            me.mouseClicked = false;
        },
        'mouseover': function (e) {
            me.tree.trigger({
                type: 'dropin',
                node: me
            });
        },
        'mouseout': function (e) {
            me.tree.trigger({
                type: 'dropout',
                node: me
            });
        }
    }).
    appendTo(this.line);




    $(document).bind({
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


    this.select = function () {
        this.isSelected = true;
        $(this.caption).addClass('selected');
    };

    this.unselect = function () {
        this.isSelected = false;
        $(this.caption).removeClass('selected');
    };

    this.getContainer = function () {
        return this.container;
    };

    this.position = function (div) {
        return $(div).offset();
    }



    this.mover = (function () {
        var active = false;
        var x = 0;
        var y = 0;
        var left = 0;
        var top = 0;

        var div = null;

        function createDiv() {
            var control = jQuery('<div/>', {
                id: me.key,
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
                id: me.key + '_name_textbox',
                'class': 'edit-name'
            }).
            css({
                'visibility': 'hidden'
            }).
            bind({
                'keydown': function (e) {
                    if (e.which === 13) {
                        var value = $(this).val();
                        var validation = validateName(value);
                        if (validation === true) {
                            applyNewName(value);
                        }
                    } else if (e.which === 27) {
                        _escape();
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
            me.name = name;
            $(me.caption).html(name);
            _escape();
            me.tree.trigger({
                'type': 'rename',
                'node': me,
                'name': name
            });
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
            }
        }

    })();


    this.sortNodes = function () {
        if (Object.keys(this.nodes).length > 1) {

            var nodes = [];
            for (var key in this.nodes) {
                if (this.nodes.hasOwnProperty(key)) {
                    nodes.push(this.nodes[key]);
                }
            }
            nodes.sort(function (obj1, obj2) {
                return (obj1.name < obj2.name ? -1 : 1);
            });

            for (var i = nodes.length - 1; i > 0; i--) {
                $(nodes[i].mainContainer).before($(nodes[i-1].mainContainer));
                //$(this.nodes[i].mainContainer).before($(this.nodes[i - 1].mainContainer));
            }

        } else {
            alert('not sort');
        }
    };

}

TreeNode.prototype.loadData = function (data) {

    if (data.length === 0) {
        this.expander.setExpandableStatus(false);
    } else {
        this.expander.setExpandableStatus(true);
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                var item = data[key];
                var node = new TreeNode(this.tree, item.key, item.caption, this, item.expanded);
                node.loadData(item.items);
                this.nodes[key] = node;
            }
        }

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
        this.isSelected = false;
    } else {
        if (!this.isRoot()) {
            this.parent.removeNode(this);
            destination.addNode(this);
        }
    }
}
TreeNode.prototype.removeNode = function (node) {
    delete this.nodes[node.getKey()];
}
TreeNode.prototype.addNode = function (node) {
    this.nodes[node.getKey()] = node;
    node.moveTo(this);
    this.sortNodes();
    this.resetStatus();
}
TreeNode.prototype.moveTo = function (newParent) {
    this.mainContainer.appendTo($(newParent.getContainer()));
}
TreeNode.prototype.isRoot = function () {
    return (this.parent.hasOwnProperty('isNode') ? false : true);
}
TreeNode.prototype.isNode = function () {
    return true;
}
TreeNode.prototype.resetStatus = function () {
    if (Object.keys(this.nodes).length > 0) {
        this.expander.setExpandableStatus(true);
    } else {
        this.expander.setExpandableStatus(false);
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

//for (var key in p) {
//    if (p.hasOwnProperty(key)) {
//        alert(key + " -> " + p[key]);
//    }
//}
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
                                    { key: 211, caption: 'baa', expanded: true, items: [] },
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
    this.nodes = {};
    this.events = jQuery('<div/>', {
        'class': 'events-container'
    }).appendTo(this.container);


    this.getContainer = function () {
        return this.container;
    }

    this.root = new TreeNode('root', 'root', me, true);
    this.root.loadData(data);

}



function TreeNode(key, name, parent, expanded) {
    var me = this;
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
                alert('change name');
                me.unselect();
                me.mouseClicked = false;
                e.preventDefault;
            }
        },
        'mouseup': function (e) {
            if (me.mouseClicked) {
                me.select();
            }
            me.mouseClicked = false;
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
            me.mouseClicked = false;
        }
    });


    //this.nameTextBox = jQuery('<input>', {
    //    id: key,
    //    html: caption
    //}).
    //appendTo(this.line);


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
        var ready = false;
        var active = false;
        var x = 0;
        var y = 0;
        var left = 0;
        var top = 0;

        var div = jQuery('<div/>', {
            id: me.key,
            'class': 'move',
            html: me.name
        }).
        css({
            'visibility': 'hidden'
        }).
        appendTo(me.mainContainer);


        function activate(left, top) {
            active = true;
            show(div);
            x = left;
            y = top;
            moveDiv($(me.caption).offset());
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
                }
                _move(e);
            },
            isActive: function () {
                return active;
            }
        }

    })();



}

TreeNode.prototype.loadData = function (data) {

    if (data.length === 0) {
        this.expander.setExpandableStatus(false);
    } else {
        this.expander.setExpandableStatus(true);
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                var item = data[key];
                var node = new TreeNode(key, item.caption, this, item.expanded);
                node.loadData(item.items);
                this.nodes[key] = node;
            }
        }

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
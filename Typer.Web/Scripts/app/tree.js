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
                            { key: 21, caption: 'ba', expanded: true, items: [] },
                            { key: 22, caption: 'bb', expanded: true, items: [] }
                        ]
                    },
                    {
                        key: 3,
                        caption: 'c',
                        expanded: true,
                        items: []
                    },
                    {
                        key: 4,
                        caption: 'd',
                        expanded: true,
                        items: [
                            {
                                key: 41, caption: 'da', expanded: true, items: [
                                    { key: 411, caption: 'daa', expanded: true, items: [] },
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
});

function TreeView(container, selectable) {
    var me = this;
    this.container = container;
    this.selectable = selectable;
    this.nodes = {};

    this.getContainer = function () {
        return this.container;
    }

    this.root = new TreeNode('root', 'root', me);
    this.root.loadData(data);

}



function TreeNode(key, caption, parent, expanded) {
    var me = this;
    this.key = key;
    this.caption = caption;
    this.parent = parent;
    this.expanded = expanded;
    this.nodes = {};

    this.mainContainer = jQuery('<div/>', {
        id: key + '_container',
        'class': 'node-container'
    }).appendTo($(this.parent.getContainer()));

    this.line = jQuery('<div/>', {
        id: key,
        'class': 'line',
        html: caption
    }).appendTo(this.mainContainer);

    this.expandButton = jQuery('<div/>', {
        id: key + '_expand-collapse-button',
        'class': 'icon ' + (me.expanded ? 'collapse' : 'expand'),
        html: me.expanded ? '-' : '+'
    }).appendTo(this.line);

    //this.dots = jQuery('<div/>', {
    //    id: key + '_dots',
    //    'class': 'dots'
    //}).appendTo(this.line);

    this.container = jQuery('<div/>', {
        id: key,
        'class': 'children-container'
    }).appendTo(this.mainContainer);

    this.getContainer = function () {
        return this.container;
    };
}

TreeNode.prototype.loadData = function (data) {

    if (data.length === 0) {
        hide(this.expandButton);
    } else {
        show(this.expandButton);

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

//for (var key in p) {
//    if (p.hasOwnProperty(key)) {
//        alert(key + " -> " + p[key]);
//    }
//}
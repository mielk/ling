$(function () {

    var treeProperties = {
        'mode': MODE.SINGLE,
        'root': my.categories.getRoot(),
        'blockOtherElements': false,
        'showSelection': false,
        'hidden': false,
        'container': $('#categories-tree')[0]
    };

    my.categories.tree = new TreeView(treeProperties);

    my.categories.tree.bind({
        newNode: function (e) {
            my.categories.addNew(e.node);
        },
        'delete': function (e) {
            my.categories.remove(e.node);
        },
        rename: function (e) {
            my.categories.updateName(e.node, e.prevName);
        },
        transfer: function (e) {
            my.categories.updateParent(e.node, e.to);
        }
    });
    
});
my.categories = my.categories || {
    root: getRoot()
}

function getRoot(){
    var root;

    $.ajax({
        url: "/Categories/GetCategories",
        type: "GET",
        datatype: "json",
        async: false,
        success: function (result) {
            root = result;
        },
        error: function (msg) {
            alert(msg.status + " | " + msg.statusText);
        }
    });

    return categoryToTreeItem(root);

}


function categoryToTreeItem(category) {

    var children = [];
    for (var i = 0; i < category.children.length; i++) {
        children[i] = categoryToTreeItem(category.children[i]);
    }

    return {
        key: category.Id,
        caption: category.Name,
        expanded: true,
        items: children
    }

}



$(function () {

    var treeProperties = {
        'mode': MODE.SINGLE,
        'data': my.categories.root.items,
        'blockOtherElements': false,
        'showSelection': false,
        'hidden': false,
        'container': $('#categories-tree')[0]
    };

    my.categories.tree = new TreeView(treeProperties);

    my.categories.tree.bind({
        newNode: function (e) {
            $.notify('New node created | Name: ' + e.node.caption + ' | Parent: ' + e.parentId);
        },
        'delete': function (e) {
            $.notify('Node ' + e.node.caption + ' has been removed');
        },
        rename: function (e) {
            $.notify('Node ' + e.prevName + ' changed name to ' + e.node.name);
        },
        transfer: function (e) {
            $.notify('Node ' + e.node.name + ' has been moved to ' + e.to.name);
        }
    });

    //newNode: [node], [parentId]
    //delete: [node]
    //rename: [node], [name]
    //tranfer: [node], [to]
    
});
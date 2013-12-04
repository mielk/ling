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
            _notify('New node created | Name: ' + e.node.caption + ' | Parent: ' + e.parentId, true);
        },
        'delete': function (e) {
            _notify('Node ' + e.node.caption + ' has been removed', true);
        },
        rename: function (e) {
            dbOperation({
                functionName: 'UpdateName',
                data: {
                    'id': e.node.key,
                    'name': e.node.name,
                },
                success: 'Category ' + e.prevName + ' changed its name to ' + e.node.name,
                error: 'Error when trying to change category name from ' + e.prevName + ' to ' + e.node.name
            });
        },
        transfer: function (e) {
            dbOperation({
                functionName: 'UpdateName',
                data: {
                    'id': e.node.key,
                    'name': e.node.name,
                },
                success: 'Category ' + e.node.name + ' has been moved to changed its name to ' + e.node.name,
                error: 'Error when trying to change category name from ' + e.prevName + ' to ' + e.node.name
            });
            _notify('Node ' + e.node.name + ' has been moved to ' + e.to.name, true);
        }
    });
    
});

function _notify(msg, success){
    my.notify.options.className = (success ? 'success' : 'error');
    $.notify(msg, my.notify.options);
}



function dbOperation(properties) {
    $.ajax({
        url: "/Categories/" + properties.functionName,
        type: "POST",
        data: properties.data,
        datatype: "json",
        async: false,
        success: function (result) {
            _notify(result ? properties.success : properties.error, result);
        },
        error: function (msg) {
            _notify(properties.error, false);
        }
    });

}
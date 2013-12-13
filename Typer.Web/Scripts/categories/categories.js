my = my || {};

function Category(parent, properties) {
    var me = this;
    this.key = properties.key;
    this.name = properties.name;
    this.parent = parent;
    this.expanded = true;
    this.children = {};
    this.items = function() {
        return my.array.objectToArray(me.children);
    };
    this.loadChildren(properties.children);
}
Category.prototype.addChild = function(category) {
    this.children[category.key] = category;
};
Category.prototype.removeChild = function(category) {
    delete this.children[category.key ? category.key : category];
};
Category.prototype.loadChildren = function(children) {
    for (var i = 0; i < children.length; i++) {
        var child = children[i];
        var category = new Category(this, categoryProperties(child));
        // ReSharper disable once PossiblyUnassignedProperty
        this.addChild(category);
    }
};


function categoryProperties(properties) {
    return {        
        key: properties.Id,
        name: properties.Name,
        parentId: properties.ParentId,
        children: properties.children
    };
}


my.categories = (function () {
    var root;

    function loadRoot() {
        var $root;
        $.ajax({
            url: "/Categories/GetCategories",
            type: "GET",
            datatype: "json",
            async: false,
            success: function (result) {
                $root = result;
            },
            error: function (msg) {
                alert(msg.status + " | " + msg.statusText);
            }
        });

        return new Category(null, categoryProperties($root));

    }

    function dbOperation(properties) {
        $.ajax({
            url: "/Categories/" + properties.functionName,
            type: "POST",
            data: properties.data,
            datatype: "json",
            async: false,
            success: function (result) {
                my.notify.display(result ? properties.success : properties.error, result);
                if (properties.callback) {
                    properties.callback(result);
                }
            },
            error: function (msg) {
                my.notify.display(properties.error + ' (' + msg.status + ')', false);
                properties.callback(false);
            }
        });
    }

    return {
        getRoot: function() {
            if (!root) {
                root = loadRoot();
            }
            return root;
        },
        updateName: function (e) {
            dbOperation({
                functionName: 'UpdateName',
                data: {
                    'id': e.node.key,
                    'name': e.name,
                },
                success: 'Category ' + e.previous + ' changed its name to ' + e.name,
                error: 'Error when trying to change category name from ' + e.previous + ' to ' + e.name,
                // ReSharper disable once UnusedParameter
                callback: function($e) {
                    e.node.object.name = e.node.name;
                }
            });

        },
        updateParent: function(e) {
            dbOperation({
                functionName: 'UpdateParentId',
                data: {
                    'id': e.node.key,
                    'parentId': e.to.key,
                },
                success: 'Category ' + e.node.name + ' has been moved to ' + e.to.name,
                error: 'Error when trying to move category ' + e.node.name + ' to ' + e.to.name,
                // ReSharper disable once UnusedParameter
                callback: function() {
                    e.node.object.parent = e.to;
                }
            });
        },
        remove: function(e) {
            dbOperation({
                functionName: 'RemoveCategory',
                data: {
                    'id': e.node.key,
                },
                success: 'Category ' + e.node.name + ' has been removed',
                error: 'Error when trying to remove category ' + e.node.name
            });
        },
        addNew: function (e) {
            var node = e.node;
            dbOperation({
                functionName: 'AddCategory',
                data: {
                    'name': node.name,
                    'parentId': node.parent.key
                },
                success: 'Category ' + node.name + ' has been added',
                error: 'Error when trying to add new category',
                callback: function(key) {
                    if (key === false) {
                        node.cancel();
                    } else {
                        node.key = key;
                        node.object = {
                            key: key,
                            name: node.name,
                            parentId: node.parent.key
                        };
                        node.parent.addNode(node);
                    }
                }
            });
        }
    };

})();
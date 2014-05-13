my = my || {};

function Category(parent, properties) {
    var me = this;
    this.Category = true;
    this.key = properties.key;
    this.name = properties.name;
    this.parent = parent;
    this.expanded = true;
    this.children = {};
    this.items = function () {
        return my.array.objectToArray(me.children);
    };
    
    this.loadChildren(properties.children);
    my.categories.addToFlyweight(this);
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
Category.prototype.path = function() {
    if (!this.parent) return '';
    var parentPath = this.parent.path();
    return parentPath + (parentPath ? ' > ' : '') + this.name;
};
Category.prototype.getDescendants = function () {
    var array = [];
    var counter = 0;
    for (var key in this.children) {
        if (this.children.hasOwnProperty(key)) {
            var child = this.children[key];
            var descendants = child.getDescendants();
            for (var i = 0; i < descendants.length; i++) {
                array[counter++] = descendants[i];
            }
        }
    }
    array[counter++] = this;
    return array;
};


function categoryProperties(properties) {
    return {        
        key: properties.Id,
        name: properties.Name,
        parentId: properties.ParentId,
        children: properties.Children
    };
}



my.categories = my.categories || (function () {
    var root;
    var flyweight = new HashTable(null);

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
            cache: false,
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

    function getCategory(id) {
        if (!root) {
            root = loadRoot();
        }
        return flyweight.getItem(id);
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
                callback: function() {
                    e.node.object.name = e.name;
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
                error: 'Error when trying to remove category ' + e.node.name,
                callback: function () {

                }
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
                        var category = new Category(node.parent.object, {
                            key: key,
                            name: node.name,
                            children: {}
                        });
                        node.object = category;
                        node.parent.object.addChild(category);
                    }
                }
            });
        },
        addToFlyweight: function (category) {
            flyweight.setItem(category.key, category);
        },
        getCategory: function (id) {
            return getCategory(id);
        },
        getCategories: function (objects) {

            if (!objects || !objects.length) return [];

            var categories = [];
            for (var i = 0; i < objects.length; i++) {
                var object = objects[i];
                var id = object.id || object.key || 0;
                var category = getCategory(id);
                if (category) {
                    categories.push(category);
                }
            }
            return categories;
        },
        toString: function (categories) {
                var categoriesString = '';
                for (var i = 0; i < categories.length; i++) {
                    var category = categories[i];
                    categoriesString += (categoriesString ? ' | ' : '');
                    categoriesString += category.path();
                }
                return categoriesString;
        },
        toIntArray: function (categories) {
            var array = [];
            for (var i = 0; i < categories.length; i++) {
                var category = categories[i];
                var descendants = category.getDescendants();
                for (var j = 0; j < descendants.length; j++) {
                    var item = descendants[j];
                    array.push(item.key);
                }
            }
            return array;
        }
    }; 

})();

$(function () {
    var controller = new CategoryViewController();
    controller.start();
});


function CategoryViewController() {
    var me = this;
    
    this.treeContainer = $('#categories-tree')[0];
    //Start only for Categories view.
    if (!this.treeContainer) return;
    

    this.tree = new Tree({
        container: me.treeContainer,
        mode: MODE.NONE,
        root: my.categories.getRoot(),
        expandWhenAddingNewNode: true,
        doubleClickDelay: 500
    });
    this.tree.show();
    this.tree.bind({
        confirm: function(e) {
            me.select(e.item);
        },
        add: function (e) {
            my.categories.addNew(e);
        },
        remove: function (e) {
            my.categories.remove(e);
        },
        rename: function (e) {
            my.categories.updateName(e);
        },
        transfer: function (e) {
            my.categories.updateParente(e);
        }
    });

    this.selected = null;
    
    //UI components.
    this.selectedPanel = $('#selected-category')[0];
    this.filter = new CategoryFilterPanel(this);

}
CategoryViewController.prototype.start = function() {

};
CategoryViewController.prototype.select = function(category) {
    this.selected = category;
    $(this.selectedPanel).html(category.path(true));
};


function CategoryFilterPanel(controler) {
    var me = this;
    this.controler = controler;
    this.container = $('#category-options')[0];
    //this.container = jQuery('<div/>').css({ 'position': 'relative' }).appendTo($(this.parent));
    this.filterManager = new FilterManager({
        container: me.container,
        visible: true,
        collapser: true,
        weight: true,
        text: true,
        type: true,
        wordtype: true
    }).bind({
        filter: function (e) {
            alert(e);
        }
    });


}
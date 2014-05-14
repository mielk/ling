/*
 * Categories
 *
 * Date: 2014-05-14 11:29
 *
 */

$(function () {

    'use strict';

    var categories = (function () {
        var root;
        var flyweight = mielk.hashTable();

        function load() {
            mielk.db.fetch('Categories', 'GetCategories', {}, {
                async: true,
                cache: false,
                callback: function (result) {
                    root = new Category(null, categoryProperties(result));
                }
            });
        }


        //Returns the root object of this categories collection.
        function getRoot() {
            if (!root) load();
            return root;
        }
            

        //Returns a category with the specified index number.
        function getCategory(id) {
            if (!root) {
                root = load();
            }
            return flyweight.getItem(id);
        }

        //Convert given objects array into the collection of underlying categories. 
        //Given array can contain IDs only or other type of objects
        //having [id] or [key] property consistent with categories ids.
        function getCategories(objects) {

            if (!objects || !objects.length) return [];

            var $categories = [];
            for (var i = 0; i < objects.length; i++) {
                var object = objects[i];
                var id = object.id || object.key || object || 0;
                var category = getCategory(id);
                if (category) {
                    $categories.push(category);
                }
            }
            return categories;
        }
        

        //Returns a string representing this categories collection.
        //Each category is presented as its full path containing
        //this category and all its parents.
        function toString($categories) {
            var categoriesString = '';
            for (var i = 0; i < $categories.length; i++) {
                var category = $categories[i];
                categoriesString += (categoriesString ? ' | ' : '');
                categoriesString += category.path();
            }
            return categoriesString;
        }
        

        //Returns an array of categories Ids.
        function toIntArray($categories) {
            var array = [];
            for (var i = 0; i < $categories.length; i++) {
                var category = $categories[i];
                var descendants = category.getDescendants();
                for (var j = 0; j < descendants.length; j++) {
                    var item = descendants[j];
                    array.push(item.key);
                }
            }
            return array;
        }


        //Add a given category to the 'flyweight' collection.
        function addToFlyweight(category) {
            flyweight.setItem(category.key, category);
        }



        //function dbOperation(properties) {
        //    $.ajax({
        //        url: "/Categories/" + properties.functionName,
        //        type: "POST",
        //        data: properties.data,
        //        datatype: "json",
        //        async: false,
        //        success: function (result) {
        //            
        //            if (properties.callback) {
        //                properties.callback(result);
        //            }
        //        },
        //        error: function (msg) {
        //            my.notify.display(properties.error + ' (' + msg.status + ')', false);
        //            properties.callback(false);
        //        }
        //    });
        //}
        
        //DB OPERATIONS
        function updateName(e) {
            var successMessage = 'Category ' + e.previous + ' changed its name to ' + e.name;
            var errorMessage = 'Error when trying to change category name from ' + e.previous + ' to ' + e.name;

            mielk.db.fetch('Categories', 'UpdateName', {
                  'id': e.node.key
                , 'name': e.name
            }, {
                async: true,
                callback: function (result) {
                    mielk.notify.display(result ? successMessage : errorMessage, result);
                    e.node.object.name = e.name;
                },
                errorCallback: function() {
                    mielk.notify.display(errorMessage);
                }
            });
            
        }
        
        function updateParent(e) {
            var successMessage = 'Category ' + e.node.name + ' has been moved to ' + e.to.name;
            var errorMessage = 'Error when trying to move category ' + e.node.name + ' to ' + e.to.name;

            mielk.db.fetch('Categories', 'UpdateParentId', {
                  'id': e.node.key
                , 'parentId': e.to.key
            }, {
                async: true,
                callback: function (result) {
                    mielk.notify.display(result ? successMessage : errorMessage, result);
                    e.node.object.parent = e.to;
                },
                errorCallback: function() {
                    mielk.notify.display(errorMessage);
                }
            });
            
        }
        
        function remove(e) {
            var successMessage = 'Category ' + e.node.name + ' has been removed';
            var errorMessage = 'Error when trying to remove category ' + e.node.name;

            mielk.db.fetch('Categories', 'RemoveCategory', {
                'id': e.node.key
            }, {
                async: true,
                callback: function (result) {
                    mielk.notify.display(result ? successMessage : errorMessage, result);
                    e.node.object.parent = e.to;
                },
                errorCallback: function () {
                    mielk.notify.display(errorMessage);
                }
            });

        }
        
        function addNew(e) {
            var node = e.node;
            var successMessage = 'Category ' + node.name + ' has been added';
            var errorMessage = 'Error when trying to add new category';

            mielk.db.fetch('Categories', 'AddCategory', {
                  'name': node.name
                , 'parentId': node.parent.key
            }, {
                async: true,
                callback: function (key) {
                    mielk.notify.display(key ? successMessage : errorMessage, key ? true : false);
                    
                    if (key === false) {
                        node.cancel();
                    } else {
                        node.key = key;
                        node.object = createNewCategory(node.parent.object, key, node.name);
                    }

                },
                errorCallback: function () {
                    mielk.notify.display(errorMessage);
                }
            });

        }
        

        function createNewCategory(parent, key, name) {
            var category = new Category(parent, {
                key: key,
                name: name,
                children: {}
            });
            parent.addChild(category);
            return category;
        }


        return {
              load: load
            , getRoot: getRoot
            , updateName: updateName
            , updateParent: updateParent
            , remove: remove
            , addNew: addNew
            , addToFlyweight: addToFlyweight
            , getCategory: getCategory
            , getCategories: getCategories
            , toString: toString
            , toIntArray: toIntArray
            
        };

    })();



    // ReSharper disable once InconsistentNaming // Class name
    function Category(parent, properties) {
        var self = this;
        
        //Class signature.
        self.Category = true;
        
        //Instance properties.
        self.key = properties.key;
        self.name = properties.name;
        self.parent = parent;
        self.expanded = true;
        self.children = {};
        self.items = function () {
            return mielk.arrays.fromObject(self.children);
        };

        (function initialize() {
            self.loadChildren(properties.children);
            categories.addToFlyweight(self);
        })();

    }
    Category.prototype = {        
        addChild: function(category) {
            this.children[category.key] = category;
        },
        removeChild: function (category) {
            delete this.children[category.key ? category.key : category];
        },
        loadChildren: function (children) {
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                var category = new Category(this, categoryProperties(child));
                // ReSharper disable once PossiblyUnassignedProperty
                this.addChild(category);
            }
        },
        path: function () {
            if (!this.parent) return '';
            var parentPath = this.parent.path();
            return parentPath + (parentPath ? ' > ' : '') + this.name;
        },
        getDescendants: function () {
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
        }
    };


    function categoryProperties(properties) {
        return {        
            key: properties.Id,
            name: properties.Name,
            parentId: properties.ParentId,
            children: properties.Children
        };
    }


    // Expose ling to the global object
    LING.CATEGORIES = categories;
    
    // Initialize categories collection.
    categories.load();

});


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
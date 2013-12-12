my = my || {};


$(function () {

    //var container = $('#category-options')[0];
    //var searchData = [
    //    //{ name: 'Europe', countries: ['Polska', 'Albania', 'Luksemburg'] },
    //    //{ name: 'South America', countries: ['Brazil', 'Venezuela', 'Argentina'] },
    //    { name: '7p5C3Z1LORy69e8' },
    //    { name: 'iRaLmh2xovulIoL' },
    //    { name: 'eruKPXbNhhQ619Q' },
    //    { name: '76qVT7AFybcG388' },
    //    { name: 'r5T8W8PdI1oG0qR' },
    //    { name: 'h4Y4Aeibql6TcYO' },
    //    { name: '22JoC7Sg6b75QGA' },
    //    { name: 'yby12QFLqzkWn0m' },
    //    { name: 'oMz6jSb7DnExDc5' },
    //    { name: 'h2wk50JG7B4083q' },
    //    { name: 'jW9sor390vun1oJ' },
    //    { name: '7E4UtMC51G7wyOB' },
    //    { name: 'vt9EVQ8NdQs1AGK' },
    //    { name: 'hzU3a9l48QIiRss' },
    //    { name: 'adVD1N6529ywvE6' },
    //    { name: 'xP7DGjI88F1lCU6' },
    //    { name: 'S6EZj4Ifx0iUDSg' },
    //    { name: '2T6jnUM692eQmC8' },
    //    { name: '174h642GQ7AUIm0' },
    //    { name: 'S7HtTffyH4M4Nif' },
    //    { name: '6QkU8iuw6nYlFE0' },
    //    { name: '2Np3Ar5vZ8ax249' },
    //    { name: 'fJalChxzB4cT773' },
    //    { name: '815Cg1lEZ4U0RoW' },
    //    { name: '5pQPKF254YO0hQW' },
    //    { name: '22Nh5opzCl8FAwZ' },
    //    { name: '2yQ6PEn6lGE6HCs' },
    //    { name: 'c584S0qKSJC68u4' },
    //    { name: '78PcV1BH4bcIe77' },
    //    { name: '204Ha4QEeb748GC' },
    //    { name: '9gmb10VHpjI097a' },
    //    { name: '8sKB2Wn5e6m623a' },
    //    { name: 'rUvxjznyGMSzh2P' },
    //    { name: 'FvJgN2rJgROuP6e' },
    //    { name: 'R5jMRwDXulm3rii' },
    //    { name: 'qVzr7S4sqWWPrWP' },
    //    { name: 'EKi9YUR5VGkA5aj' },
    //    { name: 'Fp2G0ET5iHkCkah' },
    //    { name: 'tDzQETUq125iE6r' },
    //    { name: '49523o3vddgPbk1' }
    //];
    //var dropdown = new DropDown({
    //    container: container,
    //    caption: 'Select option ...',
    //    data: searchData
    //});
    //dropdown.activate();


    //var test = (function () {
    //    var _listener = jQuery('<div/>').appendTo($(document.body));
    //    return {
    //        bind: function (e) {
    //            $(_listener).bind(e);
    //        },
    //        trigger: function (e) {
    //            $(_listener).trigger(e);
    //        },
    //    }
    //})();


    //var a = (function () {
    //    test.bind({
    //        'click': function (e) {
    //            alert('a');
    //            e.active = false;
    //        }
    //    });
    //})();


    //var b = (function () {
    //    test.bind({
    //        'click': function (e) {
    //            if (e.active !== false) {
    //                alert('b');
    //            }
    //        }
    //    });
    //})();

    //test.trigger({
    //    'type': 'click'
    //});

    //alert('end');

});

my.categories = (function () {
    var root;

    function category(parent, properties) {
        var me = this;
        var _key = properties.Id;
        var _name = properties.Name;
        var _parent = parent;
        var _expanded = true;
        var _children = {};
        var _events = (function () {
            var _listener = {};
            $(_listener).bind({
                'add': function () {

                },
                'remove': function () {
                    
                }
            });
            return {
                bind: function (e) {
                    $(_listener).bind(e);
                },
                trigger: function (e) {
                    $(_listener).trigger(e);
                }
            }
        })();

        (function createChildrenCollection() {
            for (var i = 0; i < properties.children.length; i++) {
                var _category = category(me, properties.children[i]);
                _children[_category.key()] = _category;
            }
        })();

        return {
            object: this,
            key: function () {
                return _key;
            },
            name: function () {
                return _name;
            },
            parent: function () {
                return _parent;
            },
            items: function () {
                return my.array.objectToArray(_children);
            },
            expanded: function () {
                return _expanded;
            },
            addChild: function (category) {
                _children[category.key()] = category;
            },
            removeChild: function (key) {
                delete _children[key];
            },
            events: function () {
                return _events;
            }
        }

    }

    function _loadRoot() {
        var _root;
        $.ajax({
            url: "/Categories/GetCategories",
            type: "GET",
            datatype: "json",
            async: false,
            success: function (result) {
                _root = result;
            },
            error: function (msg) {
                alert(msg.status + " | " + msg.statusText);
            }
        });

        return category(null, _root);

    }

    function _dbOperation(properties) {
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
                my.notify.display(properties.error, false);
                properties.callback(false);
            }
        });
    }

    return {
        getRoot: function () {
            if (!root) {
                root = _loadRoot();
            }
            return root;
        },
        updateName: function (node, prevName) {
            _dbOperation({
                functionName: 'UpdateName',
                data: {
                    'id': node.key,
                    'name': node.name,
                },
                success: 'Category ' + prevName + ' changed its name to ' + node.name,
                error: 'Error when trying to change category name from ' + prevName + ' to ' + node.name,
                callback: function (e) {
                    node.object.name = node.name;
                }
            });

        },
        updateParent: function (node, to) {
            _dbOperation({
                functionName: 'UpdateParentId',
                data: {
                    'id': node.key,
                    'parentId': to.key,
                },
                success: 'Category ' + node.name + ' has been moved to ' + to.name,
                error: 'Error when trying to move category ' + node.name + ' to ' + to.name,
                callback: function (e) {
                    node.object.parent = to;
                }
            });
        },
        remove: function (node) {
            _dbOperation({
                functionName: 'RemoveCategory',
                data: {
                    'id': node.key,
                },
                success: 'Category ' + node.name + ' has been removed',
                error: 'Error when trying to remove category ' + node.name
            });
        },
        addNew: function (node) {
            _dbOperation({
                functionName: 'AddCategory',
                data: {
                    'name': node.name,
                    'parentId': node.parent.key
                },
                success: 'Category ' + node.name + ' has been added',
                error: 'Error when trying to add new category',
                callback: function (key) {
                    if (key === false) {
                        node.cancel();
                    } else {
                        node.key = key;
                        node.object = {
                            key: key,
                            name: node.name,
                            parentId: node.parent.key
                        }
                        node.parent.addNode(node);
                    }
                }
            });
        }
    }

})();

//$(function () {

//    //var test = (function () {
//    //    var _listener = {};
//    //    return {
//    //        bind: function (e) {
//    //            $(_listener).bind(e);
//    //        },
//    //        trigger: function (e) {
//    //            $(_listener).trigger(e);
//    //        }
//    //    }
//    //})();

//    //(function () {
        
//    //    test.bind({
//    //        'a b': function () {
//    //            alert('a b');
//    //        },
//    //        'a': function () {
//    //            alert('a');
//    //        },
//    //        'b': function () {
//    //            alert('b');
//    //        }
//    //    });

//    //    test.trigger({
//    //        'type': 'a'
//    //    });

//    //})();


//    var treeProperties = {
//        'mode': MODE.MULTI,
//        'root': my.categories.getRoot(),
//        'blockOtherElements': false,
//        'showSelection': false,
//        'hidden': false,
//        'container': $('#categories-tree')[0]
//    };

//    my.categories.tree = new TreeView(treeProperties);

//    my.categories.tree.bind({
//        newNode: function (e) {
//            my.categories.addNew(e.node);
//        },
//        'delete': function (e) {
//            my.categories.remove(e.node);
//        },
//        rename: function (e) {
//            my.categories.updateName(e.node, e.oldName);
//        },
//        transfer: function (e) {
//            my.categories.updateParent(e.node, e.to);
//        }
//    });
    
//});
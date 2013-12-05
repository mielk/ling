$(function () {

    var test = (function () {
        var _listener = {};
        return {
            bind: function (e) {
                $(_listener).bind(e);
            },
            trigger: function (e) {
                $(_listener).trigger(e);
            }
        }
    })();

    (function () {
        
        test.bind({
            'a b': function () {
                alert('a b');
            },
            'a': function () {
                alert('a');
            },
            'b': function () {
                alert('b');
            }
        });

        test.trigger({
            'type': 'a'
        });

    })();


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
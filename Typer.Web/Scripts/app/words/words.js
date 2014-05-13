my.words = my.words || (function () {

    function dbOperation(properties) {
        $.ajax({
            url: "/Words/" + properties.functionName,
            type: "POST",
            data: properties.data,
            datatype: "json",
            async: false,
            traditional: properties.traditional || false,
            success: function (result) {
                my.notify.display(result ? properties.success : properties.error, result);
                if (properties.callback) {
                    properties.callback(result);
                }
            },
            error: function (msg) {
                my.notify.display(properties.error + ' (' + msg.status + ')', false);
                if (properties.callback) {
                    properties.callback(false);
                }
            }
        });
    }

    return{
        nameAlreadyExists: function (id, name) {
            var nameExists = true;
            $.ajax({
                url: '/Words/CheckName',
                type: "GET",
                data: {
                    'id': id,
                    'name': name
                },
                datatype: "json",
                async: false,
                cache: false,
                success: function (result) {
                    nameExists = (result.IsExisting === true);
                },
                error: function (msg) {
                    alert("[register.js::nameAlreadyExists] " + msg.status + " | " + msg.statusText);
                }
            });

            return nameExists;

        },
        updateCategory: function (e) {
            var categoriesIds = [];
            var categoriesNames = '';
            for (var key in e.items) {
                if (e.items.hasOwnProperty(key)) {
                    var category = e.items[key];
                    categoriesIds.push(category.key);
                    categoriesNames += (categoriesNames ? ', ' : '') + category.object.path();
                }
            }

            dbOperation({
                functionName: 'UpdateCategories',
                data: {
                    'id': e.word.id,
                    'categories': categoriesIds
                },
                traditional: true,
                success: 'Categories ' + categoriesNames + ' have been assigned to word ' + e.word.name,
                error: 'Error when trying to assign the given categories to word ' + e.word.name,
                // ReSharper disable once UnusedParameter
                callback: e.callback
            });

        },
        activate: function(e) {
            dbOperation({                
                functionName: 'Activate',
                data: { 'id': e.id },
                success: 'Word ' + e.name + ' has been activated',
                error: 'Error when trying to activate word ' + e.name,
                callback: e.callback
            });
        },
        deactivate: function(e) {
            dbOperation({
                functionName: 'Deactivate',
                data: { 'id': e.id },
                success: 'Word ' + e.name + ' has been deactivated',
                error: 'Error when trying to deactivate word ' + e.name,
                callback: e.callback
            });
        },
        updateWeight: function(e) {
            dbOperation({
                functionName: 'UpdateWeight',
                data: {
                    'id': e.id,
                    'weight': e.weight
                },
                success: 'Word ' + e.name + ' has changed its weight to ' + e.weight,
                error: 'Error when trying to change the weight of the word ' + e.name,
                callback: e.callback
            });
        },
        update: function (e) {
            dbOperation({
                functionName: 'Update',
                data: {
                    'id': e.word.id,
                    'name': e.name,
                    'weight': e.weight,
                    'categories': e.categories,
                    'wordtype': e.wordtype,
                    'removed': e.removed,
                    'edited': e.edited,
                    'added': e.added,
                    'properties': e.properties,
                    'forms': e.details
                },
                traditional: true,
                success: 'Word ' + e.word.name + ' has been updated',
                error: 'Error when trying to update the word ' + e.word.name,
                callback: e.callback
            });
        },
        add: function (e) {
            dbOperation({
                functionName: 'Add',
                data: {
                    'name': e.name,
                    'weight': e.weight,
                    'categories': e.categories,
                    'wordtype': e.wordtype,
                    'added': e.added,
                    'properties': e.properties
                }, traditional: true,
                success: 'Word ' + e.name + ' has been added',
                error: 'Error when trying to add the word ' + e.name,
                callback: e.callback
            });
        },
        getWords: function (id, languages) {
            var words;
            $.ajax({
                url: '/Words/GetWords',
                type: "GET",
                data: {
                    'id': id,
                    'languages': languages
                },
                datatype: "json",
                async: false,
                cache: false,
                traditional: true,
                success: function (result) {
                    words = result;
                },
                error: function (msg) {
                    alert("[register.js::nameAlreadyExists] " + msg.status + " | " + msg.statusText);
                }
            });

            return words;

        }
    };

})();

$(function () {
    //var controller = new WordViewController({
    var manager = new WordListManager({
        pageItems: 10,
        currentPage: 1,
        columns: ['id', 'name', 'weight', 'type', 'categories'],
        filters: ['wordtype', 'weight', 'categories', 'text']
    });
    manager.start();
});
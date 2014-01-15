my.questions = my.questions || (function () {

    function dbOperation(properties) {
        $.ajax({
            url: "/Questions/" + properties.functionName,
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

    return {
        nameAlreadyExists: function (id, name) {
            var nameExists = true;
            $.ajax({
                url: '/Questions/CheckName',
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
                    'id': e.question.id,
                    'categories': categoriesIds
                },
                traditional: true,
                success: 'Categories ' + categoriesNames + ' have been assigned to question ' + e.question.name,
                error: 'Error when trying to assign the given categories to question ' + e.question.name,
                // ReSharper disable once UnusedParameter
                callback: e.callback
            });

        },
        activate: function (e) {
            dbOperation({
                functionName: 'Activate',
                data: { 'id': e.id },
                success: 'Question ' + e.name + ' has been activated',
                error: 'Error when trying to activate question ' + e.name,
                callback: e.callback
            });
        },
        deactivate: function (e) {
            dbOperation({
                functionName: 'Deactivate',
                data: { 'id': e.id },
                success: 'Question ' + e.name + ' has been deactivated',
                error: 'Error when trying to deactivate question ' + e.name,
                callback: e.callback
            });
        },
        updateWeight: function (e) {
            dbOperation({
                functionName: 'UpdateWeight',
                data: {
                    'id': e.id,
                    'weight': e.weight
                },
                success: 'Question ' + e.name + ' has changed its weight to ' + e.weight,
                error: 'Error when trying to change the weight of the question ' + e.name,
                callback: e.callback
            });
        },
        update: function (e) {
            dbOperation({
                functionName: 'Update',
                data: {
                    'id': e.question.id,
                    'name': e.name,
                    'weight': e.weight,
                    'categories': e.categories,
                    'removed': e.removed,
                    'edited': e.edited,
                    'added': e.added
                },
                traditional: true,
                success: 'Word ' + e.question.name + ' has been updated',
                error: 'Error when trying to update the word ' + e.question.name,
                callback: e.callback
            });
        },
        getOptions: function (id, languages) {
            var options;
            $.ajax({
                url: '/Questions/GetOptions',
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
                    options = result;
                },
                error: function (msg) {
                    alert("[register.js::nameAlreadyExists] " + msg.status + " | " + msg.statusText);
                }
            });

            return options;

        },
        getVariantSets: function (id, languages) {
            var sets;
            $.ajax({
                url: '/Questions/GetVariantSets',
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
                    sets = result;
                },
                error: function (msg) {
                    alert("[register.js::nameAlreadyExists] " + msg.status + " | " + msg.statusText);
                }
            });

            return sets;

        }
        
    };

})();

$(function () {
    var manager = new QuestionListManager({
        pageItems: 10,
        currentPage: 1,
        columns: ['id', 'name', 'weight', 'categories'],
        filters: ['weight', 'categories', 'text']
    });
    manager.start();
});
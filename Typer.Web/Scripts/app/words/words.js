/*
 * Words
 *
 * Date: 2014-05-14 14:11
 *
 */


function Word() {

    'use strict';

    var self = this;
    
    //Class signature.
    self.Word = true;
    
    //Instance properties.
    

}
Word.prototype = {
    

    setCategories: function(categories) {
        
    }
};




$(function () {

    'use strict';

    var words = (function () {

        //Funkcja sprawdzająca czy w bazie istnieje już wyraz o podanej nazwie.
        function nameAlreadyExists(id, name) {
            var error = dict.MetawordCheckIfNameExistsError.get([name]);

            mielk.db.fetch('Words', 'CheckName', {
                'id': id,
                'name': name
            }, {                
                async: false,
                cache: false,
                callback: function(result) {
                    return (result.IsExisting === true);
                },
                errorCallback: function() {
                    alert(error);
                }
            });

        }
        
        //Funkcja update'ująca kategorie dla danego wyrazu.
        function updateCategories(metaword, categories, callback) {            
            var categoriesIds = [];
            var categoriesNames = '';
            for (var key in categories) {
                if (categories.hasOwnProperty(key)) {
                    var category = categories[key];
                    categoriesIds.push(category.key);
                    categoriesNames += (categoriesNames ? ', ' : '') + category.object.path();
                }
            }

            //Insert to the DB.
            var success = dict.MetawordCategoryAssigned.get([metaword.name, categoriesNames]);
            var error = dict.MetawordCategoryAssignedError.get([metaword.name]);

            mielk.db.fetch('Words', 'UpdateCategories', {
                      'id': metaword.id
                    , 'categories': categoriesIds
                }, {                
                    async: true,
                    cache: false,
                    traditional: true,
                    callback: function (result) {
                        metaword.setCategories(categories);
                        mielk.notify.display(successMessage, true);
                        if (callback && typeof(callback) === 'function') {
                            callback(result);
                        }
                    },
                    errorCallback: function() {
                        mielk.notify.display(errorMessage, false);
                    }
                });
            
        }

        //Funkcja ustawiająca podany wyraz na aktywny.
        function activate(id, name, callback) {
            var success = dict.MetawordActivated.get([name]);
            var error = dict.MetawordActivatedError.get([name]);
            


        }

        activate: function(e) {
            dbOperation({                
                functionName: 'Activate',
                data: { 'id': e.id },
                success: 
                error: ',
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

        return {
              nameAlreadyExists: nameAlreadyExists
            , updateCategories: updateCategories
        };

    })();

    // Expose ling to the global object
    LING.WORDS = words;

});






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
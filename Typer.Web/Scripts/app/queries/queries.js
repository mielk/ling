/*
 * Queries
 *
 * Date: 2014-05-14 15:49
 *
 */

$(function () {

    'use strict';

    var queries = (function () {

        var controllerName = 'Questions';

        //Obiekt kontrolujący przepływem danych na ekranie wyrazów.
        var controller = 1;

        //Funkcja sprawdzająca czy w bazie istnieje już zapytanie o podanej nazwie.
        function nameAlreadyExists(id, name) {
            var error = dict.QueryCheckIfNameExistsError.get([name]);
            var value = true;

            mielk.db.fetch(controllerName, 'CheckName', {
                'id': id,
                'name': name
            }, {
                async: false,
                cache: false,
                callback: function (result) {
                    value = (result.IsExisting === true);
                },
                errorCallback: function () {
                    alert(error);
                }
            });

            return value;

        }

        //Funkcja update'ująca kategorie dla danego zapytania.
        function updateCategories(query, categories, callback) {
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
            var success = dict.QueryCategoryAssigned.get([query.name, categoriesNames]);
            var error = dict.QueryCategoryAssignedError.get([query.name]);

            mielk.db.fetch(controllerName, 'UpdateCategories', {
                'id': query.id
                    , 'categories': categoriesIds
            }, {
                async: true,
                cache: false,
                traditional: true,
                callback: function (result) {
                    query.setCategories(categories);
                    mielk.notify.display(success, true);
                    mielk.fn.run(callback, result);
                },
                errorCallback: function () {
                    mielk.notify.display(error, false);
                    mielk.fn.run(callback, false);
                }
            });

        }

        //Funkcja ustawiająca status podanego zapytania na aktywny.
        function activate(id, name, callback) {
            var success = dict.QueryActivated.get([name]);
            var error = dict.QueryActivatedError.get([name]);

            mielk.db.fetch(controllerName, 'Activate', {
                'id': id
            }, {
                async: true,
                cache: false,
                callback: function (result) {
                    mielk.notify.display(success, true);
                    mielk.fn.run(callback, result);
                },
                errorCallback: function () {
                    mielk.notify.display(error, false);
                    mielk.fn.run(callback, false);
                }
            });

        }

        //Funkcja ustawiająca status podanego zapytania na nieaktywny.
        function deactivate(id, name, callback) {
            var success = dict.QueryDeactivated.get([name]);
            var error = dict.QueryDeactivatedError.get([name]);

            mielk.db.fetch(controllerName, 'Deactivate', {
                'id': id
            }, {
                async: true,
                cache: false,
                callback: function (result) {
                    mielk.notify.display(success, true);
                    mielk.fn.run(callback, result);
                },
                errorCallback: function () {
                    mielk.notify.display(error, false);
                    mielk.fn.run(callback, false);
                }
            });

        }

        //Funkcja zmieniająca wagę podanego zapytania.
        function updateWeight(id, name, weight, callback) {
            var success = dict.QueryUpdateWeight.get([name, weight]);
            var error = dict.QueryUpdateWeightError.get([name]);

            mielk.db.fetch(controllerName, 'UpdateWeight', {
                'id': id,
                'weight': weight
            }, {
                async: true,
                cache: false,
                callback: function (result) {
                    mielk.notify.display(success, true);
                    mielk.fn.run(callback, result);
                },
                errorCallback: function () {
                    mielk.notify.display(error, false);
                    mielk.fn.run(callback, false);
                }
            });
        }

        //Funkcja zmieniająca właściwości podanego zapytania.
        function update(e) {
            var success = dict.QueryUpdate.get([e.word.name]);
            var error = dict.QueryUpdateError.get([e.word.name]);

            mielk.db.fetch(controllerName, 'Update', {
                'id': e.question.id,
                'name': e.name,
                'weight': e.weight,
                'categories': e.categories,
                'dependencies': e.dependencies,
                'connections': e.connections,
                'editedSets': e.editedSets,
                'properties': e.properties,
                'editedVariants': e.editedVariants,
                'addedVariants': e.addedVariants,
                'limits': e.limits
            }, {
                async: true,
                cache: false,
                traditional: true,
                callback: function (result) {
                    mielk.notify.display(success, true);
                    mielk.fn.run(e.callback, result);
                },
                errorCallback: function () {
                    mielk.notify.display(error, false);
                    mielk.fn.run(e.callback, false);
                }
            });
        }

        //Funkcja dodająca podany metawyraz do bazy danych.
        //function add(e) {
        //    var success = dict.QueryAdded.get([e.word.name]);
        //    var error = dict.QueryAddedError.get([e.word.name]);

        //    mielk.db.fetch('Questions', 'Add', {
        //        'name': e.name,
        //        'weight': e.weight,
        //        'categories': e.categories,
        //        'wordtype': e.wordtype,
        //        'added': e.added,
        //        'properties': e.properties
        //    }, {
        //        async: true,
        //        cache: false,
        //        traditional: true,
        //        callback: function (result) {
        //            mielk.notify.display(success, true);
        //            mielk.fn.run(e.callback, result);
        //        },
        //        errorCallback: function () {
        //            mielk.notify.display(error, false);
        //            mielk.fn.run(e.callback, false);
        //        }
        //    });
        //}


        //Funkcja zwracająca wszystkie opcje dla podanego zapytania.
        function getOptions(id, name, languages) {
            var error = dict.GetQueryOptionsError.get([name]);
            var options = [];

            mielk.db.fetch(controllerName, 'GetOptions', {
                'id': id,
                'languages': languages
            }, {                
                async: false,
                cache: false,
                traditional: true,
                callback: function(result) {
                    options = result;
                },
                errorCallback: function() {
                    mielk.notify.display(error, false);
                }
            });

            return options;

        }
        
        //Funkcja zwracająca wszystkie wariant sety dla podanego zapytania.
        function getVariantSets(id, name, languages) {
            var error = dict.GetQueryOptionsError.get([name]);
            
            mielk.db.fetch(controllerName, 'GetVariantSets', {
                'id': id,
                'languages': languages
            }, {                
                async: false,
                cache: false,
                traditional: true,
                callback: function(result) {
                    return result;
                },
                errorCallback: function() {
                    mielk.notify.display(error, false);
                    return [];
                }
            });

        }
        
        //Funkcja zwracająca szczegóły danego zapytania.
        function getQuery(id) {
            var query = null;
            var error = dict.GetQueryError.get([name]);

            mielk.db.fetch(controllerName, 'GetQuestionDetails', {
                'id': id,
                'currentUserId': Ling.Users.Current.id
            }, {
                async: false,
                cache: false,
                traditional: false,
                callback: function (result){
                    query = result;
                },
                errorCallback: function(){
                    mielk.notify.display(error, false);
                }
            });

            return query;

        }

        //Funkcja ładująca ekran startowy dla zapytań.
        function initialize() {
            controller = new QueryListManager();
            controller.start();
        }


        return {
              nameAlreadyExists: nameAlreadyExists
            , updateCategories: updateCategories
            , activate: activate
            , deactivate: deactivate
            , updateWeight: updateWeight
            , update: update
            //, add: add
            , getOptions: getOptions
            , getVariantSets: getVariantSets
            , initialize: initialize
            , getQuery: getQuery
        };

    })();

    // Expose ling to the global object
    Ling.Queries = queries;

});
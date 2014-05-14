﻿/*
 * Questions
 *
 * Date: 2014-05-14 15:49
 *
 */


function Query() {

    'use strict';

    var self = this;

    //Class signature.
    self.Query = true;

    //Instance properties.


}
Query.prototype = {

    setCategories: function (categories) {

    }
    
};




$(function () {

    'use strict';

    var queries = (function () {

        //Funkcja sprawdzająca czy w bazie istnieje już zapytanie o podanej nazwie.
        function nameAlreadyExists(id, name) {
            var error = dict.QueryCheckIfNameExistsError.get([name]);

            mielk.db.fetch('Questions', 'CheckName', {
                'id': id,
                'name': name
            }, {
                async: false,
                cache: false,
                callback: function (result) {
                    return (result.IsExisting === true);
                },
                errorCallback: function () {
                    alert(error);
                }
            });

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

            mielk.db.fetch('Questions', 'UpdateCategories', {
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

            mielk.db.fetch('Questions', 'Activate', {
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

            mielk.db.fetch('Questions', 'Deactivate', {
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

            mielk.db.fetch('Questions', 'UpdateWeight', {
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

            mielk.db.fetch('Questions', 'Update', {
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
            
            mielk.db.fetch('Questions', 'GetOptions', {
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
        
        //Funkcja zwracająca wszystkie wariant sety dla podanego zapytania.
        function getVariantSets(id, name, languages) {
            var error = dict.GetQueryOptionsError.get([name]);
            
            mielk.db.fetch('Questions', 'GetVariantSets', {
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
        };

    })();

    // Expose ling to the global object
    LING.QUERIES = queries;

});
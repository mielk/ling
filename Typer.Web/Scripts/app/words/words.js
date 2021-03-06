﻿
$(function () {

    'use strict';

    var words = (function () {

        //Obiekt kontrolujący przepływem danych na ekranie wyrazów.
        var controller = 1;

        //Funkcja sprawdzająca czy w bazie istnieje już wyraz o podanej nazwie.
        function nameAlreadyExists(id, name) {
            var error = dict.MetawordCheckIfNameExistsError.get([name]);
            var value = true;

            mielk.db.fetch('Words', 'CheckName', {
                'id': id,
                'name': name
            }, {
                async: false,
                cache: false,
                callback: function(result) {
                    value = (result.IsExisting === true);
                },
                errorCallback: function() {
                    alert(error);
                }
            });

            return value;

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
                        mielk.notify.display(success, true);
                        mielk.fn.run(callback, result);
                    },
                    errorCallback: function() {
                        mielk.notify.display(error, false);
                        mielk.fn.run(callback, false);
                    }
                });
            
        }

        //Funkcja ustawiająca podany wyraz na aktywny.
        function activate(id, name, callback) {
            var success = dict.MetawordActivated.get([name]);
            var error = dict.MetawordActivatedError.get([name]);

            mielk.db.fetch('Words', 'Activate', {
                    'id': id
                }, {
                    async: true,
                    cache: false,
                    callback: function(result) {
                        mielk.notify.display(success, true);
                        mielk.fn.run(callback, result);
                    },
                    errorCallback: function() {
                        mielk.notify.display(error, false);
                        mielk.fn.run(callback, false);
                    }
                });

        }

        //Funkcja ustawiająca podany wyraz na nieaktywny.
        function deactivate(id, name, callback) {
            var success = dict.MetawordDeactivated.get([name]);
            var error = dict.MetawordDeactivatedError.get([name]);

            mielk.db.fetch('Words', 'Deactivate', {
                'id': id
            }, {
                async: true,
                cache: false,
                callback: function(result) {
                    mielk.notify.display(success, true);
                    mielk.fn.run(callback, result);
                },
                errorCallback: function() {
                    mielk.notify.display(error, false);
                    mielk.fn.run(callback, false);
                }
            });

        }
        
        //Funkcja zmieniająca wagę podanego metawyrazu.
        function updateWeight(id, name, weight, callback) {
            var success = dict.MetawordUpdateWeight.get([name, weight]);
            var error = dict.MetawordUpdateWeightError.get([name]);

            mielk.db.fetch('Words', 'UpdateWeight', {
                'id': id,
                'weight': weight
            }, {
                async: true,
                cache: false,
                callback: function(result) {
                    mielk.notify.display(success, true);
                    mielk.fn.run(callback, result);
                },
                errorCallback: function() {
                    mielk.notify.display(error, false);
                    mielk.fn.run(callback, false);
                }
            });
        }
                
        ////Funkcja zmieniająca właściwości podanego metawyrazu.
        //function update(e) {
        //    var success = dict.MetawordUpdate.get([e.word.name]);
        //    var error = dict.MetawordUpdateError.get([e.word.name]);

        //    mielk.db.fetch('Words', 'Update', {
        //        'id': e.word.id,
        //        'name': e.name,
        //        'weight': e.weight,
        //        'categories': e.categories,
        //        'wordtype': e.wordtype,
        //        'removed': e.removed,
        //        'edited': e.edited,
        //        'added': e.added,
        //        'properties': e.properties,
        //        'forms': e.details
        //    }, {
        //        async: true,
        //        cache: false,
        //        traditional: true,
        //        callback: function(result) {
        //            mielk.notify.display(success, true);
        //            mielk.fn.run(e.callback, result);
        //        },
        //        errorCallback: function() {
        //            mielk.notify.display(error, false);
        //            mielk.fn.run(e.callback, false);
        //        }
        //    });
        //}

        ////Funkcja dodająca podany metawyraz do bazy danych.
        //function add(e) {
        //    var success = dict.MetawordAdded.get([e.word.name]);
        //    var error = dict.MetawordAddedError.get([e.word.name]);

        //    mielk.db.fetch('Words', 'Add', {
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
        //        callback: function(result) {
        //            mielk.notify.display(success, true);
        //            mielk.fn.run(e.callback, result);
        //        },
        //        errorCallback: function() {
        //            mielk.notify.display(error, false);
        //            mielk.fn.run(e.callback, false);
        //        }
        //    });
        //}

        //Funkcja zwracająca wyrazy dla podanego metawyrazu.
        function getWords(id, name, languages) {
            var error = dict.GetMetawordWordsError.get([name]);
            var $words = [];
            
            mielk.db.fetch('Words', 'GetWords', {
                'id': id,
                'languages': languages
            }, {
                async: false,
                cache: false,
                traditional: true,
                callback: function(result) {
                    $words = result;
                },
                errorCallback: function() {
                    mielk.notify.display(error, false);
                }
            });

            return $words;

        }


        //Funkcja ładująca ekran startowy dla wyrazów.
        function initialize() {
            controller = new WordListManager();
            controller.start();
        }


        return {
              nameAlreadyExists: nameAlreadyExists
            , updateCategories: updateCategories
            , activate: activate
            , deactivate: deactivate
            , updateWeight: updateWeight
            //, update: update
            //, add: add
            , getWords: getWords
            , initialize: initialize
        };

    })();

    // Expose ling to the global object
    Ling.Words = words;

});
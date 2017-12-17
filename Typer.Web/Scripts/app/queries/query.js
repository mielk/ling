/*
 * Query
 *
 * Date: 2014-05-18 17:26
 *
 */

function Query(properties) {

    'use strict';

    var self = this;

    //Class signature.
    self.Query = true;

    Entity.call(self, properties);

    //Instance properties.
    self.wordtype = properties.WordType ? Ling.Enums.Wordtypes.getItem(properties.WordType) : null;
    self.askPlural = properties.AskPlural;
    self.isComplex = properties.IsComplex;
    self.service = Ling.Queries;
    self.sets = mielk.hashTable();

}
mielk.objects.extend(Entity, Query);
mielk.objects.addProperties(Query.prototype, {

      detailsMethodName: 'GetOptions'

    , controllerName: 'Questions'

    , setCategories: function () {

    }

    //Metoda abstrakcyjna, musi być zaimplementowana w każdej klasie
    //dziedziczączej po tej - określa zestaw kontrolek specyficznych 
    //dla danego podtypu entity, które mają być wyświetlone w ListView, 
    //np. dla wyrazów dodatkowym elementem będzie właściwość [Wordtype].
    , additionalViewItems: function () {
        //Dla zapytań aktualnie nie jest przewidziany żaden dodatkowy
        //element UI, dlatego zwracana jest pusta tablica. W przyszłości
        //może się to zmienić.
        var array = [];
        return array;
    }

    //Tworzy obiekt zależny względem tego entity, np. Word dla Metaword
    //albo QueryOption dla Query.
    , createSubItem: function (params) {
        return new QueryOption(this, params);
    }


    //Zwraca tablicę zawierającą definicję zestawu danych
    //specyficzne dla klasy Query.
    , getSpecificDatalinesDefinitions: function () {
        var datalines = [];

        return datalines;

    }


    //Editing entity.
    , edit: function () {
        var self = this;

        self.loadDetails();

        var editPanel = new EditQueryPanel(self);
        editPanel.show();
        editPanel.bind({
            confirm: function (e) {
                self.update(e.object);
                self.trigger({
                      type: 'confirm'
                    , query: self
                });
            },
            cancel: function (e) {
                self.trigger({
                      type: 'cancel'
                    , query: self
                });
            }
        });

    }

    , loadDetails: function () {

        var dto = Ling.Queries.getQuery(this.id);
        this.createVariantSets(dto.VariantSets);

    }

    , getOptionByContent: function(languageId, content) {
        var options = this.items.getItem(languageId);
        var option = null;
        if (options) {
            option = options.getItem(content);
        }
        return option;
    }

    , createVariantSets: function (sets) {
        var self = this;

        //Ładowanie zestawów wariantów (bez ładowania
        //zależności i powiązań).
        mielk.arrays.each(sets, function (s) {
            var set = new VariantSet(self, s);
            self.sets.setItem(set.id, set);
        });

        //Dopiero po załadowaniu wszystkich zestawów
        //ładowane są powiązania i zależności między 
        //nimi - dzięki temu jest gwarancja, że
        //wszystkie zestawy są już załadowane do pamięci.
        mielk.arrays.each(sets, function (s) {
            var set = self.getVariantSet(s.Id);

            //Przypisanie nadrzędnego zestawu.
            if (s.ParentId) {
                var masterSet = self.getVariantSet(s.ParentId);
                if (masterSet) {
                    set.setMaster(masterSet);
                }
            }

            //Ładowanie zestawów zależnych.
            mielk.arrays.each(s.Dependants, function (dependant) {
                var dependantSet = self.getVariantSet(dependant);
                if (dependantSet) {
                    set.addDependant(dependantSet);
                }
            });

            //Ładowanie zestawów powiązanych.
            mielk.arrays.each(s.Related, function (related) {
                var relatedSet = self.getVariantSet(related);
                if (relatedSet) {
                    set.addRelated(relatedSet);
                }
            });

        });

    }

    , getVariantSet: function (id) {
        return this.sets.getItem(id);
    }

    , clone: function () {
        var self = this;

        //Create a copy instance of Query with all primitive
        //properties given as initialize parameters.
        var obj = new Query({
              Id: self.id
            , Name: self.name
            , Weight: self.weight
            , IsComplex: self.isComplex
            , AskPlural: self.askPlural
            , IsActive: self.isActive
            , CreatorId: self.creatorId
            , CreateDate: self.createDate
            , IsApproved: self.isApproved
            , Positive: self.positive
            , Negative: self.negative
            , IsNew: self.isNew
            , WordType: (self.wordtype ? self.wordtype.id : 0)
        });

        //Complex properties are set directly.
        obj.cloned = true;
        obj.categories = mielk.arrays.clone(self.categories);
        obj.items = self.items.clone(true);
        obj.sets = self.sets.clone(true);

        //Assign this query to all cloned words.
        obj.items.each(function (key, language) {
            language.each(function (k, v) {
                v.parent = obj;
            });
        });

        //Assigned this query and cloned instances of sets 
        //to all cloned sets.
        obj.sets.each(function (k, set) {
            set.refreshQuery(obj);
        });

        return obj;

    }

    //[Override]
    , update: function (object) {
        var self = this;
        self.updateModel(object);
        var dto = self.dto();
        var json = JSON.stringify(dto);
        mielk.db.post('Questions', 'Update', json, {
            callback: function (result) {

                if (result < 0) {
                    var dictItem = (self.id !== 0 ? dict.QueryUpdateError : dict.QueryAddedError);
                    mielk.notify.display(dictItem.get([self.name]), false);
                } else if (self.id === 0) {
                    //New item.
                    self.trigger({ type: 'added' });
                    mielk.notify.display(dict.QueryAdded.get([self.name]), true);
                    self.id = result;
                } else {
                    self.trigger({ type: 'updated' });
                    mielk.notify.display(dict.QueryUpdate.get([self.name]), true);
                }

            },
            errorCallback: function () {
                var dictItem = (self.id !== 0 ? dict.QueryUpdateError : dict.QueryAddedError);
                mielk.notify.display(dictItem.get([self.name]), false);
            }
        });
    }

    , updateModel: function (object) {
        var self = this;
        self.edited = true;
        self.name = object.name;
        self.weight = object.weight;
        self.isComplex = object.isComplex;
        self.wordtype = object.wordtype;
        self.askPlural = object.askPlural;
        self.isActive = object.isActive;
        self.wordtype = object.wordtype;
        self.categories = object.categories;
        self.items = object.items;
        self.sets = object.sets;
        self.wordtype = object.wordtype || self.wordtype;
    }

    //[Override]
    , dto: function () {
        var self = this;

        return {
              Id: self.id
            , Name: self.name
            , Weight: self.weight
            , WordType: self.wordtype ? self.wordtype.id : 0
            , IsComplex: self.isComplex || false
            , AskPlural: self.askPlural || false
            , IsActive: self.isActive
            , CreatorId: self.creatorId
            , CreateDate: self.createDate
            , IsApproved: self.isApproved
            , Positive: self.positive
            , Negative: self.negative
            , Categories: (function () {
                var array = [];

                mielk.arrays.each(self.categories, function (category) {
                    array.push({
                        Id: category.key
                    });
                });

                return array;
            })()
            , Options: (function () {
                var array = [];
                var dto = {};

                self.items.each(function (key, language) {
                    language.each(function (k, word) {

                        dto = word.dto();

                        array.push(dto);

                    });
                });

                return array;

            })()
            , Languages: Ling.Users.Current.getLanguagesIds()
        };

    }


});





//Question.prototype.editItem = function () {
//    var self = this;
//    return new QuestionEditEntity({
//        object: self,
//        id: self.id,
//        name: self.name,
//        weight: self.weight,
//        isActive: self.isActive,
//        categories: self.categories
//    });
//};
//Question.prototype.update = function (params) {
//    if (!params.QuestionEditEntity) {
//        alert('Illegal argument passed to function Metaword.update');
//        return;
//    }

//    var self = this;
//    var name = (this.name === params.name ? '' : params.name);
//    var weight = (this.weight === params.weight ? 0 : params.weight);
//    var categories = (my.array.equal(params.categories, this.categories) ? [] : params.categories);
//    //removed sets
//    //added sets
//    var editedSets = this.editedSetsLogs(params.logs);
//    var properties = this.editedPropertiesLogs(params.logs);
//    var dependencies = this.dependenciesLogs(params.logs);
//    var connections = this.connectionsLogs(params.logs);
//    var limits = this.limitsLogs(params.logs);
//    var editedVariants = this.editedVariantsLogs(params.logs);
//    var addedVariants = this.addedVariantsLogs(params.logs);
//    //removed options


//    //Check if there are any changes.
//    if (name || weight || (categories && categories.length) || (editedSets && editedSets.length) ||
//        (dependencies && dependencies.length) || (connections && connections.length) ||
//        (properties && properties.length) || (limits && limits.length) ||
//        (addedVariants && addedVariants.length) || (editedVariants && editedVariants.length)) {

//        this.service.update({
//            question: self,
//            name: name,
//            weight: weight,
//            editedSets: editedSets,
//            dependencies: dependencies,
//            connections: connections,
//            categories: my.categories.toIntArray(categories),
//            addedVariants: addedVariants,
//            editedVariants: editedVariants,
//            properties: properties,
//            limits: limits,
//            callback: function (result) {
//                if (result !== false) {

//                    //Name.
//                    if (name) {
//                        self.name = name;
//                        self.trigger({
//                            type: 'changeName',
//                            name: name
//                        });
//                    }

//                    //Weight.
//                    if (weight) {
//                        self.weight = weight;
//                        self.trigger({
//                            type: 'changeWeight',
//                            weight: weight
//                        });
//                    }

//                    //Categories.
//                    if (categories && categories.length) {
//                        self.categories = categories;
//                        self.trigger({
//                            type: 'changeCategories',
//                            categories: categories
//                        });
//                    }

//                }
//            }
//        });
//    }

//};
//Question.prototype.editPanel = function (editItem) {
//    return new QuestionEditPanel(this, editItem);
//};
//Question.prototype.dependenciesLogs = function (logs) {
//    var removeTag = 'dependencyRemoved';
//    var addTag = 'dependencyAdded';

//    var results = [];

//    for (var i = 0; i < logs.length; i++) {
//        var log = logs[i];
//        if (log.event === removeTag) {
//            var $log = 0 + '|' + log.masterId + '|' + log.slaveId;
//            results.push($log);
//        } else if (log.event === addTag) {
//            $log = 1 + '|' + log.masterId + '|' + log.slaveId;
//            results.push($log);
//        }
//    }

//    return results;

//};

//Question.prototype.editedSetsLogs = function (logs) {
//    var tag = 'editVariantSet';
//    var results = [];

//    for (var i = 0; i < logs.length; i++) {
//        var log = logs[i];
//        if (log.event === tag) {
//            var $log = log.set + '|' + log.tag + '|' + log.wordtype;
//            results.push($log);
//        }
//    }

//    return results;

//};

//Question.prototype.editedPropertiesLogs = function (logs) {
//    var removeTag = 'removeVariantProperty';
//    var editTag = 'editVariantProperty';

//    var results = [];

//    for (var i = 0; i < logs.length; i++) {
//        var log = logs[i];
//        if (log.event === removeTag || log.event === editTag) {
//            var $log = (log.event === removeTag ? -1 : 1) + '|' + log.setId + '|' + log.property + '|' + (log.value ? log.value : 0);
//            results.push($log);
//        }
//    }

//    return results;

//};

//Question.prototype.connectionsLogs = function (logs) {
//    var removeTag = 'removeConnection';
//    var addTag = 'addConnection';

//    var results = [];
//    var map = new HashTable(null);

//    for (var i = 0; i < logs.length; i++) {
//        var log = logs[i];
//        if (log.event === removeTag) {
//            var $log = 0 + '|' + log.parent.id + '|' + log.connected.id;
//            var $oppositeLog = 0 + '|' + log.connected.id + '|' + log.parent.id;

//            //Avoiding duplicated pairs.
//            if (!map.hasItem($log) && !map.hasItem($oppositeLog)) {
//                map.setItem($log, $log);
//                map.setItem($oppositeLog, $oppositeLog);
//                results.push($log);
//            }

//        } else if (log.event === addTag) {
//            $log = 1 + '|' + log.parent.id + '|' + log.connected.id;
//            $oppositeLog = 1 + '|' + log.connected.id + '|' + log.parent.id;

//            //Avoiding duplicated pairs.
//            if (!map.hasItem($log) && !map.hasItem($oppositeLog)) {
//                map.setItem($log, $log);
//                map.setItem($oppositeLog, $oppositeLog);
//                results.push($log);
//            }

//        }
//    }

//    return results;

//};

//Question.prototype.editedVariantsLogs = function (logs) {
//    var tag = 'editVariant';
//    var results = [];

//    //for (var i = 0; i < logs.length; i++) {
//    //    var log = logs[i];
//    //    if (log.event === tag && !log.variant.isNew) {
//    //        var variant = log.variant;
//    //        var $log = log.setId + '|' + variant.id + '|' + variant.content + '|' + (variant.wordId ? variant.wordId : 0) + '|' + (variant.anchored ? 1 : 0);
//    //        results.push($log);
//    //    }
//    //}

//    //return results;

//};
//Question.prototype.addedVariantsLogs = function (logs) {
//    var tag = 'addVariant';
//    var results = [];

//    //for (var i = 0; i < logs.length; i++) {
//    //    var log = logs[i];
//    //    if (log.event === tag) {
//    //        var variant = log.variant;
//    //        var $log = log.setId + '|' + variant.key + '|' + variant.content + '|' + (variant.wordId ? variant.wordId : 0) + '|' + (variant.anchored ? 1 : 0);
//    //        results.push($log);
//    //    }
//    //}

//    return results;

//};
//Question.prototype.limitsLogs = function (logs) {
//    var removeTag = 'removeLimit';
//    var addTag = 'addLimit';
//    var results = [];
//    var map = new HashTable(null);

//    for (var i = 0; i < logs.length; i++) {
//        var log = logs[i];
//        if (log.event === removeTag || log.event === addTag) {
//            if (my.values.isNumber(log.variantId) && my.values.isNumber(log.excludedId)) {
//                var $log = (log.event === removeTag ? -1 : 1) + '|' + log.question + '|' + log.variantId + '|' + log.excludedId;
//                var $oppositeLog = (log.event === removeTag ? -1 : 1) + '|' + log.question + '|' + log.excludedId + '|' + log.variantId;

//                if (!map.hasItem($log) && !map.hasItem($oppositeLog)) {
//                    map.setItem($log, $log);
//                    map.setItem($oppositeLog, $oppositeLog);
//                    results.push($log);
//                }
//            }
//        }
//    }

//    return results;

//};
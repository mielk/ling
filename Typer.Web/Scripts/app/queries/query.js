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
    self.service = Ling.Queries;

}
mielk.objects.extend(Entity, Query);
mielk.objects.addProperties(Query.prototype, {

      detailsMethodName: 'GetOptions'

    , controllerName: 'Questions'

    , setCategories: function (categories) {

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
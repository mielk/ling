/*
 * Metaword
 *
 * Date: 2014-05-14 14:11
 *
 */
function Metaword(properties) {

    'use strict';

    var self = this;

    //Class signature.
    self.Metaword = true;

    Entity.call(self, properties);

    //Instance properties.
    self.service = Ling.Words;
    self.wordtype = Ling.Enums.Wordtypes.getItem(properties.Type);

}
mielk.objects.extend(Entity, Metaword);
mielk.objects.addProperties(Metaword.prototype, {

    setCategories: function (categories) {

    }

    //Metoda abstrakcyjna, musi być zaimplementowana w każdej klasie
    //dziedziczączej po tej - określa zestaw kontrolek specyficznych 
    //dla danego podtypu entity, które mają być wyświetlone w ListView, 
    //np. dla wyrazów dodatkowym elementem będzie właściwość [Wordtype].
    , additionalViewItems: function () {
        var array = [];

        //Wordtype label.
        var type = jQuery('<div/>', {
            'class': 'type',
            html: (this.wordtype ? this.wordtype.symbol : '')
        });
        this.bind({
            changeWordtype: function (e) {
                type.html(e.wordtype.symbol);
            }
        });
        array.push({
              item: type
            , before: 'categories'
        });
        //Wordtype label.


        return array;


    }

});





//Metaword.prototype.editItem = function () {
//    var self = this;
//    return new WordEditEntity({
//        object: self,
//        id: self.id,
//        name: self.name,
//        wordtype: self.wordtype,
//        weight: self.weight,
//        isActive: self.isActive,
//        categories: self.categories,
//        options: self.options
//    });
//};
//Metaword.prototype.update = function (params) {
//    if (!params.WordEditEntity) {
//        alert('Illegal argument passed to function Metaword.update');
//        return;
//    }

//    var self = this;
//    var name = (this.name === params.name ? '' : params.name);
//    var weight = (this.weight === params.weight ? 0 : params.weight);
//    var categories = (my.array.equal(params.categories, this.categories) ? [] : params.categories);
//    var wordtype = (this.wordtype === params.wordtype ? 0 : params.wordtype.id);
//    var removed = this.removedLogs(params.logs);
//    var edited = this.editedLogs(params.logs);
//    var added = this.addedLogs(params.logs);
//    var properties = this.propertiesLogs(params.logs);
//    var details = this.detailsLogs(params.logs);

//    //Check if there are any changes.
//    if (name || weight || wordtype ||
//        (categories && categories.length) ||
//        (removed && removed.length) ||
//        (edited && edited.length) ||
//        (added && added.length) ||
//        (properties && properties.length) ||
//        (details && details.length)) {

//        if (self.new) {

//            this.service.add({
//                word: self,
//                name: name,
//                weight: weight,
//                wordtype: wordtype,
//                added: added,
//                properties: properties,
//                details: details,
//                categories: my.categories.toIntArray(categories),
//                callback: function (result) {
//                    if (result !== false) {
//                        self.trigger({
//                            type: 'add'
//                        });
//                    }
//                }
//            });

//        } else {

//            this.service.update({
//                word: self,
//                name: name,
//                weight: weight,
//                wordtype: wordtype,
//                removed: removed,
//                edited: edited,
//                added: added,
//                properties: properties,
//                details: details,
//                categories: my.categories.toIntArray(categories),
//                callback: function (result) {
//                    if (result !== false) {

//                        //Name.
//                        if (name) {
//                            self.name = name;
//                            self.trigger({
//                                type: 'changeName',
//                                name: name
//                            });
//                        }

//                        //Wordtype.
//                        if (wordtype) {
//                            self.wordtype = params.wordtype;
//                            self.trigger({
//                                type: 'changeWordtype',
//                                wordtype: self.wordtype
//                            });
//                        }

//                        //Weight.
//                        if (weight) {
//                            self.weight = weight;
//                            self.trigger({
//                                type: 'changeWeight',
//                                weight: weight
//                            });
//                        }

//                        //Categories.
//                        if (categories && categories.length) {
//                            self.categories = categories;
//                            self.trigger({
//                                type: 'changeCategories',
//                                categories: categories
//                            });
//                        }

//                    }
//                }
//            });

//            this.trigger({
//                type: 'change'
//            });

//        }

//    }

//};
//Metaword.prototype.checkWordtype = function (wordtype) {
//    if (!wordtype || !wordtype.id) {
//        return MessageBundle.get(dict.WordtypeCannotBeEmpty);
//    } else {
//        return true;
//    }
//};
//Metaword.prototype.editPanel = function (editItem) {
//    return new WordEditPanel(this, editItem);
//};
//Metaword.prototype.removedLogs = function (logs) {
//    var tag = 'remove';
//    var array = [];
//    for (var i = 0; i < logs.length; i++) {
//        var log = logs[i];
//        if (log.event === tag && log.item && log.item.id) {
//            array.push(log.item.id);
//        }
//    }
//    return array;
//};
//Metaword.prototype.editedLogs = function (logs) {
//    var tag = 'edit';
//    var array = [];
//    for (var i = 0; i < logs.length; i++) {
//        var log = logs[i];
//        var item = log.item;
//        if (log.event === tag && item && item.id) {
//            var text = item.id + '|' + item.name + '|' + item.weight + '|' + item.isCompleted;
//            array.push(text);
//        }
//    }
//    return array;
//};
//Metaword.prototype.addedLogs = function (logs) {
//    var tag = 'add';
//    var array = [];
//    for (var i = 0; i < logs.length; i++) {
//        var log = logs[i];
//        var item = log.item;
//        if (log.event === tag && item) {
//            //metadata
//            var text = item.languageId + '|' + item.name + '|' + item.weight + '|' + item.isCompleted;

//            //properties
//            text += '$';
//            item.properties.each(function (key, value) {
//                text += value.id + '|' + value.value + ';';
//            });

//            //details
//            text += '$';
//            item.details.each(function (key, value) {
//                text += value.id + '|' + value.value + ';';
//            });

//            array.push(text);
//        }
//    }
//    return array;
//};
//Metaword.prototype.propertiesLogs = function (logs) {
//    var tag = 'properties';
//    var array = [];
//    for (var i = 0; i < logs.length; i++) {
//        var log = logs[i];
//        if (log.event === tag) {
//            var wordId = log.wordId;
//            var propertyId = log.propertyId;
//            var value = log.value;
//            var text = wordId + '|' + propertyId + '|' + (value === 'true' ? '*' : (value === 'false' ? '' : value));
//            array.push(text);
//        }
//    }
//    return array;
//};
//Metaword.prototype.detailsLogs = function (logs) {
//    var tag = 'details';
//    if (!logs) return [];

//    var array = [];
//    for (var i = 0; i < logs.length; i++) {
//        var log = logs[i];
//        if (log.event === tag) {
//            var text = log.wordId + '|' + log.form + '|' + log.value;
//            array.push(text);
//        }
//    }
//    return array;
//};



/*
 * Metaword
 *
 * Date: 2014-05-14 14:11
 *
 */
function Metaword(properties) {

    //Id, Name, Weight, Type, IsActive, Categories, Words

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

    detailsMethodName: 'GetWords'

    , controllerName: 'Words'

    , setCategories: function (categories) {

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

    //Tworzy obiekt zależny względem tego entity, np. Word dla Metaword
    //albo QueryOption dla Query.
    , createSubItem: function (params) {
        return new Word(this, params);
    }

    //Zwraca tablicę zawierającą definicję zestawu danych
    //specyficzne dla klasy Metaword.
    , getSpecificDatalinesDefinitions: function (object) {
        
        var datalines = [];

        //[Wordtype]
        var wordtypePanel = new WordtypePanel({
              value: object.wordtype
            , callback: function (result) {
                object.wordtype = result;
            }
        });
        datalines.push({
            property: Ling.Enums.Properties.Wordtype
            , index: 1
            , label: dict.Wordtype.get()
            , value: object.wordtype
            , panel: wordtypePanel.view()
        });

        return datalines;

    }
    
    , checkWordtype: function(wordtype) {
        if (!wordtype || !wordtype.id) {
            return dict.WordtypeCannotBeEmpty.get();
        } else {
            return true;
        }
    }

    , clone: function () {
        var self = this;
        
        //Create a copy instance of Metaword with all primitive
        //properties given as initialize parameters.
        var obj = new Metaword({
            Id: self.id
            , Name: self.name
            , Weight: self.weight
            , IsActive: self.isActive
            , CreatorId: self.creatorId
            , CreateDate: self.createDate
            , IsApproved: self.isApproved
            , Positive: self.positive
            , Negative: self.negative
            , 'new': self.new
        });

        //Complex properties are set directly.
        obj.cloned = true;
        obj.categories = mielk.arrays.clone(self.categories);
        obj.wordtype = self.wordtype;
        obj.items = self.items.clone(true);

        //Assign this metaword to all cloned words.
        obj.items.each(function (key, language) {
            language.each(function (k, v) {
                v.parent = obj;
            });
        });
        
        return obj;
        
    }
    
    //[Override]
    , update: function (object) {
        var self = this;
        self.updateModel(object);
        var dto = self.dto();
        var json = JSON.stringify(dto);
        mielk.db.post('Words', 'Update', json, {
            callback: function () {
                self.trigger({ type: 'updated' });
                mielk.notify.display(dict.MetawordUpdate.get([self.name]), true);
            },
            errorCallback: function() {
                mielk.notify.display(dict.MetawordUpdateError.get([self.name]), false);
            }
        });
    }
    
    , updateModel: function(object) {
        var self = this;
        self.edited = true;
        self.name = object.name;
        self.weight = object.weight;
        self.isActive = object.isActive;
        self.wordtype = object.wordtype;
        self.categories = object.categories;
        self.items = object.items;
    }
    
    //[Override]
    , dto: function () {
        var self = this;
        
        return {
            Id: self.id
            , Name: self.name
            , Weight: self.weight
            , Type: self.wordtype.id
            , IsActive: self.isActive
            , CreatorId: self.creatorId
            , CreateDate: self.createDate
            , IsApproved: self.isApproved
            , Positive: self.positive
            , Negative: self.negative
            , Categories: (function () {
                var array = [];

                mielk.arrays.each(self.categories, function(category) {
                    array.push({
                       Id: category.key
                    });
                });

                return array;
            })()
            , Words: (function() {
                var array = [];
                var dto = {};

                self.items.each(function (key, language) {
                    language.each(function (k, word) {

                        dto = (word.edited ? word.dto() : {
                            Id: word.id
                            , Name: word.name
                            , Edited: false
                        });

                        array.push(dto);

                    });
                });

                return array;

            })()
        };

    }

});




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




//Klasa reprezentująca panel do ustawiania właściwości [Wordtype].
function WordtypePanel(params) {

    'use strict';

    var self = this;

    //Class signature.
    self.WordtypePanel = true;
    self.value = params.value;
    self.callback = params.callback;

    self.ui = (function () {

        var container = jQuery('<div/>', {
            'class': 'wordtype-dropdown-container'
        });

        var dropdown = new DropDown({
              container: container
            , data: Ling.Enums.Wordtypes.getValues()
            , slots: 5
            , caseSensitive: false
            , confirmWithFirstClick: true
        });

        if (self.value) {
            dropdown.trigger({
                type: 'select',
                object: self.value
            });
        }

        dropdown.bind({
            select: function (e) {
                mielk.fn.run(self.callback, e.object);
            },
            change: function (e) {
                if (!e.value) {
                    mielk.fn.run(self.callback, null);
                }
            }
        });


        return {
            view: container
        };

    })();

}
WordtypePanel.prototype = {
    view: function () {
        return this.ui.view;
    }
};

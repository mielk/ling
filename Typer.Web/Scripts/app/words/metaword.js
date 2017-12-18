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
        var word = new Word(this, params);
        return word;
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
            , IsNew: self.isNew
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
            callback: function (result) {

                if (result < 0) {
                    var dictItem = (self.id !== 0 ? dict.MetawordUpdateError : dict.MetawordAddedError);
                    mielk.notify.display(dictItem.get([self.name]), false);
                } else if (self.id === 0) {
                    //New item.
                    self.trigger({ type: 'added' });
                    mielk.notify.display(dict.MetawordAdded.get([self.name]), true);
                    self.id === result;
                } else {
                    self.trigger({ type: 'updated' });
                    mielk.notify.display(dict.MetawordUpdate.get([self.name]), true);
                }

            },
            errorCallback: function () {
                var dictItem = (self.id !== 0 ? dict.MetawordUpdateError : dict.MetawordAddedError);
                mielk.notify.display(dictItem.get([self.name]), false);
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
            , text: function (item) { return item.name; }
            , formatSelection: function (item) { return item.name; }
            , formatResult: function (item) { return item.name; }
            , confirmWithFirstClick: true
            , initValue: self.value.id
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

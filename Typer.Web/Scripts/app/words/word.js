/*
 * Word
 *
 * Date: 2014-05-19 11:38
 *
 */
function Word(metaword, params) {

    'use strict';

    var self = this;

    //Class signature.
    self.Word = true;

    Entity.call(self, params);

    //Instance properties.
    self.parent = metaword;
    self.isCompleted = (params.IsCompleted || params.isCompleted ? true : false);
    self.language = Ling.Languages.getLanguage(params.languageId || params.LanguageId);
    self.properties = params.Properties || mielk.hashTable();
    self.grammarForms = params.GrammarForms || mielk.hashTable();
    self.edited = false;
    
    //Services.
    self.service = Ling.Words;
    
    //Delete unnecessary properties.
    delete self.items;
    delete self.listItem;
    delete self.categories;

}
mielk.objects.extend(Entity, Word);
mielk.objects.deleteProperties(Word.prototype, ['loadCategories', 'toListItem', 'createItemsMap', 'createSubitem', 'getItemByName', 'additionalViewItems']);
mielk.objects.addProperties(Word.prototype, {
    //inherited bind
    //inherited trigger
    //inherited setWeight
    //inherited activate
    //inherited getDatalinesDefinitions

      remove: function () {
        this.parent.removeItem(this);
        this.trigger({ type: 'remove' });
    }

    , clone: function () {
        var self = this;

        //Create a copy instance of Metaword with all primitive
        //properties given as initialize parameters.
        var obj = new Word(self.parent, {
              Id: self.id
            , Name: self.name
            , Weight: self.weight
            , LanguageId: self.language.id
            , IsActive: self.isActive
            , CreatorId: self.creatorId
            , CreateDate: self.createDate
            , IsApproved: self.isApproved
            , Positive: self.positive
            , Negative: self.negative
            , IsCompleted: self.isCompleted
            , Properties: self.properties.clone(true)
            , GrammarForms: self.grammarForms.clone(true)
            , IsNew: self.isNew
        });

        obj.cloned = true;

        return obj;

    }
    
    , detailsMethodName: 'GetGrammarForms'

    , controllerName: 'Words'

    //Editing entity.
    , edit: function () {
        var self = this;
        
        self.loadDetails();
        
        var editPanel = new EditWordPanel(self);
        editPanel.show();
        editPanel.bind({
            confirm: function (e) {
                self.update(e.object);
           }
        });
        
    }
    
    //[Override]
    , update: function (object) {
        var self = this;
        self.edited = true;
        self.name = object.name;
        self.weight = object.weight;
        self.isActive = object.isActive;
        self.properties = object.properties;
        self.grammarForms = object.grammarForms;
        self.isCompleted = self.checkIfComplete();
        self.trigger({ type: 'updated' });
    }

    , checkIfComplete: function() {
        var isComplete = true;
        this.grammarForms.each(function(key, value) {
            if (value.active !== false && !value.value) {
                isComplete = false;
            }
        });
        return isComplete;
    }

    //Pobiera informacje na temat elementów przypisanych do obiektu
    //reprezentowanego przez ten ListItem. Np. dla Metaword wyświetla
    //stan wszystkich przypisanych do niego wyrazów.
    , getDetails: function (methodName, fnSuccess, fnError) {

        mielk.db.fetch(this.controllerName, methodName, {
            'wordId': this.id
        }, {
            callback: fnSuccess,
            errorCallback: fnError
        });

    }

    , loadDetails: function () {

        //Jeżeli szczegóły tego wyrazu zostały już wcześniej pobrane,
        //nie ma sensu pobierać ich ponownie.
        //Dodatkowo, ponowne pobieranie powoduje kasowanie wyedytowanych
        //danych, które nie zdążyły jeszcze zostać zapisane do bazy.
        if (this.loaded) return;

        this.loadRequiredProperties();
        this.loadPropertiesValues();
        this.loadRequiredGrammarForms();
        this.loadGrammarFormsValues();
        this.loaded = true;
    }

    //[private]
    , loadRequiredProperties: function () {
        var self = this;
        var languageId = self.language.id;
        var wordtypeId = self.parent.wordtype.id;
        var requiredProperties = Ling.Grammar.getRequiredProperties(languageId, wordtypeId);

        mielk.arrays.each(requiredProperties, function(property) {
            self.properties.setItem(property.id, {
                  property: property
                , value: property.defaultValue
            });
        });

    }
    
    
    //[private]
    , loadPropertiesValues: function () {
        var self = this;
        
        var fnSuccess = function (results) {
            mielk.arrays.each(results, function (value) {
                var property = self.properties.getItem(value.PropertyId);
                if (!property) return;

                var option = property.property.options.getItem(value.ValueId);
                if (option) property.value = option;

            });
        };

        var fnError = function() {
            mielk.notify.display(dict.LoadingWordPropertiesError.get(), false, [self.name]);
        };

        self.getDetails('GetPropertyValues', fnSuccess, fnError);

    }
      

    //[private]
    , loadRequiredGrammarForms: function () {
        var self = this;
        var languageId = self.language.id;
        var wordtypeId = self.parent.wordtype.id;
        var requiredForms = Ling.Grammar.getRequiredGrammarForms(languageId, wordtypeId);

        mielk.arrays.each(requiredForms, function (group) {
            
            if (!group.isHeader) {
                group.forms.each(function(key, form) {
                    self.grammarForms.setItem(form.id, {
                          form: form
                        , value: null
                    });
                });
            }

        });

    }
      

    //[private]
    , loadGrammarFormsValues: function() {
        var self = this;

        var fnSuccess = function (results) {
            mielk.arrays.each(results, function (value) {
                var form = self.grammarForms.getItem(value.FormId);
                if (form) {
                    form.value = value.Content;
                }
            });
        };

        var fnError = function () {
            mielk.notify.display(dict.LoadingGrammarFormsError.get(), false, [self.name]);
        };

        self.getDetails('GetGrammarForms', fnSuccess, fnError);


    }


    //[Override]
    //Zwraca listę właściwości, które mają być edytowane w panelu edycji
    //dla tego typu Entity.
    , getEditedPropertiesList: function () {
        return [
              Ling.Enums.Properties.Id
            , Ling.Enums.Properties.Name
            , Ling.Enums.Properties.Weight
        ];
    }
      

    //[Override]
    //Zwraca tablicę zawierającą definicję zestawu danych
    //specyficzne dla danej podklasy typu Entity.
    , getSpecificDatalinesDefinitions: function () {
        return [];
    }
    


    //[Override]
    //Funkcja sprawdzająca czy Entity o takiej nazwie już istnieje.
    , checkName: function (name) {

        //Check if name is not empty.
        if (!name) return dict.NameCannotBeEmpty.get();
        
        //Check if name already exists in this language for its parent.
        var word = this.parent.getItemByName(this.language.id, name);
        if (word && word.id !== this.id) return dict.NameAlreadyExists.get();

        return true;
        
    }

    , getGrammarProperty: function (propertyId) {
        var property = this.properties.getItem(propertyId);
        return property ? property.property : null;
    }

    , getGrammarPropertyValue: function (propertyId) {
        var property = this.properties.getItem(propertyId);
        return property ? property.value : null;
    }

    , getGrammarForm: function(formId) {
        var form = this.grammarForms.getItem(formId);
        return form ? form.form : null;
    }

    , getGrammarFormValue: function (formId) {
        var form = this.grammarForms.getItem(formId);
        return form ? form.value : '';
    }
      
    , changeGrammarForm: function(formId, content) {
        var form = this.grammarForms.getItem(formId);
        if (form) {
            form.value = content;

            //Triggering event.
            var eventName = 'changeGrammarForm_' + form.form.id;
            this.trigger({
                type: eventName,
                value: content
            });
        }
    }

    , changePropertyValue: function (propertyId, valueId) {
        var property = this.properties.getItem(propertyId);
        if (property) {
            var value = property.property.options.getItem(valueId)
            if (value) {
                property.value = value;
                this.trigger({
                    type: property.property.changeEventName(),
                    value: value
                });
            }
        }
    }

    , updateFromSimilar: function (word) {
        var self = this;

        //Update grammar properties.
        mielk.db.fetch('Words', 'GetPropertyValues', {
            'wordId': word.id
        }, {
            async: false,
            callback: function (results) {
                mielk.arrays.each(results, function (property) {
                    self.changePropertyValue(property.PropertyId, property.ValueId);
                });
            }
        });

        //Update grammar forms.
        mielk.db.fetch('Words', 'GetGrammarForms', {
            'wordId': word.id
        }, {
            async: false,
            callback: function (results) {
                mielk.arrays.each(results, function (form) {
                    self.changeGrammarForm(form.FormId, form.Content);
                });
            }
        });



    }


    , activateGrammarForm: function(formId, value) {
        var form = this.grammarForms.getItem(formId);
        if (form) {
            form.active = value;
        }
    }
    //, update: function () {
    //    alert('Must by defined by implementing class');
    //}

    //[Override]
    , dto: function () {
        var self = this;

        return {
            Id: self.id
            , MetawordId: self.parent.id
            , LanguageId: self.language.id
            , Name: self.name
            , Weight: self.weight
            , IsCompleted: self.isCompleted
            , IsActive: self.isActive
            , CreatorId: self.creatorId
            , CreateDate: self.createDate
            , IsApproved: self.isApproved
            , Positive: self.positive
            , Negative: self.negative
            , Edited: self.edited ? true : false
            , Properties: (function () {
                var array = [];
                self.properties.each(function(key, item) {
                    array.push({
                        WordId: self.id
                        , PropertyId: item.property.id
                        , ValueId: item.value.id
                    });
                });
                return array;
            })()
            , GrammarForms: (function() {
                var array = [];
                self.grammarForms.each(function (key, item) {
                    array.push({
                        WordId: self.id
                        , FormId: item.form.id
                        , Content: item.value
                        , IsActive: item.active === true ? true : false
                    });
                });
                
                return array;
            })()
        };

    }

});
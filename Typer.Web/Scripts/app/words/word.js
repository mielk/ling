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
            , IsCompleted: self.isCompleted
            , Properties: self.properties.clone(true)
            , GrammarForms: self.grammarForms.clone(true)
        });

        return obj;

    }
    
    , detailsMethodName: 'GetGrammarForms'

    , controllerName: 'Words'

    //Editing entity.
    , edit: function () {
        this.loadDetails();
        
        var editPanel = new EditWordPanel(this);
        editPanel.show();
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
        this.loadRequiredProperties();
        this.loadPropertiesValues();
        this.loadRequiredGrammarForms();
        this.loadGrammarFormsValues();
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
                , value: null
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

    , getGrammarForm: function(formId) {
        var form = this.grammarForms.getItem(formId);
        return form ? form.value : '';
    }
      
    , changeGrammarForm: function(formId, content) {
        var form = this.grammarForms.getItem(formId);
        if (form) {
            form.value = content;
        }
    }

    //, update: function () {
    //    alert('Must by defined by implementing class');
    //}

});






//function PropertyManager(object) {
//    this.PropertyManager = true;
//    this.editObject = object;
//    this.entity = object.object;
//    this.items = new HashTable(null);

//    this.ui = (function () {
//        var container = jQuery('<div/>', {
//            'class': 'option-details-container'
//        });

//        return {
//            view: function () {
//                return container;
//            },
//            hide: function () {
//                $(container).css('display', 'none');
//            },
//            append: function (element) {
//                $(element).appendTo($(container));
//            }
//        };

//    })();

//}
//PropertyManager.prototype.view = function () {
//    return this.ui.view();
//};


//function WordPropertyManager(editObject) {
//    PropertyManager.call(this, editObject);
//    this.WordPropertyManager = true;
//    this.loadProperties();
//    this.loadValues();
//}
//mielk.objects.extend(PropertyManager, WordPropertyManager);
//WordPropertyManager.prototype.loadProperties = function () {
//    var metaword = this.entity.parent;
//    var languageId = this.entity.languageId;
//    var wordtypeId = metaword.wordtype.id;

//    var $properties = this.getPropertiesFromRepository(languageId, wordtypeId);
//    for (var i = 0; i < $properties.length; i++) {
//        var $property = $properties[i];
//        $property.Value = this.entity.getPropertyValue($property.Id);
//        var property = new WordProperty($property);
//        this.items.setItem(property.id, property);
//        this.ui.append(property.view());
//    }

//};
//WordPropertyManager.prototype.getPropertiesFromRepository = function (languageId, wordtypeId) {
//    return my.db.fetch('Words', 'GetProperties', { 'languageId': languageId, 'wordtypeId': wordtypeId });
//};
//WordPropertyManager.prototype.loadValues = function () {
//    var self = this;
//    this.entity.properties.each(function (key, object) {
//        var property = self.items.getItem(key);
//        if (property) {
//            property.setValue(object.value);
//        }
//    });

//};
//WordPropertyManager.prototype.copyDetails = function (id) {
//    var self = this;
//    var properties = this.entity.getPropertiesFromRepository(id);
//    for (var i = 0; i < properties.length; i++) {
//        var property = properties[i];
//        var def = self.items.getItem(property.PropertyId);
//        if (def) {
//            def.changeValue(my.text.parse(property.Value));
//        }
//    }
//};

//function WordProperty(params) {
//    this.WordProperty = true;
//    this.eventHandler = new EventHandler();
//    var self = this;
//    this.id = params.Id;
//    this.name = params.Name;
//    this.value = params.Value;
//    this.originalValue = params.Type === 'boolean' ? false : 0;

//    this.ui = (function () {



//        var input = (function () {
//            switch (params.Type) {
//                case 2:
//                    return my.ui.radio({
//                        container: container,
//                        name: self.name,
//                        value: self.value,
//                        options: self.parseToRadioOptions(params.Options)
//                    });
//                case 1:
//                    return my.ui.checkbox({
//                        container: container,
//                        name: params.Name,
//                        caption: params.Name,
//                        checked: params.Default
//                    });
//                default:
//                    return null;
//            }
//        })();

//        self.value = input.value();

//        input.bind({
//            click: function (e) {
//                if (e.value !== self.value) {
//                    self.value = e.value;
//                    self.trigger({
//                        type: 'change',
//                        value: self.value
//                    });
//                }
//            }
//        });

//        return {
//            view: function () {
//                return container;
//            },
//            change: function (value) {
//                if (input.change) {
//                    input.change(value);
//                }
//            }
//        };

//    })();

//}
//WordProperty.prototype.view = function () {
//    return this.ui.view();
//};
//WordProperty.prototype.parseToRadioOptions = function (options) {
//    var results = {};
//    for (var i = 0; i < options.length; i++) {
//        var option = options[i];
//        var caption = option.Name;
//        var key = option.Id;
//        var checked = (this.value ? this.value === key : option.Default);

//        var result = {
//            key: key,
//            value: key,
//            caption: caption,
//            checked: checked
//        };

//        results[key] = result;

//    }

//    return results;

//};
//WordProperty.prototype.bind = function (e) {
//    this.eventHandler.bind(e);
//};
//WordProperty.prototype.trigger = function (e) {
//    this.eventHandler.trigger(e);
//};
//WordProperty.prototype.setValue = function (value) {
//    this.originalValue = value;
//    this.ui.change(value);
//};
//WordProperty.prototype.isChanged = function () {
//    return (this.originalValue != this.value);
//};
//WordProperty.prototype.changeValue = function (value) {
//    this.ui.change(value);
//};





//OptionEntity.prototype.update = function (params, properties, details, complete) {
//    if (!params.OptionEditEntity) {
//        alert('Illegal argument passed to function Metaword.update');
//        return;
//    }

//    var self = this;
//    var completed = (this.isCompleted === complete ? undefined : complete);
//    var name = (this.name === params.name ? undefined : params.name);
//    var weight = (this.weight === params.weight ? undefined : params.weight);

//    //Check if there are any changes.
//    if (completed !== undefined || name || weight) {
//        this.isCompleted = complete;
//        this.name = (name === undefined ? this.name : name);
//        this.weight = (weight === undefined ? this.weight : weight);


//        if (this.new) {

//            this.parent.addLog({
//                event: 'add',
//                item: self
//            });

//            this.trigger({
//                type: 'add',
//                item: self
//            });

//        } else {
//            this.parent.addLog({
//                event: 'edit',
//                item: self
//            });

//            this.trigger({
//                type: 'update',
//                name: self.name,
//                weight: self.weight,
//                complete: self.isCompleted
//            });


//        }

//    }


//    //Update properties and details.
//    this.updateProperties(properties);
//    this.updateDetails(details);

//};
//OptionEntity.prototype.updateProperties = function () {
//    alert('Must be defined in implementing class');
//};
//OptionEntity.prototype.updateDetails = function () {
//    alert('Must be defined in implementing class');
//};



//Word.prototype.updateProperties = function (properties) {
//    var self = this;

//    properties.items.each(function (key, object) {

//        var property = self.properties.getItem(key);
//        if (!property || object.isChanged()) {
//            property = {
//                id: object.id,
//                value: object.value
//            };
//            self.properties.setItem(property.id, property);

//            //If id is 0, this is a newly created word and its
//            //properties have to be uploaded other way.
//            if (self.id) {
//                self.parent.addLog({
//                    event: 'properties',
//                    wordId: self.id,
//                    propertyId: property.id,
//                    value: property.value
//                });
//            }
//        }

//    });

//};
//Word.prototype.updateDetails = function (forms) {
//    var self = this;

//    forms.forms.each(function (key, object) {

//        var form;
//        //var form = self.details.getItem(key);
//        if (object.isChanged()) {
//            form = {
//                id: object.id,
//                value: object.value
//            };
//            self.details.setItem(form.id, form);

//            //If id is 0, this is a newly created word and its
//            //properties have to be uploaded other way.
//            if (self.id) {
//                self.parent.addLog({
//                    event: 'details',
//                    wordId: self.id,
//                    form: form.id,
//                    value: form.value
//                });
//            }

//        }

//    });

//};
//Word.prototype.loadProperties = function () {
//    this.properties = new HashTable(null);
//    var $values = this.getPropertiesFromRepository(this.id);
//    for (var i = 0; i < $values.length; i++) {
//        var set = $values[i];
//        var property = {
//            id: set.PropertyId,
//            value: my.text.parse(set.Value)
//        };
//        this.properties.setItem(property.id, property);
//    };
//};
//Word.prototype.getPropertiesFromRepository = function (wordId) {
//    return my.db.fetch('Words', 'GetPropertyValues', { 'wordId': wordId });
//};
//Word.prototype.getPropertyValue = function(key){
//    var property = this.properties.getItem(key);
//    return property ? property.value : null;
//};
//Word.prototype.loadDetails = function () {
//    this.details = new HashTable(null);
//    var $values = this.getFormsFromRepository(this.id);
//    for (var i = 0; i < $values.length; i++) {
//        var set = $values[i];
//        var form = {
//            id: set.FormId,
//            value: set.Content
//        };
//        this.details.setItem(form.id, form);
//    };
//};
//Word.prototype.getFormsFromRepository = function (wordId) {
//    return my.db.fetch('Words', 'GetGrammarForms', { 'wordId': wordId });
//};







//function OptionEditEntity(properties) {
//    this.OptionEditEntity = true;
//    this.id = properties.id;
//    this.name = properties.name;
//    this.weight = properties.weight;
//    this.isActive = properties.isActive;
//    this.object = properties.object;
//    this.languageId = properties.languageId;
//    this.isActive = properties.isActive || true;

//    //Logic.
//    this.eventHandler = new EventHandler();

//    //Logic.
//    this.eventHandler = new EventHandler();
//    this.logs = [];

//    //this.loadDetails();

//}
//OptionEditEntity.prototype.bind = function (e) {
//    this.eventHandler.bind(e);
//};
//OptionEditEntity.prototype.trigger = function (e) {
//    this.eventHandler.trigger(e);
//};
//OptionEditEntity.prototype.setWeight = function (value) {
//    this.weight = value;
//    this.trigger({
//        type: 'changeWeight',
//        weight: value
//    });
//};
//OptionEditEntity.prototype.addLog = function (log) {
//    this.logs.push(log);
//};
//OptionEditEntity.prototype.editItem = function () {
//    alert('Must be defined by implementing class');
//};
//OptionEditEntity.prototype.createPropertyManager = function () {
//    alert('Must be defined by implementing class');
//};
//OptionEditEntity.prototype.createDetailsManager = function () {
//    alert('Must be defined by implementing class');
//};



//function WordOptionEditEntity(properties) {
//    OptionEditEntity.call(this, properties);
//    this.WordOptionEditEntity = true;
//}
//mielk.objects.extend(OptionEditEntity, WordOptionEditEntity);
//WordOptionEditEntity.prototype.createPropertyManager = function () {
//    return new WordPropertyManager(this, {});
//};
//WordOptionEditEntity.prototype.createDetailsManager = function (params) {
//    return new GrammarManager(this, params);
//};

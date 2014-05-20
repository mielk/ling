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
    
    //Services.
    self.service = Ling.Words;
    
    //Delete unnecessary properties.
    delete self.items;
    delete self.listItem;
    delete self.categories;

}



mielk.objects.extend(Entity, Word);
mielk.objects.deleteProperties(Word.prototype, ['loadCategories', 'toListItem', 'createItemsMap', 'createSubitem', 'getItemByName']);
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
            id: self.id
            , name: self.name
            , weight: self.weight
            , languageId: self.language.id
            , isCompleted: self.isCompleted
        });

        return obj;

    }
    
    , detailsMethodName: 'GetGrammarForms'

    , controllerName: 'Words'

    //Metoda abstrakcyjna, musi być zaimplementowana w każdej klasie
    //dziedziczączej po tej - określa zestaw kontrolek specyficznych
    //dla danego podtypu entity, które mają być wyświetlone w ListView,
    //np. dla wyrazów dodatkowym elementem będzie właściwość [Wordtype].
    , additionalViewItems: function () {
        mielk.notify.display('additionalViewItems: Must be defined in Word.js', false);
    }


    //Editing entity.
    , edit: function () {
        var editPanel = new EditItemPanel(this);
        editPanel.show();
    }
      

    //Pobiera informacje na temat elementów przypisanych do obiektu
    //reprezentowanego przez ten ListItem. Np. dla Metaword wyświetla
    //stan wszystkich przypisanych do niego wyrazów.
    , getDetails: function (fnSuccess, fnError, async) {

        mielk.db.fetch(this.controllerName, this.detailsMethodName, {
            'id': this.id
        }, {
            async: async !== undefined ? async : true,
            traditional: true,
            cache: false,
            callback: fnSuccess,
            errorCallback: fnError
        });

    }

    , loadDetails: function () {
        var self = this;

        var fnSuccess = function (result) {
            
        };

        var fnError = function() {
            mielk.notify.display('Error when trying to get items of the entity | Group: ' + self.controllerName + ' | Id: ' + self.id, false);
        };

        self.getDetails(fnSuccess, fnError, false);

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
        mielk.notify.display('Must be defined in implemented class', false);
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

    //, update: function () {
    //    alert('Must by defined by implementing class');
    //}

});



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
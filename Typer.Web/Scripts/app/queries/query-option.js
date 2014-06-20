/*
 * Query option
 *
 * Date: 2014-06-20 13:42
 *
 */

function QueryOption(query, params) {

    'use strict';

    var self = this;

    //Class signature.
    self.QueryOption = true;

    Entity.call(self, params);

    //Instance properties.
    self.parent = query;
    self.isCompleted = (params.IsCompleted || params.isCompleted ? true : false);
    self.language = Ling.Languages.getLanguage(params.languageId || params.LanguageId);

    self.edited = false;

    //Services.
    self.service = Ling.Queries;

    //Delete unnecessary properties.
    delete self.items;
    delete self.listItem;
    delete self.categories;

}
mielk.objects.extend(Entity, QueryOption);
mielk.objects.deleteProperties(QueryOption.prototype, ['loadCategories', 'toListItem', 'createItemsMap', 'createSubitem', 'getItemByName', 'additionalViewItems']);
mielk.objects.addProperties(QueryOption.prototype, {
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
        var obj = new QueryOption(self.parent, {
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
            //
            , IsNew: self.isNew
        });

        obj.cloned = true;

        return obj;

    }

    , detailsMethodName: ''

    , controllerName: 'Queries'

    //Editing entity.
    , edit: function () {
        var self = this;

        self.loadDetails();

        var editPanel = new EditOptionPanel(self);
        editPanel.show();
        editPanel.bind({
            confirm: function (e) {
                self.update(e.object);
            }
        });

    }

    //[Override]
    , update: function (object) {
        alert('QueryOption.update :: TODO');
        return;
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

    , checkIfComplete: function () {
        alert('QueryOption.update :: TODO');
        return;
        var isComplete = true;
        this.grammarForms.each(function (key, value) {
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
        alert('QueryOption.update :: TODO');
        return;
        mielk.db.fetch(this.controllerName, methodName, {
            'wordId': this.id
        }, {
            callback: fnSuccess,
            errorCallback: fnError
        });

    }

    , loadDetails: function () {
        alert('QueryOption.update :: TODO');
        return;

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
        alert('QueryOption.update :: TODO');
        return;

        var self = this;
        var languageId = self.language.id;
        var wordtypeId = self.parent.wordtype.id;
        var requiredProperties = Ling.Grammar.getRequiredProperties(languageId, wordtypeId);

        mielk.arrays.each(requiredProperties, function (property) {
            self.properties.setItem(property.id, {
                property: property
                , value: property.defaultValue
            });
        });

    }


    //[private]
    , loadPropertiesValues: function () {
        alert('QueryOption.update :: TODO');
        return;
        var self = this;

        var fnSuccess = function (results) {
            mielk.arrays.each(results, function (value) {
                var property = self.properties.getItem(value.PropertyId);
                if (!property) return;

                var option = property.property.options.getItem(value.ValueId);
                if (option) property.value = option;

            });
        };

        var fnError = function () {
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
                group.forms.each(function (key, form) {
                    self.grammarForms.setItem(form.id, {
                        form: form
                        , value: null
                    });
                });
            }

        });

    }


    //[private]
    , loadGrammarFormsValues: function () {
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
        alert('QueryOption.update :: TODO');
        return;
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
        alert('QueryOption.update :: TODO');
        return;
        return [];
    }



    //[Override]
    //Funkcja sprawdzająca czy Entity o takiej nazwie już istnieje.
    , checkName: function (name) {

        alert('QueryOption.update :: TODO');
        return;

        //Check if name is not empty.
        if (!name) return dict.NameCannotBeEmpty.get();

        //Check if name already exists in this language for its parent.
        var word = this.parent.getItemByName(this.language.id, name);
        if (word && word.id !== this.id) return dict.NameAlreadyExists.get();

        return true;

    }

    , changePropertyValue: function (propertyId, valueId) {
        alert('QueryOption.update :: TODO');
        return;
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

    //[Override]
    , dto: function () {

        alert('QueryOption.update :: TODO');
        return;

        var self = this;

        return {
            Id: self.id
            , QueryId: self.query.id
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
                self.properties.each(function (key, item) {
                    array.push({
                        WordId: self.id
                        , PropertyId: item.property.id
                        , ValueId: item.value.id
                    });
                });
                return array;
            })()
            , GrammarForms: (function () {
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
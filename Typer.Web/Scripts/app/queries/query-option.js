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
    self.name = params.Name || params.Content || '';
    self.content = params.Content || params.Name || '';
    self.isMain = params.IsMain || false;
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

      remove: function () {
        this.parent.removeItem(this);
        this.trigger({ type: 'remove' });
    }

    //[Override]
    , key: function () {
        return this.content;
    }

    , clone: function () {
        var self = this;

        //Create a copy instance of Metaword with all primitive
        //properties given as initialize parameters.
        var obj = new QueryOption(self.parent, {
              Id: self.id
            , Name: self.name || self.content
            , Content: self.content || self.name
            , Weight: self.weight
            , LanguageId: self.language.id
            , IsMain: self.isMain
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



    //[Override]
    //Zwraca listę właściwości, które mają być edytowane w panelu edycji
    //dla tego typu Entity.
    , getEditedPropertiesList: function () {
        return [
              Ling.Enums.Properties.Id
            , Ling.Enums.Properties.Content
            , Ling.Enums.Properties.Weight
            , Ling.Enums.Properties.IsMain
        ];
    }



    //[Override]
    //Zwraca tablicę zawierającą definicję zestawu danych
    //specyficzne dla danej podklasy typu Entity.
    , getSpecificDatalinesDefinitions: function () {
        return [];
    }
    


    //[Override]
    //Zwraca tablicę zawierającą definicję zestawu danych, które
    //mają być wyświetlane w panelu edycji tego obiektu.
    , getDatalinesDefinitions: function (object) {
        var datalines = [];
        var properties = object.getEditedPropertiesList();

        //[Id]
        if ($.inArray(Ling.Enums.Properties.Id, properties) > -1) {
            datalines.push({
                property: Ling.Enums.Properties.Id,
                index: 0,
                label: dict.Id.get(),
                value: object.id,
                callback: function (value) {
                    object.id = value;
                },
                inputCss: {
                    'width': '60px',
                    'text-align': 'center',
                    'border': '1px solid #777',
                    'background-color': 'white'
                }
            });
        }


        //[Content]
        if ($.inArray(Ling.Enums.Properties.Content, properties) > -1) {
            datalines.push({
                property: Ling.Enums.Properties.Content,
                index: 1,
                label: dict.Content.get(),
                value: object.content,
                callback: function (value) {
                    object.content = value;
                    object.name = value;
                    object.trigger({ type: 'changeContent', value: value });
                },
                validation: function (params) {
                    return object.entity.checkContent(params.value);
                },
                editable: true
            });
        }


        //[Weight]
        if ($.inArray(Ling.Enums.Properties.Weight, properties) > -1) {
            var weightPanel = new WeightPanel({
                value: object.weight
                , callback: function (value) {
                    object.weight = value;
                    object.trigger({ type: 'changeWeight', value: value });
                }
                , css: { 'margin': '9px 0', 'height': '16px' }
            });
            datalines.push({
                property: 'weight',
                index: 2,
                label: dict.Weight.get(),
                value: object.weight,
                panel: weightPanel.view()
                //editable: true
            });
        }


        //[IsMain]
        if ($.inArray(Ling.Enums.Properties.IsMain, properties) > -1) {
            var checkboxPanel = new CheckboxPanel({
                  value: object.isMain
                , callback: function (value) {
                    object.isMain = value;
                    object.trigger({ type: 'changeDisplayStatus', value: value });
                  }
            });
            datalines.push({
                property: Ling.Enums.Properties.IsMain,
                index: 3,
                label: dict.IsDisplayed.get(),
                value: object.isMain,
                panel: checkboxPanel.view(),
                editable: true
            });
        }


        //Add class-specific fields.
        mielk.arrays.each(this.getSpecificDatalinesDefinitions(object), function (item) {
            datalines.push(item);
        });

        datalines.sort(function (a, b) {
            return a.index < b.index ? -1 : 1;
        });

        return datalines;

    }

    //[Override]
    , loadDetails: function () {

        //Jeżeli szczegóły tego zapytania zostały już wcześniej pobrane,
        //nie ma sensu pobierać ich ponownie.
        //Dodatkowo, ponowne pobieranie powoduje kasowanie wyedytowanych
        //danych, które nie zdążyły jeszcze zostać zapisane do bazy.
        if (this.loaded) return;

        //W tym momencie nie jest wymagane ładowanie żadnych dodatkowych właściwości
        //do obiektu typu QuestionOpion.
        this.loaded = true;

    }

    , controllerName: 'Questions'

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
        var self = this;
        self.edited = true;
        self.content = object.content;
        self.name = object.content;
        self.weight = object.weight;
        self.isMain = object.isMain;
        self.isActive = object.isActive;
        self.properties = object.properties;
        self.isCompleted = self.checkIfComplete();
        self.trigger({ type: 'updated' });
    }

    , checkIfComplete: function () {
        //alert('QueryOption.checkIfComplete :: TODO');
        return false;
    }

    , htmlContent: function () {
        var self = this;
        var content = self.content;
        var parts = content.split('#');

        //UI.
        var container = jQuery('<div/>');
        mielk.arrays.each(parts, function (part) {
            if (!part) return;

            if ($.isNumeric(part)) {
                // ReSharper disable once UnusedLocals
                var variant = (function () {
                    var id = Number(part);
                    var set = self.parent.getVariantSet(id);
                    var view = jQuery('<span/>', {
                        'class': 'complex',
                        html: set.tag
                    });
                    $(view).appendTo(container);
                })();
                
                //Dodać binding.

            } else {
                var span = jQuery('<span/>', {
                    'class': 'plain',
                    html: part
                });
                $(span).appendTo(container);
            }

        });

        return container;

    }



    //Funkcja sprawdzająca czy Entity o takiej treści już istnieje.
    , checkContent: function (content) {

        //Check if name is not empty.
        if (!content) return dict.ContentCannotBeEmpty.get();

        //Check if name already exists in this language for its parent.
        var option = this.parent.getOptionByContent(this.language.id, content);
        if (option && option.id !== this.id) return dict.ContentAlreadyExists.get();

        return true;

    }

    //[Override]
    , dto: function () {

        var self = this;

        return {
              Id: self.id
            , QueryId: self.parent.id
            , LanguageId: self.language.id
            , Weight: self.weight
            , Content: self.content
            , IsMain: self.isMain
            , IsCompleted: self.isCompleted
            , IsActive: self.isActive
            , CreatorId: self.creatorId
            , CreateDate: self.createDate
            , IsApproved: self.isApproved
            , Positive: self.positive
            , Negative: self.negative
            , Edited: self.edited ? true : false
        };

    }

});
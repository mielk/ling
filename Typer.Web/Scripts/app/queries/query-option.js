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
    self.content = params.Content || '';
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
            , Content: self.content
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
        var self = this;
        self.edited = true;
        self.name = object.name;
        self.content = object.Content;
        self.weight = object.weight;
        self.isActive = object.isActive;
        self.properties = object.properties;
        self.isCompleted = self.checkIfComplete();
        self.trigger({ type: 'updated' });
    }

    , checkIfComplete: function () {
        alert('QueryOption.update :: TODO');
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



    //[Override]
    //Funkcja sprawdzająca czy Entity o takiej nazwie już istnieje.
    , checkName: function (name) {

        //Check if name is not empty.
        if (!name) return dict.NameCannotBeEmpty.get();

        //Check if name already exists in this language for its parent.
        var option = this.parent.getOptionByName(this.language.id, name);
        if (option && option.id !== this.id) return dict.NameAlreadyExists.get();

        return true;

    }

    //[Override]
    , dto: function () {

        var self = this;

        return {
              Id: self.id
            , QueryId: self.parent.id
            , LanguageId: self.language.id
            , Name: self.name
            , Content: self.content
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
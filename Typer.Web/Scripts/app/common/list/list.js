﻿
function ListManager(properties) {

    'use strict';
    
    var self = this;
    
    //Class signature.
    self.ListManager = true;
    

    self.eventHandler = mielk.eventHandler();

    self.filterManager = new ListFilterManager(self, properties.filters);
    this.itemsManager = new ListItemsManager(this);
    self.pagerManager = new ListPager(self, properties);

    self.view = new ListView(self, properties);
    self.view.render({
          columns: properties.columns
        , filter: self.filterManager.view()
        , items: self.itemsManager.view()
        , pager: self.pagerManager.view()
    });

}

ListManager.prototype = {    
    bind: function (e) {
        this.eventHandler.bind(e);
    }
    
    , trigger: function (e) {
        this.eventHandler.trigger(e);
    }
    
    , start: function () {
        this.filter({ page: 1, pageSize: Ling.Config.entities.pageSize });
    }
    
    , filter: function (e) {
        this.filterManager.filter(e);
    }

    , moveToPage: function (page) {
        this.filter({ page: page });
    }
    
    //newItem: function () {
    //    //var e = this.filterValues;
    //    //e.Categories = [];
    //    //e.UserLanguages = my.languages.userLanguages();

    //    //return this.creator(e);

    //},
    
    , pageItems: function () {
        return this.pagerManager.pageItems;
    }
    
    , createObject: function () {
        alert('Must be defined in implementing class');
    }

    , createNewItem: function () {
        var self = this;
        
        //Aktualnie podane filtry są przekazywane jako parametr,
        //żeby ustawić domyślne wartości dla nowo tworzonego 
        //elementu, np. jeżeli aktualnie wyświetlone są rzeczowniki
        //o wadze 5, to po wciśnięciu przycisku [Add], nowy metawyraz
        //domyślnie również będzie rzeczownikiem o wadze 5.
        var item = self.emptyItem(self.filterManager.filters);
        
        //Update view after adding a new item.
        item.bind({
            add: function () {
                self.filterManager.filter({});
            }
        });
        
        //Edit new item.
        item.edit();
        
    }
    
    , emptyItem: function () {
        alert('Must be defined in implementing class');
    }
    
};





function ListView(manager) {

    'use strict';

    var self = this;

    //Class signature.
    self.ListView = true;

    self.manager = manager;
    self.container = $(document.body);

}
ListView.prototype = {
    clear: function () {
        $(this.container).empty();
    },

    append: function (element) {
        $(element).appendTo(this.container);
    },

    addHeaderRow: function (columns) {
        var headerContainer = jQuery('<div/>', { 'class': 'item header' }).appendTo($(this.container));
        mielk.arrays.each(columns, function (item) {
            jQuery('<div/>', { 'class': item, html: item }).appendTo($(headerContainer));
        });
        return headerContainer;
    },

    createAddButton: function () {
        var manager = this.manager;
        this.addButton = jQuery('<a/>', {
            id: 'add-item', 'class': 'add', html: 'Add'
        }).bind({
            click: function () {
                manager.createNewItem();
            }
        }).appendTo(jQuery('<div/>', {'id': 'add-button-container' }).appendTo($(this.container)));
    },

    render: function (properties) {
        this.append(properties.filter);
        this.addHeaderRow(properties.columns);
        if (properties.items) this.append(properties.items);
        this.createAddButton();
        if (properties.pager) this.append(properties.pager);
    }

};




// Interface
function ListManagerPanel(controller) {

    'use strict';

    var self = this;
    self.ListManagerPanel = true;
    self.controller = controller;
}
ListManagerPanel.prototype = {
    view: function () {
        alert('Must be defined in class implemeneted this class');
    }
};
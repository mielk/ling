
function ListManager(properties) {

    'use strict';
    
    var self = this;
    
    //Class signature.
    self.ListManager = true;
    

    self.eventHandler = mielk.eventHandler();

    //this.filterManager = new ListFilterManager(this, properties.filters);

    //this.itemsManager = new ListItemsManager(this);

    //this.pagerManager = new ListPager(this, properties);

    this.view = new ListView(this, properties);
    this.view.render({
        columns: properties.columns,
        //filter: self.filterManager.view(),
        items: self.itemsManager.view(),
        pager: self.pagerManager.view()
    });

}

ListManager.prototype = {    
    bind: function (e) {
        this.eventHandler.bind(e);
    },
    
    trigger: function (e) {
        this.eventHandler.trigger(e);
    },
    
    start: function () {
        this.filter({ page: 1, pageSize: 10 });
    },
    
    filter: function (e) {
        //this.filterManager.filter(e);
    },

    moveToPage: function (page) {
        this.filter({ page: page });
    },
    
    newItem: function () {
        var e = this.filterValues;
        e.Categories = [];
        e.UserLanguages = my.languages.userLanguages();

        return this.creator(e);

    },
    
    pageItems: function () {
        return this.pagerManager.pageItems;
    },
    
    createObject: function () {
        alert('Must be defined in implementing class');
    },
    
    createListItem: function () {
        alert('Must be defined in implementing class');
    },
    
    createNewItem: function () {
        var self = this;
        var item = this.emptyItem();
        item.bind({
            add: function () {
                self.filterManager.filter({});
            }
        });
        item.edit();
    },
    
    emptyItem: function () {
        alert('Must be defined in implementing class');
    },
    
    getLanguages: function () {
        if (!this.languages) {
            this.languages = my.languages.userLanguages();
        }
        return this.languages;
    },
    
    getLanguagesIds: function () {
        if (!this.languagesIds) {
            this.languagesIds = my.languages.userLanguagesId();
        }
        return this.languagesIds;
    }
    
};
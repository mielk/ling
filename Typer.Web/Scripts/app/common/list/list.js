
function ListManager(properties) {

    'use strict';
    
    var self = this;
    
    //Class signature.
    self.ListManager = true;
    

    self.eventHandler = mielk.eventHandler();

    self.filterManager = new ListFilterManager(this, properties.filters);

    //this.itemsManager = new ListItemsManager(this);

    //this.pagerManager = new ListPager(this, properties);

    this.view = new ListView(this, properties);
    this.view.render({
          columns: properties.columns
        , filter: self.filterManager.view()
        //, items: self.itemsManager.view()
        //, pager: self.pagerManager.view()
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
        //var e = this.filterValues;
        //e.Categories = [];
        //e.UserLanguages = my.languages.userLanguages();

        //return this.creator(e);

    },
    
    pageItems: function () {
//        return this.pagerManager.pageItems;
    },
    
    createObject: function () {
        alert('Must be defined in implementing class');
    },
    
    createListItem: function () {
        alert('Must be defined in implementing class');
    },
    
    createNewItem: function () {
        //var self = this;
        //var item = this.emptyItem();
        //item.bind({
        //    add: function () {
        //        self.filterManager.filter({});
        //    }
        //});
        //item.edit();
    },
    
    emptyItem: function () {
        alert('Must be defined in implementing class');
    },
    
    getLanguages: function () {
        //if (!this.languages) {
        //    this.languages = my.languages.userLanguages();
        //}
        //return this.languages;
    },
    
    getLanguagesIds: function () {
        //if (!this.languagesIds) {
        //    this.languagesIds = my.languages.userLanguagesId();
        //}
        //return this.languagesIds;
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
        $(element).appendTo($(this.container));
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
        this.append(properties.items);
        this.createAddButton();
        this.append(properties.pager);
    }

};




// Interface
function ListManagerPanel(manager) {

    'use strict';

    var self = this;
    self.ListManagerPanel = true;
    self.manager = manager;
}
ListManagerPanel.prototype = {
    view: function () {
        return this.container;
    }
}




function ListPager(controller, properties) {
    ListManagerPanel.call(this, controller);
    this.ListPager = true;
    var self = this;
    this.pageItems = properties.pageItems || 10;
    this.page = properties.page || 1;
    this.totalItems = properties.totalItems || 0;
    this.totalPages = 1;

    this.controller.bind({
        filter: function (e) {
            self.page = e.page;
            self.setTotalItems(e.total);
            self.refresh();
        }
    });

    this.ui = (function () {
        var container = jQuery('<div/>', {
            'class': 'pager'
        });

        // ReSharper disable UnusedLocals
        var first = element('first', 'First', function () { self.controller.moveToPage(1); });
        var previous = element('previous', 'Previous', function () { self.controller.moveToPage(self.page - 1); });
        var current = element('current', '', function () { });
        var next = element('next', 'Next', function () { self.controller.moveToPage(self.page + 1); });
        var last = element('last', 'Last', function () { self.controller.moveToPage(self.totalPages); });
        // ReSharper restore UnusedLocals

        function element(cssClass, caption, clickCallback) {
            return jQuery('<div/>', {
                'class': 'pager-item ' + cssClass,
                html: caption
            }).bind({
                click: clickCallback
            }).appendTo($(container));
        }

        return {
            view: function () {
                return container;
            },
            currentHtml: function (value) {
                if (value === undefined) {
                    return current.innerHTML;
                } else {
                    $(current).html(value);
                }
                return true;
            },
            enablePrevious: function (value) {
                display(first, value);
                display(previous, value);
            },
            enableNext: function (value) {
                display(next, value);
                display(last, value);
            }
        };

    })();

}
mielk.objects.extend(ListManagerPanel, ListPager);
ListPager.prototype.setTotalItems = function (items) {
    this.totalItems = items;
    this.totalPages = Math.max(Math.floor(this.totalItems / this.pageItems) + (this.totalItems % this.pageItems ? 1 : 0), 1);
};
ListPager.prototype.view = function () {
    return this.ui.view();
};
ListPager.prototype.refresh = function () {
    this.ui.currentHtml(this.page + '/' + this.totalPages);
    this.ui.enablePrevious(this.page !== 1);
    this.ui.enableNext(this.page !== this.totalPages);
};


function ListItemsManager(controller) {
    ListManagerPanel.call(this, controller);
    this.ListItemsManager = true;
    var self = this;
    this.container = jQuery('<div/>');
    this.items = [];

    this.controller.bind({
        filter: function (e) {
            self.refresh(e.items);
        }
    });

}
mielk.objects.extend(ListManagerPanel, ListItemsManager);
ListItemsManager.prototype.refresh = function (items) {
    this.clear();

    for (var i = 0; i < items.length; i++) {
        var object = this.controller.createObject(items[i]);
        var item = this.controller.createListItem(object);
        object.injectListItem(item);
        item.appendTo($(this.container));
        this.items[i] = item;
    }

    this.loadDetails();

};
ListItemsManager.prototype.clear = function () {
    for (var i = 0; i < this.items.length; i++) {
        this.items[i].remove();
    }
};
ListItemsManager.prototype.loadDetails = function () {
    for (var i = 0; i < this.items.length; i++) {
        var item = this.items[i];
        item.loadDetails();
    }
};
function ListManager(properties) {
    this.ListManager = true;
    var self = this;
    this.name = properties.name;
    this.creator = properties.creator;
    this.eventHandler = new EventHandler();

    this.filterManager = new ListFilterManager(this, properties.filters);

    this.itemsManager = new ListItemsManager(this);

    this.pagerManager = new ListPager(this, properties);

    this.view = new ListView(this, properties);
    this.view.render({
        columns: properties.columns,
        filter: self.filterManager.view(),
        items: self.itemsManager.view(),
        pager: self.pagerManager.view()
    });
    
}
ListManager.prototype.bind = function(e) {
    this.eventHandler.bind(e);
};
ListManager.prototype.trigger = function (e) {
    this.eventHandler.trigger(e);
};
ListManager.prototype.start = function () {
    this.filter({ page: 1, pageSize: 10 });
};
ListManager.prototype.filter = function (e) {
    this.filterManager.filter(e);
};
ListManager.prototype.load = function (items) {
    this.view.clear();

    for (var i = 0; i < this.pager.pageItems && i < items.length; i++) {
        var object = items[i];
        var itemLine = this.creator(object);
        itemLine.appendTo(this.view.items);
        //var wordLine = new WordLine(word);
        //wordLine.appendTo(this.words);
    }

    //this.pager.refresh();

};
ListManager.prototype.moveToPage = function (page) {
    //var $page = Math.max(Math.min(this.totalPages(), page), 1);
    //if ($page !== this.currentPage) {

    //};
};
ListManager.prototype.newItem = function () {
    var e = this.filterValues;
    e.Categories = [];
    e.UserLanguages = getLanguages();

    return this.creator(e);

};
ListManager.prototype.pageItems = function () {
    return this.pagerManager.pageItems;
};


function ListView(controller) {
    this.controller = controller;
    this.container = $(document.body);
}
ListView.prototype.clear = function () {
    $(this.items).empty();
};
ListView.prototype.append = function (element) {
    $(element).appendTo($(this.container));
};
ListView.prototype.addHeaderRow = function (columns) {
    var headerContainer = jQuery('<div/>', { 'class': 'word header' }).appendTo($(this.container));
    for (var i = 0; i < columns.length; i++) {
        var name = columns[i];
        jQuery('<div/>', { 'class': name, html: name }).appendTo($(headerContainer));
    }
    return headerContainer;
};
ListView.prototype.createAddButton = function() {
    this.addButton = jQuery('<a/>', {
        id: 'add-item', 'class': 'add', html: 'Add'
    }).bind({
        click: function () {
            //var item = createNewItem();
            //item.displayEditForm();
        }
    }).appendTo(jQuery('<div/>', { 'id': 'add-button-container' }).appendTo($(this.container)));
};
ListView.prototype.render = function (properties) {
    this.append(properties.filter);
    this.addHeaderRow(properties.columns);
    this.append(properties.items);
    this.createAddButton();
    this.append(properties.pager);
};


function ListManagerPanel(controller) {
    this.controller = controller;
}
ListManagerPanel.prototype.view = function() {
    return this.container;
};


function ListFilterManager(controller, filters) {
    ListManagerPanel.call(this, controller);
    var self = this;

    this.manager = new FilterManager(this.filterManagerCreatingObject(filters));
    this.manager.bind({        
        filter: function (e) {
            self.controller.filter(e);
        }
    });

    this.filters = {
        wordtype: 0,
        categories: [],
        text: '',
        weight: { from: 0, to: 0 }
    };

}
extend(ListManagerPanel, ListFilterManager);
ListFilterManager.prototype.filterManagerCreatingObject = function(filters) {
    var array = filters ? filters : [];
    var result = {};
    for (var i = 0; i < array.length; i++) {
        var filter = array[i];
        result[filter] = true;
    }
    return result;
};
ListFilterManager.prototype.changeFilterValue = function(key, value) {
    if (value !== null && value !== undefined) {
        this.filters[key] = value;
    }
};
ListFilterManager.prototype.view = function () {
    return this.manager.view();
};
ListFilterManager.prototype.filter = function (e) {
    var self = this;
    
    //Update filters values array.
    for (var key in this.filters) {
        if (e.hasOwnProperty(key)) {
            var value = e[key];
            this.filters[key] = value;
        }
    }

    $.ajax({
        url: '/' + self.controller.name + '/Filter',
        type: "GET",
        data: {
            'wordtype': this.filters.wordtype,
            'lowWeight': this.filters.weight.from,
            'upWeight': this.filters.weight.to,
            'categories': this.filters.categories,
            'text': this.filters.text,
            'page': e.currentPage || 1,
            'pageSize': e.pageItems || self.controller.pageItems()
        },
        traditional: true,
        datatype: "json",
        async: false,
        cache: false,
        success: function (result) {
            self.controller.trigger({
                type: 'filter',
                items: result.items,
                total: result.total,
                currentPage: e.currentPage
            });
        },
        error: function (msg) {
            alert(msg.status + " | " + msg.statusText);
            return null;
        }
    });

};


//var metaword = new Metaword({
//    Object: {
//        Type: me.controller.wordtype ? me.controller.wordtype.id : 0
//    },
//    Categories: [],
//    UserLanguages: getLanguages()
//}, {
//    blockOtherElements: true
//});
//metaword.wordtype = me.controller.wordtype;
//metaword.displayEditForm();



function ListPager(controller, properties) {
    ListManagerPanel.call(this, controller);
    var self = this;
    this.pageItems = properties.pageItems || 10;
    this.currentPage = properties.currentPage || 1;
    this.totalItems = properties.totalItems || 0;
    this.totalPages = 1;
    
    this.controller.bind({
        filter: function (e) {
            self.currentPage = e.currentPage;
            self.setTotalItems(e.total);
            self.refresh();
        }
    });

    this.ui = (function() {
        var container = jQuery('<div/>', {
            'class': 'pager'
        });

        // ReSharper disable UnusedLocals
        var first = element('first', 'First', function () { self.controller.moveToPage(1); });
        var previous = element('previous', 'Previous', function () { self.controller.moveToPage(self.currentPage - 1); });
        var current = element('current', '', function () { });
        var next = element('next', 'Next', function () { self.controller.moveToPage(self.currentPage + 1); });
        var last = element('last', 'Last', function () { self.controller.moveToPage(self.totalPages); });
        // ReSharper restore UnusedLocals

        function element(cssClass, caption, clickCallback) {
            return  jQuery('<div/>', {
                        'class': 'pager-item ' + cssClass,
                        html: caption
                    }).bind({
                        click: clickCallback
                    }).appendTo($(container));
        }

        return {
            view: function() {
                return container;
            },
            currentHtml: function(value) {
                if (value === undefined) {
                    return current.innerHTML;
                } else {
                    $(current).html(value);
                }
                return true;
            },
            enablePrevious: function(value) {
                display(first, value);
                display(previous, value);
            },
            enableNext: function(value) {
                display(next, value);
                display(last, value);
            }
        };

    })();

}
extend(ListManagerPanel, ListPager);
ListPager.prototype.setTotalItems = function (items) {
    this.totalItems = items;
    this.totalPages = Math.max(Math.floor(this.totalItems / this.pageItems) + (this.totalItems % this.pageItems ? 1 : 0), 1);
};
ListPager.prototype.view = function() {
    return this.ui.view();
};
ListPager.prototype.refresh = function () {
    this.ui.currentHtml(this.currentPage + '/' + this.totalPages);
    this.ui.enablePrevious(this.current !== 1);
    this.ui.enableNext(this.currentPage !== this.totalPages);
};


function ListItemsManager(controller) {
    ListManagerPanel.call(this, controller);
    var self = this;
    this.container = jQuery('<div/>');

    this.controller.bind({        
        filter: function(e) {
            alert('filter');
        }
    });

}
extend(ListManagerPanel, ListItemsManager);




//function WordViewController(properties) {
//    var me = this;
//    this.pageItems = properties.pageItems || 10;
//    this.currentPage = properties.currentPage || 1;
//    this.container = $(document.body);
//    this.totalItems = 0;
//    this.wordtype = null;

//    this.filterManager = new FilterManager({
//        container: me.container,
//        wordtype: true,
//        weight: true,
//        categories: true,
//        text: true
//    }).bind({
//        filter: function (e) {
//            var items = me.filter(e);
//            me.load(items);
//        }
//    });

//    this.header = (new WordViewHeader(this)).appendTo(this.container);
//    this.words = jQuery('<div/>').appendTo($(this.container));
//    this.addButton = (new WordViewAddButton(this)).appendTo(this.container);
//    this.pager = (new WordViewPager(this)).appendTo(this.container);

//}




function WordViewAddButton(controller) {
    var me = this;
    this.controller = controller;


}
WordViewAddButton.prototype.appendTo = function (parent) {
    $(this.container).appendTo($(parent));
    return this;
};



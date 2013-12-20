function ListManager(properties) {
    var self = this;
    this.controller = properties.controller;
    this.creator = properties.creator;
    
    this.filterManager = new FilterManager({
        wordtype: true,
        weight: true,
        categories: true,
        text: true
    }).bind({
        filter: function (e) {
            var items = me.filter(e);
            me.load(items);
        }
    });
    this.filterValues = {
        wordtype: 0,
        categories: [],
        text: '',
        weight: { from: 0, to: 0 }
    };


    this.pager = new ListPager(this, properties);

    this.view = new ListView(this, properties);
    this.view.render({
        columns: properties.columns,
        filter: self.filterManager.view,
        pager: self.pager.view
    });
    
}
ListManager.prototype.start = function () {
    var items = this.filter({ page: 1, pageSize: 10 });
    if (items) {
        this.load(items);
    }
};
ListManager.prototype.filter = function (e) {
    var self = this;
    var values = this.filterValues;
    var items;

    for (var key in e.parameters) {
        if (e.parameters.hasOwnProperty(key)) {
            var value = e.parameters[key];
            values[key] = value;
        }
    }

    //Set page properties.
    if (e.currentPage) this.pager.currentPage = e.currentPage;
    if (e.pageItems) this.pager.pageItems = e.pageItems;

    
    $.ajax({
        url: '/' + self.controller + '/Filter',
        type: "GET",
        data: {
            'wordtype': values.wordtype,
            'lowWeight': values.weight.from,
            'upWeight': values.weight.to,
            'categories': values.categories,
            'text': values.text,
            'page': self.pager.currentPage,
            'pageSize': self.pager.pageItems
        },
        traditional: true,
        datatype: "json",
        async: false,
        cache: false,
        success: function (result) {
            self.pager.setTotalItems(result.total);
            items = result.items;
        },
        error: function (msg) {
            alert(msg.status + " | " + msg.statusText);
            return null;
        }
    });

    return items;

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


var metaword = new Metaword({
    Object: {
        Type: me.controller.wordtype ? me.controller.wordtype.id : 0
    },
    Categories: [],
    UserLanguages: getLanguages()
}, {
    blockOtherElements: true
});
metaword.wordtype = me.controller.wordtype;
metaword.displayEditForm();s



function ListPager(controller, properties) {
    var self = this;
    this.controller = controller;
    this.pageItems = properties.pageItems || 10;
    this.currentPage = properties.currentPage || 1;
    this.totalItems = properties.totalItems || 0;
}
ListPager.prototype.setTotalItems = function (items) {
    this.totalItems = items;
    this.totalPages = Math.floor(this.totalItems / this.pageItems) + (this.totalItems % this.pageItems ? 1 : 0); 
};




function ListView(controller) {
    var self = this;
    this.controller = controller;
    this.container = $(document.body);
    this.items = jQuery('<div/>');
    this.addButton = jQuery('<a/>', {
        id: 'add-item', 'class': 'add', html: 'Add'
    }).bind({
        click: function () {
            var item = createNewItem();
            item.displayEditForm();
        }
    }).appendTo(jQuery('<div/>', { 'id': 'add-button-container' }));


}
ListView.prototype.clear = function () {
    $(this.items).empty();
};
ListView.prototype.append = function (element) {
    $(element).appendTo($(this.container));
};
ListView.prototype.addHeaderRow = function (columns) {
    var headerContainer = jQuery('<div/>', { 'class': 'word header' });
    for (var i = 0; i < columns.length; i++) {
        var name = columns[i];
        var columns = jQuery('<div/>', { 'class': name, html: name }).appendTo($(headerContainer));
    }
    return headerContainer;
};
ListView.prototype.render = function (properties) {
    this.append(properties.filter);
    this.addHeaderRow(properties.columns);
    this.append(this.items);
    this.append(this.addButton);
    this.append(properties.pager);
};




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


function WordViewPager(controller) {
    var me = this;
    this.controller = controller;
    this.container = jQuery('<div/>', {
        'class': 'pager'
    });

    this.first = jQuery('<div/>', {
        'class': 'pager-item first',
        html: 'First'
    }).bind({
        click: function () {
            me.controller.moveToPage(1);
        }
    }).appendTo($(this.container));

    this.previous = jQuery('<div/>', {
        'class': 'pager-item previous',
        html: 'Previous'
    }).bind({
        click: function () {
            me.controller.moveToPage(me.controller.currentPage - 1);
        }
    }).appendTo($(this.container));

    this.current = jQuery('<div/>', { 'class': 'pager-item current', html: 'First' }).appendTo($(this.container));

    this.next = jQuery('<div/>', {
        'class': 'pager-item next',
        html: 'Next'
    }).bind({
        click: function () {
            me.controller.moveToPage(me.controller.currentPage + 1);
        }
    }).appendTo($(this.container));

    this.last = jQuery('<div/>', {
        'class': 'pager-item last',
        html: 'Last'
    }).bind({
        click: function () {
            me.controller.moveToPage(me.controller.totalPages());
        }
    }).appendTo($(this.container));

}
WordViewPager.prototype.appendTo = function (parent) {
    $(this.container).appendTo($(parent));
    return this;
};
WordViewPager.prototype.refresh = function () {
        var current = this.controller.currentPage;
        var total = this.controller.totalPages();
        $(this.current).html(current + ' / ' + total);

        display(this.first, current !== 1);
        display(this.previous, current !== 1);
        display(this.next, current !== total);
        display(this.last, current !== total);

    };
//Generic class.
function ListManager(properties) {
    this.ListManager = true;
    var self = this;
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
ListManager.prototype.moveToPage = function (page) {
    this.filter({ page: page });
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
ListManager.prototype.createObject = function() {
    alert('Must be defined in implementing class');
};
ListManager.prototype.createListItem = function() {
    alert('Must be defined in implementing class');
}; 


//Implementations of ListManager.
function WordListManager(properties) {
    ListManager.call(this, properties);
    this.name = 'Words';
    this.WordListManager = true;
}
extend(ListManager, WordListManager);
WordListManager.prototype.createObject = function (properties) {
    return new Metaword(properties);
};
WordListManager.prototype.createListItem = function (object) {
    return new WordListItem(object);
};


function QuestionListManager(properties) {
    ListManager.call(this, properties);
    this.name = 'Questions';
    this.QuestionListManager = true;
}
extend(ListManager, QuestionListManager);
QuestionListManager.prototype.createObject = function (properties) {
    return new Question(properties);
};
QuestionListManager.prototype.createListItem = function (object) {
    return new QuestionListItem(object);
};



function ListView(controller) {
    this.ListView = true;
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
    var headerContainer = jQuery('<div/>', { 'class': 'item header' }).appendTo($(this.container));
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
    this.ListManagerPanel = true;
    this.controller = controller;
}
ListManagerPanel.prototype.view = function() {
    return this.container;
};


function ListFilterManager(controller, filters) {
    ListManagerPanel.call(this, controller);
    this.ListFilterManager = true;
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
            'page': e.page || 1,
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
                page: e.page
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
extend(ListManagerPanel, ListItemsManager);
ListItemsManager.prototype.refresh = function (items) {
    this.clear();
    
    for (var i = 0; i < items.length; i++) {
        var object = this.controller.createObject(items[i]);
        var item = this.controller.createListItem(object);
        item.appendTo($(this.container));
        this.items[i] = item;
    }
};
ListItemsManager.prototype.clear = function() {
    for (var i = 0; i < this.items.length; i++) {
        this.items[i].remove();
    }
};




function ListItem(object) {
    this.ListItem = true;
    this.object = object;
}
ListItem.prototype.appendTo = function(parent) {
    $(this.view.container).appendTo($(parent));
};
ListItem.prototype.remove = function () {
    this.object = null;
    $(this.view.container).remove();
};
ListItem.prototype.edit = function() {
    alert('Must be defined by implementing class');
};

function WordListItem(properties) {
    ListItem.call(this, properties);
    this.WordListItem = true;
    var self = this;
    this.name = 'word';
    this.view = new WordListItemView(self);
}
extend(ListItem, WordListItem);


function QuestionListItem(properties) {
    ListItem.call(this, properties);
    this.QuestionListItem = true;
    var self = this;
    this.name = 'question';
    this.view = new QuestionListItemView(self, { className: this.name });
}
extend(ListItem, QuestionListItem);




function ListItemView(item) {
    this.ListItemView = true;
    var self = this;
    this.item = item;
    this.object = this.item.object;
    
    this.container = jQuery('<div/>', {
        'class': 'item'
    });
    
    this.id = jQuery('<div/>', { 'class': 'id', html: self.object.id }).appendTo($(this.container));
    this.name = jQuery('<div/>', { 'class': 'name', html: self.object.name }).appendTo($(this.container));
    this.addWeigthPanel();
    //this.weight = (new WeightPanel(self.item)).appendTo($(this.container));
    //this.type = jQuery('<div/>', { 'class': 'type', html: me.line.type.symbol }).appendTo($(this.container));
    //this.categories = jQuery('<div/>', { 'class': 'categories', html: me.line.categories }).appendTo($(this.container));

    this.edit = jQuery('<div/>', { 'class': 'edit-item' }).
        bind({ click: function () { self.item.edit(); } }).
        appendTo($(this.container));

    this.deactivate = jQuery('<a/>', { html: self.object.isActive ? 'Deactivate' : 'Activate' }).
        bind({ click: function () { self.item.activate(); } }).
        appendTo($(this.container));
    
}
ListItemView.prototype.addWeigthPanel = function() {
    var weightPanel = new WeightPanel(this.item);
    weightPanel.appendTo($(this.container));
};



function WordListItemView(item) {
    ListItemView.call(this, item);
    this.WordListItemView = true;
}
extend(ListItemView, WordListItemView);


function QuestionListItemView(item) {
    ListItemView.call(this, item);
    this.QuestionListItemView = true;
}
extend(ListItemView, QuestionListItemView);



function Entity(properties) {
    this.Entity = true;
    //Properties.
    this.id = properties.Id || 0;
    this.name = properties.Name;
    this.weight = properties.Weight || 1;
    this.isActive = properties.IsActive;
    this.creatorId = properties.CreatorId;
    this.createDate = properties.CreateDate;
    this.isApproved = properties.IsApproved;
    this.positive = properties.Positive;
    this.negative = properties.Negative;

    this.eventHandler = new EventHandler();
    //CategoriesString
    //Words

}
Entity.prototype.trigger = function(e) {
    this.eventHandler.trigger(e);
};
Entity.prototype.bind = function (e) {
    this.eventHandler.bind(e);
};
Entity.prototype.setWeight = function(weight) {
    this.weight = Math.max(Math.min(weight, 10), 1);
    this.trigger({        
        type: 'changeWeight',
        weight: weight
    });
};



function Metaword(properties) {
    Entity.call(this, properties);
    this.Metaword = true;
    this.wordtype = properties.Type;
}
extend(Entity, Metaword);


function Question(properties) {
    Entity.call(this, properties);
    this.Question = true;
}
extend(Entity, Question);



function WeightPanel(line) {
    this.WeightPanel = true;
    var self = this;
    this.maxWeight = 10;
    this.line = line;
    this.object = this.line.object;
    
    this.ui = (function() {
        var container = jQuery('<div/>', { 'class': 'weight' });
        var icons = [];
        for (var i = 0; i < self.maxWeight; i++) {
            var $icon = icon(i);
            icons[i] = $icon;
        }
        
        function icon($index) {
            var index = $index;
            var dom = jQuery('<a/>', {
                'class': 'weight'
            }).bind({
                click: function () {
                    self.object.setWeight(index + 1);
                }
            });
            $(dom).appendTo($(container));

            return {                
                activate: function(value) {
                    if (value) {
                        $(dom).addClass('checked');
                    } else {
                        $(dom).removeClass('checked');
                    }
                }
            };

        }

        function refresh(value) {
            for (var j = 0; j < value; j++) {
                icons[j].activate(true);
            }
            for (var k = value; k < icons.length; k++) {
                icons[k].activate(false);
            }
        }

        (function () {
            //Initial value.
            refresh(self.object.weight || 1);
        })();

        return {            
            refresh: function(value) {
                refresh(value);
            },
            view: function() {
                return container;
            }
        };

    });

    this.object.bind({
        changeWeight: function (e) {
            self.ui.refresh(e.weight);
        }
    });

}
WeightPanel.prototype.appendTo = function(parent) {
    $(this.ui().view()).appendTo($(parent));
};










function WordLine(word) {
    this.word = word;
    this.id = word.Id;
    this.name = word.Name;
    this.weight = word.Weight;
    this.type = WORDTYPE.getItem(word.Type);
    this.active = word.IsActive;
    this.categories = word.CategoriesString;
    this.eventHandler = new EventHandler();
    this.view = new WordLineView(this);
}
WordLine.prototype.bind = function (e) {
    this.eventHandler.bind(e);
};
WordLine.prototype.trigger = function (e) {
    this.eventHandler.trigger(e);
};
WordLine.prototype.appendTo = function (parent) {
    $(this.view.container).appendTo($(parent));
};
WordLine.prototype.setWeight = function (value) {
    var me = this;
    var callback = function (result) {
        if (result) {
            me.weight = value;
            me.trigger({
                type: 'setWeight',
                weight: value
            });
        }
    };

    var e = {
        id: me.id,
        name: me.name,
        weight: value,
        callback: callback
    };

    my.words.updateWeight(e);

};
WordLine.prototype.updateCategories = function (categories) {
    this.view.updateCategories(categories);
};
WordLine.prototype.activate = function (result) {
    var me = this;
    var state = (result !== undefined ? result : !this.active);


    var callback = function (value) {
        if (value) {
            me.active = state;
            me.view.activate(me.active);
        }
    };

    var e = {
        id: me.id,
        name: me.name,
        callback: callback
    };

    if (state) {
        my.words.activate(e);
    } else {
        my.words.deactivate(e);
    }

};


function WordLineView(line) {
    var me = this;
    this.line = line;

    this.container = jQuery('<div/>', {
        'class': 'word '
    });
    this.activate(this.line.active);

    this.id = jQuery('<div/>', { 'class': 'id', html: me.line.id }).appendTo($(this.container));
    this.name = jQuery('<div/>', { 'class': 'name', html: me.line.name }).appendTo($(this.container));
    this.weight = (new WordLineWeightPanel(this.line)).appendTo($(this.container));

    this.type = jQuery('<div/>', { 'class': 'type', html: me.line.type.symbol }).appendTo($(this.container));
    this.categories = jQuery('<div/>', { 'class': 'categories', html: me.line.categories }).appendTo($(this.container));

    this.edit = jQuery('<div/>', {
        'class': 'edit-item',
        html: me.line.id
    }).bind({
        click: function () {
            var id = me.line.id;
            editMetaword(id, me.line);
        }
    }).appendTo($(this.container));

    this.deactivate = jQuery('<a/>', {
        html: me.line.active ? 'Deactivate' : 'Activate'
    }).bind({
        click: function () { me.line.activate(); }
    }).appendTo($(this.container));

}
WordLineView.prototype.activate = function (value) {
    if (value) {
        this.container.removeClass('inactive');
        this.container.addClass('active');
        $(this.deactivate).html('Deactivate');
    } else {
        this.container.removeClass('active');
        this.container.addClass('inactive');
        $(this.deactivate).html('Activate');
    }
};
WordLineView.prototype.updateCategories = function (categories) {
    $(this.categories).html(categories);
};







//function QuestionViewController(properties) {
//    var me = this;
//    this.pageItems = properties.pageItems || 10;
//    this.currentPage = properties.currentPage || 1;
//    this.container = $(document.body);

//    this.filterManager = new FilterManager({
//        container: me.container,
//        weight: true,
//        categories: true,
//        text: true
//    }).bind({
//        filter: function (e) {
//            var items = me.filter(e);
//            me.load(items);
//        }
//    });

//    this.header = (new QuestionViewHeader(this)).appendTo(this.container);
//    this.questions = jQuery('<div/>').appendTo($(this.container));
//    this.addButton = (new QuestionViewAddButton(this)).appendTo(this.container);
//    this.pager = (new QuestionViewPager(this)).appendTo(this.container);

//}
//QuestionViewController.prototype.start = function () {
//    var items = this.filter({ page: 1, pageSize: 10 });
//    if (items) {
//        this.load(items);
//    }
//};
//QuestionViewController.prototype.filter = function (e) {
//    var me = this;
//    var items;

//    $.ajax({
//        url: '/Questions/Filter',
//        type: "GET",
//        data: {
//            'lowWeight': e.weight ? e.weight.from : 0,
//            'upWeight': e.weight ? e.weight.to : 0,
//            'categories': e.categories ? e.categories : [],
//            'text': e.text ? e.text : '',
//            'page': me.currentPage,
//            'pageSize': me.pageItems
//        },
//        traditional: true,
//        datatype: "json",
//        async: false,
//        cache: false,
//        success: function (result) {
//            me.totalItems = result.Total;
//            items = result.Questions;
//        },
//        error: function (msg) {
//            alert(msg.status + " | " + msg.statusText);
//            return null;
//        }
//    });

//    return items;

//};
//QuestionViewController.prototype.load = function (items) {
//    this.questions.empty();

//    for (var i = 0; i < this.pageItems && i < items.length; i++) {
//        var question = items[i];
//        var questionLine = new QuestionLine(question);
//        questionLine.appendTo(this.questions);
//    }

//    this.pager.refresh();

//};
//QuestionViewController.prototype.totalPages = function () {
//    var totalPages = Math.floor(this.totalItems / this.pageItems) + (this.totalItems % this.pageItems ? 1 : 0);
//    return totalPages;
//};
//QuestionViewController.prototype.moveToPage = function (page) {
//    var $page = Math.max(Math.min(this.totalPages(), page), 1);
//    if ($page !== this.currentPage) {

//    };
//};


//function QuestionViewAddButton() {
//    this.container = jQuery('<div/>', {
//        'id': 'add-button-container'
//    });
//    this.button = jQuery('<a/>', {
//        id: 'add-item',
//        'class': 'add',
//        html: 'Add'
//    }).bind({
//        click: function () {
//            var question = new Question({
//                Question: {},
//                Categories: [],
//                UserLanguages: getLanguages()
//            }, {
//                blockOtherElements: true
//            });
//            question.displayEditForm();
//        }
//    }).appendTo($(this.container));

//}
//QuestionViewAddButton.prototype.appendTo = function (parent) {
//    $(this.container).appendTo($(parent));
//    return this;
//};



//function QuestionViewPager(controller) {
//    var me = this;
//    this.controller = controller;
//    this.container = jQuery('<div/>', {
//        'class': 'pager'
//    });

//    this.first = jQuery('<div/>', {
//        'class': 'pager-item first',
//        html: 'First'
//    }).bind({
//        click: function () {
//            me.controller.moveToPage(1);
//        }
//    }).appendTo($(this.container));

//    this.previous = jQuery('<div/>', {
//        'class': 'pager-item previous',
//        html: 'Previous'
//    }).bind({
//        click: function () {
//            me.controller.moveToPage(me.controller.currentPage - 1);
//        }
//    }).appendTo($(this.container));

//    this.current = jQuery('<div/>', { 'class': 'pager-item current', html: 'First' }).appendTo($(this.container));

//    this.next = jQuery('<div/>', {
//        'class': 'pager-item next',
//        html: 'Next'
//    }).bind({
//        click: function () {
//            me.controller.moveToPage(me.controller.currentPage + 1);
//        }
//    }).appendTo($(this.container));

//    this.last = jQuery('<div/>', {
//        'class': 'pager-item last',
//        html: 'Last'
//    }).bind({
//        click: function () {
//            me.controller.moveToPage(me.controller.totalPages());
//        }
//    }).appendTo($(this.container));

//}
//QuestionViewPager.prototype.appendTo = function (parent) {
//    $(this.container).appendTo($(parent));
//    return this;
//};
//QuestionViewPager.prototype.refresh = function () {
//    var current = this.controller.currentPage;
//    var total = this.controller.totalPages();
//    $(this.current).html(current + ' / ' + total);

//    display(this.first, current !== 1);
//    display(this.previous, current !== 1);
//    display(this.next, current !== total);
//    display(this.last, current !== total);

//};



//function QuestionViewHeader() {
//    this.container = jQuery('<div/>', { 'class': 'question header' });
//    this.id = jQuery('<div/>', { 'class': 'id', html: 'id' }).appendTo($(this.container));
//    this.name = jQuery('<div/>', { 'class': 'name', html: 'name' }).appendTo($(this.container));
//    this.weight = jQuery('<div/>', { 'class': 'weight', html: 'weight' }).appendTo($(this.container));
//    this.categories = jQuery('<div/>', { 'class': 'categories', html: 'categories' }).appendTo($(this.container));
//}
//QuestionViewHeader.prototype.appendTo = function (parent) {
//    $(this.container).appendTo($(parent));
//};


//function QuestionLine(question) {
//    this.question = question;
//    this.id = question.Id;
//    this.name = question.Name;
//    this.weight = question.Weight;
//    this.active = question.IsActive;
//    this.categories = question.CategoriesString;
//    this.eventHandler = new EventHandler();
//    this.view = new QuestionLineView(this);
//}
//QuestionLine.prototype.bind = function (e) {
//    this.eventHandler.bind(e);
//};
//QuestionLine.prototype.trigger = function (e) {
//    this.eventHandler.trigger(e);
//};
//QuestionLine.prototype.appendTo = function (parent) {
//    $(this.view.container).appendTo($(parent));
//};
//QuestionLine.prototype.setWeight = function (value) {
//    var me = this;
//    var callback = function (result) {
//        if (result) {
//            me.weight = value;
//            me.trigger({
//                type: 'setWeight',
//                weight: value
//            });
//        }
//    };

//    var e = {
//        id: me.id,
//        name: me.name,
//        weight: value,
//        callback: callback
//    };

//    my.questions.updateWeight(e);

//};
//QuestionLine.prototype.updateCategories = function (categories) {
//    this.view.updateCategories(categories);
//};
//QuestionLine.prototype.activate = function (result) {
//    var me = this;
//    var state = (result !== undefined ? result : !this.active);


//    var callback = function (value) {
//        if (value) {
//            me.active = state;
//            me.view.activate(me.active);
//        }
//    };

//    var e = {
//        id: me.id,
//        name: me.name,
//        callback: callback
//    };

//    if (state) {
//        my.questions.activate(e);
//    } else {
//        my.questions.deactivate(e);
//    }

//};


//function QuestionLineView(line) {
//    var me = this;
//    this.line = line;

//    this.container = jQuery('<div/>', {
//        'class': 'question '
//    });
//    this.activate(this.line.active);

//    this.id = jQuery('<div/>', { 'class': 'id', html: me.line.id }).appendTo($(this.container));
//    this.name = jQuery('<div/>', { 'class': 'name', html: me.line.name }).appendTo($(this.container));
//    this.weight = (new QuestionLineWeightPanel(this.line)).appendTo($(this.container));

//    this.categories = jQuery('<div/>', { 'class': 'categories', html: me.line.categories }).appendTo($(this.container));

//    this.edit = jQuery('<div/>', {
//        'class': 'edit-item',
//        html: me.line.id
//    }).bind({
//        click: function () {
//            var id = me.line.id;
//            editQuestion(id, me.line);
//        }
//    }).appendTo($(this.container));

//    this.deactivate = jQuery('<a/>', {
//        html: me.line.active ? 'Deactivate' : 'Activate'
//    }).bind({
//        click: function () {
//            me.line.activate();
//        }
//    }).appendTo($(this.container));

//}
//QuestionLineView.prototype.activate = function (value) {
//    if (value) {
//        this.container.removeClass('inactive');
//        this.container.addClass('active');
//        $(this.deactivate).html('Deactivate');
//    } else {
//        this.container.removeClass('active');
//        this.container.addClass('inactive');
//        $(this.deactivate).html('Activate');
//    }
//};
//QuestionLineView.prototype.updateCategories = function (categories) {
//    $(this.categories).html(categories);
//};


//function QuestionLineWeightPanel(line) {
//    var me = this;
//    this.line = line;
//    this.question = this.line.question;

//    this.container = jQuery('<div/>', { 'class': 'weight' });
//    this.icons = [];
//    for (var i = 0; i < 10; i++) {
//        this.icons[i] = jQuery('<a/>', {
//            'class': 'weight',
//            html: i + 1
//        }).bind({
//            click: function () {
//                var value = Number(this.innerHTML);
//                if ($.isNumeric(value)) {
//                    value = Math.max(Math.min(10, value), 1);
//                    me.line.setWeight(value);
//                }
//            }
//        }).appendTo($(this.container));
//    }

//    this.line.bind({
//        setWeight: function (e) {
//            me.setValue(e.weight);
//        }
//    });

//    (function ini() {
//        me.setValue(me.line.weight);
//    })();

//}
//QuestionLineWeightPanel.prototype.setValue = function (value) {
//    var i;
//    for (i = 0; i < value; i++) {
//        this.icons[i].addClass('checked');
//    }
//    for (i = value; i < 10; i++) {
//        this.icons[i].removeClass('checked');
//    }
//};
//QuestionLineWeightPanel.prototype.appendTo = function (parent) {
//    $(this.container).appendTo($(parent));
//    return this;
//};



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
    e.UserLanguages = my.languages.userLanguages();

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
ListManager.prototype.createNewItem = function () {
    var self = this;
    var item = this.emptyItem();
    item.bind({
        add: function () {
            self.filterManager.filter({});
        }
    });
    item.edit();
};
ListManager.prototype.emptyItem = function () {
    alert('Must be defined in implementing class');
};
ListManager.prototype.getLanguages = function() {
    if (!this.languages) {
        this.languages = my.languages.userLanguages();
    }
    return this.languages;
};
ListManager.prototype.getLanguagesIds = function () {
    if (!this.languagesIds)
    {
        this.languagesIds = my.languages.userLanguagesId();
    }
    return this.languagesIds;
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
    return new WordListItem(this, object);
};
WordListManager.prototype.emptyItem = function () {
    var filters = this.filterManager.filters;
    return new Metaword({
        Id: 0,
        Name: '',
        Weight: (filters.weight && filters.weight.from && filters.weight.from === filters.weight.to ? filters.weight.from : 1),
        Type: filters.wordtype || 0,
        IsActive: true,
        CreatorId: 1,
        CreateDate: new Date().getTime,
        IsApprover: false,
        Positive: 0,
        Negative: 0,
        Categories: (filters.categories && filters.categories.length === 1 ? filters.categories : []),
        'new': true
    });
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
    return new QuestionListItem(this, object);
};
QuestionListManager.prototype.emptyItem = function () {
    var filters = this.filterManager.filters;
    return new Question({
        Id: 0,
        Name: '',
        Weight: filters.weight || 1,
        IsActive: true,
        CreatorId: 1,
        CreateDate: new Date().getTime,
        IsApprover: false,
        Positive: 0,
        Negative: 0,
        Categories: (filters.categories && filters.categories.length === 1 ? filters.categories : []),
        'new': true
    });
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
ListView.prototype.createAddButton = function () {
    var controller = this.controller;
    this.addButton = jQuery('<a/>', {
        id: 'add-item', 'class': 'add', html: 'Add'
    }).bind({
        click: function () {
            controller.createNewItem();
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
                page: e.page || 1
            });
        },
        error: function (msg) {
            alert(msg.status + " | " + msg.statusText);
            return null;
        }
    });

};


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
        var previous = element('previous', 'Previous', function () { self.controller.moveToPage(self.page - 1); });
        var current = element('current', '', function () { });
        var next = element('next', 'Next', function () { self.controller.moveToPage(self.page + 1); });
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
        object.injectListItem(item);
        item.appendTo($(this.container));
        this.items[i] = item;
    }

    this.loadDetails();

};
ListItemsManager.prototype.clear = function() {
    for (var i = 0; i < this.items.length; i++) {
        this.items[i].remove();
    }
};
ListItemsManager.prototype.loadDetails = function() {
    for (var i = 0; i < this.items.length; i++) {
        var item = this.items[i];
        item.loadDetails();
    }
};


function ListItem(manager, object) {
    this.ListItem = true;
    this.manager = manager;
    this.object = object;
}
ListItem.prototype.appendTo = function (parent) {
    this.view.appendTo(parent);
};
ListItem.prototype.remove = function () {
    this.object = null;
    $(this.view.container).remove();
};
ListItem.prototype.loadDetails = function() {
    this.view.loadDetails();
};


function WordListItem(manager, properties) {
    ListItem.call(this, manager, properties);
    this.WordListItem = true;
    var self = this;
    this.name = 'word';
    this.view = new WordListItemView(self.manager, self);
}
extend(ListItem, WordListItem);


function QuestionListItem(manager, properties) {
    ListItem.call(this, manager, properties);
    this.QuestionListItem = true;
    var self = this;
    this.name = 'question';
    this.view = new QuestionListItemView(self.manager, self, { className: this.name });
}
extend(ListItem, QuestionListItem);



function ListItemView(manager, item) {
    this.ListItemView = true;
    var self = this;
    this.manager = manager;
    this.item = item;
    this.object = this.item.object;
    
    this.container = jQuery('<div/>', {
        'class': 'item'
    });
    if (!this.object.isActive) $(this.container).addClass('inactive');
    
    this.id = jQuery('<div/>', { 'class': 'id', html: self.object.id }).appendTo($(this.container));
    this.name = jQuery('<div/>', { 'class': 'name', html: self.object.name }).appendTo($(this.container));
    this.addWeigthPanel();
    
    this.categories = jQuery('<div/>', { 'class': 'categories', html: my.categories.toString(self.object.categories) }).appendTo($(this.container));

    this.details = jQuery('<div/>', {
        'class': 'list-item-details',
        'id': 'details_' + self.object.id
    }).appendTo(this.container);

    this.edit = jQuery('<div/>', { 'class': 'edit-item' }).
        bind({ click: function () { self.object.edit(); } }).
        appendTo($(this.container));

    this.deactivate = jQuery('<a/>', { html: self.object.isActive ? 'Deactivate' : 'Activate' }).
        bind({ click: function () { self.object.activate(); } }).
        appendTo($(this.container));

    //Events.
    this.object.bind({
        activate: function (e) {
            self.activate(e.value);
        },
        changeName: function (e) {
            self.name.html(e.name);
        },
        changeCategories: function (e) {
            self.categories.html(my.categories.toString(e.categories));
        },
        change: function () {
            self.refreshItems();
        }
    });

}
ListItemView.prototype.addWeigthPanel = function() {
    var weightPanel = new WeightPanel(this.item);
    weightPanel.appendTo($(this.container));
};
ListItemView.prototype.activate = function (value) {
    if (value) {
        this.deactivate.html('Deactivate');
        $(this.container).removeClass('inactive');
    } else {
        this.deactivate.html('Activate');
        $(this.container).addClass('inactive');
    }
};
ListItemView.prototype.loadDetails = function () {
    alert('Must be defined in implemented class');
};
ListItemView.prototype.appendTo = function(parent) {
    $(this.container).appendTo($(parent));
};
ListItemView.prototype.refreshItems = function () {
    $(this.details).empty();
    this.loadDetails();
};



function WordListItemView(manager, item) {
    ListItemView.call(this, manager, item);
    this.WordListItemView = true;
    var self = this;

    //Add panels specific for this type of objects.
    this.type = jQuery('<div/>', { 'class': 'type', html: self.object.wordtype.symbol }).appendTo($(this.container));
    $(this.categories).before(this.type);

    this.object.bind({
        changeWordtype: function (e) {
            self.type.html(e.wordtype.symbol);
        }
    });

}
extend(ListItemView, WordListItemView);
WordListItemView.prototype.loadDetails = function () {
    var self = this;
    var object = self.object;
    var spinner = new SpinnerWrapper($(this.details));

    $.ajax({
        url: '/Words/GetWords',
        type: "GET",
        data: {
            'id': object.id,
            'languages': self.manager.getLanguagesIds()
        },
        datatype: "json",
        async: true,
        cache: false,
        traditional: true,
        success: function (result) {
            self.renderItems(result);
            spinner.stop();
        },
        error: function () {
            spinner.stop();
            self.loadDetails();
        }
    });

};
WordListItemView.prototype.renderItems = function (words) {
    var self = this;
    var languages = self.manager.getLanguages();
    var columns = {};
    
    for (var i = 0; i < languages.length; i++) {
        var language = languages[i];
        var column = jQuery('<div/>', {
            'class': 'details-column'
        }).appendTo(self.details);
        columns[language.id] = column;
    }

    for (var j = 0; j < words.length; j++) {
        var word = words[j];
        var languageId = word.LanguageId;
        var languageColumn = columns[languageId];
        var icon = jQuery('<div/>', {
            'class': 'details-icon',
            title: word.Name
        }).appendTo(languageColumn);
        $(icon).addClass(word.IsCompleted ? 'complete' : 'incomplete');
    }

};


function QuestionListItemView(manager, item) {
    ListItemView.call(this, manager, item);
    this.QuestionListItemView = true;
}
extend(ListItemView, QuestionListItemView);
QuestionListItemView.prototype.loadDetails = function () {
    var self = this;
    var object = self.object;
    var spinner = new SpinnerWrapper($(this.details));

    $.ajax({
        url: '/Questions/GetOptions',
        type: "GET",
        data: {
            'id': object.id,
            'languages': self.manager.getLanguagesIds()
        },
        datatype: "json",
        async: true,
        cache: false,
        traditional: true,
        success: function (result) {
            self.renderItems(result);
            spinner.stop();
        },
        error: function () {
            spinner.stop();
            self.loadDetails();
        }
    });
};
QuestionListItemView.prototype.renderItems = function (options) {
    var self = this;
    var languages = self.manager.getLanguages();
    var columns = {};

    for (var i = 0; i < languages.length; i++) {
        var language = languages[i];
        var column = jQuery('<div/>', {
            'class': 'details-column'
        }).appendTo(self.details);
        columns[language.id] = column;
    }

    for (var j = 0; j < options.length; j++) {
        var option = options[j];
        var languageId = option.LanguageId;
        var languageColumn = columns[languageId];
        var icon = jQuery('<div/>', {
            'class': 'details-icon',
            title: option.Name
        }).appendTo(languageColumn);
        $(icon).addClass(option.IsCompleted ? 'complete' : 'incomplete');
    }

};






function Entity(properties) {
    this.Entity = true;
    this.service = null;
    //Properties.
    this.id = properties.Id || 0;
    this.name = properties.Name;
    this.weight = properties.Weight || 1;
    this.isActive = properties.IsActive || true;
    this.creatorId = properties.CreatorId || 1;
    this.createDate = properties.CreateDate || new Date().getDate;
    this.isApproved = properties.IsApproved || false;
    this.positive = properties.Positive || 0;
    this.negative = properties.Negative || 0;
    this.categories = this.loadCategories(properties.Categories) || [];
    this.new = properties.new || false;

    this.eventHandler = new EventHandler();

}
Entity.prototype.trigger = function(e) {
    this.eventHandler.trigger(e);
};
Entity.prototype.bind = function (e) {
    this.eventHandler.bind(e);
};
Entity.prototype.loadCategories = function (categories) {
    var array = [];
    for (var i = 0; i < categories.length; i++) {
        var object = categories[i];

        var category;

        if (object.Category) {
            array.push(object);
        } else if (object.Id) {
            var id = categories[i].Id;
            category = my.categories.getCategory(id);
            array.push(category);
        } else if ($.isNumeric(object)) {
            category = my.categories.getCategory(object);
            array.push(category);
        }
    }
    return array;
};
Entity.prototype.setWeight = function(weight) {
    //Leave the function if weight has not been changed.
    if (weight === this.weight) return;

    var self = this;
    this.weight = Math.max(Math.min(weight, 10), 1);
    this.service.updateWeight({
        id: self.id,
        weight: weight,
        name: self.name,
        callback: function (result) {
            if (result !== false) {
                self.trigger({
                    type: 'changeWeight',
                    weight: weight
                });
            }
        }
    });
};
Entity.prototype.activate = function (value) {
    var self = this;
    var status = (value === undefined ? !this.isActive : value);
    var e = {
        id: self.id,
        name: self.name,
        callback: function (result) {
            self.isActive = status;
            if (result !== false) {
                self.trigger({
                    type: 'activate',
                    value: status
                });
            }
        }
    };

    if (status) {
        this.service.activate(e);
    } else {
        this.service.deactivate(e);
    }

};
Entity.prototype.editPanel = function () {
    alert('Must be defined by implementing class');
};
Entity.prototype.editItem = function () {
    alert('Must be defined by implementing class');
};
Entity.prototype.getProperty = function (key) {
    if (this.hasOwnProperty(key)) {
        return this[key];
    }
    return null;
};
Entity.prototype.checkName = function (name) {
    var maxLength = 255;

    if (!name.trim()) {
        return MessageBundle.get(dict.NameCannotBeEmpty);
    } else if (name.length > maxLength) {
        return MessageBundle.get(dict.NameCannotBeLongerThan, [maxLength]);
    } else {
        var nameExists = this.service.nameAlreadyExists(this.id, name);
        if (nameExists) {
            return MessageBundle.get(dict.NameAlreadyExists);
        } else {
            return true;
        }

    }

};
Entity.prototype.update = function () {
    alert('Must by defined by implementing class');
};
Entity.prototype.injectListItem = function (item) {
    this.listItem = item;
};
Entity.prototype.edit = function () {
    var editItem = this.editItem();
    var editPanel = this.editPanel(editItem);
    editPanel.display();
};
Entity.prototype.removedLogs = function (logs) {
    var tag = 'remove';
    var array = [];
    for (var i = 0; i < logs.length; i++) {
        var log = logs[i];
        if (log.event === tag && log.item && log.item.id) {
            array.push(log.item.id);
        }
    }
    return array;
};
Entity.prototype.editedLogs = function (logs) {
    var tag = 'edit';
    var array = [];
    for (var i = 0; i < logs.length; i++) {
        var log = logs[i];
        var item = log.item;
        if (log.event === tag && item && item.id) {
            var text = item.id + '|' + item.name + '|' + item.weight + '|' + item.isCompleted;
            array.push(text);
        }
    }
    return array;
};
Entity.prototype.addedLogs = function (logs) {
    var tag = 'add';
    var array = [];
    for (var i = 0; i < logs.length; i++) {
        var log = logs[i];
        var item = log.item;
        if (log.event === tag && item) {
            //metadata
            var text = item.languageId + '|' + item.name + '|' + item.weight + '|' + item.isCompleted;

            //properties
            text += '$';
            item.properties.each(function (key, value) {
                text += value.id + '|' + value.value + ';';
            });

            //details
            text += '$';
            item.details.each(function (key, value) {
                text += value.id + '|' + value.value + ';';
            });

            array.push(text);
        }
    }
    return array;
};
Entity.prototype.propertiesLogs = function (logs) {
    var tag = 'properties';
    var array = [];
    for (var i = 0; i < logs.length; i++) {
        var log = logs[i];
        if (log.event === tag) {
            var wordId = log.wordId;
            var propertyId = log.propertyId;
            var value = log.value;
            var text = wordId + '|' + propertyId + '|' + (value === 'true' ? '*' : (value === 'false' ? '' : value));
            array.push(text);
        }
    }
    return array;
};
Entity.prototype.detailsLogs = function (logs) {
    var tag = 'details';
    if (!logs) return [];

    var array = [];
    for (var i = 0; i < logs.length; i++) {
        var log = logs[i];
        if (log.event === tag) {
            var text = log.wordId + '|' + log.form + '|' + log.value;
            array.push(text);
        }
    }
    return array;
};


function Metaword(properties) {
    Entity.call(this, properties);
    this.Metaword = true;
    this.service = my.words;
    this.wordtype = WORDTYPE.getItem(properties.Type);
}
extend(Entity, Metaword);
Metaword.prototype.editItem = function () {
    var self = this;
    return new WordEditEntity({
        id: self.id,
        name: self.name,
        wordtype: self.wordtype,
        weight: self.weight,
        isActive: self.isActive,
        categories: self.categories,
        options: self.options
    });
};
Metaword.prototype.update = function (params) {
    if (!params.WordEditEntity) {
        alert('Illegal argument passed to function Metaword.update');
        return;
    }

    var self = this;
    var name = (this.name === params.name ? '' : params.name);
    var weight = (this.weight === params.weight ? 0 : params.weight);
    var categories = (my.array.equal(params.categories, this.categories) ? [] : params.categories);
    var wordtype = (this.wordtype === params.wordtype ? 0 : params.wordtype.id);
    var removed = this.removedLogs(params.logs);
    var edited = this.editedLogs(params.logs);
    var added = this.addedLogs(params.logs);
    var properties = this.propertiesLogs(params.logs);
    var details = this.detailsLogs(params.logs);

    //Check if there are any changes.
    if (name || weight || wordtype ||
        (categories && categories.length) ||
        (removed && removed.length) ||
        (edited && edited.length) ||
        (added && added.length) ||
        (properties && properties.length) ||
        (details && details.length)){

        if (self.new) {

            this.service.add({
                word: self,
                name: name,
                weight: weight,
                wordtype: wordtype,
                added: added,
                properties: properties,
                details: details,
                categories: my.categories.toIntArray(categories),
                callback: function (result) {
                    if (result !== false) {
                        self.trigger({
                            type: 'add'
                        });
                    }
                }
            });

        } else {

            this.service.update({
                word: self,
                name: name,
                weight: weight,
                wordtype: wordtype,
                removed: removed,
                edited: edited,
                added: added,
                properties: properties,
                details: details,
                categories: my.categories.toIntArray(categories),
                callback: function (result) {
                    if (result !== false) {

                        //Name.
                        if (name) {
                            self.name = name;
                            self.trigger({
                                type: 'changeName',
                                name: name
                            });
                        }

                        //Wordtype.
                        if (wordtype) {
                            self.wordtype = params.wordtype;
                            self.trigger({
                                type: 'changeWordtype',
                                wordtype: self.wordtype
                            });
                        }

                        //Weight.
                        if (weight) {
                            self.weight = weight;
                            self.trigger({
                                type: 'changeWeight',
                                weight: weight
                            });
                        }

                        //Categories.
                        if (categories && categories.length) {
                            self.categories = categories;
                            self.trigger({
                                type: 'changeCategories',
                                categories: categories
                            });
                        }

                    }
                }
            });

            this.trigger({
                type: 'change'
            });

        }

    }
    
};
Metaword.prototype.checkWordtype = function (wordtype) {
    if (!wordtype || !wordtype.id) {
        return MessageBundle.get(dict.WordtypeCannotBeEmpty);
    } else {
        return true;
    }
};
Metaword.prototype.editPanel = function (editItem) {
    return new WordEditPanel(this, editItem);
};


function Question(properties) {
    Entity.call(this, properties);
    this.Question = true;
    this.service = my.questions;
}
extend(Entity, Question);
Question.prototype.editItem = function () {
    var self = this;
    return new QuestionEditEntity({
        id: self.id,
        name: self.name,
        weight: self.weight,
        isActive: self.isActive,
        categories: self.categories
    });
};
Question.prototype.update = function (params) {
    if (!params.QuestionEditEntity) {
        alert('Illegal argument passed to function Metaword.update');
        return;
    }

    var self = this;
    var name = (this.name === params.name ? '' : params.name);
    var weight = (this.weight === params.weight ? 0 : params.weight);
    var categories = (my.array.equal(params.categories, this.categories) ? [] : params.categories);
    var removed = this.removedLogs(params.logs);
    var edited = this.editedLogs(params.logs);
    var added = this.addedLogs(params.logs);
    var details = this.detailsLogs(params.logs);

    //Check if there are any changes.
    if (name || weight || (categories && categories.length) || (removed && removed.length) ||
            (edited && edited.length) || (added && added.length)) {

        this.service.update({
            question: self,
            name: name,
            weight: weight,
            removed: removed,
            edited: edited,
            added: added,
            categories: my.categories.toIntArray(categories),
            callback: function (result) {
                if (result !== false) {

                    //Name.
                    if (name) {
                        self.name = name;
                        self.trigger({
                            type: 'changeName',
                            name: name
                        });
                    }

                    //Weight.
                    if (weight) {
                        self.weight = weight;
                        self.trigger({
                            type: 'changeWeight',
                            weight: weight
                        });
                    }

                    //Categories.
                    if (categories && categories.length) {
                        self.categories = categories;
                        self.trigger({
                            type: 'changeCategories',
                            categories: categories
                        });
                    }

                }
            }
        });
    }

};
Question.prototype.editPanel = function (editItem) {
    return new QuestionEditPanel(this, editItem);
};


function EditEntity(properties) {
    this.EditEntity = true;
    this.id = properties.id;
    this.name = properties.name;
    this.weight = properties.weight;
    this.isActive = properties.isActive;
    this.categories = properties.categories;

    //Logic.
    this.eventHandler = new EventHandler();
    this.languages = new HashTable(null);
    this.logs = [];

    this.loadDetails();

}
EditEntity.prototype.bind = function (e) {
    this.eventHandler.bind(e);
};
EditEntity.prototype.trigger = function (e) {
    this.eventHandler.trigger(e);
};
EditEntity.prototype.setWeight = function (value) {
    this.weight = value;
    this.trigger({
        type: 'changeWeight',
        weight: value
    });
};
EditEntity.prototype.setCategories = function(categories) {
    this.categories = categories;
    this.trigger({
        type: 'changeCategories',
        categories: categories
    });
};
EditEntity.prototype.addLog = function (log) {
    this.logs.push(log);
};
EditEntity.prototype.removeLog = function (type, item) {
    var array = [];
    for (var i = 0; i < this.logs.length; i++) {
        var log = this.logs[i];
        if (log.event !== type && log.item !== item) {
            array.push(log);
        }
    }
    this.logs = array;
};
EditEntity.prototype.loadDetails = function () {
    var languages = my.languages.userLanguages();
    for (var i = 0; i < languages.length; i++) {
        var language = languages[i];
        var object = new LanguageEntity(this, language);
        this.languages.setItem(language.id, object);
    }

    //For new items options are not loaded.
    if (this.id) {
        this.loadItems();
    }

};
EditEntity.prototype.loadItems = function () {
    alert('Must by defined by implementing class');
};
EditEntity.prototype.getLanguagesIds = function () {
    if (!this.languages) return [];
    var languages = [];
    this.languages.each(function (key, object) {
        var language = object.language;
        languages.push(language.id);
    });
    return languages;
};
EditEntity.prototype.newItem = function () {
    alert('Must be defined in implementing class');
};


function WordEditEntity(properties) {
    EditEntity.call(this, properties);
    this.WordEditEntity = true;
    this.wordtype = properties.wordtype;
}
extend(EditEntity, WordEditEntity);
WordEditEntity.prototype.setWordtype = function (params) {
    var wordtype = params.wordtype;
    var line = params.line;

    this.wordtype = wordtype;
    this.trigger({
        type: 'changeWordtype',
        wordtype: wordtype,
        line: line
    });
};
WordEditEntity.prototype.loadItems = function () {
    var words = my.words.getWords(this.id, this.getLanguagesIds());

    for (var i = 0; i < words.length; i++) {
        var object = words[i];
        var word = new Word(this, object);
        var languageId = word.getLanguageId();
        var language = this.languages.getItem(languageId);
        language.addItem(word);
    }

};
WordEditEntity.prototype.newItem = function (languageId) {
    return new Word(this, {
        LanguageId: languageId,
        'new': true
    });
};

function QuestionEditEntity(properties) {
    EditEntity.call(this, properties);
    this.QuestionEditEntity = true;
}
extend(EditEntity, QuestionEditEntity);
QuestionEditEntity.prototype.loadItems = function () {
    this.loadOptions();
    this.loadVariants();
};
QuestionEditEntity.prototype.loadOptions = function () {
    var options = my.questions.getOptions(this.id, this.getLanguagesIds());
    for (var i = 0; i < options.length; i++) {
        var object = options[i];
        var option = new Option(this, object);
        var languageId = option.getLanguageId();
        var language = this.languages.getItem(languageId);
        language.addItem(option);
    }
};
QuestionEditEntity.prototype.loadVariants = function () {
    var variants = my.questions.getVariantSets(this.id, this.getLanguagesIds());
    for (var i = 0; i < variants.length; i++) {
        var object = variants[i];
        var variant = new Variant(this, object);
        var languageId = variant.getLanguageId();
        var language = this.languages.getItem(languageId);
        language.addVariant(variant);
    }
};
QuestionEditEntity.prototype.newItem = function (languageId) {
    return new Option(this, {
        LanguageId: languageId,
        'new': true
    });
};




function LanguageEntity(parent, language) {
    this.LanguageEntity = true;
    this.parent = parent;
    this.language = language;
    this.items = [];
    this.variants = [];
}
LanguageEntity.prototype.addItem = function (option) {
    this.items.push(option);
    option.injectLanguageEntity(this);
};
LanguageEntity.prototype.remove = function (item) {
    this.items = my.array.remove(this.items, item);
    
    if (item.new) {
        this.parent.removeLog('add', item);
    } else {
        this.parent.addLog({
            event: 'remove',
            item: item
        });
    }

};






function OptionEntity(entity, properties) {
    this.OptionEntity = true;
    this.service = null;
    //Properties.
    this.parent = entity;
    this.id = properties.Id || 0;
    this.name = properties.Name || properties.Content || '';
    this.weight = properties.Weight || 1;
    this.languageId = properties.LanguageId;
    this.isCompleted = properties.IsCompleted || false;
    this.isActive = properties.IsActive || true;
    this.creatorId = properties.CreatorId || 1;
    this.createDate = properties.CreateDate || new Date().getDate;
    this.isApproved = properties.IsApproved || false;
    this.positive = properties.Positive || 0;
    this.negative = properties.Negative || 0;
    this.new = properties.new || false;

    //Logic.
    this.eventHandler = new EventHandler();
    this.language = null; //LanguageEntity

}
OptionEntity.prototype.bind = function (e) {
    this.eventHandler.bind(e);
};
OptionEntity.prototype.trigger = function (e) {
    this.eventHandler.trigger(e);
};
OptionEntity.prototype.getLanguageId = function () {
    return this.languageId;
};
OptionEntity.prototype.injectLanguageEntity = function (languageEntity) {
    this.language = languageEntity;
};
OptionEntity.prototype.delete = function () {
    if (this.language) {
        this.language.remove(this);
    }

    this.trigger({
        type: 'remove'
    });

};
OptionEntity.prototype.edit = function (properties) {

    //Load properties and details of this entity.
    if (!this.properties) this.loadProperties();
    if (!this.details) this.loadDetails();

    //Create edit object bound to this entity and display edit form.
    var editItem = this.editItem();
    var editPanel = this.editOptionPanel(editItem, properties);
    editPanel.display();

};
OptionEntity.prototype.loadProperties = function () {
    alert('Must be defined in implementing class');
};
OptionEntity.prototype.loadDetails = function () {
    alert('Must be defined in implementing class');
};
OptionEntity.prototype.editOptionPanel = function () {
    alert('Must be defined in implementing class');
};
OptionEntity.prototype.checkName = function (name) {

    if (!name) return MessageBundle.get(dict.NameCannotBeEmpty);

    var language = this.language;
    var items = language ? language.items : [];
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var itemName = item.name;
        if (itemName === name && item !== this) {
            return MessageBundle.get(dict.NameAlreadyExists);
        }
    }
    return true;
};
OptionEntity.prototype.update = function (params, properties, details, complete) {
    if (!params.OptionEditEntity) {
        alert('Illegal argument passed to function Metaword.update');
        return;
    }

    var self = this;
    var completed = (this.isCompleted === complete ? undefined : complete);
    var name = (this.name === params.name ? undefined : params.name);
    var weight = (this.weight === params.weight ? undefined : params.weight);

    //Check if there are any changes.
    if (completed !== undefined || name || weight) {
        this.isCompleted = complete;
        this.name = (name === undefined ? this.name : name);
        this.weight = (weight === undefined ? this.weight : weight);


        if (this.new) {

            this.parent.addLog({
                event: 'add',
                item: self
            });

            this.trigger({
                type: 'add',
                item: self
            });

        } else {
            this.parent.addLog({
                event: 'edit',
                item: self
            });

            this.trigger({
                type: 'update',
                name: self.name,
                weight: self.weight,
                complete: self.isCompleted
            });


        }

    }


    //Update properties and details.
    this.updateProperties(properties);
    this.updateDetails(details);

};
OptionEntity.prototype.updateProperties = function () {
    alert('Must be defined in implementing class');
};
OptionEntity.prototype.updateDetails = function () {
    alert('Must be defined in implementing class');
};


function Word(metaword, properties) {
    OptionEntity.call(this, metaword, properties);
    this.Word = true;
    this.service = my.words;
}
extend(OptionEntity, Word);
Word.prototype.editOptionPanel = function (editItem, properties) {
    return new WordOptionEditPanel(this, editItem, properties);
};
Word.prototype.editItem = function () {
    var self = this;
    return new WordOptionEditEntity({
        id: self.id,
        name: self.name,
        weight: self.weight,
        isActive: self.isActive,
        languageId: self.languageId,
        object: self
    });
};
Word.prototype.updateProperties = function (properties) {
    var self = this;

    properties.items.each(function (key, object) {

        var property = self.properties.getItem(key);
        if (!property || object.isChanged()) {
            property = {
                id: object.id,
                value: object.value
            };
            self.properties.setItem(property.id, property);

            //If id is 0, this is a newly created word and its
            //properties have to be uploaded other way.
            if (self.id) {
                self.parent.addLog({
                    event: 'properties',
                    wordId: self.id,
                    propertyId: property.id,
                    value: my.text.valueToText(property.value)
                });
            }
        }

    });

};
Word.prototype.updateDetails = function (forms) {
    var self = this;    

    forms.forms.each(function (key, object) {

        var form;
        //var form = self.details.getItem(key);
        if (object.isChanged()) {
            form = {
                id: object.key,
                value: object.value
            };
            self.details.setItem(form.id, form);

            //If id is 0, this is a newly created word and its
            //properties have to be uploaded other way.
            if (self.id) {
                self.parent.addLog({
                    event: 'details',
                    wordId: self.id,
                    form: form.id,
                    value: form.value
                });
            }

        }

    });

};
Word.prototype.loadProperties = function () {
    this.properties = new HashTable(null);
    var $values = this.getPropertiesFromRepository(this.id);
    for (var i = 0; i < $values.length; i++) {
        var set = $values[i];
        var property = {
            id: set.PropertyId,
            value: my.text.parse(set.Value)
        };
        this.properties.setItem(property.id, property);
    };
};
Word.prototype.getPropertiesFromRepository = function (wordId) {
    return my.db.fetch('Words', 'GetPropertyValues', { 'wordId': wordId });
};
Word.prototype.loadDetails = function () {
    this.details = new HashTable(null);
    var $values = this.getFormsFromRepository(this.id);
    for (var i = 0; i < $values.length; i++) {
        var set = $values[i];
        var form = {
            id: set.Definition,
            value: set.Content
        };
        this.details.setItem(form.id, form);
    };
};
Word.prototype.getFormsFromRepository = function (wordId) {
    return my.db.fetch('Words', 'GetGrammarForms', { 'wordId': wordId });
};








function Option(question, properties) {
    OptionEntity.call(this, question, properties);
    this.Option = true;
    this.service = my.questions;
}
extend(OptionEntity, Option);
Option.prototype.editOptionPanel = function (editItem, properties) {
    return new QuestionOptionEditPanel(this, editItem, properties);
};
Option.prototype.editItem = function () {
    var self = this;
    return new QuestionOptionEditEntity({
        id: self.id,
        name: self.name,
        weight: self.weight,
        isActive: self.isActive,
        languageId: self.languageId,
        object: self
    });
};
Option.prototype.updateProperties = function () {
    
};
Option.prototype.updateDetails = function (details) {

};
Option.prototype.loadProperties = function () {

};
Option.prototype.loadDetails = function () {

};


function OptionEditEntity(properties) {
    this.OptionEditEntity = true;
    this.id = properties.id;
    this.name = properties.name;
    this.weight = properties.weight;
    this.isActive = properties.isActive;
    this.object = properties.object;
    this.languageId = properties.languageId;
    this.isActive = properties.isActive || true;

    //Logic.
    this.eventHandler = new EventHandler();

    //Logic.
    this.eventHandler = new EventHandler();
    this.logs = [];

    //this.loadDetails();

}
OptionEditEntity.prototype.bind = function (e) {
    this.eventHandler.bind(e);
};
OptionEditEntity.prototype.trigger = function (e) {
    this.eventHandler.trigger(e);
};
OptionEditEntity.prototype.setWeight = function (value) {
    this.weight = value;
    this.trigger({
        type: 'changeWeight',
        weight: value
    });
};
OptionEditEntity.prototype.addLog = function (log) {
    this.logs.push(log);
};
OptionEditEntity.prototype.editItem = function () {
    alert('Must be defined by implementing class');
};
OptionEditEntity.prototype.createPropertyManager = function () {
    alert('Must be defined by implementing class');
};
OptionEditEntity.prototype.createDetailsManager = function () {
    alert('Must be defined by implementing class');
};



function WordOptionEditEntity(properties) {
    OptionEditEntity.call(this, properties);
    this.WordOptionEditEntity = true;
}
extend(OptionEditEntity, WordOptionEditEntity);
WordOptionEditEntity.prototype.createPropertyManager = function () {
    return new WordPropertyManager(this, {});
};
WordOptionEditEntity.prototype.createDetailsManager = function (params) {
    return new GrammarManager(this, params);
};




function QuestionOptionEditEntity(properties) {
    OptionEditEntity.call(this, properties);
    this.QuestionOptionEditEntity = true;
}
extend(OptionEditEntity, QuestionOptionEditEntity);
QuestionOptionEditEntity.prototype.createPropertyManager = function () {
    return new QuestionPropertyManager(this, {});
};
QuestionOptionEditEntity.prototype.createDetailsManager = function (params) {
    return new OptionManager(this, params);
};





function PropertyManager(object) {
    this.PropertyManager = true;
    this.editObject = object;
    this.entity = object.object;
    this.items = new HashTable(null);

    this.ui = (function () {
        var container = jQuery('<div/>', {
            'class': 'option-details-container'
        });

        return {
            view: function() {
                return container;
            },
            hide: function() {
                $(container).css('display', 'none');
            },
            append: function(element) {
                $(element).appendTo($(container));
            }
        };

    })();

}
PropertyManager.prototype.view = function () {
    return this.ui.view();
};


function WordPropertyManager(editObject) {
    PropertyManager.call(this, editObject);
    this.WordPropertyManager = true;
    this.loadProperties();
    this.loadValues();
}
extend(PropertyManager, WordPropertyManager);
WordPropertyManager.prototype.loadProperties = function () {
    var metaword = this.entity.parent;
    var languageId = this.entity.languageId;
    var wordtypeId = metaword.wordtype.id;

    var $properties = this.getPropertiesFromRepository(languageId, wordtypeId);
    for (var i = 0; i < $properties.length; i++) {
        var property = new WordProperty($properties[i]);
        this.items.setItem(property.id, property);
        this.ui.append(property.view());
    }

};
WordPropertyManager.prototype.getPropertiesFromRepository = function (languageId, wordtypeId) {
    return my.db.fetch('Words', 'GetProperties', { 'languageId': languageId, 'wordtypeId': wordtypeId });
};
WordPropertyManager.prototype.loadValues = function() {
    var self = this;
    this.entity.properties.each(function(key, object){
        var property = self.items.getItem(key);
        if (property){
            property.setValue(object.value);
        }
    });

};
WordPropertyManager.prototype.copyDetails = function (id) {
    var self = this;
    var properties = this.entity.getPropertiesFromRepository(id);
    for (var i = 0; i < properties.length; i++) {
        var property = properties[i];
        var def = self.items.getItem(property.PropertyId);
        if (def) {
            def.changeValue(my.text.parse(property.Value));
        }
    }
};

function WordProperty(params) {
    this.WordProperty = true;
    this.eventHandler = new EventHandler();
    var self = this;
    this.id = params.Id;
    this.name = params.Name;
    this.value = params.Value;
    this.originalValue = params.Type === 'boolean' ? false : 0;
    
    this.ui = (function () {
        var container = jQuery('<div/>', {            
            'class': 'property-container'
        });


        var input = (function() {
            switch (params.Type) {
                case 'radio':
                    return my.ui.radio({
                        container: container,
                        name: self.name,
                        options: self.parseToRadioOptions(params.Details)
                    });
                case 'boolean':
                    return my.ui.checkbox({                        
                        container: container,
                        name: params.Name,
                        caption: params.Name,
                        checked: params.Details.indexOf('*') >= 0 ? true : false
                    });
                default:
                    return null;
            }
        })();

        self.value = input.value();

        input.bind({
            click: function (e) {
                if (e.value !== self.value) {
                    self.value = e.value;
                    self.trigger({
                        type: 'change',
                        value: self.value
                    });
                }
            }
        });

        return {
            view: function() {
                return container;
            },
            change: function (value) {
                if (input.change) {
                    input.change(value);
                }
            }
        };

    })();

}
WordProperty.prototype.view = function() {
    return this.ui.view();
};
WordProperty.prototype.parseToRadioOptions = function(str) {
    var $options = str.split('|');
    var options = {};
    for (var i = 0; i < $options.length; i++) {
        var text = $options[i];
        var caption = my.text.substring(text, '', '(').trim();
        var key = Number(my.text.substring(text, '(', ')'));
        var checked = (text.indexOf('*') >= 0 ? true : false);

        var option = {
            key: key,
            value: key,
            caption: caption,
            checked: checked
        };

        options[key] = option;

    }

    return options;

};
WordProperty.prototype.bind = function (e) {
    this.eventHandler.bind(e);
};
WordProperty.prototype.trigger = function (e) {
    this.eventHandler.trigger(e);
};
WordProperty.prototype.setValue = function (value) {
    this.originalValue = value;
    this.ui.change(value);
};
WordProperty.prototype.isChanged = function () {
    return (this.originalValue !== this.value);
};
WordProperty.prototype.changeValue = function (value) {
    this.ui.change(value);
};



function QuestionPropertyManager(editObject) {
    PropertyManager.call(this, editObject);
    this.QuestionPropertyManager = true;
    this.ui.hide();
}
extend(PropertyManager, QuestionPropertyManager);


function DetailsManager(object) {
    this.DetailsManager = true;
    this.editObject = object;
    this.entity = object.object;

    this.container = jQuery('<div/>', {
        'class': 'option-details-container'
    });

}
DetailsManager.prototype.view = function () {
    return this.container;
};


function GrammarManager(object, properties) {
    DetailsManager.call(this, object, properties);
    this.GrammerManager = true;
    var self = this;
    this.propertiesManager = properties.propertiesManager;

    this.groups = new HashTable(null);
    this.forms = new HashTable(null);

    this.ui = (function () {
        // ReSharper disable once UnusedLocals
        var searchPanel = jQuery('<div/>', {
            'class': 'grammar-search-panel'
        }).appendTo(self.container);

        var formsPanel = jQuery('<div/>', {
            'class': 'grammar-forms-panel'
        }).appendTo(self.container);

        var formsList = jQuery('<ul/>').appendTo(formsPanel);

        return {
            addGroup: function(view) {
                $(view).appendTo($(formsList));
            },
            searchPanel: function(){
                return searchPanel;
            }
        };

    })();

    this.loadSearchPanel();
    this.loadForms();
    this.loadValues();
    this.render();

}
extend(DetailsManager, GrammarManager);
GrammarManager.prototype.loadSearchPanel = function (name) {
    var self = this;

    //Remove the previous dropdown if exists.
    var container = self.ui.searchPanel();
    $(container).empty();

    my.db.fetch('Words', 'GetSimilarWords', {
        'languageId': self.entity.languageId,
        'wordtype': self.entity.parent.wordtype ? self.entity.parent.wordtype.id : 0,
        'word': name || self.entity.name
    }, {
        async: true,
        callback: function (words) {
            var dropdown = new DropDown({
                container: self.ui.searchPanel(),
                data: self.convertSimilarWords(words),
                placeholder: 'Select word to copy grammar forms',
                allowClear: true
            });

            dropdown.bind({
                change: function (e) {
                    self.propertiesManager.copyDetails(e.item.object.Id);
                    self.copyDetails(e.item.object.Name, e.item.object.Id);
                }
            });

        }
    });

};
GrammarManager.prototype.convertSimilarWords = function(words){
    var data = [];
    for (var i = 0; i < words.length; i++){
        var word = words[i];
        data.push({
            key: word.Id,
            name: word.Name,
            object: word
        });
    }

    return data;

};
GrammarManager.prototype.loadForms = function() {
    var metaword = this.entity.parent;
    var languageId = this.entity.languageId;
    var wordtypeId = metaword.wordtype.id;

    var $forms = this.getDefinitionsFromRepository(languageId, wordtypeId);
    for (var i = 0; i < $forms.length; i++) {
        // ReSharper disable once UnusedLocals
        var form = new GrammarForm(this, $forms[i]);
    }

};
GrammarManager.prototype.getDefinitionsFromRepository = function(languageId, wordtypeId) {
    return my.db.fetch('Words', 'GetGrammarDefinitions', { 'languageId': languageId, 'wordtypeId': wordtypeId });
};
GrammarManager.prototype.render = function () {
    var sorted = this.sorted();
    for (var i = 0; i < sorted.length; i++) {
        var group = sorted[i];
        group.render();
    }
};
GrammarManager.prototype.sorted = function() {
    var array = this.groups.values();
    array.sort(function(a, b) {
        return a.index < b.index ? -1 : 1;
    });
    
    //Sorted forms inside groups.
    for (var i = 0; i < array.length; i++) {
        var group = array[i];
        if (!group.GrammarGroup) {
            alert('This item is not of a GrammarGroup type');
        } else {
            group.sort();
        }
    }

    return array;
};
GrammarManager.prototype.addGroupView = function (view) {
    this.ui.addGroup(view);
};
GrammarManager.prototype.loadValues = function () {
    var self = this;
    this.entity.details.each(function (key, object) {
        var form = self.forms.getItem(key);
        if (form) {
            form.setValue(object.value);
        }
    });
};
GrammarManager.prototype.addForm = function (form) {
    //Add to proper group (create if it doesn't exist yet).
    var self = this;
    var group = this.groups.getItem(form.groupName);
    if (!group) {
        group = new GrammarGroup({
            index: form.groupIndex,
            name: form.groupName,
            manager: self,
            header: form.header
        });
        self.groups.setItem(form.groupName, group);
    }
    group.add(form);

    //Add to flyweight map of forms.
    this.forms.setItem(form.key, form);

};
GrammarManager.prototype.copyDetails = function (name, id) {
    var self = this;
    var matched = my.text.countMatchedEnd(this.editObject.name, name);
    var forms = this.entity.getFormsFromRepository(id);

    for (var i = 0; i < forms.length; i++) {
        var form = forms[i];
        var def = self.forms.getItem(form.Definition);
        if (def) {
            def.changeValue(self.getProperForm(form.Content, my.text.cut(name, matched), my.text.cut(self.editObject.name, matched)));
        }
    }
};
GrammarManager.prototype.getProperForm = function (form, baseValue, replace) {
    return form.replace(baseValue, replace);
};

function GrammarForm(manager, params) {
    this.GrammarForm = true;
    this.manager = manager;
    this.id = params.Id;
    this.key = params.Key;
    this.name = params.Name;
    this.params = params.Params;
    this.groupIndex = my.text.substring(params.Group, '(', ')');
    this.groupName = my.text.substring(params.Group, ')', '');
    this.header = params.Header;
    this.inactiveRules = params.InactiveRules;
    this.index = params.Index;
    this.originalValue = '';
    this.active = true;

    manager.addForm(this);
    
    //Bind listeners.
    if (this.inactiveRules) {
        this.setListeners();
    }
    
}
GrammarForm.prototype.view = function () {
    var self = this;
    if (!this.panel) {
        
        if (this.header) {
            this.panel = jQuery('<div/>', {
                'class': 'grammar-form',
                html: self.name
            }).css({                
                'border': 'none',
                'text-align': 'right'
            });
        } else {
            this.panel = jQuery('<input/>', {
                'type': 'text',
                'class': 'grammar-form'
            }).bind({
                change: function () {
                    self.value = $(this).val();
                }
            });
        }

    }

    return this.panel;

};
GrammarForm.prototype.setListeners = function () {
    var self = this;
    var rules = this.inactiveRules.split('|');
    for (var i = 0; i < rules.length; i++) {
        var rule = rules[i];
        var key = Number(my.text.substring(rule, '', ':'));
        var value = my.text.parse(my.text.substring(rule, ':', ''));

        var property = this.manager.propertiesManager.items.getItem(key);
        if (property) {
            self.activate(property.value != value);
            property.bind({
                change: function (e) {
                    self.activate(e.value != value);
                }
            });
        }
    }
};
GrammarForm.prototype.activate = function (value) {
    this.active = value;
    if (value) {
        this.view().removeAttr('disabled');
    } else {
        this.view().attr('disabled', 'disabled');
    }
};
GrammarForm.prototype.setValue = function (value) {
    this.originalValue = value;
    this.value = value;
    if (!this.header) {
        this.view().val(value);
    }
};
GrammarForm.prototype.isChanged = function () {
    return (this.value !== undefined && this.originalValue !== this.value);
};
GrammarForm.prototype.changeValue = function (value) {
    this.value = value;
    if (!this.header) {
        this.view().val(value);
    }
};

function GrammarGroup(params) {
    this.GrammarGroup = true;
    this.manager = params.manager;
    this.index = params.index;
    this.name = params.name;
    this.header = params.header;
    this.forms = [];
}
GrammarGroup.prototype.add = function(form) {
    this.forms.push(form);
};
GrammarGroup.prototype.sort = function() {
    this.forms.sort(function(a, b) {
        return a.index < b.index ? -1 : 1;
    });
};
GrammarGroup.prototype.render = function () {
    var self = this;
    var listWrapper = jQuery('<li/>').
        css({
            'display': 'block',
            'float': 'left',
            'width': (100 / self.manager.groups.size()) + '%'
        });

    var container = jQuery('<div/>', {
        'class': 'grammar-group'
    }).appendTo($(listWrapper));

    //Render header.
    var header = jQuery('<div/>', {
        'class': 'grammar-form grammar-header',
        html: self.name
    }).css({
        'visibility': (self.header ? 'hidden' : 'visible')
    });
    $(header).appendTo($(container));

    //Insert forms.
    for (var i = 0; i < this.forms.length; i++) {
        var form = this.forms[i];
        var view = form.view();
        $(view).appendTo($(container));
    }

    this.manager.addGroupView(listWrapper);

};




function OptionManager(object, properties) {
    DetailsManager.call(this, object, properties);
    this.GrammerManager = true;
    var self = this;
    this.propertiesManager = properties.propertiesManager;

    this.groups = new HashTable(null);
    this.forms = new HashTable(null);

    this.ui = (function () {
        // ReSharper disable once UnusedLocals
        var searchPanel = jQuery('<div/>', {
            'class': 'grammar-search-panel'
        }).appendTo(self.container);

        var formsPanel = jQuery('<div/>', {
            'class': 'grammar-forms-panel'
        }).appendTo(self.container);

        var formsList = jQuery('<ul/>').appendTo(formsPanel);

        return {
            addGroup: function (view) {
                $(view).appendTo($(formsList));
            },
            searchPanel: function () {
                return searchPanel;
            }
        };

    })();

    //this.loadSearchPanel();
    //this.loadForms();
    //this.loadValues();
    //this.render();
    
}
extend(DetailsManager, OptionManager);



/*
    * Class:           EditPanel
    * Description:     Responsible for displaying properties of the 
    *                  given object in a separate modal window.
    * Parameters:      
    *  ListItem item   List item that the object edited is assigned to.
    */
function EditPanel(object, editObject) {
    this.EditPanel = true;
    var self = this;
    this.object = object;
    this.editObject = editObject;
    this.line = this.object.line;

    this.validator = (function () {
        var invalid = new HashTable(null);

        return {
            validation: function (e) {
                if (e.status) {
                    invalid.removeItem(e.id);
                } else {
                    invalid.setItem(e.id, e.id);
                }

                self.object.trigger({
                    type: 'validation',
                    status: invalid.size() === 0
                });

            }
        };

    })();

    this.ui = (function () {
        var background = jQuery('<div/>', {
            'class': 'edit-background',
            'z-index': my.ui.addTopLayer()
        }).appendTo($(document.body));

        var frame = jQuery('<div/>', {
            'class': 'edit-frame'
        }).appendTo($(background));

        var container = jQuery('<div/>', {
            'class': 'edit-container'
        }).appendTo($(frame));

        // ReSharper disable once UnusedLocals
        var close = jQuery('<div/>', {
            'class': 'edit-close'
        }).bind({
            'click': function () {
                self.cancel();
            }
        }).appendTo($(frame));

        return {
            display: function() {
                $(background).css({
                    'visibility': 'visible',
                    'z-index': my.ui.addTopLayer()
                });
            },
            hide: function() {
                $(background).css({
                    'visibility': 'hidden'
                });
            },
            destroy: function() {
                $(background).remove();
            },
            append: function(element) {
                $(element).appendTo($(container));
            }
        };

    })();

    this.meta = (function () {
        var controls = new HashTable(null);

        var container = jQuery('<div/>', {
            id: 'meta-container'
        });
        self.ui.append($(container));

        return {
            addLine: function (line) {
                controls.setItem(line.property, line);
                line.appendTo(container);
            },
            getLine: function (key) {
                return controls.getItem(key);
            }
        };

    })();

    this.languages = (function () {
        var items = new HashTable(null);

        var container = jQuery('<div/>', {
            id: 'languages-container'
        });
        self.ui.append($(container));

        return {
            add: function(panel){
                items.setItem(panel.id, panel);
                $(panel.view()).appendTo($(container));
            }
        };
    })();

    this.buttons = (function () {
        var panel = jQuery('<div/>', {
            'class': 'edit-buttons-panel'
        });

        var container = jQuery('<div/>', {
            'class': 'edit-buttons-container'
        }).appendTo($(panel));

        var ok = jQuery('<input/>', {
            'class': 'edit-button',
            'type': 'submit',
            'value': 'OK'
        }).bind({
            'click': function () {
                self.confirm();
            }
        }).appendTo($(container));

        // ReSharper disable once UnusedLocals
        var cancel = jQuery('<input/>', {
            'class': 'edit-button',
            'type': 'submit',
            'value': 'Cancel'
        }).bind({
            'click': function () {
                self.cancel();
            }
        }).appendTo($(container));

        self.ui.append(panel);

        self.object.bind({
            validation: function (e) {
                if (e.status) {
                    $(ok).removeAttr('disabled');
                } else {
                    $(ok).attr('disabled', 'disabled');
                }
            }
        });

    })();

    this.generalRender();

    this.renderLanguages();

}
EditPanel.prototype.display = function () {
    this.ui.display();
};
EditPanel.prototype.cancel = function () {
    this.ui.destroy();
};
EditPanel.prototype.confirm = function () {
    this.object.update(this.editObject);
    this.ui.destroy();
};
EditPanel.prototype.start = function () {
    this.display();
};
EditPanel.prototype.generalRender = function () {

    var self = this;

    //[Id]
    this.meta.addLine(new EditDataLine(this, { 
        property: 'id', label: 'ID', value: self.editObject.id,
        callback: function (value) { self.editObject.id = value; },
        inputCss: { 'width': '60px', 'text-align': 'center', 'border': '1px solid #777', 'background-color': 'white' } 
    }));

    //[Name]
    this.meta.addLine(new EditDataLine(this, {
        property: 'name', label: 'Name', value: self.editObject.name,
        callback: function (value) { self.editObject.name = value; },
        validation: function (params) {
            return self.object.checkName(params.value);
        },
        editable: true
    }));
    
    //[Weight]
    var weightPanel = new WeightPanel(this, self.editObject, {
        css: { 'margin': '9px 0', 'height': '16px' }
    });
    this.meta.addLine(new EditDataLine(this, {
        property: 'weight', label: 'Weight', value: self.editObject.weight,
        panel: weightPanel.view()
    }));

    //[Category]
    var categoryPanel = new CategoryPanel(this, self.editObject);
    this.meta.addLine(new EditDataLine(this, {
        property: 'categories', label: 'Categories', value: self.editObject.categories,
        panel: categoryPanel.view()
    }));

    this.render();
};
EditPanel.prototype.render = function () {
    alert('Must be defined by implementing class');
};
EditPanel.prototype.getProperty = function (key) {
    if (this.editPanel.hasOwnProperty(key)) {
        return this.editPanel[key];
    }
    return null;
};
EditPanel.prototype.renderLanguages = function () {
    var self = this;
    var languages = this.editObject.languages;
    languages.each(function (key, object) {
        var panel = new LanguagePanel(self.editObject, self, object);
        self.languages.add(panel);
    });
};

function WordEditPanel(object, editObject) {
    EditPanel.call(this, object, editObject);
    this.WordEditPanel = true;
}
extend(EditPanel, WordEditPanel);
WordEditPanel.prototype.render = function () {
    var self = this;
    //[Wordtype]
    var wordtypePanel = new WordtypePanel(this, self.editObject);
    var wordtypeLine = new EditDataLine(this, {
        property: 'wordtype', label: 'Type', value: self.editObject.wordtype,
        panel: wordtypePanel.view(), editable: true, 
        validation: function (params) {
            return self.object.checkWordtype(params.value);
        },
        binding: {
            changeWordtype: function (e) {
                e.line.validate(e.wordtype);
            }
        }
    });
    wordtypePanel.injectEditLine(wordtypeLine);
    this.meta.addLine(wordtypeLine);
    

    //Move wordtype panel before name panel.
    var nameEditLine = this.meta.getLine('name');
    $(nameEditLine.view()).before(wordtypeLine.view());

};


function QuestionEditPanel(object, editObject) {
    EditPanel.call(this, object, editObject);
    this.QuestionEditPanel = true;
}
extend(EditPanel, QuestionEditPanel);
QuestionEditPanel.prototype.render = function () {
    //alert('Not implemented yet');
};


   
function EditDataLine(panel, properties) {
    this.EditDataLine = true;
    var self = this;
    this.panel = panel;
    this.object = panel.editObject || properties.object;
    this.property = properties.property;
    this.linked = new HashTable(null);
    this.validation = properties.validation;
    this.callback = properties.callback;

    this.ui = (function () {
        var timer;
        var valuePanel;

        var container = jQuery('<div/>', {
            'class': 'field-line'
        });

        // ReSharper disable once UnusedLocals
        var label = jQuery('<label/>', {
            'class': 'label',
            html: properties.label
        }).appendTo(jQuery('<span/>', {
            'class': 'block'
        }).css({
            'display': 'block',
            'float': 'left'
        }).appendTo($(container)));

        //Append error panels if this property is validatable.
        if (self.validation) {
            var errorContainer = jQuery('<div/>').addClass('error').appendTo($(container));
            var error = jQuery('<div/>', { 'class': 'error_content' }).appendTo(errorContainer);
            var errorIcon = jQuery('<span/>', { 'class': 'icon' }).appendTo($(container));
        }

        //Append right panel if is defined.
        if (properties.right) {
            $(properties.right).appendTo($(container));
        }


        if (properties.panel) {
            valuePanel = $(properties.panel);
            $(valuePanel).appendTo($(container));
        } else if (properties.editable) {
            valuePanel = jQuery('<input/>', {
                'class': 'field default',
                'type': 'text'
            }).bind({
                'keydown': function (e) {
                    if (e.which === 13) {
                        /* Jeżeli to nie jest ustawione, w IE 9 focus przeskakuje od razu
                            * na przycisk [Select categories] i wywołuje jego kliknięcie. */
                        e.preventDefault();
                        e.stopPropagation();
                    }
                },
                'keyup': function () {
                    var field = this;
                    if (timer) {
                        clearTimeout(timer);
                    }
                    timer = setTimeout(function () {
                        self.validate($(field).val());
                    }, 150);
                },
                'change': function () {
                    self.validate($(this).val());
                },
                'mouseup': function (e) {
                    e.preventDefault();
                },
                'blur': function () {
                    self.validate($(this).val());
                }
            }).on({
                'focus': function () {
                    this.select();
                }
            });

            $(valuePanel).val(properties.value);

            //Append panel to span to center it vertically.
            var span = jQuery('<span/>', {
                'class': 'block'
            }).
            bind({
                'click': function () {
                    $(valuePanel).focus();
                }
            }).appendTo($(container));

            valuePanel.appendTo($(span));

        } else {
            valuePanel = jQuery('<label/>', {
                'class': 'value',
                html: properties.value
            }).appendTo($(container));
        }

        if (properties.controlBinding) {
            $(valuePanel).bind(properties.controlBinding);
        }

        if (properties.inputCss) {
            $(valuePanel).css(properties.inputCss);
        }

        function format(value) {
            if (value === true) {
                $(valuePanel).removeClass('invalid').addClass('valid');
                $(errorContainer).css({ 'display': 'none' });
                $(errorIcon).removeClass('iconInvalid').addClass('iconValid');
            } else {
                $(valuePanel).removeClass('valid').addClass('invalid');
                $(errorContainer).css({ 'display': 'table' });
                $(errorIcon).removeClass('iconValid').addClass('iconInvalid');
                $(error).text(value);
            }
        }

        return {
            focus: function () {
                $(valuePanel).focus();
            },
            value: function(){
                return $(valuePanel).val();
            },
            format: function (value) {
                format(value);
            },
            appendTo: function (parent) {
                $(container).appendTo($(parent));
            },
            view: function () {
                return container;
            }
        };

    })();

    if (properties.binding) {
        this.object.bind(properties.binding);
    }

    if (this.validation) this.validate(properties.value);

    if (properties.focus) this.ui.focus();

}
EditDataLine.prototype.focus = function () {
    this.ui.focus();
};
EditDataLine.prototype.validate = function (value) {
    //There is no point to validate value if it hadn't changed.
    if (!this.validation || value === this.value) return;

    var self = this;
    this.value = value;
    this.verifyLinked();

    //Assign value to EditObject.
    if (this.callback && typeof (this.callback) === 'function') {
        this.callback(value);
    }

    var validationResult = this.validation({
        value: self.value,
        property: self.property,
        id: self.object.id
    });

    this.ui.format(validationResult);

    this.panel.validator.validation({
        id: self.property,
        status: (validationResult === true ? true : false)
    });

};
EditDataLine.prototype.verifyLinked = function () {
    this.linked.each(
        function (key, value) {
            value.validate();
        }
    );
};
EditDataLine.prototype.addLinked = function (item) {
    this.linked.setItem(item.property, item);
};
EditDataLine.prototype.appendTo = function (parent) {
    this.ui.appendTo(parent);
};
EditDataLine.prototype.view = function () {
    return this.ui.view();
};


function LanguagePanel(item, panel, languageEntity) {
    this.LanguagePanel = true;
    var self = this;
    this.item = item;
    this.panel = panel;
    this.languageEntity = languageEntity;
    this.language = this.languageEntity.language;
    this.items = new HashTable(null);

    this.ui = (function () {
        var isCollapsed = false;

        var container = jQuery('<div/>', {
            'class': 'language'
        });

        var info = jQuery('<div/>', {
            'class': 'info'
        }).appendTo($(container));


        // ReSharper disable once UnusedLocals
        var collapseButton = jQuery('<div/>', {
            'class': 'collapse'
        }).bind({
            'click': function () {
                if (isCollapsed === true) {
                    expand();
                } else {
                    collapse();
                }
            }
        }).appendTo($(info));

        // ReSharper disable once UnusedLocals
        var flag = jQuery('<div/>', {
            'class': 'flag ' + self.language.flag,
        }).appendTo($(info));

        // ReSharper disable once UnusedLocals
        var name = jQuery('<div/>', {
            'class': 'name',
            'html': self.language.name
        }).appendTo($(info));


        //Options.
        var options = jQuery('<div/>', {
            'class': 'options'
        }).css({
            'display': self.items.size() ? 'block' : 'none'
        }).appendTo($(container));


        //Buttons.
        var buttons = jQuery('<div/>', {
            'class': 'buttons'
        }).appendTo($(container));

        // ReSharper disable once UnusedLocals
        var add = jQuery('<input/>', {
            'class': 'button add',
            'type': 'submit',
            'value': 'Add'
        }).bind({
            'click': function () {
                self.addNew();
            }
        }).appendTo($(buttons));


        function collapse() {
            isCollapsed = true;

            $(options).css({
                'display': 'none'
            });
            $(buttons).css({
                'display': 'none'
            });
        }

        function expand() {
            isCollapsed = false;
            showOptionsPanel();
            $(buttons).css({
                'display': 'block'
            });
        }

        function showOptionsPanel() {
            $(options).css({
                'display': self.items.size() ? 'block' : 'none'
            });
        }

        return {
            view: function() {
                return container;
            },
            addOption: function(option) {
                $(option).appendTo($(options));
                showOptionsPanel();
            },
            refresh: function() {
                showOptionsPanel();
            }
        };

    })();

    this.loadOptions();

}
LanguagePanel.prototype.view = function () {
    return this.ui.view();
};
LanguagePanel.prototype.loadOptions = function () {
    var entity = this.languageEntity;
    var items = entity.items;
    for (var i = 0; i < items.length; i++) {
        var option = items[i];
        this.addOption(option);
    }
};
LanguagePanel.prototype.addOption = function (option) {
    var panel = new OptionPanel(option, this);
    this.items.setItem(option.id || option.name, panel);
    this.ui.addOption(panel.view());
};
LanguagePanel.prototype.remove = function (item) {
    this.items.removeItem(item.id);
    this.ui.refresh();
}; 
LanguagePanel.prototype.addNew = function () {
    var item = this.item.newItem(this.language.id);
    item.injectLanguageEntity(this.languageEntity);
    item.edit({ languagePanel: this });
};
LanguagePanel.prototype.add = function (item) {
    this.addOption(item);
};




function OptionPanel(item, parent) {
    this.OptionPanel = true;
    var self = this;
    this.item = item;
    this.parent = parent;

    this.ui = (function () {

        var container = jQuery('<div/>', { 'class': 'option' });
        
        // ReSharper disable once UnusedLocals
        var deleteButton = jQuery('<div/>', {
            'class': 'button delete',
            'title': 'Delete this option'
        }).bind({
            click: function () {
                self.delete();
            }
        }).appendTo($(container));

        // ReSharper disable once UnusedLocals
        var edit = jQuery('<div/>', {
            'class': 'button edit',
            'title': 'Edit this option'
        }).bind({
            click: function () {
                self.item.edit({ line: self });
            }
        }).appendTo($(container));

        var content = jQuery('<div/>', {
            'class': 'content',
            'html': self.contentToHtml()
        }).appendTo($(container));

        var weight = jQuery('<div/>', {
            'class': 'weight',
            'html': self.item.weight
        }).appendTo($(container));

        var completness = jQuery('<div/>', {
            'class': 'completness ' + (item.isCompleted ? 'complete' : 'incomplete')
        }).appendTo($(container));


        return {
            view: function() {
                return container;
            },
            destroy: function() {
                $(container).remove();
            },
            update: function($content, $weight, $complete) {
                $(content).html(self.contentToHtml($content));
                $(weight).html($weight);
                $(completness).addClass($complete ? 'complete' : 'incomplete');
                $(completness).removeClass($complete ? 'incomplete' : 'complete');
            }
        };

    })();

    this.item.bind({
        remove: function () {
            self.ui.destroy();
        }
    });

}
OptionPanel.prototype.view = function () {
    return this.ui.view();
};
OptionPanel.prototype.delete = function () {
    this.item.delete();
    this.parent.remove(this.item);
};
OptionPanel.prototype.isUniqueContent = function () {
    //!Inherited
    //return this.language.isUnique(content.trim(), this.id);
};
OptionPanel.prototype.update = function (content, weight, complete) {
    this.ui.update(content, weight, complete);
};
OptionPanel.prototype.toHtml = function () {
    var content = this.item.name;
    var weight = this.item.weight;

    var html = '<div class="button delete" title="Delete this option"></div>';
    html += '<div class="button edit" title="Edit this option"></div>';
    html += '<div class="content" data-value="' + content + '">';
    html += this.contentToHtml(content);
    html += '</div>';
    html += '<div class="weight" data-value="' + weight + '">' + weight + '</div>';

    return html;

};
OptionPanel.prototype.contentToHtml = function () {
    var content = this.item.name;
    var replaced = content.replace(/\[/g, '|$').replace(/\]/g, '|');
    var parts = replaced.split("|");

    var result = '';
    for (var part = 0; part < parts.length; part++) {
        var s = parts[part];
        if (s.length > 0) {
            result += '<span class="';
            result += (my.text.startsWith(s, '$') ? 'complex' : 'plain');
            result += '">';
            result += s.replace("$", "");
            result += '</span>';
        }
    }

    return result;
};




function WeightPanel(line, object, properties) {
    this.WeightPanel = true;
    var self = this;
    this.maxWeight = 10;
    this.line = line;
    this.object = object || this.line.object;

    this.ui = (function () {
        var container = jQuery('<div/>').css({
            'display': 'table-cell',
            'position': 'relative',
            'height': '100%',
            'float': 'left',
            '-moz-box-sizing': 'border-box',
            '-webkit-box-sizing': 'border-box',
            'box-sizing': 'border-box',
            'width': '210px',
            'margin': '0 18px'
        });

        if (properties && properties.css) {
            $(container).css(properties.css);
        }

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
                activate: function (value) {
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
            refresh: function (value) {
                refresh(value);
            },
            view: function () {
                return container;
            }
        };

    })();

    this.object.bind({
        changeWeight: function (e) {
            self.ui.refresh(e.weight);
        }
    });

}
WeightPanel.prototype.appendTo = function (parent) {
    $(this.ui.view()).appendTo($(parent));
};
WeightPanel.prototype.view = function(){
    return this.ui.view();
};


function CategoryPanel(line, object) {
    var self = this;
    this.CategoryPanel = true;
    this.line = line;
    this.object = object || line.object;
    this.categories = object.categories;

    this.ui = (function () {

        var container = jQuery('<span/>',{
            'class': 'block'
        });

        // ReSharper disable once UnusedLocals
        var editButton = jQuery('<input/>', {
            'id': 'select-categories',
            'class': 'select-categories-button',
            'type': 'submit',
            'value': '...'
        }).css({
            'float': 'right'
        }).on({
            'click': function () {
                self.selectCategories();
            }
        }).appendTo($(container));

        var value = jQuery('<span/>', {
            'class': 'selected-categories block'
        }).css({
            
        }).appendTo($(container));


        return {
            refresh: function() {
                $(value).html(my.categories.toString(self.categories));
            },
            view: function() {
                return container;
            }
        };

    })();

    this.object.bind({
        changeCategories: function (e) {
            self.categories = e.categories;
            self.refresh();
        }
    });

    this.refresh();

}
CategoryPanel.prototype.selectCategories = function () {
    var self = this;
    var tree = new Tree({
        'mode': MODE.MULTI,
        'root': my.categories.getRoot(),
        'selected': self.categories,
        'blockOtherElements': true,
        'showSelection': true,
        'hidden': true
    });

    tree.reset({ unselect: false, collapse: false });
    tree.eventHandler.bind({
        confirm: function (e) {
            var categories = my.categories.getCategories(e.item);
            self.object.setCategories(categories);
            tree.destroy();
        },
        add: function (e) {
            my.categories.addNew(e);
        },
        remove: function (e) {
            my.categories.remove(e);
        },
        rename: function (e) {
            my.categories.updateName(e);
        },
        transfer: function (e) {
            my.categories.updateParent(e);
        }
    });
    tree.show();
};
CategoryPanel.prototype.refresh = function () {
    this.ui.refresh();
};
CategoryPanel.prototype.view = function () {
    return this.ui.view();
};

function WordtypePanel(line, object) {
    var self = this;
    this.WordtypePanel = true;
    this.line = line;
    this.object = object || line.object;
    this.value = this.object.wordtype;

    this.ui = (function () {
        var container = jQuery('<div/>', {
            'class': 'wordtype-dropdown-container'
        });

        var dropdown = new DropDown({            
            container: container,
            data: WORDTYPE.getValues(),
            slots: 4,
            caseSensitive: false,
            confirmWithFirstClick: true
        });

        if (self.value) {
            dropdown.trigger({
                type: 'select',
                object: self.value
            });
        }

        dropdown.bind({
            select: function (e) {
                self.object.setWordtype({
                    wordtype: e.object,
                    line: self.line
                });
            },
            change: function (e) {
                if (!e.value) {
                    self.object.setWordtype({
                        wordtype: null,
                        line: self.line
                    });
                }
            }
        });


        return {
            view: function() {
                return container;
            }
        };

    })();

}
WordtypePanel.prototype.view = function () {
    return this.ui.view();
};
WordtypePanel.prototype.injectEditLine = function (editLine) {
    this.line = editLine;
    this.line.value = this.value;
};




function EditOptionPanel(object, editObject, properties) {
    this.EditOptionPanel = true;
    var self = this;
    this.object = object;
    this.editObject = editObject;
    this.line = properties.line;
    this.languagePanel = (this.line ? this.line.parent : properties.languagePanel);

    this.validator = (function () {
        var invalid = new HashTable(null);

        return {
            validation: function (e) {
                if (e.status) {
                    invalid.removeItem(e.id);
                } else {
                    invalid.setItem(e.id, e.id);
                }

                self.editObject.trigger({
                    type: 'validation',
                    status: invalid.size() === 0
                });

            }
        };

    })();

    this.ui = (function () {
        var background = jQuery('<div/>', {
            'class': 'edit-background',
            'z-index': my.ui.addTopLayer()
        }).appendTo($(document.body));

        var frame = jQuery('<div/>', {
            'class': 'edit-frame'
        }).appendTo($(background));

        var container = jQuery('<div/>', {
            'class': 'edit-container'
        }).appendTo($(frame));

        // ReSharper disable once UnusedLocals
        var close = jQuery('<div/>', {
            'class': 'edit-close'
        }).bind({
            'click': function () {
                self.cancel();
            }
        }).appendTo($(frame));

        return {
            display: function() {
                $(background).css({
                    'visibility': 'visible',
                    'z-index': my.ui.addTopLayer()
                });
            },
            hide: function() {
                $(background).css({
                    'visibility': 'hidden'
                });
            },
            destroy: function() {
                $(background).remove();
            },
            append: function(element) {
                $(element).appendTo($(container));
            }
        };

    })();

    this.meta = (function () {
        var controls = new HashTable(null);

        var container = jQuery('<div/>', {
            id: 'meta-container'
        });
        self.ui.append($(container));

        return {
            addLine: function (line) {
                controls.setItem(line.property, line);
                line.appendTo(container);
            },
            getLine: function (key) {
                return controls.getItem(key);
            },
            focus: function () {
                var nameLine = controls.getItem('name');
                if (nameLine) nameLine.focus();
            }
        };

    })();

    this.properties = this.editObject.createPropertyManager();
    this.ui.append(this.properties.view());

    this.details = this.editObject.createDetailsManager({ propertiesManager: self.properties });
    this.ui.append(this.details.view());

    this.buttons = (function () {
        var panel = jQuery('<div/>', {
            'class': 'edit-buttons-panel'
        });

        var container = jQuery('<div/>', {
            'class': 'edit-buttons-container'
        }).appendTo($(panel));

        var ok = jQuery('<input/>', {
            'class': 'edit-button',
            'type': 'submit',
            'value': 'OK'
        }).bind({
            'click': function () {
                self.confirm();
            }
        }).appendTo($(container));

        // ReSharper disable once UnusedLocals
        var cancel = jQuery('<input/>', {
            'class': 'edit-button',
            'type': 'submit',
            'value': 'Cancel'
        }).bind({
            'click': function () {
                self.cancel();
            }
        }).appendTo($(container));

        self.ui.append(panel);

        self.editObject.bind({
            validation: function (e) {
                if (e.status) {
                    $(ok).removeAttr('disabled');
                } else {
                    $(ok).attr('disabled', 'disabled');
                }
            }
        });

    })();

    this.generalRender();
    this.meta.focus();

    //Rendering//
    //this.loadProperties();

    this.object.bind({
        update: function (e) {
            self.line.update(e.name, e.weight, e.complete);
        },
        add: function (e) {
            self.languagePanel.add(e.item);
        }
    });

}
EditOptionPanel.prototype.display = function () {
    this.ui.display();
};
EditOptionPanel.prototype.cancel = function () {
    this.ui.destroy();
};
EditOptionPanel.prototype.confirm = function () {
    this.object.update(this.editObject, this.properties, this.details, this.isComplete());
    this.ui.destroy();
};
EditOptionPanel.prototype.isComplete = function () {
    var forms = this.details.forms;
    var complete = true;
    forms.each(function (key, value) {
        if (complete && value.active && !value.header && !value.value) {
            complete = false;
        }
    });
    return complete;
};
EditOptionPanel.prototype.start = function () {
    this.display();
};
EditOptionPanel.prototype.generalRender = function () {

    var self = this;

    //[Name]
    this.meta.addLine(new EditDataLine(this, {
        property: 'name', label: 'Name', object: self.editObject, value: self.editObject.name,
        callback: function (value) {
            self.editObject.name = value;
        },
        controlBinding: {
            blur: function (e) {
                var value = e.target.value;
                if (self.details.loadSearchPanel) self.details.loadSearchPanel(value);
            }
        },
        validation: function (params) {
            return self.object.checkName(params.value);
        },
        editable: true, focus: true
    }));

    //[Weight]
    var weightPanel = new WeightPanel(this, self.editObject, {
        css: { 'margin': '9px 0', 'height': '16px' }
    });
    this.meta.addLine(new EditDataLine(this, {
        property: 'weight', label: 'Weight', object: self.editObject, value: self.editObject.weight,
        panel: weightPanel.view()
    }));

};

function WordOptionEditPanel(object, editObject, line) {
    EditOptionPanel.call(this, object, editObject, line);
    this.WordOptionEditPanel = true;
}
extend(EditOptionPanel, WordOptionEditPanel);



function QuestionOptionEditPanel(object, editObject, line) {
    EditOptionPanel.call(this, object, editObject, line);
    this.QuestionOptionEditPanel = true;
}
extend(EditOptionPanel, QuestionOptionEditPanel);
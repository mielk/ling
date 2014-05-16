﻿//Generic class.
function ListManager(properties) {
    this.ListManager = true;
    var self = this;
    this.eventHandler = mielk.eventHandler();

    //this.filterManager = new ListFilterManager(this, properties.filters);

    this.itemsManager = new ListItemsManager(this);

    this.pagerManager = new ListPager(this, properties);

    this.view = new ListView(this, properties);
    this.view.render({
        columns: properties.columns,
        //filter: self.filterManager.view(),
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
    this.filter({page: 1, pageSize: 10 });
};
ListManager.prototype.filter = function (e) {
    //this.filterManager.filter(e);
};
ListManager.prototype.moveToPage = function (page) {
    this.filter({page: page });
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
mielk.objects.extend(ListManager, WordListManager);
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
mielk.objects.extend(ListManager, QuestionListManager);
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
    var headerContainer = jQuery('<div/>', {'class': 'item header' }).appendTo($(this.container));
    for (var i = 0; i < columns.length; i++) {
        var name = columns[i];
        jQuery('<div/>', {'class': name, html: name }).appendTo($(headerContainer));
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
    }).appendTo(jQuery('<div/>', {'id': 'add-button-container' }).appendTo($(this.container)));
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
        weight: {from: 0, to: 0 }
    };

}
mielk.objects.extend(ListManagerPanel, ListFilterManager);
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
        var first = element('first', 'First', function () {self.controller.moveToPage(1); });
        var previous = element('previous', 'Previous', function () {self.controller.moveToPage(self.page - 1); });
        var current = element('current', '', function () {});
        var next = element('next', 'Next', function () {self.controller.moveToPage(self.page + 1); });
        var last = element('last', 'Last', function () {self.controller.moveToPage(self.totalPages); });
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
mielk.objects.extend(ListManagerPanel, ListPager);
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
mielk.objects.extend(ListItem, WordListItem);


function QuestionListItem(manager, properties) {
    ListItem.call(this, manager, properties);
    this.QuestionListItem = true;
    var self = this;
    this.name = 'question';
    this.view = new QuestionListItemView(self.manager, self, {className: this.name });
}
mielk.objects.extend(ListItem, QuestionListItem);



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
    
    this.id = jQuery('<div/>', {'class': 'id', html: self.object.id }).appendTo($(this.container));
    this.name = jQuery('<div/>', {'class': 'name', html: self.object.name }).appendTo($(this.container));
    this.addWeigthPanel();
    
    this.categories = jQuery('<div/>', {'class': 'categories', html: my.categories.toString(self.object.categories) }).appendTo($(this.container));

    this.details = jQuery('<div/>', {
        'class': 'list-item-details',
        'id': 'details_' + self.object.id
    }).appendTo(this.container);

    this.edit = jQuery('<div/>', {'class': 'edit-item' }).
        bind({click: function () {self.object.edit(); } }).
        appendTo($(this.container));

    this.deactivate = jQuery('<a/>', {html: self.object.isActive ? 'Deactivate' : 'Activate' }).
        bind({click: function () {self.object.activate(); } }).
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
    this.type = jQuery('<div/>', {'class': 'type', html: self.object.wordtype.symbol }).appendTo($(this.container));
    $(this.categories).before(this.type);

    this.object.bind({
        changeWordtype: function (e) {
            self.type.html(e.wordtype.symbol);
        }
    });

}
mielk.objects.extend(ListItemView, WordListItemView);
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
mielk.objects.extend(ListItemView, QuestionListItemView);
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

    this.eventHandler = mielk.eventHandler();

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



function Metaword(properties) {
    Entity.call(this, properties);
    this.Metaword = true;
    this.service = my.words;
    this.wordtype = WORDTYPE.getItem(properties.Type);
}
mielk.objects.extend(Entity, Metaword);
Metaword.prototype.editItem = function () {
    var self = this;
    return new WordEditEntity({
        object: self,
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
Metaword.prototype.removedLogs = function (logs) {
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
Metaword.prototype.editedLogs = function (logs) {
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
Metaword.prototype.addedLogs = function (logs) {
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
Metaword.prototype.propertiesLogs = function (logs) {
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
Metaword.prototype.detailsLogs = function (logs) {
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






function Question(properties) {
    Entity.call(this, properties);
    this.Question = true;
    this.service = my.questions;
}
mielk.objects.extend(Entity, Question);
Question.prototype.editItem = function () {
    var self = this;
    return new QuestionEditEntity({
        object: self,
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
    //removed sets
    //added sets
    var editedSets = this.editedSetsLogs(params.logs);
    var properties = this.editedPropertiesLogs(params.logs);
    var dependencies = this.dependenciesLogs(params.logs);
    var connections = this.connectionsLogs(params.logs);
    var limits = this.limitsLogs(params.logs);
    var editedVariants = this.editedVariantsLogs(params.logs);
    var addedVariants = this.addedVariantsLogs(params.logs);
    //removed options
    

    //Check if there are any changes.
    if (name || weight || (categories && categories.length) || (editedSets && editedSets.length) ||
        (dependencies && dependencies.length) || (connections && connections.length) ||
        (properties && properties.length) || (limits && limits.length) ||
        (addedVariants && addedVariants.length) || (editedVariants && editedVariants.length)) {

        this.service.update({
            question: self,
            name: name,
            weight: weight,
            editedSets: editedSets,
            dependencies: dependencies,
            connections: connections,
            categories: my.categories.toIntArray(categories),
            addedVariants: addedVariants,
            editedVariants: editedVariants,
            properties: properties,
            limits: limits,
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
Question.prototype.dependenciesLogs = function (logs) {
    var removeTag = 'dependencyRemoved';
    var addTag = 'dependencyAdded';

    var results = [];

    for (var i = 0; i < logs.length; i++) {
        var log = logs[i];
        if (log.event === removeTag) {
            var $log = 0 + '|' + log.masterId + '|' + log.slaveId;
            results.push($log);
        } else if (log.event === addTag) {
            $log = 1 + '|' + log.masterId + '|' + log.slaveId;
            results.push($log);
        }
    }

    return results;

};

Question.prototype.editedSetsLogs = function (logs) {
    var tag = 'editVariantSet';
    var results = [];

    for (var i = 0; i < logs.length; i++) {
        var log = logs[i];
        if (log.event === tag) {
            var $log = log.set + '|' + log.tag + '|' + log.wordtype;
            results.push($log);
        }
    }

    return results;

};

Question.prototype.editedPropertiesLogs = function (logs) {
    var removeTag = 'removeVariantProperty';
    var editTag = 'editVariantProperty';

    var results = [];

    for (var i = 0; i < logs.length; i++) {
        var log = logs[i];
        if (log.event === removeTag || log.event === editTag) {
            var $log = (log.event === removeTag ? -1 : 1) + '|' + log.setId + '|' + log.property + '|' + (log.value ? log.value : 0);
            results.push($log);
        }
    }

    return results;

};

Question.prototype.connectionsLogs = function (logs) {
    var removeTag = 'removeConnection';
    var addTag = 'addConnection';

    var results = [];
    var map = new HashTable(null);

    for (var i = 0; i < logs.length; i++) {
        var log = logs[i];
        if (log.event === removeTag) {
            var $log = 0 + '|' + log.parent.id + '|' + log.connected.id;
            var $oppositeLog = 0 + '|' + log.connected.id + '|' + log.parent.id;
            
            //Avoiding duplicated pairs.
            if (!map.hasItem($log) && !map.hasItem($oppositeLog)) {
                map.setItem($log, $log);
                map.setItem($oppositeLog, $oppositeLog);
                results.push($log);
            }

        } else if (log.event === addTag) {
            $log = 1 + '|' + log.parent.id + '|' + log.connected.id;
            $oppositeLog = 1 + '|' + log.connected.id + '|' + log.parent.id;
            
            //Avoiding duplicated pairs.
            if (!map.hasItem($log) && !map.hasItem($oppositeLog)) {
                map.setItem($log, $log);
                map.setItem($oppositeLog, $oppositeLog);
                results.push($log);
            }

        }
    }

    return results;

};

Question.prototype.editedVariantsLogs = function(logs) {
    var tag = 'editVariant';
    var results = [];

    //for (var i = 0; i < logs.length; i++) {
    //    var log = logs[i];
    //    if (log.event === tag && !log.variant.isNew) {
    //        var variant = log.variant;
    //        var $log = log.setId + '|' + variant.id + '|' + variant.content + '|' + (variant.wordId ? variant.wordId : 0) + '|' + (variant.anchored ? 1 : 0);
    //        results.push($log);
    //    }
    //}
    
    //return results;

};
Question.prototype.addedVariantsLogs = function(logs) {
    var tag = 'addVariant';
    var results = [];
    
    //for (var i = 0; i < logs.length; i++) {
    //    var log = logs[i];
    //    if (log.event === tag) {
    //        var variant = log.variant;
    //        var $log = log.setId + '|' + variant.key + '|' + variant.content + '|' + (variant.wordId ? variant.wordId : 0) + '|' + (variant.anchored ? 1 : 0);
    //        results.push($log);
    //    }
    //}
    
    return results;

};
Question.prototype.limitsLogs = function(logs) {
    var removeTag = 'removeLimit';
    var addTag = 'addLimit';
    var results = [];
    var map = new HashTable(null);
    
    for (var i = 0; i < logs.length; i++) {
        var log = logs[i];
        if (log.event === removeTag || log.event === addTag) {
            if (my.values.isNumber(log.variantId) && my.values.isNumber(log.excludedId)) {
                var $log = (log.event === removeTag ? -1 : 1) + '|' + log.question + '|' + log.variantId + '|' + log.excludedId;
                var $oppositeLog = (log.event === removeTag ? -1 : 1) + '|' + log.question + '|' + log.excludedId + '|' + log.variantId;
                
                if (!map.hasItem($log) && !map.hasItem($oppositeLog)) {
                    map.setItem($log, $log);
                    map.setItem($oppositeLog, $oppositeLog);
                    results.push($log);
                }
            }
        }
    }

    return results;

};







function EditEntity(properties) {
    this.EditEntity = true;
    this.object = properties.object;
    this.id = properties.id;
    this.name = properties.name;
    this.weight = properties.weight;
    this.isActive = properties.isActive;
    this.categories = properties.categories;

    //Logic.
    this.eventHandler = mielk.eventHandler();
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
EditEntity.prototype.getLanguage = function(id) {
    if (!this.languages) return null;
    return this.languages.getItem(id);
};


function WordEditEntity(properties) {
    EditEntity.call(this, properties);
    this.WordEditEntity = true;
    this.wordtype = properties.wordtype;
}
mielk.objects.extend(EditEntity, WordEditEntity);
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
mielk.objects.extend(EditEntity, QuestionEditEntity);
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
    this.variantsSets = new HashTable(null);
    
    var variantsSets = my.questions.getVariantSets(this.id, this.getLanguagesIds());
    for (var i = 0; i < variantsSets.length; i++) {
        var object = variantsSets[i];
        var variantSet = new VariantSet(this, object);
        this.variantsSets.setItem(variantSet.id, variantSet);
        //Add to proper language.
        var languageId = variantSet.getLanguageId();
        var language = this.languages.getItem(languageId);
        variantSet.language = language;
        language.addVariantSet(variantSet);
    }

    this.variantsSets.each(function (key, value) {
        value.createDetails();
    });

    //Loading limits must be invoked after variants have been loaded.
    this.variantsSets.each(function(key, value) {
        value.loadLimits();
    });

};
QuestionEditEntity.prototype.newItem = function (languageId) {
    return new Option(this, {
        LanguageId: languageId,
        'new': true
    });
};
QuestionEditEntity.prototype.getVariantSet = function(key) {
    return this.variantsSets.getItem(key);
};
QuestionEditEntity.prototype.editVariants = function () {
    var self = this;
    var variantPanel = new VariantPanel({
        question: self.object,
        editQuestion: self
    });
    variantPanel.display();
};




function LanguageEntity(parent, language) {
    this.LanguageEntity = true;
    this.parent = parent;
    this.language = language;
    this.events = mielk.eventHandler();
    this.items = [];
    this.variantSets = [];
    this.variants = new HashTable(null);
    this.dependencies = new HashTable(null);
}
LanguageEntity.prototype.trigger = function (e) {
    this.events.trigger(e);
};
LanguageEntity.prototype.bind = function (e) {
    this.events.bind(e);
};
LanguageEntity.prototype.addItem = function (option) {
    this.items.push(option);
    option.injectLanguageEntity(this);
};
LanguageEntity.prototype.addVariantSet = function (variantSet) {
    var self = this;
    self.variantSets.push(variantSet);
    variantSet.bind({
        changeWordtype: function (e) {
            self.trigger({
                type: 'changeWordtype',
                set: variantSet,
                wordtype: e.wordtype
            });
        }
    });
};
LanguageEntity.prototype.addVariant = function(variant) {
    this.variants.setItem(variant.id, variant);
};
LanguageEntity.prototype.getVariant = function(key) {
    return this.variants.getItem(key);
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
LanguageEntity.prototype.addDependencyDefinition = function (definition) {
    var slave = definition.slave;
    var master = definition.master;
    var dependencyGroup = this.dependencies.getItem(slave);
    if (!dependencyGroup) {
        dependencyGroup = [];
        this.dependencies.setItem(slave, dependencyGroup);
    }
    dependencyGroup.push(master);
};
LanguageEntity.prototype.getMasters = function (wordtypeId) {
    return this.dependencies.getItem(wordtypeId);
};
LanguageEntity.prototype.isDependable = function(wordtypeId) {
    var masters = this.getMasters(wordtypeId);
    return (masters && masters.length > 0 ? true : false);
};



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
        callback: function (value) {self.editObject.id = value; },
        inputCss: {'width': '60px', 'text-align': 'center', 'border': '1px solid #777', 'background-color': 'white' } 
    }));

    //[Name]
    this.meta.addLine(new EditDataLine(this, {
        property: 'name', label: 'Name', value: self.editObject.name,
        callback: function (value) {self.editObject.name = value; },
        validation: function (params) {
            return self.object.checkName(params.value);
        },
        editable: true
    }));
    
    //[Weight]
    var weightPanel = new WeightPanel(this, self.editObject, {
        css: {'margin': '9px 0', 'height': '16px' }
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
mielk.objects.extend(EditPanel, WordEditPanel);
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
mielk.objects.extend(EditPanel, QuestionEditPanel);
QuestionEditPanel.prototype.render = function () {
    //[Button for running variant panel]
    var variantButtonsPanel = new VariantButtonsPanel(this, self.editObject);
    var variantLine = new EditDataLine(this, {
        property: 'editVariants', label: '', 
        panel: variantButtonsPanel.view(), editable: true
    });
    this.meta.addLine(variantLine);
};
QuestionEditPanel.prototype.editVariants = function () {
    this.editObject.editVariants();
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
            var error = jQuery('<div/>', {'class': 'error_content' }).appendTo(errorContainer);
            var errorIcon = jQuery('<span/>', {'class': 'icon' }).appendTo($(container));
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
                $(errorContainer).css({'display': 'none' });
                $(errorIcon).removeClass('iconInvalid').addClass('iconValid');
            } else {
                $(valuePanel).removeClass('valid').addClass('invalid');
                $(errorContainer).css({'display': 'table' });
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
            'class': 'flag ' + self.language.flag
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
    item.edit({languagePanel: this });
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

        var container = jQuery('<div/>', {'class': 'option' });
        
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
                self.item.edit({line: self });
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

    tree.reset({unselect: false, collapse: false });
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
            slots: 5,
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


function VariantButtonsPanel(object) {
    var self = this;
    self.VariantButtonsPanel = true;
    self.object = object;

    self.ui = (function () {
        var container = jQuery('<div/>', {
            'class': 'variant-button-edit-container'
        });

        var button = jQuery('<input/>', {
            'class': 'variant-button-edit',
            'type': 'submit',
            'value': 'Edit variants'
        }).appendTo(container);

        button.bind({
            click: function () {
                self.object.editVariants();
            }
        });


        return {
            view: function () {
                return container;
            }
        };

    })();

}
VariantButtonsPanel.prototype.view = function () {
    return this.ui.view();
};
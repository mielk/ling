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
ListManager.prototype.createNewItem = function () {
    var item = this.emptyItem();
    item.edit();
};
ListManager.prototype.emptyItem = function () {
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
        Categories: (filters.categories && filters.categories.length === 1 ? filters.categories : [])
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
    return new QuestionListItem(object);
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
        Categories: (filters.categories && filters.categories.length === 1 ? filters.categories : [])
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
        object.injectListItem(item);
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
    if (!this.object.isActive) $(this.container).addClass('inactive');
    
    this.id = jQuery('<div/>', { 'class': 'id', html: self.object.id }).appendTo($(this.container));
    this.name = jQuery('<div/>', { 'class': 'name', html: self.object.name }).appendTo($(this.container));
    this.addWeigthPanel();
    
    this.categories = jQuery('<div/>', { 'class': 'categories', html: my.categories.toString(self.object.categories) }).appendTo($(this.container));

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


function WordListItemView(item) {
    ListItemView.call(this, item);
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


function QuestionListItemView(item) {
    ListItemView.call(this, item);
    this.QuestionListItemView = true;
}
extend(ListItemView, QuestionListItemView);


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

    this.eventHandler = new EventHandler();
    //Words

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

        if (object.Category) {
            array.push(object);
        } else if (object.Id) {
            var id = categories[i].Id;
            var category = my.categories.getCategory(id);
            array.push(category);
        } else if ($.isNumeric(object)) {
            var category = my.categories.getCategory(object);
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
    var result = this.service.updateWeight({
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
Entity.prototype.update = function (properties) {
    alert('Must by defined by implementing class');
};
Entity.prototype.injectListItem = function (item) {
    this.listItem = item;
};
Entity.prototype.edit = function () {
    var editPanel = this.editPanel();
    editPanel.display();
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
Metaword.prototype.update = function (properties) {
    if (!properties.WordEditEntity) {
        alert('Illegal argument passed to function Metaword.update');
        return;
    }

    var self = this;
    var name = (this.name === properties.name ? '' : properties.name);
    var weight = (this.weight === properties.weight ? 0 : properties.weight);
    var categories = (my.array.equal(properties.categories, this.categories) ? [] : properties.categories);
    var wordtype = (this.wordtype === properties.wordtype ? 0 : properties.wordtype.id);

    //Check if there are any changes.
    if (name || weight || (categories && categories.length) || wordtype){
        var result = this.service.update({
            word: self,
            name: name,
            weight: weight,
            wordtype: wordtype,
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
                        self.wordtype = properties.wordtype;
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
    }
    
};
Metaword.prototype.checkWordtype = function (wordtype) {
    if (!wordtype || !wordtype.id) {
        return MessageBundle.get(dict.WordtypeCannotBeEmpty);
    } else {
        return true;
    }
};
Metaword.prototype.editPanel = function () {
    return new WordEditPanel(this);
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
Question.prototype.update = function (properties) {
    if (!properties.QuestionEditEntity) {
        alert('Illegal argument passed to function Metaword.update');
        return;
    }

    var self = this;
    var name = (this.name === properties.name ? '' : properties.name);
    var weight = (this.weight === properties.weight ? 0 : properties.weight);
    var categories = (my.array.equal(properties.categories, this.categories) ? [] : properties.categories);

    //Check if there are any changes.
    if (name || weight || (categories && categories.length)) {
        var result = this.service.update({
            question: self,
            name: name,
            weight: weight,
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
Question.prototype.editPanel = function () {
    return new QuestionEditPanel(this);
};



function EditEntity(properties) {
    this.EditEntity = true;
    this.id = properties.id;
    this.name = properties.name;
    this.weight = properties.weight;
    this.isActive = properties.isActive;
    this.categories = properties.categories;
    this.eventHandler = new EventHandler();
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
EditEntity.prototype.setCategories = function (categories) {
    this.categories = categories;
    this.trigger({
        type: 'changeCategories',
        categories: categories
    });
}

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

function QuestionEditEntity(properties) {
    EditEntity.call(this, properties);
    this.QuestionEditEntity = true;
}
extend(EditEntity, QuestionEditEntity);


/*
 * Class:           EditPanel
 * Description:     Responsible for displaying properties of the 
 *                  given object in a separate modal window.
 * Parameters:      
 *  ListItem item   List item that the object edited is assigned to.
 */
function EditPanel(object) {
    this.EditPanel = true;
    var self = this;
    this.object = object;
    this.line = this.object.line;
    this.editObject = this.object.editItem();

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

        var close = jQuery('<div/>', {
            'class': 'edit-close'
        }).bind({
            'click': function () {
                self.cancel();
            }
        }).appendTo($(frame));

        return {
            display: function () {
                $(background).css({
                    'visibility': 'visible',
                    'z-index': my.ui.addTopLayer()
                });
            },
            hide: function () {
                $(background).css({
                    'visibility': 'hidden'
                });
            },
            destroy: function () {
                $(background).remove();
            },
            append: function (element) {
                $(element).appendTo($(container));
            }
        }

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
        var container = jQuery('<div/>', {
            id: 'languages-container'
        });
        self.ui.append($(container));

        return {
            append: function (element) {
                $(element).appendTo($(container));
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

function WordEditPanel(line) {
    EditPanel.call(this, line);
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


function QuestionEditPanel(line) {
    EditPanel.call(this, line);
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
    this.object = panel.editObject;
    this.property = properties.property;
    this.linked = new HashTable(null);
    this.validation = properties.validation;
    this.callback = properties.callback;

    this.ui = (function () {
        var timer;
        var panel;

        var container = jQuery('<div/>', {
            'class': 'field-line'
        });

        var label = jQuery('<label/>', {
            'class': 'label',
            html: properties.label
        }).appendTo(jQuery('<span/>').css({
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
            panel = $(properties.panel);
            $(panel).appendTo($(container));
        } else if (properties.editable) {
            panel = jQuery('<input/>', {
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

            $(panel).val(properties.value);

            //Append panel to span to center it vertically.
            var span = jQuery('<span/>').
            bind({
                'click': function () {
                    $(panel).focus();
                }
            }).appendTo($(container));

            panel.appendTo($(span));

        } else {
            panel = jQuery('<label/>', {
                'class': 'value',
                html: properties.value
            }).appendTo($(container));
        }

        if (properties.inputCss) {
            $(panel).css(properties.inputCss);
        }

        function format(value) {
            if (value === true) {
                $(panel).removeClass('invalid').addClass('valid');
                $(errorContainer).css({ 'display': 'none' });
                $(errorIcon).removeClass('iconInvalid').addClass('iconValid');
            } else {
                $(panel).removeClass('valid').addClass('invalid');
                $(errorContainer).css({ 'display': 'table' });
                $(errorIcon).removeClass('iconValid').addClass('iconInvalid');
                $(error).text(value);
            }
        }


        return {
            focus: function () {
                $(panel).focus();
            },
            value: function(){
                return $(panel).val();
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
            '-moz-box-sizing': 'box-border',
            '-webkit-box-sizing': 'box-border',
            'box-sizing': 'box-border',
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


function CategoryPanel(line, object, properties) {
    var self = this;
    this.CategoryPanel = true;
    this.line = line;
    this.object = object || line.object;
    this.categories = object.categories;

    this.ui = (function () {

        var container = jQuery('<span/>');

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
            'class': 'selected-categories'
        }).css({
            
        }).appendTo($(container));


        return {
            refresh: function () {
                $(value).html(my.categories.toString(self.categories));
            },
            view: function () {
                return container;
            }
        }

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

function WordtypePanel(line, object, properties) {
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
            view: function () {
                return container;
            }
        }

    })();

}
WordtypePanel.prototype.view = function () {
    return this.ui.view();
};
WordtypePanel.prototype.injectEditLine = function (editLine) {
    this.line = editLine;
    this.line.value = this.value;
};
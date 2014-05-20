
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
mielk.objects.extend(OptionEntity, Word);
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
                    value: property.value
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
                id: object.id,
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
    }
};
Word.prototype.getPropertiesFromRepository = function (wordId) {
    return my.db.fetch('Words', 'GetPropertyValues', { 'wordId': wordId });
};
Word.prototype.getPropertyValue = function(key){
    var property = this.properties.getItem(key);
    return property ? property.value : null;
};
Word.prototype.loadDetails = function () {
    this.details = new HashTable(null);
    var $values = this.getFormsFromRepository(this.id);
    for (var i = 0; i < $values.length; i++) {
        var set = $values[i];
        var form = {
            id: set.FormId,
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
mielk.objects.extend(OptionEntity, Option);
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
Option.prototype.updateDetails = function () {

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
mielk.objects.extend(OptionEditEntity, WordOptionEditEntity);
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
mielk.objects.extend(OptionEditEntity, QuestionOptionEditEntity);
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
            view: function () {
                return container;
            },
            hide: function () {
                $(container).css('display', 'none');
            },
            append: function (element) {
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
mielk.objects.extend(PropertyManager, WordPropertyManager);
WordPropertyManager.prototype.loadProperties = function () {
    var metaword = this.entity.parent;
    var languageId = this.entity.languageId;
    var wordtypeId = metaword.wordtype.id;

    var $properties = this.getPropertiesFromRepository(languageId, wordtypeId);
    for (var i = 0; i < $properties.length; i++) {
        var $property = $properties[i];
        $property.Value = this.entity.getPropertyValue($property.Id);
        var property = new WordProperty($property);
        this.items.setItem(property.id, property);
        this.ui.append(property.view());
    }

};
WordPropertyManager.prototype.getPropertiesFromRepository = function (languageId, wordtypeId) {
    return my.db.fetch('Words', 'GetProperties', { 'languageId': languageId, 'wordtypeId': wordtypeId });
};
WordPropertyManager.prototype.loadValues = function () {
    var self = this;
    this.entity.properties.each(function (key, object) {
        var property = self.items.getItem(key);
        if (property) {
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


        var input = (function () {
            switch (params.Type) {
                case 2:
                    return my.ui.radio({
                        container: container,
                        name: self.name,
                        value: self.value,
                        options: self.parseToRadioOptions(params.Options)
                    });
                case 1:
                    return my.ui.checkbox({
                        container: container,
                        name: params.Name,
                        caption: params.Name,
                        checked: params.Default
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
            view: function () {
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
WordProperty.prototype.view = function () {
    return this.ui.view();
};
WordProperty.prototype.parseToRadioOptions = function (options) {
    var results = {};
    for (var i = 0; i < options.length; i++) {
        var option = options[i];
        var caption = option.Name;
        var key = option.Id;
        var checked = (this.value ? this.value === key : option.Default);

        var result = {
            key: key,
            value: key,
            caption: caption,
            checked: checked
        };

        results[key] = result;

    }

    return results;

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
    return (this.originalValue != this.value);
};
WordProperty.prototype.changeValue = function (value) {
    this.ui.change(value);
};



function QuestionPropertyManager(editObject) {
    PropertyManager.call(this, editObject);
    this.QuestionPropertyManager = true;
    this.ui.hide();
}
mielk.objects.extend(PropertyManager, QuestionPropertyManager);


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
            addGroup: function (view) {
                $(view).appendTo($(formsList));
            },
            searchPanel: function () {
                return searchPanel;
            }
        };

    })();

    this.renderSearchPanel(object.name);
    this.loadForms();
    this.loadValues();
    this.render();

}
mielk.objects.extend(DetailsManager, GrammarManager);
GrammarManager.prototype.renderSearchPanel = function (name) {
    var self = this;

    //Remove the previous dropdown if exists.
    var container = self.ui.searchPanel();
    $(container).empty();

    this.searchDropdown = new DropDown({
        container: self.ui.searchPanel(),
        placeholder: 'Select word to copy grammar forms',
        allowClear: true
    });

    this.searchDropdown.bind({
        change: function (e) {
            self.propertiesManager.copyDetails(e.item.key);
            self.copyDetails(e.item.name, e.item.key);
        }
    });

    if (name) {
        this.refreshSearchPanel(name);
    }

};
GrammarManager.prototype.refreshSearchPanel = function (name) {
    var self = this;

    var data = my.db.fetch('Words', 'GetSimilarWords', {
        'languageId': self.entity.languageId,
        'wordtype': self.entity.parent.wordtype ? self.entity.parent.wordtype.id : 0,
        'word': name || self.entity.name
    });

    //Convert to objects for dropdown (they must have [key] or [name] property).
    var result = [];
    for (var i = 0; i < data.length; i++) {
        var item = data[i];
        result.push({
            key: item.Id,
            name: item.Name
        });
    }

    self.searchDropdown.loadData(result);

};
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
GrammarManager.prototype.convertSimilarWords = function (words) {
    var data = [];
    for (var i = 0; i < words.length; i++) {
        var word = words[i];
        data.push({
            key: word.Id,
            name: word.Name,
            object: word
        });
    }

    return data;

};
GrammarManager.prototype.loadForms = function () {
    var metaword = this.entity.parent;
    var languageId = this.entity.languageId;
    var wordtypeId = metaword.wordtype.id;

    var $forms = this.getDefinitionsFromRepository(languageId, wordtypeId);
    for (var i = 0; i < $forms.length; i++) {
        // ReSharper disable once UnusedLocals
        var form = new GrammarForm(this, $forms[i]);
    }

};
GrammarManager.prototype.getDefinitionsFromRepository = function (languageId, wordtypeId) {
    return my.db.fetch('Words', 'GetGrammarDefinitions', { 'languageId': languageId, 'wordtypeId': wordtypeId });
};
GrammarManager.prototype.render = function () {
    var sorted = this.sorted();
    for (var i = 0; i < sorted.length; i++) {
        var group = sorted[i];
        group.render();
    }
};
GrammarManager.prototype.sorted = function () {
    var array = this.groups.values();
    array.sort(function (a, b) {
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
    this.forms.setItem(form.id, form);

};
GrammarManager.prototype.copyDetails = function (name, id) {
    var self = this;
    var matched = my.text.countMatchedEnd(this.editObject.name, name);
    var forms = this.entity.getFormsFromRepository(id);

    for (var i = 0; i < forms.length; i++) {
        var form = forms[i];
        var def = self.forms.getItem(form.FormId);
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
GrammarGroup.prototype.add = function (form) {
    this.forms.push(form);
};
GrammarGroup.prototype.sort = function () {
    this.forms.sort(function (a, b) {
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
mielk.objects.extend(DetailsManager, OptionManager);















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
                if (self.details.searchDropdown) {
                    self.details.refreshSearchPanel(value);
                }
                //if (self.details.loadSearchPanel) self.details.loadSearchPanel(value);
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
mielk.objects.extend(EditOptionPanel, WordOptionEditPanel);



function QuestionOptionEditPanel(object, editObject, line) {
    EditOptionPanel.call(this, object, editObject, line);
    this.QuestionOptionEditPanel = true;
}
mielk.objects.extend(EditOptionPanel, QuestionOptionEditPanel);
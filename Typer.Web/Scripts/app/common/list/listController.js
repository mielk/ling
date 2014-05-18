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
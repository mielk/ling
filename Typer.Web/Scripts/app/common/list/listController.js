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
WordEditEntity.prototype.newItem = function (languageId) {
    return new Word(this, {
        LanguageId: languageId,
        IsNew: true
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
        IsNew: true
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
    
    if (item.isNew) {
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
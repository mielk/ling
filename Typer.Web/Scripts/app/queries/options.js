




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






function QuestionPropertyManager(editObject) {
    window.PropertyManager.call(this, editObject);
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
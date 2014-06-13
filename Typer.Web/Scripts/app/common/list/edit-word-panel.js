﻿//Podklasa reprezentująca panel edycji dla subitemów.
//Dziedziczy po głównej klasie edycji.
function EditWordPanel(entity) {

    'use strict';

    var self = this;

    self.EditWordPanel = true;

    EditPanel.call(self, entity);

}
mielk.objects.extend(EditPanel, EditWordPanel);
mielk.objects.addProperties(EditWordPanel.prototype, {
      //[Override]
      initialize: function() {
        this.insertMetadata();
        this.insertProperties();
        this.insertDetails();
    }
    
    , insertProperties: function() {
        var self = this;

        //Tworzy kontener do przechowywania szczegółowych informacji.
        var container = jQuery('<div/>', {
            'class': 'subitem-properties-container'
        });

        //Iterate trough all properties and create a UI for each of them.
        self.editObject.properties.each(function(key, item) {
            var propertyContainer = jQuery('<div/>', { 'class': 'property-container' });
            var control = item.property.type.control({
                name: item.property.name,
                container: propertyContainer,
                value: item.value ? item.value.id : item.property.defaultValue,
                options: item.property.options
            });

            if (!control) return;

            //Attach events handlers to this control.
            var eventName = item.property.changeEventName();
            control.bind({
                click: function(e) {
                    item.value = e.object;
                    
                    self.editObject.trigger({
                        type: eventName,
                        property: item.property,
                        value: item.value,
                        propagate: false
                    });
                }
            });

            //Attach event of changing value.
            var events = {};
            events[eventName] = function (e) {
                if (e.propagate !== false) {
                    var value = e.value.property.isBoolean() ? e.value.value : e.value.id;
                    control.change(value);
                }
            };
            self.editObject.bind(events);

            $(control.view).appendTo(container);

        });

        self.ui.appendDetailsView(container);

    }

    //[Override]
    , insertDetails: function() {

        var grammarPanel = new GrammarPanel(this.editObject);
        this.ui.appendDetailsView(grammarPanel.view());

    }

});


function GrammarPanel(word) {

    'use strict';

    var self = this;

    //Class signature.
    self.GrammarPanel = true;

    //Instance properties.
    self.word = word;

    self.ui = (function () {

        var container;
        var searchPanel;
        var formsPanel;
        var headerColumn;
        var formsColumns;

        function createContainer() {
            container = jQuery('<div/>', {
                'class': 'option-details-container'
            });
        }

        function appendSearchPanel() {
            searchPanel = new GrammarSearchPanel(self.word, self, container);
            searchPanel.view().appendTo(container);
        }

        function appendFormsPanel() {
            formsPanel = jQuery('<div/>', {
                'class': 'grammar-forms-panel'
            }).appendTo(container);

            //Create header column.
            headerColumn = jQuery('<div/>', {
                'class': 'grammar-forms-header-column'
            }).appendTo(formsPanel);

            //Create values columns.
            formsColumns = jQuery('<div/>', {
                'class': 'grammar-forms-columns-container'
            }).appendTo(formsPanel);

        }

        function addHeaderCell(cell) {
            $(cell).appendTo(headerColumn);
        }

        function addFormGroup(group) {
            $(group).appendTo(formsColumns);
        }
        
        (function initialize() {
            createContainer();
            appendSearchPanel();
            appendFormsPanel();
        })();


        return {
              view: container
            , addHeaderCell: addHeaderCell
            , addFormGroup: addFormGroup
        };


    })();

    (function initialize() {
        self.renderItems();
    })();

}
GrammarPanel.prototype = {

      view: function () {
        return this.ui.view;
    }

    , renderItems: function () {
        var languageId = this.word.language.id;
        var wordtypeId = this.word.parent.wordtype.id;
        var formGroups = Ling.Grammar.getRequiredGrammarForms(languageId, wordtypeId);

        //Divide groups into header and other columns.
        var headers = [];
        var forms = [];

        mielk.arrays.each(formGroups, function (group) {
            if (group.isHeader) {
                headers.push(group);
            } else {
                forms.push(group);
            }
        });
        
        this.renderHeaderColumn(headers[0]);
        this.renderFormColumns(forms);

    }

    , renderHeaderColumn: function (header) {
        var self = this;

        //Add header cell.
        self.ui.addHeaderCell(this.createHeadCell());

        //Add other headers.
        header.forms.each(function (k, v) {
            self.ui.addHeaderCell(self.createHeadCell(v.displayed));
        });

    }

    , renderFormColumns: function (columns) {
        var self = this;
        var total = columns.length;

        mielk.arrays.each(columns, function (item) {
            var column = jQuery('<div/>', {
                'class': 'grammar-group'
            }).css({
                'width': (100 / total)  + '%'
            });

            self.ui.addFormGroup(column);

            //Add controls to this column.
            var header = self.createHeadCell(item.name);
            $(header).appendTo(column);

            item.forms.each(function (key, value) {
                var word = self.word;
                var form = self.word.getGrammarForm(value.id);
                var cell = new GrammarCell(word, form);
                //var cell = self.createCell(v);
                $(cell.view()).appendTo(column);
            });

        });

    }

    , createHeadCell: function (caption) {
        var cell = jQuery('<div/>', {
            'class': 'grammar-form-cell grammar-header'
            , html: caption ? caption : ''
        }).css({
            'visibility': caption ? 'visible': 'hidden'
        });

        return cell;

    }

};



function GrammarCell(word, form) {

    'use strict';

    var self = this;

    //Class signature.
    self.GrammarCell = true;

    //Instance properties.
    self.word = word;
    self.form = form;
    self.active = true;

    self.ui = (function () {

        var control = jQuery('<input/>', {
            'type': 'text',
            'class': 'grammar-form-cell'
        }).bind({
            change: function () {
                var value = $(this).val();
                self.setValue(value);
            }
        });
        
        function activate(value) {
            if (value) {
                control.removeAttr('disabled');
            } else {
                control.attr('disabled', 'disabled');
            }
        }

        function setInitialValue() {
            var content = self.word.getGrammarFormValue(self.form.id);
            $(control).val(content);
        }

        function setValue(value) {
            $(control).val(value);
        }
        
        (function initialize() {
            setInitialValue();
        })();
        

        return {
              view: control
            , activate: activate
            , setValue: setValue
        };

    })();


    self.events = (function () {
        //Dla celów wydajnościowych do ogólnej nazwy zdarzenia 
        //dołączany jest numer Id formy gramatycznej (tak, aby
        //przy każdej zmianie odpalany był tylko event dla tej
        //konkretnej formy.
        var eventName = 'changeGrammarForm_' + self.form.id;
        var events = {};
        events[eventName] = function (e) {
            self.ui.setValue(e.value);
        }

        self.word.bind(events);

    })();


    (function initialize() {
        self.setListeners();
        self.checkState();
    })();

}
GrammarCell.prototype = {

    view: function () {
        return this.ui.view;
    }

    , setValue: function (value) {
        this.word.changeGrammarForm(this.form.id, value);
    }

    , setListeners: function () {
        var self = this;
        this.form.inactiveRules.each(function (key, value) {
            var eventName = 'change' + mielk.text.toCamelCase(value.property.name);
            var eventsObject = {};
            eventsObject[eventName] = function () {
                self.checkState();
            };

            self.word.bind(eventsObject);

        });

    }
    
    , checkState: function() {
        var self = this;
        var active = true;
        this.form.inactiveRules.each(function (key, item) {

            //Nie ma sensu sprawdzać kolejnych właściwości,
            //jeżeli już z poprzednich wynikało, że item będzie nieaktywny.
            if (!active) return;

            var property = self.word.properties.getItem(item.property.id);
            if (property.value.id === item.value.id) {
                active = false;
            }

        });

        self.activate(active);

    }
    
    , activate: function (value) {
        this.active = value;
        this.ui.activate(value);
        this.word.activateGrammarForm(this.form.id, value);
    }

};



function GrammarSearchPanel(word, parentPanel){

    'use strict';

    var self = this;

    self.GrammarSearchPanel = true;
    
    self.parentPanel = parentPanel;
    self.word = word;

    self.ui = (function () {

        var container = jQuery('<div/>', {
            'class': 'grammar-search-panel'
        });

        var dropdown = new DropDown({
              container: container
            , caseSensitive: false
            , data: self.getSimilarWords(self.word.name)
            , confirmWithFirstClick: true
            , placeholder: 'Select similar word'
            , allowClear: true
        });


        dropdown.bind({
            change: function (e) {
                self.word.updateFromSimilar(e.item);
            }
        });

        function updateData(data) {
            dropdown.loadData(data, true);
        }

        return {
              view: container
            , updateData: updateData
        };

    })();

    self.events = (function () {

        self.word.bind({
            changeName: function (e) {
                self.update(e.value);
            }
        })

    })();

}
GrammarSearchPanel.prototype = {

    view: function () {
        return this.ui.view;
    },

    update: function (name) {
        var self = this;
        var data = self.getSimilarWords(name);
        self.ui.updateData(data);
    },

    getSimilarWords: function (name) {

        if (!name) return [];

        var self = this;
        var rawData = mielk.db.fetch('Words', 'GetSimilarWords', {
            'languageId': self.word.language.id,
            'wordtype': self.word.parent.wordtype ? self.word.parent.wordtype.id : 0,
            'word': name || self.word.name
        });
        var data = [];
        mielk.arrays.each(rawData, function (item) {
            data.push({
                id: item.Id
                , name: item.Name
                , key: item.Name
            });
        });

        return data;

    }

};


//function GrammarForm(manager, params) {

//    manager.addForm(this);

//    //Bind listeners.
//    if (this.inactiveRules) {
//        this.setListeners();
//    }

//}

//GrammarForm.prototype.view = function () {
//    var self = this;
//    if (!this.panel) {

//        if (this.header) {
//            this.panel = jQuery('<div/>', {
//                'class': 'grammar-form',
//                html: self.name
//            }).css({
//                'border': 'none',
//                'text-align': 'right'
//            });
//        } else {
//        }

//    }

//    return this.panel;

//};
//GrammarForm.prototype.setListeners = function () {
//    var self = this;
//    var rules = this.inactiveRules.split('|');
//    for (var i = 0; i < rules.length; i++) {
//        var rule = rules[i];
//        var key = Number(my.text.substring(rule, '', ':'));
//        var value = my.text.parse(my.text.substring(rule, ':', ''));

//        var property = this.manager.propertiesManager.items.getItem(key);
//        if (property) {
//            self.activate(property.value !== value);
//            property.bind({
//                change: function (e) {
//                    self.activate(e.value != value);
//                }
//            });
//        }
//    }
//};
//GrammarForm.prototype.activate = function (value) {
//    this.active = value;
//    if (value) {
//        this.view().removeAttr('disabled');
//    } else {
//        this.view().attr('disabled', 'disabled');
//    }
//};
//GrammarForm.prototype.setValue = function (value) {
//    this.originalValue = value;
//    this.value = value;
//    if (!this.header) {
//        this.view().val(value);
//    }
//};
//GrammarForm.prototype.isChanged = function () {
//    return (this.value !== undefined && this.originalValue !== this.value);
//};
//GrammarForm.prototype.changeValue = function (value) {
//    this.value = value;
//    if (!this.header) {
//        this.view().val(value);
//    }
//};




//function GrammarManager(object, properties) {
//    DetailsManager.call(this, object, properties);
//    this.GrammerManager = true;
//    var self = this;
//    this.propertiesManager = properties.propertiesManager;

//    this.groups = new HashTable(null);
//    this.forms = new HashTable(null);

//    this.ui = (function () {
//        // ReSharper disable once UnusedLocals




//        var formsList = jQuery('<ul/>').appendTo(formsPanel);

//        return {
//            addGroup: function (view) {
//                $(view).appendTo($(formsList));
//            },
//            searchPanel: function () {
//                return searchPanel;
//            }
//        };

//    })();

//    this.renderSearchPanel(object.name);
//    this.loadForms();
//    this.loadValues();
//    this.render();

//}
//mielk.objects.extend(DetailsManager, GrammarManager);
//GrammarManager.prototype.renderSearchPanel = function (name) {
//    var self = this;

//    //Remove the previous dropdown if exists.
//    var container = self.ui.searchPanel();
//    $(container).empty();

//    this.searchDropdown = new DropDown({
//        container: self.ui.searchPanel(),
//        placeholder: 'Select word to copy grammar forms',
//        allowClear: true
//    });

//    this.searchDropdown.bind({
//        change: function (e) {
//            self.propertiesManager.copyDetails(e.item.key);
//            self.copyDetails(e.item.name, e.item.key);
//        }
//    });

//    if (name) {
//        this.refreshSearchPanel(name);
//    }

//};
//GrammarManager.prototype.refreshSearchPanel = function (name) {
//    var self = this;

//    var data = my.db.fetch('Words', 'GetSimilarWords', {
//        'languageId': self.entity.languageId,
//        'wordtype': self.entity.parent.wordtype ? self.entity.parent.wordtype.id : 0,
//        'word': name || self.entity.name
//    });

//    //Convert to objects for dropdown (they must have [key] or [name] property).
//    var result = [];
//    for (var i = 0; i < data.length; i++) {
//        var item = data[i];
//        result.push({
//            key: item.Id,
//            name: item.Name
//        });
//    }

//    self.searchDropdown.loadData(result);

//};
//GrammarManager.prototype.loadSearchPanel = function (name) {
//    var self = this;

//    //Remove the previous dropdown if exists.
//    var container = self.ui.searchPanel();
//    $(container).empty();

//    my.db.fetch('Words', 'GetSimilarWords', {
//        'languageId': self.entity.languageId,
//        'wordtype': self.entity.parent.wordtype ? self.entity.parent.wordtype.id : 0,
//        'word': name || self.entity.name
//    }, {
//        async: true,
//        callback: function (words) {
//            var dropdown = new DropDown({
//                container: self.ui.searchPanel(),
//                data: self.convertSimilarWords(words),
//                placeholder: 'Select word to copy grammar forms',
//                allowClear: true
//            });

//            dropdown.bind({
//                change: function (e) {
//                    self.propertiesManager.copyDetails(e.item.object.Id);
//                    self.copyDetails(e.item.object.Name, e.item.object.Id);
//                }
//            });

//        }
//    });

//};
//GrammarManager.prototype.convertSimilarWords = function (words) {
//    var data = [];
//    for (var i = 0; i < words.length; i++) {
//        var word = words[i];
//        data.push({
//            key: word.Id,
//            name: word.Name,
//            object: word
//        });
//    }

//    return data;

//};



//GrammarManager.prototype.loadForms = function () {
//    var metaword = this.entity.parent;
//    var languageId = this.entity.languageId;
//    var wordtypeId = metaword.wordtype.id;

//    var $forms = this.getDefinitionsFromRepository(languageId, wordtypeId);
//    for (var i = 0; i < $forms.length; i++) {
//        // ReSharper disable once UnusedLocals
//        var form = new GrammarForm(this, $forms[i]);
//    }

//};
//GrammarManager.prototype.getDefinitionsFromRepository = function (languageId, wordtypeId) {
//    return my.db.fetch('Words', 'GetGrammarDefinitions', { 'languageId': languageId, 'wordtypeId': wordtypeId });
//};
//GrammarManager.prototype.render = function () {
//    var sorted = this.sorted();
//    for (var i = 0; i < sorted.length; i++) {
//        var group = sorted[i];
//        group.render();
//    }
//};
//GrammarManager.prototype.sorted = function () {
//    var array = this.groups.values();
//    array.sort(function (a, b) {
//        return a.index < b.index ? -1 : 1;
//    });

//    //Sorted forms inside groups.
//    for (var i = 0; i < array.length; i++) {
//        var group = array[i];
//        if (!group.GrammarGroup) {
//            alert('This item is not of a GrammarGroup type');
//        } else {
//            group.sort();
//        }
//    }

//    return array;
//};
//GrammarManager.prototype.addGroupView = function (view) {
//    this.ui.addGroup(view);
//};
//GrammarManager.prototype.loadValues = function () {
//    var self = this;
//    this.entity.details.each(function (key, object) {
//        var form = self.forms.getItem(key);
//        if (form) {
//            form.setValue(object.value);
//        }
//    });
//};
//GrammarManager.prototype.addForm = function (form) {
//    //Add to proper group (create if it doesn't exist yet).
//    var self = this;
//    var group = this.groups.getItem(form.groupName);
//    if (!group) {
//        group = new GrammarGroup({
//            index: form.groupIndex,
//            name: form.groupName,
//            manager: self,
//            header: form.header
//        });
//        self.groups.setItem(form.groupName, group);
//    }
//    group.add(form);

//    //Add to flyweight map of forms.
//    this.forms.setItem(form.id, form);

//};
//GrammarManager.prototype.copyDetails = function (name, id) {
//    var self = this;
//    var matched = my.text.countMatchedEnd(this.editObject.name, name);
//    var forms = this.entity.getFormsFromRepository(id);

//    for (var i = 0; i < forms.length; i++) {
//        var form = forms[i];
//        var def = self.forms.getItem(form.FormId);
//        if (def) {
//            def.changeValue(self.getProperForm(form.Content, my.text.cut(name, matched), my.text.cut(self.editObject.name, matched)));
//        }
//    }
//};
//GrammarManager.prototype.getProperForm = function (form, baseValue, replace) {
//    return form.replace(baseValue, replace);
//};

//function GrammarGroup(params) {
//    this.GrammarGroup = true;
//    this.manager = params.manager;
//    this.index = params.index;
//    this.name = params.name;
//    this.header = params.header;
//    this.forms = [];
//}
//GrammarGroup.prototype.add = function (form) {
//    this.forms.push(form);
//};
//GrammarGroup.prototype.sort = function () {
//    this.forms.sort(function (a, b) {
//        return a.index < b.index ? -1 : 1;
//    });
//};
//GrammarGroup.prototype.render = function () {
//    var self = this;
//    var listWrapper = jQuery('<li/>').
//        css({
//            'display': 'block',
//            'float': 'left',
//            'width': (100 / self.manager.groups.size()) + '%'
//        });

//    var container = jQuery('<div/>', {
//        'class': 'grammar-group'
//    }).appendTo($(listWrapper));

//    //Render header.
//    var header = jQuery('<div/>', {
//        'class': 'grammar-form grammar-header',
//        html: self.name
//    }).css({
//        'visibility': (self.header ? 'hidden' : 'visible')
//    });
//    $(header).appendTo($(container));

//    //Insert forms.
//    for (var i = 0; i < this.forms.length; i++) {
//        var form = this.forms[i];
//        var view = form.view();
//        $(view).appendTo($(container));
//    }

//    this.manager.addGroupView(listWrapper);

//};
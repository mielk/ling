function EditPanel(entity) {

    'use strict';

    var self = this;

    //Class signature.
    self.EditPanel = true;

    self.entity = entity;
    self.editObject = mielk.objects.clone(entity);
    //Tworzy powiązanie pomiędzy edytowanym obiektem a jego klonem.
    self.editObject.entity = entity;

    self.eventHandler = mielk.eventHandler();
    self.validator = mielk.validation.validator(self);
    self.ui = new EditPanelView(self);
    self.dataLines = mielk.hashTable();
    self.languages = mielk.hashTable();

    //Initialization.
    self.initialize();

}
EditPanel.prototype = {

      bind: function(e){
        this.eventHandler.bind(e);
    }

    , trigger: function(e){
        this.eventHandler.trigger(e);
    }

    , show: function () {
        this.ui.show();
    }

    , destroy: function () {
        this.ui.destroy();
    }

    , confirm: function () {
        //Update object.
        this.destroy();
    }

    , cancel: function () {
        this.destroy();
    }

    , initialize: function() {
        this.insertMetadata();
        this.insertDetails();
    }

    , insertMetadata: function () {

        var self = this;

        //Tworzy kontener do przechowywania linii z danymi.
        var container = jQuery('<div/>', {
            id: 'meta-container'
        });


        //Pobiera z odpowiedniego obiektu Entity listę danych,
        //które mają być wyświetlone w tym panelu i dla każdego
        //z nich tworzy obiekt typu EditDataLine.
        var datalines = this.entity.getDatalinesDefinitions(this.editObject);

        mielk.arrays.each(datalines, function (data) {
            var dataline = new EditDataLine(self, data);
            self.dataLines.setItem(dataline.property, dataline);
            $(dataline.view()).appendTo(container);
        });


        self.ui.appendMetadata(container);

    }

    , getDataLine: function (property) {
        return this.dataLines.getItem(property);
    }

    , insertDetails: function() {
        var self = this;
        
        //Tworzy kontener do przechowywania szczegółowych informacji.
        var container = jQuery('<div/>', {
            id: 'languages-container'
        });

        var languages = Ling.Users.Current.getLanguages();
        mielk.arrays.each(languages, function (language) {
            var panel = new LanguagePanel(self, language);
            $(panel.view()).appendTo(container);
        });

        self.ui.appendDetailsView(container);

    }

};




function EditPanelView(panel) {

    'use strict';

    var self = this;

    //Class signature.
    self.EditPanelView = true;

    self.panel = panel;

    //UI components.
    self.background = jQuery('<div/>', {
          'class': 'edit-background'
        , 'z-index': mielk.ui.topLayer()
    }).bind({
        'click': function (e) {
            if (!self.clickedOnContainer(e.pageX, e.pageY)){
                self.panel.cancel();
            }
        }

    }).appendTo($(document.body));

    self.frame = jQuery('<div/>', {
        'class': 'edit-frame'
    }).appendTo(self.background);

    self.close = jQuery('<div/>', {
        'class': 'edit-close'
    }).bind({
        'click': function () {
            self.destroy();
        }
    }).appendTo(self.frame);

    self.container = jQuery('<div/>', {
        'class': 'edit-container'
    }).appendTo(self.frame);

    self.metadata = jQuery('<div/>').appendTo(self.container);
    
    self.details = jQuery('<div/>').appendTo(self.container);

    self.buttons = (function() {
        var $panel = jQuery('<div/>', {
            'class': 'edit-buttons-panel'
        }).appendTo(self.container);

        var $container = jQuery('<div/>', {
            'class': 'edit-buttons-container'
        }).appendTo($panel);

        var ok = jQuery('<input/>', {
            'class': 'edit-button',
            'type': 'submit',
            'value': 'OK'
        }).bind({
            'click': function () {
                self.panel.confirm();
            }
        }).appendTo($container);

        // ReSharper disable once UnusedLocals
        var cancel = jQuery('<input/>', {
            'class': 'edit-button',
            'type': 'submit',
            'value': 'Cancel'
        }).bind({
            'click': function () {
                self.panel.cancel();
            }
        }).appendTo($container);

        // ReSharper disable once UnusedLocals
        var events = (function () {
            self.panel.bind({
                validation: function (e) {
                    if (e.status) {
                        $(ok).removeAttr('disabled');
                    } else {
                        $(ok).attr('disabled', 'disabled');
                    }
                }
            });
        })();

    })();

}
EditPanelView.prototype = {

    show: function () {
        $(this.background).css({
            'visibility': 'visible',
            'z-index': mielk.ui.topLayer()
        });
    }

    , destroy: function () {
        $(this.background).remove();
    }

    , append: function (element) {
        $(element).appendTo(this.container);
    }
    
    , appendMetadata: function(element) {
        $(element).appendTo(this.metadata);
    }
    
    , appendDetailsView: function(element) {
        $(element).appendTo(this.details);
    }
    
    , clickedOnContainer: function (x, y) {
        var offset = $(this.container).offset();
        var height = $(this.container).height();
        var width = $(this.container).width();

        if (x < offset.left) return false;
        if (y < offset.top) return false;
        if (x > offset.left + width) return false;
        if (y > offset.top + height) return false;

        return true;

    }
};




//Klasa reprezentująca pojedynczy wiersz danych w panelu edycji.
function EditDataLine(panel, params) {

    'use strict';

    var self = this;

    //Class signature.
    self.EditDataLine = true;

    self.panel = panel;
    self.entity = panel.entity;
    self.editObject = panel.editObject;
    self.property = params.property;
    self.value = null;      //Wartość nie jest przypisywana od razu, ponieważ w takiej sytuacji walidacja nie jest uruchamiana.

    self.validation = params.validation;
    self.callback = params.callback;
    self.linked = params.linked;

    //UI components.
    self.ui = (function (properties) {
        var container;
        var valuePanel;
        var errorContainer;
        var error;
        var errorIcon;
        var timer;          //Służy do opóźniania walidacji tekstów.


        //Functions.
        function focus() {
            $(valuePanel).focus();
        }

        function value() {
            return $(valuePanel).val();
        }

        function format($value) {
            if ($value === true) {
                $(valuePanel).removeClass('invalid').addClass('valid');
                $(errorContainer).css({ 'display': 'none' });
                $(errorIcon).removeClass('iconInvalid').addClass('iconValid');
            } else {
                $(valuePanel).removeClass('valid').addClass('invalid');
                $(errorContainer).css({ 'display': 'table' });
                $(errorIcon).removeClass('iconValid').addClass('iconInvalid');
                $(error).text($value);
            }
        }

        function createContainer() {

            container = jQuery('<div/>', {
                'class': 'field-line'
            });

        }

        function applyLabel(label) {

            // ReSharper disable once UnusedLocals
            var labelControl = jQuery('<label/>', {
                'class': 'label',
                html: label
            });

            var span = jQuery('<span/>', {
                'class': 'block'
            }).css({
                'display': 'block',
                'float': 'left'
            });

            $(labelControl).appendTo(span);
            $(span).appendTo(container);

        }

        function applyErrorWarnings(validation) {
            //Append error panels if this property is validatable.
            if (validation) {
                errorContainer = jQuery('<div/>').addClass('error').appendTo(container);
                error = jQuery('<div/>', { 'class': 'error_content' }).appendTo(errorContainer);
                errorIcon = jQuery('<span/>', { 'class': 'icon' }).appendTo(container);
            }
        }

        function applyRightPanel(right) {

            //Append right panel if it is defined.
            if (right) {
                $(right).appendTo(container);
            }

        }

        function applyPanel($panel, $editable, $value) {

            if ($panel) {
                //Jeżeli gotowy panel jest przekazany do konstruktora
                //jest on wstawiany w miejsce standardowego value panela.
                applyCustomPanel($panel);
            } else if (!$editable) {
                //Sytuacja, kiedy linia ma być nieedytowalna.
                applyNonEditablePanel($value);
            } else {
                //Sytuacja, kiedy linia ma być edytowalna.
                applyEditablePanel($value);
            }

        }

        function applyCustomPanel($panel) {
            valuePanel = $panel;
            $($panel).appendTo(container);
        }

        function applyNonEditablePanel($value) {
            valuePanel = jQuery('<label/>', {
                'class': 'value',
                html: $value
            }).appendTo(container);
        }

        function applyEditablePanel($value) {

            valuePanel = jQuery('<input/>', {
                'class': 'field default',
                'type': 'text'
            }).bind({
                'keydown': function (e) {
                    /* Jeżeli to nie jest ustawione, w IE 9 focus przeskakuje od razu
                     * na przycisk [Select categories] i wywołuje jego kliknięcie. */
                    if (e.which === 13) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }
                , 'keyup': function () {
                    validate(150);
                }
                , 'change blur': function () {
                    validate();
                }
                , 'mouseup': function (e) {
                    e.preventDefault();
                }
            }).on({
                'focus': function () {
                    this.select();
                }
            });


            //Append panel to span to center it vertically.
            var span = jQuery('<span/>', {
                'class': 'block'
            }).bind({
                'click': function () {
                    $(valuePanel).focus();
                }
            }).appendTo(container);

            //Ustawia początkową wartość i dodaje panel do głównego kontenera.
            $(valuePanel).val($value);
            $(valuePanel).appendTo(span);

        }

        function applyCustomCss(css) {
            if (css) {
                $(valuePanel).css(css);
            }
        }

        function applyBindings(bindings) {
            if (bindings) {
                $(valuePanel).bind(bindings);
            }
        }

        function validate(delay) {
            var $value = $(valuePanel).val();

            if (!delay) {
                self.validate($value);
            } else {
                if (timer) clearTimeout(timer);
                timer = setTimeout(function () {
                    self.validate($value);
                }, delay);
            }

        }


        (function initialize() {
            createContainer();
            applyLabel(properties.label);
            applyErrorWarnings(properties.validation);
            applyRightPanel(properties.right);
            applyPanel(properties.panel, properties.editable, properties.value);
            applyCustomCss(properties.inputCss);
            applyBindings(properties.controlBindings);
        })();


        return {
              focus: focus
            , value: value
            , format: format
            , view: container
        };

    })(params);


    (function initialize() {
        self.setValue();
        if (params.validation) self.validate(params.value);
        if (params.bindings) self.applyBindings(params.bindings);
        if (params.focus) self.focus();
    })();

}
EditDataLine.prototype = {

    view: function(){
        return this.ui.view;
    }

    , focus: function () {
        this.ui.focus();
    }

    , validate: function (value) {
        var self = this;

        //Nie ma sensu walidować elementu, jeżeli nie zmieniła
        //się jego wartość lub nie jest ustawiona reguła walidacji.
        if (!this.validation || value === this.value) return;


        //Przypisuje wartość do tej DataLine oraz do zbindowanego
        //do niej obiektu EditObject.
        self.value = value;
        mielk.fn.run(self.callback, value);


        //Waliduje wprowadzoną wartość...
        self.verifyLinked();
        var validationResult = mielk.fn.run(self.validation, {
              value: self.value
            , property: self.property.name
            , id: self.entity.id
        });

        //... i wywołuje odpowiednie metody zmieniające formatowanie
        //w zależności od wyników walidacji.
        self.ui.format(validationResult);

        self.panel.validator.validation({
            id: self.property.name,
            status: (validationResult === true ? true : false)
        });

    }

    , setValue: function (value) {
        this.editObject[this.property] = (value !== undefined ? value : this.value);
    }

    , applyBindings: function (bindings) {
        if (bindings) {
            this.entity.bind(bindings);
        }
    }

    , verifyLinked: function () {
        var self = this;
        mielk.arrays.each(this.linked, function (linked) {
            alert('edit-panel.js : EditDataLine.verifyLinked');
            var dataline = self.panel.getDataLine(linked);
            if (dataline) dataline.validate();
        });
    }

};





//Klasa reprezentująca panel pojedynczego języka zawierający
//wyrazy lub opcje zapytania.
function LanguagePanel(panel, language) {

    'use strict';

    var self = this;
    
    //Class signature.
    self.LanguagePanel = true;

    self.panel = panel;
    self.language = language;
    self.object = panel.editObject;
    self.items = mielk.hashTable();

    // ReSharper disable UnusedLocals
    self.ui = (function() {

        var collapsed = false;
        
        var container = jQuery('<div/>', {
            'class': 'language'
        });

        var info = jQuery('<div/>', {
            'class': 'info'
        }).appendTo(container);

        var collapseButton = jQuery('<div/>', {
            'class': 'collapse'
        }).bind({
            'click': function () {
                if (collapsed === true) {
                    expand();
                } else {
                    collapse();
                }
            }
        }).appendTo(info);
        
        var flag = jQuery('<div/>', {
            'class': 'flag ' + self.language.flag
        }).appendTo(info);

        var name = jQuery('<div/>', {
            'class': 'name',
            'html': self.language.name
        }).appendTo(info);

        var options = jQuery('<div/>', {
            'class': 'options'
        }).css({
            'display': self.items.size() ? 'block' : 'none'
        }).appendTo(container);

        var buttons = jQuery('<div/>', {
            'class': 'buttons'
        }).appendTo(container);




        function showOptionsPanel() {
            $(options).css({
                'display': self.items.size() ? 'block' : 'none'
            });
        }
        
        function collapse() {
            collapsed = true;

            $(options).css({
                'display': 'none'
            });
            $(buttons).css({
                'display': 'none'
            });
        }

        function expand() {
            collapsed = false;
            showOptionsPanel();
            $(buttons).css({
                'display': 'block'
            });
        }

        function addButtons() {
            var add = jQuery('<input/>', {
                'class': 'button add',
                'type': 'submit',
                'value': dict.Add.get()
            }).bind({
                'click': function () {
                    //self.addNew();
                }
            }).appendTo(buttons);
        }

        function addOption(option, optionView) {
            self.items.setItem(option.name, optionView);
            $(optionView).appendTo(options);
            showOptionsPanel();
        }

        (function initialize() {
            addButtons();
        })();


        return {
              view: container
            , refresh: showOptionsPanel
            , addOption: addOption
        };

    })();
    // ReSharper restore UnusedLocals

    (function initialize() {
        self.loadItems();
    })();

}
LanguagePanel.prototype = {
    
      view: function() {
        return this.ui.view;
    }
    
    , loadItems: function () {
        var self = this;
        var set = self.object.items.getItem(self.language.id);
        if (set) {

            set.each(function (key, item) {

                item.bind({
                    remove: function() {
                        self.removeItem(item);
                    }
                });

                var optionPanel = new OptionPanel(item);
                self.ui.addOption(item, optionPanel.view());
                
            });

        }
    }
    
    , removeItem: function(item) {
        this.items.removeItem(item.name);
        this.ui.refresh();
    }
    
    , addNew: function () {

        alert('Not implemented yet: edit-panel.js:LanguagePanel.addNew');

        //    var item = this.item.newItem(this.language.id);
        //    item.injectLanguageEntity(this.languageEntity);
        //    item.edit({ languagePanel: this });
    }
};




//Klasa reprezentująca pojedynczą linię z sub-itemem, np. jeden
//wyraz lub jedno QueryOption.
function OptionPanel(item, parent) {

    'use strict';

    var self = this;
    
    //Class signature.
    self.OptionPanel = true;
    
    //Instance properties.
    self.item = item;
    self.parent = parent;   // <- EditPanel.editObject
    
    // ReSharper disable UnusedLocals
    self.ui = (function () {

        var container = jQuery('<div/>', { 'class': 'option' });

        var deleteButton = jQuery('<div/>', {
            'class': 'button delete',
            'title': dict.DeleteThisItem.get()
        }).bind({
            click: function () {
                self.item.remove();
                hide();
            }
        }).appendTo(container);

        var edit = jQuery('<div/>', {
            'class': 'button edit',
            'title': dict.EditThisItem.get()
        }).bind({
            click: function () {
                self.item.edit();
            }
        }).appendTo(container);

        var content = jQuery('<div/>', {
            'class': 'content',
            'html': self.contentToHtml()
        }).appendTo(container);

        var weight = jQuery('<div/>', {
            'class': 'weight',
            'html': self.item.weight
        }).appendTo(container);

        var completness = jQuery('<div/>', {
            'class': 'completness ' + (self.item.isCompleted ? 'complete' : 'incomplete')
        }).appendTo(container);



        function hide() {
            $(container).css({
                'display': 'none'
            });
        }

        function destroy() {
            $(container).remove();
        }

        function update($content, $weight, $complete) {
            $(content).html(self.contentToHtml($content));
            $(weight).html($weight);
            $(completness).addClass($complete ? 'complete' : 'incomplete');
            $(completness).removeClass($complete ? 'incomplete' : 'complete');
        }




        return {
              view: container
            , destroy: destroy
            , update: update
            , hide: hide
        };

    })();
    // ReSharper restore UnusedLocals

    self.events = (function () {
        self.item.bind({
            update: function(e) {
                self.update(e.content, e.weight, e.complete);
            }

        });
    })();

}
OptionPanel.prototype = {
    
    view: function() {
        return this.ui.view;
    }
    
    , update: function(content, weight, complete) {
        this.ui.update(content, weight, complete);
    }
    
    , toHtml: function($content) {
        var content = $content || this.item.name;
        var weight = this.item.weight;

        var html = '<div class="button delete" title="' + dict.DeleteThisItem.get() + '"></div>';
        html += '<div class="button edit" title="' + dict.EditThisItem.get() + '"></div>';
        html += '<div class="content" data-value="' + content + '">';
        html += this.contentToHtml(content);
        html += '</div>';
        html += '<div class="weight" data-value="' + weight + '">' + weight + '</div>';

        return html;

    }
    
    , contentToHtml: function() {
        var content = this.item.name;
        var replaced = content.replace(/\[/g, '|$').replace(/\]/g, '|');
        var parts = replaced.split("|");

        var result = '';
        mielk.arrays.each(parts, function(part) {
            if (part.length > 0) {
                result += '<span class="' + (mielk.text.startsWith(part, '$') ? 'complex' : 'plain') + '">' + part.replace("$", "") + '</span>';
            }
        });
        
        return result;

    }
    
    , isUniqueContent: function() {
        return false;
    }
    
};



//Podklasa reprezentująca panel edycji dla subitemów.
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
        self.entity.properties.each(function(key, item) {
            var propertyContainer = jQuery('<div/>', { 'class': 'property-container' });
            var control = item.property.type.control({
                  name: item.property.name
                , container: propertyContainer
                , value: item.value.id
                , options: item.property.options
            });

            if (!control) return;

            //Attach events handlers to this control.
            control.bind({
                click: function (e) {
                    item.value = e.object;
                    self.entity.trigger({
                          type: 'change' + item.property.name
                        , property: item.property
                        , value: item.value
                    });
                }
            });

            $(control.view).appendTo(container);
            
        });

        self.ui.appendDetailsView(container);

    }

    //[Override]
    , insertDetails: function() {
        
        var grammarPanel = new GrammarPanel(this.entity);
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
            searchPanel = jQuery('<div/>', {
                'class': 'grammar-search-panel'
            }).appendTo(container);
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
                var cell = new GrammarCell(self.word, value);
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

        return {
            view: control
        };

    })();

    (function initialize() {
        self.setListeners();
    })();

}
GrammarCell.prototype = {

    view: function () {
        return this.ui.view;
    }

    , setValue: function (value) {
        var x = value;
    }

    , setListeners: function () {
        var self = this;
        this.form.inactiveRules.each(function (key, value) {
            var eventName = 'change' + value.property.name;
            var eventsObject = {};
            eventsObject[eventName] = function(e){
                var x = 1;
                //Sprawdzać na obiekcie self.word czy ten element nadal powinien być aktywny.
            };

            self.word.bind(eventsObject);

        });

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

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
        this.clear();
    }

    , confirm: function () {
        var self = this;
        self.trigger({
            type: 'confirm',
            object: self.editObject
        });
        self.destroy();
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

    , clear: function() {
        for (var key in this) {
            delete this[key];
        }
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
    //Wartość nie jest przypisywana od razu, ponieważ w takiej sytuacji walidacja nie jest uruchamiana.
    //Dla własciwości, które nie potrzebują walidacji, wartość przypisywana jest od razu.
    self.value = params.validation ? null : params.value;

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
                    self.addNew();
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
                self.addOption(item);
            });

        }
    }

    , addOption: function (item) {
        var self = this;

        item.bind({
            remove: function () {
                self.removeItem(item);
            }
        });

        var optionPanel = new OptionPanel(item);
        self.ui.addOption(item, optionPanel.view());

    }
    
    , removeItem: function(item) {
        this.items.removeItem(item.name);
        this.ui.refresh();
    }
    
    , addNew: function () {
        var self = this;
        var item = self.panel.editObject.createSubItem({
              'new': true
            , languageId: self.language.id
        });
        item.edit();
        item.bind({
            updated: function () {
                if (item.new) {
                    item.new = false;
                    self.addOption(item);
                }
            }
        });
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
            updated: function () {
                self.update(self.item.name, self.item.weight, self.item.isCompleted);
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
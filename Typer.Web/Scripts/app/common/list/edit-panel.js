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
    
    (function initialize() {
        self.insertMetadata();
    })();

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
            var dataline = new EditDataLine(self, data)
            self.dataLines.setItem(dataline.property, dataline);
            $(dataline.view()).appendTo(container);
        });


        self.ui.append(container);



        //    //[Weight]
        //    var weightPanel = new WeightPanel(this, self.editObject, {
        //        css: { 'margin': '9px 0', 'height': '16px' }
        //    });
        //    this.meta.addLine(new EditDataLine(this, {
        //        property: 'weight', label: 'Weight', value: self.editObject.weight,
        //        panel: weightPanel.view()
        //    }));

        //    //[Category]
        //    var categoryPanel = new CategoryPanel(this, self.editObject);
        //    this.meta.addLine(new EditDataLine(this, {
        //        property: 'categories', label: 'Categories', value: self.editObject.categories,
        //        panel: categoryPanel.view()
        //    }));

        //    this.render();


    }

    , getDataLine: function (property) {
        return this.dataLines.getItem(property);
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
        ,'z-index': mielk.ui.topLayer()
    }).appendTo($(document.body));

    self.frame = jQuery('<div/>', {
        'class': 'edit-frame'
    }).appendTo(self.background);

    self.container = jQuery('<div/>', {
        'class': 'edit-container'
    }).appendTo(self.frame);

    self.close = jQuery('<div/>', {
        'class': 'edit-close'
    }).bind({
        'click': function () {
            self.destroy();
        }
    }).appendTo(self.frame);

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

    , appendDataLine: function (dataLine) {
        $(dataLine.view).appendTo(self.dataLines);
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

        function applyPanel(panel, editable, value) {

            if (panel) {
                //Jeżeli gotowy panel jest przekazany do konstruktora 
                //jest on wstawiany w miejsce standardowego value panela.
                applyCustomPanel(panel);
            } else if (!editable) {
                //Sytuacja, kiedy linia ma być nieedytowalna.
                applyNonEditablePanel(value);
            } else {
                //Sytuacja, kiedy linia ma być edytowalna.
                applyEditablePanel(value);
            }

        }

        function applyCustomPanel(panel) {
            valuePanel = panel;
            $(panel).appendTo(container);
        }

        function applyNonEditablePanel(value) {
            valuePanel = jQuery('<label/>', {
                'class': 'value',
                html: value
            }).appendTo(container);
        }

        function applyEditablePanel(value) {

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
            $(valuePanel).val(value);
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
            var value = $(valuePanel).val();

            if (!delay) {
                self.validate(value);
            } else {
                if (timer) clearTimeout(timer);
                timer = setTimeout(function () {
                    self.validate(value);
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
            , property: self.property
            , id: self.entity.id
        });

        //... i wywołuje odpowiednie metody zmieniające formatowanie
        //w zależności od wyników walidacji.
        self.ui.format(validationResult);

        self.panel.validator.validation({
            id: self.property,
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





///*
//    * Class:           EditPanel
//    * Description:     Responsible for displaying properties of the 
//    *                  given object in a separate modal window.
//    * Parameters:      
//    *  ListItem item   List item that the object edited is assigned to.
//    */
//function EditPanel(object, editObject) {




//    this.languages = (function () {
//        var items = new HashTable(null);

//        var container = jQuery('<div/>', {
//            id: 'languages-container'
//        });
//        self.ui.append($(container));

//        return {
//            add: function (panel) {
//                items.setItem(panel.id, panel);
//                $(panel.view()).appendTo($(container));
//            }
//        };
//    })();

//    this.buttons = (function () {
//        var panel = jQuery('<div/>', {
//            'class': 'edit-buttons-panel'
//        });

//        var container = jQuery('<div/>', {
//            'class': 'edit-buttons-container'
//        }).appendTo($(panel));

//        var ok = jQuery('<input/>', {
//            'class': 'edit-button',
//            'type': 'submit',
//            'value': 'OK'
//        }).bind({
//            'click': function () {
//                self.confirm();
//            }
//        }).appendTo($(container));

//        // ReSharper disable once UnusedLocals
//        var cancel = jQuery('<input/>', {
//            'class': 'edit-button',
//            'type': 'submit',
//            'value': 'Cancel'
//        }).bind({
//            'click': function () {
//                self.cancel();
//            }
//        }).appendTo($(container));

//        self.ui.append(panel);

//        self.object.bind({
//            validation: function (e) {
//                if (e.status) {
//                    $(ok).removeAttr('disabled');
//                } else {
//                    $(ok).attr('disabled', 'disabled');
//                }
//            }
//        });

//    })();

//    this.generalRender();

//    this.renderLanguages();

//}
//EditPanel.prototype.confirm = function () {
//    this.object.update(this.editObject);
//    this.ui.destroy();
//};
//EditPanel.prototype.generalRender = function () {

//    var self = this;

//    this.render();
//};
//EditPanel.prototype.render = function () {
//    alert('Must be defined by implementing class');
//};
//EditPanel.prototype.getProperty = function (key) {
//    if (this.editPanel.hasOwnProperty(key)) {
//        return this.editPanel[key];
//    }
//    return null;
//};
//EditPanel.prototype.renderLanguages = function () {
//    var self = this;
//    var languages = this.editObject.languages;
//    languages.each(function (key, object) {
//        var panel = new LanguagePanel(self.editObject, self, object);
//        self.languages.add(panel);
//    });
//};
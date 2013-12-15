$(function () {

    $('.edit-item').bind({
        'click': function () {
            var id = Number(this.innerHTML);
            if ($.isNumeric(id)) {
                editMetaword(id);
            }
        }
    });

    $('#add-item').bind({
        'click': function () {

            var metaword = new Metaword({
                    Object: {},
                    Categories: [],
                    UserLanguages: getLanguages()
                }, {
                    blockOtherElements: true
                });

            metaword.ui.display();

        }
    });

});


function editMetaword(id) {
    var metawordJson = getItem('/Words/GetMetaword', id);
    var metaword = new Metaword(metawordJson, {
                        blockOtherElements: true
                    });
    metaword.displayEditForm();
}

function getItem(methodUrl, itemId) {
    var item;

    $.ajax({
        url: methodUrl,
        type: "GET",
        data: { 'id': itemId },
        datatype: "json",
        async: false,
        cache: false,
        success: function (result) {
            item = result;
        },
        error: function (msg) {
            alert(msg.status + " | " + msg.statusText);
        }
    });

    return item;
}

TYPE = {
    NOUN: { id: 1, name: 'noun' },
    VERB: { id: 2, name: 'verb' },
    ADJECTIVE: { id: 3, name: ' adjective' },
    OTHER: { id: 4, name: 'other' },
    getItem: function (value) {
        for (var key in TYPE) {
            if (TYPE.hasOwnProperty(key)) {
                var object = TYPE[key];
                if (object.id === value) {
                    return object;
                }
            }
        }
    }
}

function getLanguages() {
    var $languages;

    $.ajax({
        url: '/User/GetLanguages',
        type: "GET",
        datatype: "json",
        async: false,
        cache: false,
        success: function (result) {
            $languages = result;
        },
        error: function (msg) {
            alert(msg.status + " | " + msg.statusText);
        }
    });

    var languages = [];
    for (var i = 0; i < $languages.length; i++){
        var language = $languages[i];
        languages[i] = {
            Language: language,
            Options: []
        }
    }

    return languages;

}

function Metaword(data, properties) {
    var me = this;
    this.object = data.Object || data.Metaword || data.Word;
    this.id = this.object.Id || 0;
    this.name = this.object.Name || '';
    this.weight = this.object.Weight || 1;
    this.categories = [];
    this.languages = this.createLanguageCollection(data.UserLanguages);
    this.properties = properties || {};
    this.type = TYPE.getItem(this.object.Type);

    this.eventHandler = new EventHandler();

    this.validator = new MetawordValidator(this);

    this.view = new MetawordView(this, properties.container, properties.x, properties.y);

    this.meta = new MetawordMeta(this);

    this.buttons = new MetawordButtons(this);


}
Metaword.prototype.categoriesString = function () {
    var s = '';
    for (var i = 0; i < this.categories.length; i++) {
        var category = this.categories[i];
        s = s + (s ? '; ' : '') + category.name;
    }
    return s;
};
Metaword.prototype.createLanguageCollection = function (languages) {
    var arr = [];
    for (var i = 0; i < languages.length; i++) {
        var languageJson = languages[i];
        arr[i] = new Language({
            id: languageJson.Language.Id,
            name: languageJson.Language.Name,
            flag: languageJson.Language.Flag,
            options: languageJson.Options
        });
    }

    return arr;
}
Metaword.prototype.cancel = function () {
    //Cancel.
}
Metaword.prototype.confirm = function () {
    //Confirm.
}
Metaword.prototype.displayEditForm = function () {
    this.view.display();
}


function MetawordView(metaword, container, x, y) {
    var me = this;
    this.word = metaword;
    this.blockOther = (container ? true : false);

    this.background = container || jQuery('<div/>', {
                            id: 'question-background',
                            'class': 'question-background'
                        }).
                        css({
                            'display': 'none',
                            'z-index' : my.ui.addTopLayer()
                        }).appendTo($(document.body));

    this.frame = jQuery('<div/>', {
                    id: 'question-container-frame',
                    'class': 'question-container-frame'
                }).css({
                    'display': 'none'
                }).appendTo($(me.background));

    this.container = jQuery('<div/>', {
                    id: 'question-container',
                    'class': 'question-container'
                }).
                appendTo($(this.frame));

    this.quit = jQuery('<div/>', {
                id: 'question-container-exit',
                'class': 'question-container-exit'
            }).
            bind({
                'click': function () {
                    //Cancel.
                }
            }).
            appendTo($(this.background));


    //Place container inside the screen.
    if (x !== undefined) {
        $(container).css('left', x);
    }
    if (y !== undefined) {
        $(container).css('top', y);
    }

}
MetawordView.prototype.destroy = function () {
    $(this.background).empty();
    if (this.blockOther) {
        $(this.background).remove();
    }
}
MetawordView.prototype.display = function () {
    $(this.background).css({
        'display': 'block'
    });
    $(this.frame).css({
        'display': 'block'
    });

    this.word.meta.name.focus();

}
MetawordView.prototype.append = function (element) {
    $(element).appendTo(this.container);
}


function MetawordValidator(metaword) {
    var me = this;
    this.word = metaword;

    this.invalid = new HashTable(null);

}
MetawordValidator.prototype.validation = function (validation) {
    if (validation.status) {
        this.invalid.removeItem(validation.id);
    } else {
        this.invalid.setItem(validation.id, validation.id);
    }
    this.checkState();
}
MetawordValidator.prototype.checkState = function () {
    if (this.word.buttons) {
        this.word.buttons.enable(this.invalid.size());
    }
}



function MetawordMeta(metaword) {
    var me = this;
    this.word = metaword;

    this.container = jQuery('<div/>', {
        id: 'question-meta-container',
        'class': 'question-meta-container'
    });

    this.word.view.append(this.container);


    this.id = new DataLine(this, {
        property: 'id',
        label: 'ID',
        validation: null,
        editable: false,
        inputCss: { 'width': '60px', 'text-align': 'center', 'border': '1px solid #777' }
    });

    this.type = new DataLine(this, {
        property: 'type',
        label: 'Type',
        validation: null,
        editable: false,
        inputCss: { 'width': '60px', 'text-align': 'center', 'border': '1px solid #777' }
    });

    this.name = new DataLine(this, {
        property: 'name',
        label: 'Name',
        validation: nameChecker.check,
        editable: true
    });

    this.weight = new DataLine(this, {
        property: 'weight',
        label: 'Weight',
        validation: null,
        editable: false,
        value: (new WeightPanel(10, me.word.weight)).view.container
    });

    //this.categories = dataLine({
    //    property: 'categories',
    //    label: 'Categories',
    //    validation: null,
    //    editable: false,
    //    value: categoriesPanel(),
    //    right: categoriesEditButton()
    //});

}
MetawordMeta.prototype.append = function (element) {
    $(element).appendTo($(this.container));
}

function DataLine(parent, properties) {
    var me = this;
    this.parent = parent;
    this.word = this.parent.word;
    this.property = properties.property;
    this.linked = new HashTable(null);
    this.validation = properties.validation;

    this.view = new DataLineView(this, properties);

    this.parent.append(this.view.container);

    if (this.validation) {
        this.validate();
    }

}
DataLine.prototype.validate = function () {
    var me = this;
    this.verifyLinked();

    var isValid = this.validation({
        value: me.getValue(),
        property: me.property,
        id: me.word.id
    });

    this.format(isValid === true);
    if (isValid !== true) {
        $(this.view.error).text(isValid);
    }

    this.word.validator.validation({
        id: me.property,
        status: (isValid === true ? true : false)
    });

}
DataLine.prototype.verifyLinked = function () {
    this.linked.each(
        function(key, value){
            value.validate();
        }
    );
}
DataLine.prototype.getValue = function () {
    return this.view.getValue();
}
DataLine.prototype.addLinked = function (line) {
    this.linked.setItem(line.property, line);
}
DataLine.prototype.format = function (value) {
    this.view.format(value);
}
DataLine.prototype.focus = function () {
    this.view.focus();
}



function DataLineView(dataLine, properties) {
    var me = this;
    this.dataLine = dataLine;

    this.container = jQuery('<div/>', {
        'class': 'field-line'
    });

    this.label = jQuery('<label/>', {
        'class': 'label',
        html: properties.label
    }).appendTo(jQuery('<span/>').css({
        'display': 'block',
        'float': 'left'
    }).appendTo($(this.container)));

    if (this.dataLine.validation) {
        this.errorContainer = jQuery('<div/>').addClass('error').appendTo($(this.container));
        this.error = jQuery('<div/>', { 'class': 'error_content' }).appendTo(this.errorContainer);
        this.errorIcon = jQuery('<span/>', {'class': 'icon'}).appendTo($(this.container));
    }

    if (properties.right) {
        $(properties.right).appendTo(this.container);
    }

    var $timer;
    if (properties.value) {
        this.value = $(properties.value);
        $(this.value).appendTo($(this.container));
    } else if (properties.editable) {
        this.value = jQuery('<input/>', {
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
                if ($timer) {
                    clearTimeout($timer);
                }
                $timer = setTimeout(function () {
                    me.dataLine.validate();
                }, 150);
            },
            'change': function () {
                me.dataLine.validate();
            },
            'mouseup': function (e) {
                e.preventDefault();
            },
            'blur': function (e) {
                me.dataLine.validate();
            }
        })
        .on({
            'focus': function (e) {
                this.select();
            }
        }).val(me.dataLine.word[properties.property]);

        var span = jQuery('<span/>').
        bind({
            'click': function () {
                me.value.focus();
            }
        }).
        appendTo($(this.container))

        this.value.appendTo($(span));

    } else {
        this.value = jQuery('<label/>', {
            'class': 'value',
            html: me.dataLine.word[properties.property]
        }).appendTo($(this.container));
    }

    if (properties.inputCss) {
        $(this.value).css(properties.inputCss);
    }

}
DataLineView.prototype.format = function (isValid) {
    if (isValid) {
        $(this.value).removeClass('invalid').addClass('valid');
        $(this.errorContainer).css({ 'display': 'none' });
        $(this.errorIcon).removeClass('iconInvalid').addClass('iconValid');
    } else {
        $(this.value).removeClass('valid').addClass('invalid');
        $(this.errorContainer).css({ 'display': 'table' });
        $(this.errorIcon).removeClass('iconValid').addClass('iconInvalid');
    }

}
DataLineView.prototype.focus = function () {
    $(this.value).focus();
}
DataLineView.prototype.getValue = function () {
    return $(this.value).val();
}

var nameChecker = (function(){
    var nameExists = false;
    function check(params) {
        var MAX_LENGTH = 255;
        var name = params.value;
        var id = params.id;

        if (!name.trim()) {
            return MessageBundle.get(dict.NameCannotBeEmpty);
        } else if (name.length > MAX_LENGTH) {
            return MessageBundle.get(dict.NameCannotBeLongerThan, [MAX_LENGTH]);
        } else {
            nameAlreadyExists(name, id);

            if (nameExists) {
                return MessageBundle.get(dict.NameAlreadyExists);
            } else {
                return true;
            }

        }

    }

    function nameAlreadyExists(name, id) {
        $.ajax({
            url: "/Words/CheckName",
            type: "GET",
            data: {
                'id': id,
                'name': name
            },
            datatype: "json",
            async: false,
            cache: false,
            success: function (result) {
                nameExists = (result.IsExisting === true);
            },
            error: function (msg) {
                alert("[register.js::nameAlreadyExists] " + msg.status + " | " + msg.statusText);
            }
        });
        
    }

    return {
        check: function (params) {
            return check(params);
        }
    }
})();

function MetawordButtons(metaword) {
    var me = this;
    this.word = metaword;

    this.panel = jQuery('<div/>', {
        id: 'question-buttons-panel',
        'class': 'question-buttons-panel'
    });

    this.word.view.append(this.panel);

    this.container = jQuery('<div/>', {
        id: 'question-buttons-container',
        'class': 'question-buttons-container'
    }).appendTo($(this.panel));

    this.ok = jQuery('<input/>', {
        id: 'question-button-ok',
        'class': 'question-button',
        'type': 'submit',
        'value': 'OK'
    }).bind({
        'click': function () {
            me.word.confirm();
        }
    }).appendTo($(this.container));

    this.cancel = jQuery('<input/>', {
        id: 'question-button-cancel',
        'class': 'question-button',
        'type': 'submit',
        'value': 'Cancel'
    }).bind({
        'click': function () {
            me.word.cancel();
        }
    }).appendTo($(this.container));


}
MetawordButtons.prototype.enable = function (value) {
    if (value) {
        $(this.ok).removeAttr('disabled');
    } else {
        $(this.ok).attr('disable', 'disabled');
    }
}


function Language(properties) {
    var me = this;
    this.id = properties.id;
    this.name = properties.name;
    this.flag = properties.image;

    this.options = this.createOptionsSet(properties.options || {});

    this.view = new LanguageView(this);

}
Language.prototype.createOptionsSet = function(options){
    var array = new HashTable(null);
    for (var i = 0; i < options.length; i++) {
        var optionJson = options[i];
        var option = new Option({
            id: optionJson.Id,
            content: optionJson.Content,
            questionId: optionJson.QuestionId,
            weight: optionJson.Weight,
            language: me
        });
        array.setItem(option.id, option);
        option.draw();
    }

    return array;

}
Language.prototype.removeOption = function (option) {
    this.options.removeItem(option.id);
    this.view.refreshOptionsPanel();
}
Language.prototype.isUnique = function (content, optionId) {
    var unique = true;
    this.options.each(function (key, option) {
        if (option.content === content) {
            if (option.name !== optionId) {
                unique = false;
            }
        }
    });
    return unique;
}




function LanguageView(language) {

    var me = this;
    this.language = language;
    this.isCollapsed = false;

    this.container = jQuery('<div/>', {
        id: 'language_' + me.language.name,
        'class': 'language'
    });

    this.info = jQuery('<div/>', {
        'class': 'info'
    }).appendTo($(this.container));


    this.collapse = jQuery('<div/>', {
        'class': 'collapse'
    }).bind({
        'click': function () {
            if (me.isCollapsed === true) {
                me.expand();
            } else {
                me.collapse();
            }
        }
    }).appendTo($(this.info));


    this.flag = jQuery('<div/>', {
        'class': 'flag',
    }).css({
        'background-image': me.language.flag
    }).appendTo($(this.info));

    this.name = jQuery('<div/>', {
        'class': 'name',
        'html': me.language.name
    }).appendTo($(this.info));


    //Options.
    this.options = jQuery('<div/>', {
        'class': 'options'
    }).appendTo($(this.container));


    //Buttons.
    this.buttons = jQuery('<div/>', {
        'class': 'buttons'
    }).appendTo($(this.container));

    this.add = jQuery('<input/>', {
        'class': 'button add',
        'type': 'submit',
        'value': 'Add'
    }).bind({
        'click': function () {
            //var option = new Option({
            //    'language': me
            //});
            //var editPanel = new EditPanel({
            //    'option': option
            //});
            //editPanel.bind({
            //    'confirm': function (e) {
            //        var option = e.option;
            //        option.id = e.name;
            //        option.update(e.name, e.weight);
            //        me.options.setItem(option.id, option);
            //        option.draw();
            //    }
            //});
            //editPanel.display();
            //Tworzenie nowej opcji
            //var option = new PreOption(me, ++me.optionNum);
            //Edit panel.
        }
    }).appendTo($(this.buttons));

}
LanguageView.prototype.collapse = function(){
    this.isCollapsed = true;
    $(this.options).css({
        'display': 'none'
    });
    $(this.buttons).css({
        'display': 'none'
    });
};
LanguageView.prototype.expand = function(){
    this.isCollapsed = false;
    this.refreshOptionsPanel();
    $(this.options).css({
        'display': 'block'
    });
    $(this.buttons).css({
        'display': 'block'
    });
};
LanguageView.prototype.refreshOptionsPanel = function(){
    $(this.options).css({
        'display': (me.language.options.size() ? 'block' : 'none')
    });
};
LanguageView.prototype.addOption = function(element){
    $(element).appendTo($(this.options));
}



function WeightPanel(maxWeight, weight) {
    var me = this;
    this.minWeight = 1;
    this.maxWeight = maxWeight;
    this.value = weight;

    this.view = new WeightPanelView(this);

}
function WeightPanelView(panel) {
    var me = this;
    this.checkedCssClass = "weight-checked";
    this.panel = panel;
    this.container = jQuery('<div/>', {
        id: 'weight-panel',
        'class': 'weight-panel'
    });

    this.iconsContainer = jQuery('<div/>', {
        'class': 'weight-icons-container'
    }).bind({
        'clickIcon': function (e) {
            $(this.textbox).val(e.weight);
        }
    }).appendTo($(this.container));

    this.icons = jQuery('<div/>', {
        'class': 'weight-icons'
    }).bind({
        'changeValue': function (e) {
            if (e.weight !== me.value) {
                me.setValue(e.weight);
            }
        },
        'clickIcon': function (e) {
            me.setValue(e.weight);
        }
    }).appendTo($(this.iconsContainer));


    for (var i = this.panel.minWeight - 1; i < this.panel.maxWeight; i++) {
        var icon = jQuery('<div/>', {
            'id': i,
            'class': 'weight-icon',
            html: i + 1
        }).bind({
            'click': function (e) {
                $(me.icons).trigger({
                    'type': 'clickIcon',
                    'weight': (this.id * 1 + 1)
                });
            }
        }).appendTo($(this.icons));
    }

    this.textbox = jQuery('<input/>', {
        'type': 'text',
        'class': 'default question-weight-textbox'
    }).bind({
        'change': function () {
            var value = Math.min(Math.max(me.panel.minWeight, $(this).val() * 1), me.panel.maxWeight);
            $(this).val(value);
            $(me.icons).trigger({
                'type': 'changeValue',
                'weight': value
            });
        }
    }).on({
        'focus': function (e) {
            this.select();
        }
    })
    .val(me.panel.value)
    .appendTo(jQuery('<span/>').
        bind({
            'click': function () {
                $(me.textbox).focus();
            }
        }).appendTo($(me.container)));


    this.setValue(this.panel.value);

}
WeightPanelView.prototype.setValue = function (value) {
    var me = this;
    this.panel.value = value;
    $(this.icons).find('.weight-icon').each(function () {
        var $value = $(this).html() * 1;
        if ($value <= value * 1) {
            $(this).addClass(me.checkedCssClass);
        } else {
            $(this).removeClass(me.checkedCssClass);
        }
    });
    $(this.textbox).val(value);
    this.panel.weight = value;
}




    //        function categoriesPanel(){
    //            $value = jQuery('<div/>', {
    //                'class': 'categories',
    //                'html': me.categoriesString()
    //            });

    //            me.events.bind({
    //                'changeCategory' : function(){
    //                    _refresh();
    //                }
    //            });

    //            $span = jQuery('<span/>');
    //            $value.appendTo($span);

    //            function _refresh(){
    //                $value.val(me.categoriesString());
    //            }

    //            return $span;

    //        }

    //        function categoriesEditButton(){
    //            var $button = jQuery('<input/>', {
    //                'id': 'select-categories',
    //                'class': 'expand-button',
    //                'type': 'submit',
    //                'value': '...'
    //            }).on({
    //                'click': function (e) {
    //                    selectCategories();
    //                }
    //            });
    //            return $button;
    //        }

    //        function selectCategories() {
    //            var tree = new Tree({
    //                'mode': MODE.MULTI,
    //                'root': my.categories.getRoot(),
    //                'blockOtherElements': true,
    //                'showSelection': true,
    //                'hidden': true
    //            });

    //            tree.reset({ unselect: true, collapse: false });
    //            tree.eventHandler.bind({
    //                confirm: function (e) {
    //                    me.events.trigger({
    //                        'type': 'changeCategory',
    //                        'items': e.items
    //                    });
    //                    tree.destroy();
    //                },
    //                add: function (e) {
    //                    my.categories.addNew(e);
    //                },
    //                remove: function (e) {
    //                    my.categories.remove(e);
    //                },
    //                rename: function (e) {
    //                    my.categories.updateName(e);
    //                },
    //                transfer: function (e) {
    //                    my.categories.updateParent(e);
    //                }
    //            });
    //            tree.show();
    //        }

    //        function _validate() {
    //            nameLine.validate();
    //        }

    //        return {
    //            focusName: function () {
    //                nameLine.focus();
    //            },
    //            validate: function () {
    //                _validate();
    //            }
    //        }

    //    })();






    //function Question(data, properties) {
    //    var me = this;
    //    this.id = data.Question.Id || 0;
    //    this.name = data.Question.Name || '';
    //    this.weight = data.Question.Weight || 1;
    //    this.categories = [];
    //    this.languages = createLanguageCollection(data.UserLanguages);
    //    this.properties = properties || {};



    //    this.events = (function () {
    //        var _container = jQuery('<div/>', {
    //            'class': 'events-container'
    //        }).appendTo(me.ui.container);

    //        _container.bind({
    //            cancel: function (e) {
    //                me.ui.close();
    //            },
    //            confirm: function (e) {
    //                alert('confirm; weight: ' + me.weight);
    //            },
    //            changeCategory: function (e) {
    //                if (e.items) {
    //                    me.categories = e.items;
    //                } else if (e.item) {
    //                    me.categories = [];
    //                    me.categories.push(e.item);
    //                }
                
    //            }

    //        });

    //        return {
    //            trigger: function (e) {
    //                _container.trigger(e);
    //            },
    //            bind: function(a){
    //                $(_container).bind(a);
    //            }
    //        }

    //    })();





    //    this.options = (function () {

    //        var _container = jQuery('<div/>', {
    //            id: 'question-languages-panel',
    //            'class': 'question-languages-panel'
    //        }).appendTo($(me.ui.container()));

        
    //        for (var i = 0; i < me.languages.length; i++) {
    //            var language = me.languages[i];
    //            language.gui.appendTo(_container);
    //        }

    //    })();

    //    //==============================================


    //    (function () {
    //        me.meta.validate();
    //    })();


    //}








    //function Option(properties) {
    //    var me = this;
    //    this.id = properties.id;
    //    this.language = properties.language;
    //    this.content = properties.content || '';
    //    this.weight = properties.weight || 1;



    //    this.gui = (function () {
    //        var _container = jQuery('<div/>', {
    //            'class': 'option'
    //        });

    //        var _content;
    //        var _weight;

    //        (function createGUI() {
    //            var _delete = jQuery('<div/>', {
    //                'class': 'button delete',
    //                'title': 'Delete this option'
    //            }).bind({
    //                click: function (e) {
    //                    me.remove();
    //                }
    //            }).appendTo($(_container));

    //            var _edit = jQuery('<div/>', {
    //                'class': 'button edit',
    //                'title': 'Edit this option'
    //            }).bind({
    //                click: function (e) {
    //                    var editPanel = new EditPanel({
    //                        'option': me
    //                    });
    //                    editPanel.bind({
    //                        'confirm': function (e) {
    //                            me.update(e.name, e.weight);
    //                        }
    //                    });
    //                    editPanel.display();
    //                }
    //            }).appendTo($(_container));

    //            _content = jQuery('<div/>', {
    //                'class': 'content',
    //                'data-value': me.content,
    //                'html': contentToHtml()
    //            }).appendTo($(_container));

    //            _weight = jQuery('<div/>', {
    //                'class': 'weight',
    //                'html': me.weight
    //            }).appendTo($(_container));

    //        })();

    //        return {
    //            remove: function () {
    //                _container.remove();
    //            },
    //            appendTo: function (parent) {
    //                _container.appendTo($(parent));
    //            },
    //            container: function () {
    //                return _container;
    //            },
    //            draw: function () {
    //                me.language.gui.addOption(_container);
    //            },
    //            update: function () {
    //                $(_content).html(contentToHtml(me.content));
    //                $(_weight).html(me.weight);
    //            }
    //        }

    //    })();

    //    function contentToHtml() {
    //        var replaced = me.content.replace(/\[/g, '|$').replace(/\]/g, '|');
    //        var parts = replaced.split("|");

    //        var result = '';
    //        for (var part = 0; part < parts.length; part++) {
    //            var s = parts[part];
    //            if (s.length > 0) {
    //                result += '<span class="';
    //                result += (my.text.startsWith(s, '$') ? 'complex' : 'plain');
    //                result += '">';
    //                result += s.replace("$", "");
    //                result += '</span>';
    //            }
    //        }

    //        return result;

    //    }

    //    function toHtml() {
    //        var html = '<div class="button delete" title="Delete this option"></div>';
    //        html += '<div class="button edit" title="Edit this option"></div>';
    //        html += '<div class="content" data-value="' + me.content + '">';
    //        html += contentToHtml(me.content);
    //        html += '</div>';
    //        html += '<div class="weight" data-value="' + me.weight + '">' + me.weight + '</div>';

    //        return html;

    //    }

    //}

    //Option.prototype.isUniqueContent = function (content) {
    //    return this.language.isUnique(content.trim(), this.name);
    //}
    //Option.prototype.update = function (content, weight) {
    //    this.content = content;
    //    this.weight = weight;
    //    this.gui.update();
    //}
    //Option.prototype.remove = function () {
    //    this.language.removeOption(this);
    //    this.gui.remove();
    //}
    //Option.prototype.draw = function () {
    //    this.gui.draw();
    //}

    //Question.prototype.displayEditForm = function () {
    //    this.ui.display();
    //}













    //function EditPanel(properties) {
    //    this.MIN_WEIGHT = 1;
    //    this.MAX_WEIGHT = 10;
    //    var me = this;
    //    this.option = properties.option;

    //    this.gui = (function () {
    //        var $background = jQuery('<div/>', {
    //            id: 'edit-option-background',
    //            'class': 'question-background'
    //        }).
    //            css({
    //                'display': 'none',
    //                'z-index': my.ui.addTopLayer()
    //            }).appendTo($(document.body));

    //        var $events = jQuery('<div/>', {
    //            'class': 'events-container'
    //        }).bind({
    //            'confirm': function () {
    //                me.destroy();
    //            }
    //        }).appendTo($background);

    //        var $container = jQuery('<div/>', {
    //            'class': 'edit-container'
    //        }).
    //            css({
    //                'z-index': my.ui.addTopLayer()
    //            }).appendTo($($background));

    //        var $frame = jQuery('<div/>', {
    //            'class': 'relative'
    //        }).appendTo($($container));


    //        var $close = jQuery('<div/>', {
    //            'class': 'edit-close'
    //        })
    //        .bind({
    //            'click': function () {
    //                me.destroy();
    //            }
    //        })
    //        .appendTo($($frame));


    //        var name = (function () {
    //            var timer;

    //            var _container = jQuery('<div/>', {
    //                'class': 'line'
    //            }).appendTo($($frame));

    //            var $label = jQuery('<div/>', {
    //                'class': 'label',
    //                html: 'Name'
    //            }).appendTo($(_container));

    //            var $error = jQuery('<div/>', {
    //                'class': 'error'
    //            }).appendTo($(_container));

    //            var $errorContent = jQuery('<div/>', {
    //                'class': 'error-content'
    //            }).appendTo($($error));

    //            var $statusIcon = jQuery('<span/>', {
    //                'class': 'icon'
    //            }).appendTo($(_container));

    //            var $textbox = jQuery('<input/>', {
    //                'type': 'text',
    //                'class': 'default'
    //            }).bind({
    //                'keyup': function () {
    //                    if (timer) {
    //                        clearTimeout(timer);
    //                    }
    //                    timer = setTimeout(function () {
    //                        me.validateName();
    //                    }, 150);
    //                },
    //                'keydown': function(e){
    //                    if (e.which === 27) { //Escape.
    //                        me.destroy();
    //                    }
    //                },
    //                'change': function () {
    //                    me.validateName();
    //                },
    //                'mouseup': function (e) {
    //                    e.preventDefault();
    //                }
    //            }).
    //            on({
    //                'focus': function (e) {
    //                    this.select();
    //                }
    //            })
    //            .val(me.option.content)
    //            .focus()
    //            .appendTo(jQuery('<span/>').
    //                bind({
    //                    'click': function () {
    //                        $textbox.focus();
    //                    }
    //                }).appendTo($(_container)));


    //            function _valid(){
    //                $($error).css({ 'visibility': 'hidden' });
    //                $($statusIcon).removeClass('iconInvalid').addClass('iconValid');
    //                $($textbox).removeClass('invalid').addClass('valid');
    //                buttons.enable();
                
    //            }

    //            function _invalid(msg) {
    //                $($errorContent).text(msg);
    //                $($error).css({ 'visibility': 'visible' });
    //                $($statusIcon).removeClass('iconValid').addClass('iconInvalid');
    //                $($textbox).removeClass('valid').addClass('invalid');
    //                buttons.disable();
    //            }

    //            return {
    //                value: function () {
    //                    return $($textbox).val();
    //                },
    //                valid: function () {
    //                    _valid();
    //                },
    //                invalid: function (msg) {
    //                    _invalid(msg);
    //                },
    //                focus: function () {
    //                    $($textbox).focus();
    //                }
    //            }

    //        })();

    //        var weight = (function () {
    //            var CHECKED_CSS_CLASS = "weight-checked";
    //            var _value = me.option.weight;

    //            var _container = jQuery('<div/>', {
    //                'class': 'line'
    //            }).appendTo($($frame));

    //            var $label = jQuery('<div/>', {
    //                'class': 'label',
    //                html: 'Weight'
    //            }).appendTo($(_container));

    //            var iconsContainer = jQuery('<div/>', {
    //                'class': 'weight-icons-container'
    //            }).bind({
    //                'clickIcon': function (e) {
    //                    $($textbox).val(e.weight);
    //                }
    //            }).appendTo($(_container));

    //            var icons = jQuery('<div/>', {
    //                'class': 'weight-icons'
    //            }).bind({
    //                'changeValue': function (e) {
    //                    if (e.weight !== me.value) {
    //                        _setValue(e.weight);
    //                    }
    //                },
    //                'clickIcon': function (e) {
    //                    _setValue(e.weight);
    //                }
    //            }).appendTo($(iconsContainer));

    //            for (var i = me.MIN_WEIGHT - 1; i < me.MAX_WEIGHT; i++){
    //                var icon = jQuery('<div/>', {
    //                    'id': i,
    //                    'class': 'weight-icon',
    //                    html: i + 1
    //                }).bind({
    //                    'click': function (e) {
    //                        $(icons).trigger({
    //                            'type': 'clickIcon',
    //                            'weight': (this.id * 1 + 1)
    //                        });
    //                    }
    //                }).appendTo($(icons));
    //            }


    //            function _setValue(value) {
    //                _value = value;
    //                var cls = CHECKED_CSS_CLASS;
    //                $('.weight-icon').each(function () {
    //                    var $value = $(this).html() * 1;
    //                    if ($value <= value * 1) {
    //                        $(this).addClass(cls);
    //                    } else {
    //                        $(this).removeClass(cls);
    //                    }
    //                });
    //            }

    //            var $textbox = jQuery('<input/>', {
    //                'type': 'text',
    //                'class': 'default centered'
    //            }).bind({
    //                'change': function () {
    //                    var value = Math.min(Math.max(me.MIN_WEIGHT, $(this).val() * 1), me.MAX_WEIGHT);
    //                    $(this).val(value);
    //                    $(icons).trigger({
    //                        'type': 'changeValue',
    //                        'weight': value
    //                    });
    //                }
    //            }).on({
    //                'focus': function (e) {
    //                    this.select();
    //                }
    //            })
    //            .val(me.option.weight)
    //            .appendTo(jQuery('<span/>').
    //                bind({
    //                    'click': function () {
    //                        $($textbox).focus();
    //                    }
    //                }).appendTo($(_container)));

    //            _setValue(me.option.weight);


    //            return {
    //                value: function () {
    //                    return $($textbox).val();
    //                }
    //            }

    //        })();

    //        var buttons = (function (){
    //            var _container = jQuery('<div/>', {
    //                'class': 'line'
    //            }).appendTo($($frame));

    //            var _frame = jQuery('<div/>', {
    //                'class': 'edit-buttons'
    //            }).appendTo($(_container));

    //            var _ok = jQuery('<input/>', {
    //                'type': 'submit',
    //                'value': 'Confirm',
    //                'class': 'question-button'
    //            }).bind({
    //                'click': function () {
    //                    $events.trigger({
    //                        'type' : 'confirm',
    //                        'name': name.value(),
    //                        'weight': weight.value(),
    //                        'option': me.option
    //                    });
    //                }
    //            }).appendTo($(_frame));

    //            var _cancel = jQuery('<input/>', {
    //                'type': 'submit',
    //                'value': 'Cancel',
    //                'class': 'question-button'
    //            }).bind({
    //                'click': function () {
    //                    me.destroy();
    //                }
    //            }).appendTo($(_frame));

    //            function _enable() {
    //                $(_ok).removeAttr('disabled');
    //            }

    //            function _disable() {
    //                $(_ok).attr('disabled', 'disabled');
    //            }

    //            return {
    //                enable: function () {
    //                    _enable();
    //                },
    //                disable: function () {
    //                    _disable();
    //                }
    //            }

    //        })();

    //        return {
    //            destroy: function () {
    //                $($background).remove();
    //            },
    //            display: function () {
    //                $($background).css({
    //                    'display' : 'block'
    //                });
    //                name.focus();
    //            },
    //            name: function () {
    //                return name;
    //            },
    //            weight: function () {
    //                return weight;
    //            },
    //            trigger: function (e) {
    //                $events.trigger(e);
    //            },
    //            bind: function(a){
    //                $events.bind(a);
    //            }
    //        }

    //    })();

    //    this.validateName = function () {
    //        var name = me.gui.name().value();
    //        var isValid = isValidName(name);

    //        if (isValid === true) {
    //            me.gui.name().valid();
    //        } else {
    //            me.gui.name().invalid(isValid);
    //        }

    //    }

    //    function isValidName(name) {
    //        if (name.trim().length === 0) {
    //            return MessageBundle.get(dict.NameCannotBeEmpty);
    //        } else if (!me.option.isUniqueContent(name)) {
    //            return MessageBundle.get(dict.NameAlreadyExists);
    //        } else {
    //            return true;
    //        }
    //    }

    //    this.getName = function () {
    //        return me.gui.name().value();
    //    }
    //    this.getWeight = function () {
    //        return me.gui.weight().value();
    //    }

    //}
    //EditPanel.prototype.display = function () {
    //    this.validateName();
    //    this.gui.display();
    //}
    //EditPanel.prototype.destroy = function () {
    //    this.gui.destroy();
    //}
    //EditPanel.prototype.bind = function(e){
    //    this.gui.bind(e);
//}
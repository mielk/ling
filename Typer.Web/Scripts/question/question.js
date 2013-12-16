my.questions = my.questions || (function () {

    function dbOperation(properties) {
        $.ajax({
            url: "/Questions/" + properties.functionName,
            type: "POST",
            data: properties.data,
            datatype: "json",
            async: false,
            traditional: properties.traditional || false,
            success: function (result) {
                my.notify.display(result ? properties.success : properties.error, result);
                if (properties.callback) {
                    properties.callback(result);
                }
            },
            error: function (msg) {
                my.notify.display(properties.error + ' (' + msg.status + ')', false);
                if (properties.callback) {
                    properties.callback(false);
                }
            }
        });
    }

    return {
        updateCategory: function (e) {

            var categoriesIds = [];
            var categoriesNames = '';
            for (var key in e.items) {
                if (e.items.hasOwnProperty(key)) {
                    var category = e.items[key];
                    categoriesIds.push(category.key);
                    categoriesNames += (categoriesNames ? ', ' : '') + category.object.path();
                }
            }

            dbOperation({
                functionName: 'UpdateCategories',
                data: {
                    'id': e.question.id,
                    'categories': categoriesIds
                },
                traditional: true,
                success: 'Categories ' + categoriesNames + ' have been assigned to question ' + e.question.name,
                error: 'Error when trying to assign the given categories to question ' + e.question.name,
                // ReSharper disable once UnusedParameter
                callback: e.callback
            });

        }
    };

})();


$(function () {

    $('.edit-item').bind({
        'click': function () {
            var id = Number(this.innerHTML);
            var listLine = $(this).parent();
            if ($.isNumeric(id)) {
                editQuestion(id, listLine);
            }
        }
    });

    $('#add-item').bind({
        'click': function () {

            var question = new Question({
                Question: {},
                Categories: [],
                UserLanguages: getLanguages()
            }, {
                blockOtherElements: true
            });

            question.ui.display();

        }
    });


    //var questionJSON = getQuestion(1);
    //var question = new Question(questionJSON, {
    //                        blockOtherElements: true
    //                    });
    //question.displayEditForm();

});


function editQuestion(id, listLine) {
    var questionJson = getQuestion(id);
    var question = new Question(questionJson, {
        blockOtherElements: true,
        listLine: listLine
    });
    question.displayEditForm();
}

function getQuestion(questionId) {
    var question;

    $.ajax({
        url: "/Questions/GetQuestion",
        type: "GET",
        data: { 'id': questionId },
        datatype: "json",
        async: false,
        cache: false,
        success: function (result) {
            question = result;
        },
        error: function (msg) {
            alert(msg.status + " | " + msg.statusText);
        }
    });

    return question;

}

function getLanguages() {
    var $languages;

    $.ajax({
        url: '/Login/GetLanguages',
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
    for (var i = 0; i < $languages.length; i++) {
        var language = $languages[i];
        languages[i] = {
            Language: language,
            Options: []
        };
    }

    return languages;

}



function Question(data, properties) {
    // ReSharper disable once UnusedLocals
    var me = this;
    this.object = data.Object || data.Question;
    this.id = this.object.Id || 0;
    this.name = this.object.Name || '';
    this.weight = this.object.Weight || 1;
    this.categories = this.initialCategoryCollection(data.Categories);
    this.properties = properties || {};
    this.listLine = properties.listLine;

    this.eventHandler = new EventHandler();
    this.eventHandler.bind({
        changeCategory: function (e) {
            e.question = me;

            if (me.checkIfCategoriesChanged(e.items)) {
                e.callback = function (result) {
                    if (result) {
                        me.categories.length = 0;
                        for (var i = 0; i < e.items.length; i++) {
                            me.categories.push(e.items[i].object);
                        }
                        me.trigger({ type: 'refreshCategories' });
                    }
                };
                my.questions.updateCategory(e);
            }

        },
        refreshCategories: function () {
            me.updateCategoriesString();
            if (me.listLine) {
                $(me.listLine).find('.categories').html(me.categoriesString);
            }
        }
    });

    this.validator = new QuestionValidator(this);

    this.view = new QuestionView(this, properties);

    this.meta = new QuestionMeta(this);

    this.languages = this.createLanguageCollection(data.UserLanguages);

    this.buttons = new QuestionButtons(this);

    (function ini() {
        me.trigger({
            type: 'refreshCategories'
        });
    })();

}
Question.prototype.updateCategoriesString = function () {
    var s = '';
    for (var i = 0; i < this.categories.length; i++) {
        var category = this.categories[i];
        s = s + (s ? ' | ' : '') + category.path();
    }
    this.categoriesString = s;
};
Question.prototype.initialCategoryCollection = function (collection) {
    var array = [];
    for (var i = 0; i < collection.length; i++) {
        var id = collection[i].Id;
        var category = my.categories.getCategory(id);
        array.push(category);
    }
    return array;
};
Question.prototype.createLanguageCollection = function (languages) {
    var arr = [];
    for (var i = 0; i < languages.length; i++) {
        var languageJson = languages[i];
        arr[i] = new Language(this, {
            id: languageJson.Language.Id,
            name: languageJson.Language.Name,
            flag: languageJson.Language.Flag,
            options: languageJson.Options
        });
    }

    return arr;
};
Question.prototype.cancel = function () {
    this.view.destroy();
};
Question.prototype.confirm = function () {
    alert('Confirmed');
    this.view.destroy();
};
Question.prototype.displayEditForm = function () {
    this.view.display();
};
Question.prototype.bind = function (e) {
    this.eventHandler.bind(e);
};
Question.prototype.trigger = function (e) {
    this.eventHandler.trigger(e);
};
Question.prototype.checkIfCategoriesChanged = function (items) {
    var nodes = [];
    for (var i = 0; i < this.categories.length; i++) {
        var category = this.categories[i];
        nodes.push(category.node);
    }

    return (!my.array.equal(items, nodes));

};


function QuestionValidator(question) {
    this.question = question;
    this.invalid = new HashTable(null);
}
QuestionValidator.prototype.validation = function (validation) {
    if (validation.status) {
        this.invalid.removeItem(validation.id);
    } else {
        this.invalid.setItem(validation.id, validation.id);
    }
    this.checkState();
};
QuestionValidator.prototype.checkState = function () {
    if (this.question.buttons) {
        this.question.buttons.enable(this.invalid.size() === 0);
    }
};



function QuestionView(question, properties) {
    var me = this;
    this.question = question;
    this.blockOtherElements = properties.blockOtherElements;

    this.background = properties.container || jQuery('<div/>', {
        id: 'question-background',
        'class': 'question-background'
    }).css({
        'display': 'none',
        'z-index': my.ui.addTopLayer()
    }).appendTo($(document.body));

    this.frame = jQuery('<div/>', {
        id: 'question-container-frame',
        'class': 'question-container-frame'
    }).css({
        'display': 'none'
    }).appendTo($(this.background));

    this.container = jQuery('<div/>', {
        id: 'question-container',
        'class': 'question-container'
    }).appendTo($(this.frame));

    this.quit = jQuery('<div/>', {
        id: 'question-container-exit',
        'class': 'question-container-exit'
    }).bind({
        'click': function () {
            me.question.cancel();
        }
    }).
    appendTo($(this.background));


    //Place container inside the screen.
    if (properties.x !== undefined) {
        $(this.container).css('left', properties.x);
    }
    if (properties.y !== undefined) {
        $(this.container).css('top', properties.y);
    }

}
QuestionView.prototype.destroy = function () {
    $(this.background).empty();
    if (this.blockOtherElements) {
        $(this.background).remove();
    }
};
QuestionView.prototype.display = function () {
    $(this.background).css({
        'display': 'block'
    });
    $(this.frame).css({
        'display': 'block'
    });

    this.question.meta.name.focus();

};
QuestionView.prototype.append = function (element) {
    $(element).appendTo(this.container);
};


function QuestionMeta(question) {
    var me = this;
    this.question = question;

    this.container = jQuery('<div/>', {
        id: 'question-meta-container',
        'class': 'question-meta-container'
    });

    this.question.view.append(this.container);


    this.id = new DataLine(this, {
        property: 'id',
        label: 'ID',
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
        value: (new WeightPanel(10, me.question.weight)).view.container
    });

    var categoryPanel = new CategoryPanel(this);
    this.categories = new DataLine(this, {
        property: 'categories',
        label: 'Categories',
        validation: null,
        editable: false,
        value: categoryPanel.view.panel,
        right: categoryPanel.view.editButton
    });

    this.relatives = 'to be added';

    this.contrary = 'to be added';

}
QuestionMeta.prototype.append = function (element) {
    $(element).appendTo($(this.container));
};


function DataLine(parent, properties) {
    this.parent = parent;
    this.question = this.parent.question;
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
        id: me.question.id
    });

    this.format(isValid === true);
    if (isValid !== true) {
        $(this.view.error).text(isValid);
    }

    this.question.validator.validation({
        id: me.property,
        status: (isValid === true ? true : false)
    });

};
DataLine.prototype.verifyLinked = function () {
    this.linked.each(
        function (key, value) {
            value.validate();
        }
    );
};
DataLine.prototype.getValue = function () {
    return this.view.getValue();
};
DataLine.prototype.addLinked = function (line) {
    this.linked.setItem(line.property, line);
};
DataLine.prototype.format = function (value) {
    this.view.format(value);
};
DataLine.prototype.focus = function () {
    this.view.focus();
};



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
        this.errorIcon = jQuery('<span/>', { 'class': 'icon' }).appendTo($(this.container));
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
            'blur': function () {
                me.dataLine.validate();
            }
        })
        .on({
            'focus': function () {
                this.select();
            }
        }).val(me.dataLine.question[properties.property]);

        var span = jQuery('<span/>').
            bind({
                'click': function () {
                    me.value.focus();
                }
            }).
            appendTo($(this.container));

        this.value.appendTo($(span));

    } else {
        this.value = jQuery('<label/>', {
            'class': 'value',
            html: me.dataLine.question[properties.property]
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

};
DataLineView.prototype.focus = function () {
    $(this.value).focus();
};
DataLineView.prototype.getValue = function () {
    return $(this.value).val();
};


var nameChecker = (function () {
    var nameExists = false;
    function check(params) {
        var maxLength = 255;
        var name = params.value;
        var id = params.id;

        if (!name.trim()) {
            return MessageBundle.get(dict.NameCannotBeEmpty);
        } else if (name.length > maxLength) {
            return MessageBundle.get(dict.NameCannotBeLongerThan, [maxLength]);
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
            url: "/Questions/CheckName",
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
    };
})();

function QuestionButtons(question) {
    var me = this;
    this.question = question;

    this.panel = jQuery('<div/>', {
        id: 'question-buttons-panel',
        'class': 'question-buttons-panel'
    });

    this.question.view.append(this.panel);

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
            me.question.confirm();
        }
    }).appendTo($(this.container));

    this.cancel = jQuery('<input/>', {
        id: 'question-button-cancel',
        'class': 'question-button',
        'type': 'submit',
        'value': 'Cancel'
    }).bind({
        'click': function () {
            me.question.cancel();
        }
    }).appendTo($(this.container));


}
QuestionButtons.prototype.enable = function (value) {
    if (value) {
        $(this.ok).removeAttr('disabled');
    } else {
        $(this.ok).attr('disabled', 'disabled');
    }
};


function Language(parent, properties) {
    this.parent = parent;
    this.id = properties.id;
    this.name = properties.name;
    this.flag = properties.image;

    this.view = new LanguageView(this);

    this.options = this.createOptionsSet(properties.questions || {});

    this.view.refreshOptionsPanel();

}
Language.prototype.createOptionsSet = function (options) {
    var me = this;
    var array = new HashTable(null);
    for (var i = 0; i < options.length; i++) {
        var optionJson = options[i];
        var question = new Question({
            id: optionJson.Id,
            content: optionJson.Name,
            questionId: optionJson.QuestionId,
            weight: optionJson.Weight,
            language: me
        });
        array.setItem(question.id, question);
    }

    return array;

};
Language.prototype.addOption = function (option) {
    this.options.setItem(option.key, option);
    this.view.addOption(option.view.container);
};
Language.prototype.removeOption = function (option) {
    this.options.removeItem(option.id);
    this.view.refreshOptionsPanel();
};
Language.prototype.isUnique = function (content, optionId) {
    var unique = true;
    this.options.each(function (key, option) {
        if (option.content === content) {
            if (option.id !== optionId) {
                unique = false;
            }
        }
    });
    return unique;
};


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


    this.collapseButton = jQuery('<div/>', {
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
            var option = new Option({
                language: me.language
            });
            var editPanel = new EditPanel({
                option: option
            });
            editPanel.bind({                
               confirm: function(e) {
                    var $option = e.option;
                    $option.id = e.name;
                    $option.update(e.name, e.weight);
                    me.language.addOption($option);
               }
            });
            editPanel.display();
        }
    }).appendTo($(this.buttons));

    this.refreshOptionsPanel();

    this.language.parent.view.append($(this.container));

}
LanguageView.prototype.collapse = function () {
    this.isCollapsed = true;
    $(this.options).css({
        'display': 'none'
    });
    $(this.buttons).css({
        'display': 'none'
    });
};
LanguageView.prototype.expand = function () {
    this.isCollapsed = false;
    this.refreshOptionsPanel();
    $(this.buttons).css({
        'display': 'block'
    });
};
LanguageView.prototype.refreshOptionsPanel = function () {
    var me = this;
    $(this.options).css({
        'display': (me.language.options && me.language.options.size() ? 'block' : 'none')
    });
};
LanguageView.prototype.addOption = function (element) {
    $(element).appendTo($(this.options));
};




function WeightPanel(maxWeight, weight) {
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
            $(me.textbox).val(e.weight);
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
        // ReSharper disable once UnusedLocals
        var icon = jQuery('<div/>', {
            'id': i,
            'class': 'weight-icon',
            html: i + 1
        }).bind({
            'click': function () {
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
        'focus': function () {
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
};

//panel
//editButton
function CategoryPanel(parent) {
    this.parent = parent;
    this.question = this.parent.question;
    this.view = new CategoryPanelView(this);
}
CategoryPanel.prototype.panel = function () {
    return this.view.span;
};
CategoryPanel.prototype.selectCategories = function () {
    var me = this;
    var tree = new Tree({
        'mode': MODE.MULTI,
        'root': my.categories.getRoot(),
        'selected': me.parent.question.categories,
        'blockOtherElements': true,
        'showSelection': true,
        'hidden': true
    });

    tree.reset({ unselect: false, collapse: false });
    tree.eventHandler.bind({
        confirm: function (e) {
            me.parent.question.trigger({
                'type': 'changeCategory',
                'items': e.item
            });
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

function CategoryPanelView(parent) {
    var me = this;
    this.parent = parent;
    this.panel = jQuery('<span/>');
    this.value = jQuery('<div/>', {
        'class': 'categories'
    }).appendTo(this.panel);


    this.refresh();

    this.parent.question.bind({
        refreshCategories: function () {
            me.refresh();
        }
    });


    this.editButton = jQuery('<input/>', {
        'id': 'select-categories',
        'class': 'expand-button',
        'type': 'submit',
        'value': '...'
    }).on({
        'click': function () {
            me.parent.selectCategories();
        }
    });
}
CategoryPanelView.prototype.refresh = function () {
    $(this.value).html(this.parent.question.categoriesString);
};




function Option(properties) {
    this.language = properties.language;
    this.id = properties.id;
    this.content = properties.content || '';
    this.weight = properties.weight || 1;

    this.view = new OptionView(this);

    this.language.view.addOption($(this.view.container));

}
Option.prototype.toHtml = function () {
    var html = '<div class="button delete" title="Delete this option"></div>';
    html += '<div class="button edit" title="Edit this option"></div>';
    html += '<div class="content" data-value="' + this.content + '">';
    html += this.contentToHtml(this.content);
    html += '</div>';
    html += '<div class="weight" data-value="' + this.weight + '">' + this.weight + '</div>';

    return html;

};
Option.prototype.contentToHtml = function () {
    var replaced = this.content.replace(/\[/g, '|$').replace(/\]/g, '|');
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
Option.prototype.isUniqueContent = function (content) {
    return this.language.isUnique(content.trim(), this.id);
};
Option.prototype.update = function (content, weight) {
    this.content = content;
    this.weight = weight;
    this.view.update();
};
Option.prototype.remove = function () {
    this.language.removeOption(this);
    this.view.destroy();
};


function OptionView(question) {
    var me = this;
    this.question = question;

    this.container = jQuery('<div/>', { 'class': 'option' });

    this.delete = jQuery('<div/>', {
        'class': 'button delete',
        'title': 'Delete this option'
    }).bind({
        click: function () {
            me.question.remove();
        }
    }).appendTo($(this.container));

    this.edit = jQuery('<div/>', {
        'class': 'button edit',
        'title': 'Edit this option'
    }).bind({
        click: function () {
            var editPanel = new EditPanel({
                'option': me
            });
            editPanel.bind({
                'confirm': function (e) {
                    me.question.update(e.name, e.weight);
                }
            });
            editPanel.display();
        }
    }).appendTo($(this.container));

    this.content = jQuery('<div/>', {
        'class': 'content',
        'data-value': me.question.content,
        'html': me.question.contentToHtml()
    }).appendTo($(this.container));

    this.weight = jQuery('<div/>', {
        'class': 'weight',
        'html': me.question.weight
    }).appendTo($(this.container));

}
OptionView.prototype.destroy = function () {
    $(this.container).remove();
};
OptionView.prototype.appendTo = function (parent) {
    $(this.container).appendTo($(parent));
};
OptionView.prototype.update = function () {
    $(this.content).html(this.question.contentToHtml());
    $(this.weight).html(this.question.weight);
};



function EditPanel(properties) {
    var me = this;
    this.option = properties.option;
    this.minWeight = 1;
    this.maxWeight = 10;
    this.invalid = new HashTable(null);
    this.eventHandler = new EventHandler();

    this.view = new EditPanelView(this);

    this.meta = new EditPanelMeta(this);



    this.buttons = new EditPanelButtons(this);

    //this.gui = (function () {

    //    var weight = (function () {
    //        var CHECKED_CSS_CLASS = "weight-checked";
    //        var _value = me.option.weight;

    //        var _container = jQuery('<div/>', {
    //            'class': 'line'
    //        }).appendTo($($frame));

    //        var $label = jQuery('<div/>', {
    //            'class': 'label',
    //            html: 'Weight'
    //        }).appendTo($(_container));

    //        var iconsContainer = jQuery('<div/>', {
    //            'class': 'weight-icons-container'
    //        }).bind({
    //            'clickIcon': function (e) {
    //                $($textbox).val(e.weight);
    //            }
    //        }).appendTo($(_container));

    //        var icons = jQuery('<div/>', {
    //            'class': 'weight-icons'
    //        }).bind({
    //            'changeValue': function (e) {
    //                if (e.weight !== me.value) {
    //                    _setValue(e.weight);
    //                }
    //            },
    //            'clickIcon': function (e) {
    //                _setValue(e.weight);
    //            }
    //        }).appendTo($(iconsContainer));

    //        for (var i = me.MIN_WEIGHT - 1; i < me.MAX_WEIGHT; i++){
    //            var icon = jQuery('<div/>', {
    //                'id': i,
    //                'class': 'weight-icon',
    //                html: i + 1
    //            }).bind({
    //                'click': function (e) {
    //                    $(icons).trigger({
    //                        'type': 'clickIcon',
    //                        'weight': (this.id * 1 + 1)
    //                    });
    //                }
    //            }).appendTo($(icons));
    //        }


    //        function _setValue(value) {
    //            _value = value;
    //            var cls = CHECKED_CSS_CLASS;
    //            $('.weight-icon').each(function () {
    //                var $value = $(this).html() * 1;
    //                if ($value <= value * 1) {
    //                    $(this).addClass(cls);
    //                } else {
    //                    $(this).removeClass(cls);
    //                }
    //            });
    //        }

    //        var $textbox = jQuery('<input/>', {
    //            'type': 'text',
    //            'class': 'default centered'
    //        }).bind({
    //            'change': function () {
    //                var value = Math.min(Math.max(me.MIN_WEIGHT, $(this).val() * 1), me.MAX_WEIGHT);
    //                $(this).val(value);
    //                $(icons).trigger({
    //                    'type': 'changeValue',
    //                    'weight': value
    //                });
    //            }
    //        }).on({
    //            'focus': function (e) {
    //                this.select();
    //            }
    //        })
    //        .val(me.option.weight)
    //        .appendTo(jQuery('<span/>').
    //            bind({
    //                'click': function () {
    //                    $($textbox).focus();
    //                }
    //            }).appendTo($(_container)));

    //        _setValue(me.option.weight);


    //        return {
    //            value: function () {
    //                return $($textbox).val();
    //            }
    //        }

    //    })();


    //})();


    //this.getName = function () {
    //    return me.gui.name().value();
    //}
    //this.getWeight = function () {
    //    return me.gui.weight().value();
    //}

}
EditPanel.prototype.display = function () {
    this.meta.validate();
    this.view.display();
};
EditPanel.prototype.destroy = function() {
    this.view.destroy();
};
EditPanel.prototype.bind = function (e) {
    this.eventHandler.bind(e);
};
EditPanel.prototype.trigger = function (e) {
    this.eventHandler.trigger(e);
};
EditPanel.prototype.confirm = function(e) {
    //Confirm.
};
EditPanel.prototype.validation = function(validation) {
    if (validation.status) {
        this.invalid.removeItem(validation.id);
    } else {
        this.invalid.setItem(validation.id, validation.id);
    }
    this.checkState();
};
EditPanel.prototype.checkState = function() {
    if (this.buttons) {
        this.buttons.enable(this.invalid.size() === 0);
    }
};



function EditPanelView(panel) {
    var me = this;
    this.panel = panel;

    this.background = jQuery('<div/>', {
        id: 'edit-option-background',
        'class': 'question-background'
    }).css({
        'display': 'none',
        'z-index': my.ui.addTopLayer()
    }).appendTo($(document.body));

    this.container = jQuery('<div/>', {
        'class': 'edit-container'
    }).css({
        'z-index': my.ui.addTopLayer()
    }).appendTo($(this.background));

    this.frame = jQuery('<div/>', {
        'class': 'relative'
    }).appendTo($(this.container));

    this.close = jQuery('<div/>', {
        'class': 'edit-close'
    }).bind({
        'click': function () {
            me.panel.destroy();
        }
    }).appendTo($(this.frame));

}
EditPanelView.prototype.destroy = function() {
    $(this.background).remove();
};
EditPanelView.prototype.display = function () {
    $(this.background).css({
        'display': 'block'
    });
    //name.focus();
};
EditPanelView.prototype.append = function(element) {
    $(element).appendTo($(this.container));
};


function EditPanelMeta(panel) {
    var me = this;
    this.panel = panel;

    this.container = jQuery('<div/>');
    this.panel.view.append(this.container);

    this.name = new EditLine(this, {
        property: 'name',
        label: 'Name',
        validation: me.isValidName,
        editable: true,
        object: me.panel.option
    });

}
EditPanelMeta.prototype.append = function(element) {
    $(element).appendTo($(this.container));
};
EditPanelMeta.prototype.isValidName = function (e) {
    var name = e.value;
    if (name.trim().length === 0) {
        return MessageBundle.get(dict.NameCannotBeEmpty);
    } else if (!this.panel.option.isUniqueContent(name)) {
        return MessageBundle.get(dict.NameAlreadyExists);
    } else {
        return true;
    }

};
EditPanelMeta.prototype.validate = function() {
    this.name.validate();
};

function EditPanelButtons(panel) {
    var me = this;
    this.panel = panel;

    this.container = jQuery('<div/>', {
        'class': 'line'
    });
    
    this.frame = jQuery('<div/>', {
        'class': 'edit-buttons'
    }).appendTo($(this.container));

    this.ok = jQuery('<input/>', {
        'type': 'submit',
        'value': 'Confirm',
        'class': 'question-button'
    }).bind({
        'click': function () {
            me.panel.confirm();
        }
    }).appendTo($(this.frame));

    this.cancel = jQuery('<input/>', {
        'type': 'submit',
        'value': 'Cancel',
        'class': 'question-button'
    }).bind({
        'click': function () {
            me.panel.destroy();
        }
    }).appendTo($(this.frame));


    this.panel.view.append(this.container);

}
EditPanelButtons.prototype.enable = function(value) {
    if (value) {
        $(this.ok).removeAttr('disabled');
    } else {
        $(this.ok).attr('disabled', 'disabled');
    }
};




function EditLine(parent, properties) {
    this.parent = parent;
    this.object = properties.object;
    this.property = properties.property;
    this.linked = new HashTable(null);
    this.validation = properties.validation;

    this.view = new EditLineView(this, properties);

    this.parent.append(this.view.container);

    if (this.validation) {
        this.validate();
    }

}
EditLine.prototype.validate = function () {
    var me = this;
    this.verifyLinked();

    var isValid = this.validation({
        value: me.getValue(),
        property: me.property,
        id: me.object.id
    });

    this.format(isValid === true);
    if (isValid !== true) {
        $(this.view.error).text(isValid);
    }

    this.parent.panel.validation({
        id: me.property,
        status: (isValid === true ? true : false)
    });

};
EditLine.prototype.verifyLinked = function () {
    this.linked.each(
        function (key, value) {
            value.validate();
        }
    );
};
EditLine.prototype.getValue = function () {
    return this.view.getValue();
};
EditLine.prototype.addLinked = function (line) {
    this.linked.setItem(line.property, line);
};
EditLine.prototype.format = function (value) {
    this.view.format(value);
};
EditLine.prototype.focus = function () {
    this.view.focus();
};



function EditLineView(editLine, properties) {
    var me = this;
    this.editLine = editLine;

    this.container = jQuery('<div/>', {
        'class': 'line'
    });

    this.label = jQuery('<div/>', {
        'class': 'label',
        html: properties.label
    }).appendTo(jQuery('<span/>').css({
        'display': 'block',
        'float': 'left'
    }).appendTo($(this.container)));


    if (this.editLine.validation) {
        this.errorContainer = jQuery('<div/>').addClass('error').appendTo($(this.container));
        this.error = jQuery('<div/>', { 'class': 'error_content' }).appendTo(this.errorContainer);
        this.errorIcon = jQuery('<span/>', { 'class': 'icon' }).appendTo($(this.container));
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
            'class': 'default',
            'type': 'text'
        }).bind({
            'keydown': function (e) {
                if (e.which === 13) {
                    /* Jeżeli to nie jest ustawione, w IE 9 focus przeskakuje od razu
                        * na przycisk [Select categories] i wywołuje jego kliknięcie. */
                    e.preventDefault();
                    e.stopPropagation();
                } else if (e.which == 27) { //Escape.
                    //Destroy
                }
            },
            'keyup': function () {
                if ($timer) {
                    clearTimeout($timer);
                }
                $timer = setTimeout(function () {
                    me.editLine.validate();
                }, 150);
            },
            'change': function () {
                me.editLine.validate();
            },
            'mouseup': function (e) {
                e.preventDefault();
            },
            'blur': function () {
                me.editLine.validate();
            }
        })
        .on({
            'focus': function () {
                this.select();
            }
        }).val(me.editLine.object[properties.property]);

        var span = jQuery('<span/>').
            bind({
                'click': function () {
                    me.value.focus();
                }
            }).
            appendTo($(this.container));

        this.value.appendTo($(span));

    } else {
        this.value = jQuery('<label/>', {
            'class': 'value',
            html: me.editLine.question[properties.property]
        }).appendTo($(this.container));
    }

    if (properties.inputCss) {
        $(this.value).css(properties.inputCss);
    }

}
EditLineView.prototype.format = function (isValid) {
    if (isValid) {
        $(this.value).removeClass('invalid').addClass('valid');
        $(this.errorContainer).css({ 'display': 'none' });
        $(this.errorIcon).removeClass('iconInvalid').addClass('iconValid');
    } else {
        $(this.value).removeClass('valid').addClass('invalid');
        $(this.errorContainer).css({ 'display': 'table' });
        $(this.errorIcon).removeClass('iconValid').addClass('iconInvalid');
    }

};
EditLineView.prototype.focus = function () {
    $(this.value).focus();
};
EditLineView.prototype.getValue = function () {
    return $(this.value).val();
};
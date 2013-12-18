my.words = my.words || (function () {

    function dbOperation(properties) {
        $.ajax({
            url: "/Words/" + properties.functionName,
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
                    'id': e.word.id,
                    'categories': categoriesIds
                },
                traditional: true,
                success: 'Categories ' + categoriesNames + ' have been assigned to word ' + e.word.name,
                error: 'Error when trying to assign the given categories to word ' + e.word.name,
                // ReSharper disable once UnusedParameter
                callback: e.callback
            });

        }
    };

})();

$(function () {

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

    var controller = new WordViewController({
        pageItems: 10,
        currentPage: 1
    });
    controller.start();

});


function WordViewController(properties) {
    var me = this;
    this.pageItems = properties.pageItems || 10;
    this.currentPage = properties.currentPage || 1;
    this.container = $(document.body);

    this.filterManager = new FilterManager({
        container: me.container,
        wordtype: true,
        weight: true,
        categories: true,
        text: true
    }).bind({
        filter: function (e) {
            var items = me.filter(e);
            me.load(items);
        }
    });

    this.header = (new WordViewHeader(this)).appendTo(this.container);
    this.words = jQuery('<div/>').appendTo($(this.container));
   
}
WordViewController.prototype.start = function() {
    var items = this.filter({ page: 1, pageSize: 10 });
    if (items) {
        this.load(items);
    }
};
WordViewController.prototype.filter = function(e) {
    var me = this;
    var items;

    $.ajax({
        url: '/Words/Filter',
        type: "GET",
        data: {
            'wordType': e.wordtype ? e.wordtype.id : -1,
            'lowWeight': e.weight ? e.weight.from : 0,
            'upWeight': e.weight ? e.weight.to : 0,
            'categories': e.categories ? e.categories : [],
            'text': e.text ? e.text : '',
            'page': me.currentPage,
            'pageSize': me.pageItems
        },
        traditional: true,
        datatype: "json",
        async: false,
        cache: false,
        success: function(result) {
            items = result;
        },
        error: function(msg) {
            alert(msg.status + " | " + msg.statusText);
            return null;
        }
    });

    return items;

};
WordViewController.prototype.load = function(items) {
    this.words.empty();

    for (var i = 0; i < this.pageItems && i < items.length; i++) {
        var word = items[i];
        var wordLine = new WordLine(word);
        wordLine.appendTo(this.words);
    }

};


function WordViewHeader() {
    this.container = jQuery('<div/>', { 'class': 'word header' });
    this.id = jQuery('<div/>', { 'class': 'id', html: 'id' }).appendTo($(this.container));
    this.name = jQuery('<div/>', { 'class': 'name', html: 'name' }).appendTo($(this.container));
    this.weight = jQuery('<div/>', { 'class': 'weight', html: 'weight' }).appendTo($(this.container));
    this.type = jQuery('<div/>', { 'class': 'type', html: 'type' }).appendTo($(this.container));
    this.categories = jQuery('<div/>', { 'class': 'categories', html: 'categories' }).appendTo($(this.container));
}

WordViewHeader.prototype.appendTo = function(parent) {
    $(this.container).appendTo($(parent));
};


function WordLine(word) {
    this.word = word;
    this.id = word.Id;
    this.name = word.Name;
    this.weight = word.Weight;
    this.type = TYPE.getItem(word.Type);
    this.active = word.IsActive;
    this.categories = word.CategoriesString;
    this.eventHandler = new EventHandler();
    this.view = new WordLineView(this);
}

WordLine.prototype.bind = function(e) {
    this.eventHandler.bind(e);
};
WordLine.prototype.trigger = function(e) {
    this.eventHandler.trigger(e);
};
WordLine.prototype.appendTo = function(parent) {
    $(this.view.container).appendTo($(parent));
};
WordLine.prototype.setWeight = function(value) {
    this.weight = value;
    this.trigger({
        type: 'setValue',
        weight: value
    });
};
WordLine.prototype.updateCategories = function(categories) {
    //
};

function WordLineView(line) {
    var me = this;
    this.line = line;

    this.container = jQuery('<div/>', {
        'class': 'word '
    });
    this.activate(this.line.active);

    this.id = jQuery('<div/>', { 'class': 'id', html: me.line.id }).appendTo($(this.container));
    this.name = jQuery('<div/>', { 'class': 'name', html: me.line.name }).appendTo($(this.container));
    this.weight = (new WordLineWeightPanel(this.line)).appendTo($(this.container));

    this.type = jQuery('<div/>', { 'class': 'type', html: me.line.type.symbol }).appendTo($(this.container));
    this.categories = jQuery('<div/>', { 'class': 'categories', html: me.line.categories }).appendTo($(this.container));

    this.edit = jQuery('<div/>', {
        'class': 'edit-item',
        html: me.line.id
    }).bind({
        click: function () {
            var id = me.line.id;
            editMetaword(id, me);
        }
    }).appendTo($(this.container));

    this.deactivate = jQuery('<a/>', {
        html: 'Deactivate'
    }).bind({
        click: function () {
            var id = me.line.id;
            //Deactivate.
        }
    }).appendTo($(this.container));

}

WordLineView.prototype.activate = function(value) {
    if (value) {
        this.container.removeClass('inactive');
        this.container.addClass('active');
    } else {
        this.container.removeClass('active');
        this.container.addClass('inactive');
    }
};


function WordLineWeightPanel(line) {
    var me = this;
    this.line = line;
    this.word = this.line.word;

    this.container = jQuery('<div/>', { 'class': 'weight' });
    this.icons = [];
    for (var i = 0; i < 10; i++) {
        this.icons[i] = jQuery('<a/>', {
            'class': 'weight',
        }).bind({
            click: function () {
                me.word.setWeight(i + 1);
            }
        }).appendTo($(this.container));
    }

    this.line.bind({
        setWeight: function (e) {
            me.setValue(e.weight);
        }
    });

    (function ini() {
        me.setValue(me.line.weight);
    })();

}

WordLineWeightPanel.prototype.setValue = function (value) {
    var i;
    for (i = 0; i < value; i++) {
        this.icons[i].addClass('checked');
    }
    for (i = value; i < 10; i++) {
        this.icons[i].removeClass('checked');
    }
};
WordLineWeightPanel.prototype.appendTo = function(parent) {
    $(this.container).appendTo($(parent));
    return this;
};



function editMetaword(id, wordLine) {
    var metawordJson = getItem('/Words/GetMetaword', id);
    var metaword = new Metaword(metawordJson, {
        blockOtherElements: true,
        wordLine: wordLine
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
    NOUN: { id: 1, name: 'noun', symbol: 'N' },
    VERB: { id: 2, name: 'verb', symbol: 'V' },
    ADJECTIVE: { id: 3, name: 'adjective', symbol: 'A' },
    OTHER: { id: 4, name: 'other', symbol: 'O' },
    getItem: function(value) {
        for (var key in TYPE) {
            if (TYPE.hasOwnProperty(key)) {
                var object = TYPE[key];
                if (object.id === value) {
                    return object;
                }
            }
        }
        return null;
    }
};

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
    for (var i = 0; i < $languages.length; i++){
        var language = $languages[i];
        languages[i] = {
            Language: language,
            Options: []
        };
    }

    return languages;

}

function Metaword(data, properties) {
    var me = this;
    this.object = data.Object || data.Metaword || data.Word;
    this.id = this.object.Id || 0;
    this.name = this.object.Name || '';
    this.weight = this.object.Weight || 1;
    this.categories = this.initialCategoryCollection(data.Categories);
    this.wordLine = properties.wordLine;
    
    this.properties = properties || {};
    this.type = TYPE.getItem(this.object.Type);

    this.eventHandler = new EventHandler();
    this.eventHandler.bind({
        changeCategory: function (e) {
            e.word = me;
            
            if (me.checkIfCategoriesChanged(e.items)){
                e.callback = function (result) {
                    if (result) {
                        me.categories.length = 0;
                        for (var i = 0; i < e.items.length; i++) {
                            me.categories.push(e.items[i].object);
                        }
                        me.trigger({ type: 'refreshCategories' });
                    }
                };
                my.words.updateCategory(e);
            }
            
        },
        refreshCategories: function () {
            me.updateCategoriesString();
            if (me.wordLine) {
                me.wordLine.updateCategories(me.categoriesString);
            }
        }
    });

    this.validator = new MetawordValidator(this);

    this.view = new MetawordView(this, properties);

    this.meta = new MetawordMeta(this);

    this.languages = this.createLanguageCollection(data.UserLanguages);

    this.buttons = new MetawordButtons(this);

    (function ini() {
        me.trigger({
            type: 'refreshCategories'
        });
    })();

}
Metaword.prototype.updateCategoriesString = function () {
    var s = '';
    for (var i = 0; i < this.categories.length; i++) {
        var category = this.categories[i];
        s = s + (s ? ' | ' : '') + category.path();
    }
    this.categoriesString = s;
};
Metaword.prototype.initialCategoryCollection = function (collection) {
    var array = [];
    for (var i = 0; i < collection.length; i++) {
        var id = collection[i].Id;
        var category = my.categories.getCategory(id);
        array.push(category);
    }
    return array;
};
Metaword.prototype.createLanguageCollection = function (languages) {
    var arr = [];
    for (var i = 0; i < languages.length; i++) {
        var languageJson = languages[i];
        arr[i] = new Language(this, {
            id: languageJson.Language.Id,
            name: languageJson.Language.Name,
            flag: languageJson.Language.Flag,
            words: languageJson.Words
        });
    }

    return arr;
};
Metaword.prototype.cancel = function () {
    this.view.destroy();
};
Metaword.prototype.confirm = function () {
    alert('Confirmed');
    this.view.destroy();
};
Metaword.prototype.displayEditForm = function () {
    this.view.display();
};
Metaword.prototype.bind = function (e) {
    this.eventHandler.bind(e);
};
Metaword.prototype.trigger = function (e) {
    this.eventHandler.trigger(e);
};
Metaword.prototype.checkIfCategoriesChanged = function(items) {
    var nodes = [];
    for (var i = 0; i < this.categories.length; i++) {
        var category = this.categories[i];
        nodes.push(category.node);
    }

    return (!my.array.equal(items, nodes));
    
};


function MetawordView(metaword, properties) {
    var me = this;
    this.word = metaword;
    this.blockOtherElements = properties.blockOtherElements;

    this.background = properties.container || jQuery('<div/>', {
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
                    me.word.cancel();
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
MetawordView.prototype.destroy = function() {
    $(this.background).empty();
    if (this.blockOtherElements) {
        $(this.background).remove();
    }
};
MetawordView.prototype.display = function() {
    $(this.background).css({
        'display': 'block'
    });
    $(this.frame).css({
        'display': 'block'
    });

    this.word.meta.name.focus();

};
MetawordView.prototype.append = function(element) {
    $(element).appendTo(this.container);
};


function MetawordValidator(metaword) {
    this.word = metaword;
    this.invalid = new HashTable(null);
}
MetawordValidator.prototype.validation = function(validation) {
    if (validation.status) {
        this.invalid.removeItem(validation.id);
    } else {
        this.invalid.setItem(validation.id, validation.id);
    }
    this.checkState();
};
MetawordValidator.prototype.checkState = function() {
    if (this.word.buttons) {
        this.word.buttons.enable(this.invalid.size() === 0);
    }
};



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
MetawordMeta.prototype.append = function(element) {
    $(element).appendTo($(this.container));
};


function DataLine(parent, properties) {
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
DataLine.prototype.validate = function() {
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

};
DataLine.prototype.verifyLinked = function() {
    this.linked.each(
        function(key, value) {
            value.validate();
        }
    );
};
DataLine.prototype.getValue = function() {
    return this.view.getValue();
};
DataLine.prototype.addLinked = function(line) {
    this.linked.setItem(line.property, line);
};
DataLine.prototype.format = function(value) {
    this.view.format(value);
};
DataLine.prototype.focus = function() {
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
            'blur': function () {
                me.dataLine.validate();
            }
        })
        .on({
            'focus': function () {
                this.select();
            }
        }).val(me.dataLine.word[properties.property]);

        var span = jQuery('<span/>').
            bind({
                'click': function() {
                    me.value.focus();
                }
            }).
            appendTo($(this.container));

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

};
DataLineView.prototype.focus = function() {
    $(this.value).focus();
};
DataLineView.prototype.getValue = function() {
    return $(this.value).val();
};


var nameChecker = (function(){
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
        check: function(params) {
            return check(params);
        }
    };
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
MetawordButtons.prototype.enable = function(value) {
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

    this.options = this.createOptionsSet(properties.words || {});

    this.view.refreshOptionsPanel();

}
Language.prototype.createOptionsSet = function(options) {
    var me = this;
    var array = new HashTable(null);
    for (var i = 0; i < options.length; i++) {
        var optionJson = options[i];
        var word = new Word({
            id: optionJson.Id,
            content: optionJson.Name,
            metawordId: optionJson.MetawordId,
            weight: optionJson.Weight,
            language: me
        });
        array.setItem(word.id, word);
    }

    return array;

};
Language.prototype.addOption = function (option) {
    this.options.setItem(option.key, option);
    this.view.addOption(option.view.container);
};
Language.prototype.removeOption = function(option) {
    this.options.removeItem(option.id);
    this.view.refreshOptionsPanel();
};
Language.prototype.isUnique = function(content, optionId) {
    var unique = true;
    this.options.each(function(key, option) {
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
            var word = new Word({
                language: me.language
            });
            var editPanel = new EditPanel({                
               object: word
            });
            editPanel.bind({                
                confirm: function (e) {
                    var $word = e.object;
                    me.language.addOption($word);
                    alert('confirm');
                } 
            });
            editPanel.display();
        }
    }).appendTo($(this.buttons));

    this.refreshOptionsPanel();

    this.language.parent.view.append($(this.container));

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
LanguageView.prototype.addOption = function(element) {
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
WeightPanelView.prototype.setValue = function(value) {
    var me = this;
    this.panel.value = value;
    $(this.icons).find('.weight-icon').each(function() {
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
    this.word = this.parent.word;
    this.view = new CategoryPanelView(this);
}
CategoryPanel.prototype.panel = function() {
    return this.view.span;
};
CategoryPanel.prototype.selectCategories = function() {
    var me = this;
    var tree = new Tree({
        'mode': MODE.MULTI,
        'root': my.categories.getRoot(),
        'selected': me.parent.word.categories,
        'blockOtherElements': true,
        'showSelection': true,
        'hidden': true
    });

    tree.reset({ unselect: false, collapse: false });
    tree.eventHandler.bind({
        confirm: function(e) {
            me.parent.word.trigger({
                'type': 'changeCategory',
                'items': e.item
            });
            tree.destroy();
        },
        add: function(e) {
            my.categories.addNew(e);
        },
        remove: function(e) {
            my.categories.remove(e);
        },
        rename: function(e) {
            my.categories.updateName(e);
        },
        transfer: function(e) {
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

    this.parent.word.bind({
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
CategoryPanelView.prototype.refresh = function() {
    $(this.value).html(this.parent.word.categoriesString);
};




function Word(properties) {
    this.language = properties.language;
    this.id = properties.id;
    this.content = properties.content || '';
    this.weight = properties.weight || 1;

    this.view = new WordView(this);

    this.language.view.addOption($(this.view.container));

}
Word.prototype.toHtml = function() {
    var html = '<div class="button delete" title="Delete this option"></div>';
    html += '<div class="button edit" title="Edit this option"></div>';
    html += '<div class="content" data-value="' + this.content + '">';
    html += this.contentToHtml(this.content);
    html += '</div>';
    html += '<div class="weight" data-value="' + this.weight + '">' + this.weight + '</div>';

    return html;

};
Word.prototype.contentToHtml = function() {
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
Word.prototype.isUniqueContent = function(content) {
    return this.language.isUnique(content.trim(), this.id);
};
Word.prototype.update = function(content, weight) {
    this.content = content;
    this.weight = weight;
    this.view.update();
};
Word.prototype.remove = function() {
    this.language.removeOption(this);
    this.view.destroy();
};


function WordView(word) {
    var me = this;
    this.word = word;

    this.container = jQuery('<div/>', { 'class': 'option' });

    this.delete = jQuery('<div/>', {
        'class': 'button delete',
        'title': 'Delete this option'
    }).bind({
        click: function () {
            me.word.remove();
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
                    me.word.update(e.name, e.weight);
                }
            });
            editPanel.display();
        }
    }).appendTo($(this.container));

    this.content = jQuery('<div/>', {
        'class': 'content',
        'data-value': me.word.content,
        'html': me.word.contentToHtml()
    }).appendTo($(this.container));

    this.weight = jQuery('<div/>', {
        'class': 'weight',
        'html': me.word.weight
    }).appendTo($(this.container));

}
WordView.prototype.destroy = function() {
    $(this.container).remove();
};
WordView.prototype.appendTo = function(parent) {
    $(this.container).appendTo($(parent));
};
WordView.prototype.update = function() {
    $(this.content).html(this.word.contentToHtml());
    $(this.weight).html(this.word.weight);
};





function EditPanel(properties) {
    // ReSharper disable once UnusedLocals
    var me = this;
    this.object = properties.object;
    this.minWeight = 1;
    this.maxWeight = 10;
    this.invalid = new HashTable(null);
    this.eventHandler = new EventHandler();

    this.view = new EditPanelView(this);

    this.meta = new EditPanelMeta(this);

    this.buttons = new EditPanelButtons(this);

}
EditPanel.prototype.display = function () {
    this.meta.validate();
    this.view.display();
};
EditPanel.prototype.destroy = function () {
    this.view.destroy();
};
EditPanel.prototype.bind = function (e) {
    this.eventHandler.bind(e);
};
EditPanel.prototype.trigger = function (e) {
    this.eventHandler.trigger(e);
};
EditPanel.prototype.confirm = function (e) {
    //Confirm.
};
EditPanel.prototype.validation = function (validation) {
    if (validation.status) {
        this.invalid.removeItem(validation.id);
    } else {
        this.invalid.setItem(validation.id, validation.id);
    }
    this.checkState();
};
EditPanel.prototype.checkState = function () {
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
EditPanelView.prototype.destroy = function () {
    $(this.background).remove();
};
EditPanelView.prototype.display = function () {
    $(this.background).css({
        'display': 'block'
    });
    this.panel.meta.name.focus();
    //name.focus();
};
EditPanelView.prototype.append = function (element) {
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
        object: me.panel.object
    });

    this.weight = new EditLine(this, {
        property: 'weight',
        label: 'Weight',
        validation: null,
        editable: false,
        value: (new WeightPanel(10, me.panel.object.weight)).view.container,
        object: me.panel.object
    });

}
EditPanelMeta.prototype.append = function (element) {
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
EditPanelMeta.prototype.validate = function () {
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
EditPanelButtons.prototype.enable = function (value) {
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
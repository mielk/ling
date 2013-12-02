var categories = [{
    key: 'A', caption: 'A', expanded: false, items: [
        { key: 'AA', caption: 'AA', expanded: false, items: [] },
        {
            key: 'AB', caption: 'AB', expanded: true, items: [
                { key: 'ABC', caption: 'ABC', expanded: true, items: [] },
                { key: 'ABD', caption: 'ABD', expanded: true, items: [] }
            ]
        },
        { key: 'AC', caption: 'AC', expanded: false, items: [] }
    ]
},
{
    key: 'B', caption: 'B', expanded: false, items: [
        { key: 'BA', caption: 'BA', expanded: false, items: [] },
        { key: 'BB', caption: 'BB', expanded: true, items: [] },
        {
            key: 'BC', caption: 'BC', expanded: false, items: [
                  { key: 'BBC', caption: 'BBC', expanded: true, items: [] },
                  { key: 'BBD', caption: 'BBD', expanded: true, items: [] }
            ]
        },
        { key: 'BD', caption: 'BD', expanded: true, items: [] }
    ]
}];


var categoriesTree = categoriesTree || new TreeView({
        'mode': MODE.MULTI,
        'data': categories,
        'blockOtherElements': true,
        'showSelection': true,
        'hidden' : true
    });


$(function () {

    $('.edit-question').bind({
        'click': function () {
            var id = Number(this.innerHTML);
            if ($.isNumeric(id)) {
                editQuestion(id);
            }
        }
    });

    $('#add-question').bind({
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


function editQuestion(id) {
    var questionJson = getQuestion(id);
    var question = new Question(questionJson, {
                        blockOtherElements: true
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
    var _languages;

    $.ajax({
        url: "/Questions/GetLanguages",
        type: "GET",
        datatype: "json",
        async: false,
        success: function (result) {
            _languages = result;
        },
        error: function (msg) {
            alert(msg.status + " | " + msg.statusText);
        }
    });

    var languages = [];
    for (var i = 0; i < _languages.length; i++){
        var language = _languages[i];
        languages[i] = {
            Language: language,
            Options: []
        }
    }

    return languages;

}


function Question(data, properties) {
    var me = this;
    this.id = data.Question.Id || 0;
    this.name = data.Question.Name || '';
    this.weight = data.Question.Weight || 1;
    this.categories = [];
    this.categoriesString = function () {
        var s = '';
        for (var i = 0; i < me.categories.length; i++) {
            var category = me.categories[i];
            s = s + (s ? '; ' : '') + category.name;
        }
        return s;
    }
    this.languages = createLanguageCollection(data.UserLanguages);
    this.properties = properties || {};


    this.ui = (function () {
        var _background;
        if (me.properties.blockOtherElements) {
            _background = jQuery('<div/>', {
                id: 'question-background',
                'class': 'question-background'
            }).
            css({
                'display': 'none',
                'z-index' : my.ui.addTopLayer()
            }).appendTo($(document.body));
        }

        var _frame = jQuery('<div/>', {
            id: 'question-container-frame',
            'class': 'question-container-frame'
        }).css({
            'display': 'none'
        }).appendTo($(_background || document.body));

        var _container = jQuery('<div/>', {
            id: 'question-container',
            'class': 'question-container'
        }).
        appendTo($(_frame));

        var btnQuit = jQuery('<div/>', {
            id: 'question-container-exit',
            'class': 'question-container-exit'
        }).
        bind({
            'click': function () {
                me.events.trigger({
                    'type': 'cancel'
                });
            }
        }).
        appendTo($(_background || document.body));


        //Place container inside the screen.
        if (me.properties.x !== undefined) {
            _container.css('left', me.properties.x);
        }
        if (me.properties.y !== undefined) {
            _container.css('top', me.properties.y);
        }


        return {
            container: function () {
                return _container;
            },
            close: function () {
                if (_background) {
                    $(_background).remove();
                } else {
                    $(_frame).remove();
                }
            },
            display: function () {
                $(_background).css({
                    'display' : 'block'
                });
                $(_frame).css({
                    'display': 'block'
                });
            }
        }

    })();

    this.events = (function () {
        var _container = jQuery('<div/>', {
            'class': 'events-container'
        }).appendTo(me.ui.container);

        _container.bind({
            cancel: function (e) {
                me.ui.close();
            },
            confirm: function (e) {
                alert('confirm; weight: ' + me.weight);
            },
            changeCategory: function (e) {
                me.categories = e.items;
            }

        });

        return {
            trigger: function (e) {
                _container.trigger(e);
            },
            bind: function(a){
                $(_container).bind(a);
            }
        }

    })();

    this.meta = (function () {

        var _container = jQuery('<div/>', {
            id: 'question-meta-container',
            'class': 'question-meta-container'
        }).appendTo($(me.ui.container()));

        var _events = (function (){

            _container.bind({
                
            });

            return {
                trigger: function (e) {
                    _container.trigger(e);
                }
            }

        })();

        var dataLine = function (properties) {
            var id = properties.property;
            var linked = new HashTable(null);
            var $validation = properties.validation;
            var $container;
            var $value;
            var $error;
            var $errorContainer;
            var $errorIcon;

            (function createGUI() {

                $container = jQuery('<div/>', {
                    'class': 'field-line'
                }).appendTo($(_container));

                var $label = jQuery('<label/>', {
                    'class': 'label',
                    html: properties.label
                }).appendTo(jQuery('<span/>').css({ 'display': 'block', 'float': 'left' }).appendTo($($container)));



                if (properties.validation) {
                    $errorContainer = jQuery('<div/>').addClass('error').appendTo($($container));
                    $error = jQuery('<div/>', {
                        'class': 'error_content'
                    }).appendTo($errorContainer);
                    $errorIcon = jQuery('<span/>', {
                        'class': 'icon'
                    }).appendTo($($container));
                }


                if (properties.right) {
                    $(properties.right).appendTo($container);
                }


                var $timer;
                $value;

                if (properties.value) {
                    $(properties.value).appendTo($($container));
                } else if (properties.editable) {
                    $value = jQuery('<input/>', {
                        'class': 'field default',
                        'type': 'text'
                    })
                    .bind({
                        'keyup': function () {
                            if ($timer) {
                                clearTimeout($timer);
                            }
                            $timer = setTimeout(function () {
                                _validate();
                            }, 150);
                        },
                        'change': function () {
                            _validate();
                        },
                        'mouseup': function (e) {
                            e.preventDefault();
                        }
                    })
                    .on({
                        'focus': function (e) {
                            this.select();
                        }
                    })
                    .val(me[properties.property]);

                    


                    $span = jQuery('<span/>').
                            bind({
                                'click': function () {
                                    $value.focus();
                                }
                            }).
                            appendTo($($container))

                    $value.appendTo($span);

                } else {
                    $value = jQuery('<label/>', {
                        'class': 'value',
                        html: me[properties.property]
                    }).appendTo($($container));
                }


                if (properties.inputCss) {
                    $($value).css(properties.inputCss);
                }

            })();

            function _formatAsValid(){
                $($value).
                    removeClass('invalid').
                    addClass('valid');
                $($errorContainer).css({
                    'visibility': 'hidden'
                });
                $($errorIcon).
                    removeClass('iconInvalid').
                    addClass('iconValid');
            }

            function _formatAsInvalid(){
                $($value).
                    removeClass('valid').
                    addClass('invalid');
                $($errorContainer).css({
                    'visibility': 'visible'
                });
                $($errorIcon).
                    removeClass('iconValid').
                    addClass('iconInvalid');
            }

            function _validate() {

                //Verify linked controls.
                verifyLinked();

                var isValid = $validation({
                    value: _getValue(),
                    id: me.id
                });
                if (isValid === true) {
                    _formatAsValid();
                } else {
                    //Add error message.
                    _formatAsInvalid()
                    $($error).text(isValid);
                }

                me.events.trigger({
                    'type': 'validation',
                    'id': id,
                    'status': (isValid === true ? true : false)
                });

            }

            function verifyLinked() {
                linked.each(
                    function (key, value) {
                        value.validate();
                    }
                );
            }

            function _getValue() {
                return $($value).val();
            }


            (function () {
                if ($validation) {
                    _validate();
                }
            })();


            return {
                getId: function () {
                    return id;
                },
                formatAsValid : function () {
                    _formatAsValid();
                },
                formatAsInvalid: function () {
                    _formatAsInvalid();
                },
                format: function(isValid){
                    if (isValid){
                        _formatAsValid();
                    } else {
                        _formatAsInvalid();
                    }
                },
                addLinked: function (line) {
                    linked.setItem(line.getId(), line);
                },
                validate: function () {
                    _validate();
                },
                getValue: function () {
                    return _getValue();
                }

            }

        };

        var idLine = dataLine({
            property: 'id',
            label: 'ID',
            validation: null,
            editable: false,
            inputCss: { 'width' : '60px', 'text-align' : 'center', 'border' : '1px solid #777'}
        });

        var nameLine = dataLine({
            property: 'name',
            label: 'Name',
            validation: nameChecker.check,
            editable: true
        });

        var weightLine = dataLine({
            property: 'weight',
            label: 'Weight',
            validation: null,
            editable: false,
            value: weightPanel(10, me.weight)
        });

        var categoriesLine = dataLine({
            property: 'categories',
            label: 'Categories',
            validation: null,
            editable: false,
            value: categoriesPanel(),
            right: categoriesEditButton()
        });


        function weightPanel(maxWeight, weight) {
            var CHECKED_CSS_CLASS = "weight-checked";
            var _weight = weight;
            var _maxWeight = maxWeight;

            var _panel = jQuery('<div/>', {
                id: 'weight-panel',
                'class': 'weight-panel'
            });

            var _container = jQuery('<div/>', {
                id: 'weight-container',
                'class': 'weight-container'
            }).appendTo($(_panel));

            for (var i = 0; i < maxWeight; i++) {
                var _icon = jQuery('<div/>', {
                    id: 'weight-container',
                    'class': 'weight-icon' + (i < _weight ? ' weight-checked' : ''),
                    html: (i + 1)
                }).
                bind({
                    'click': function () {
                        me.weight = this.innerHTML * 1;
                        _renderIcons();
                    }
                }).appendTo($(_container));
            }

            function _renderIcons() {
                $(".weight-panel").find(".weight-icon").each(
                    function (key, value) {
                        var i = this.innerHTML * 1;
                        if (i <= me.weight) {
                            $(this).addClass(CHECKED_CSS_CLASS);
                        } else {
                            $(this).removeClass(CHECKED_CSS_CLASS);
                        }
                    }
                );
            }

            return _panel;

        }

        function categoriesPanel(){
            $value = jQuery('<input/>', {
                'class': 'field default',
                'type': 'text'
            })
            .val(me.categoriesString());

            me.events.bind({
                'changeCategory' : function(){
                    _refresh();
                }
            });

            $span = jQuery('<span/>');
            $value.appendTo($span);

            function _refresh(){
                $value.val(me.categoriesString());
            }

            return $span;

        }

        function categoriesEditButton(){
            var $button = jQuery('<div/>', {
                'class': 'expand-button',
                html: '...'
            }).
            bind({
                'click': function () {
                    categoriesTree.reset();
                    categoriesTree.bind({
                        'confirm': function (e) {
                            me.events.trigger({
                                'type': 'changeCategory',
                                'items': e.items
                            });
                        }
                    });
                    categoriesTree.show();
                }
            });
            return $button;
        }

    })();

    this.validator = (function () {
        var _invalid = new HashTable(null);

        me.events.bind({
            'validation': function (e) {
                if (e.status) {
                    _invalid.removeItem(e.id);
                } else {
                    _invalid.setItem(e.id, e.id);
                }
                _checkState();
            }
        });

        function _checkState() {
            if (_invalid.size()) {
                me.buttons.disable();
            } else {
                me.buttons.enable();
            }
        }

    })();

    this.options = (function () {

        var _container = jQuery('<div/>', {
            id: 'question-languages-panel',
            'class': 'question-languages-panel'
        }).appendTo($(me.ui.container()));

        
        for (var i = 0; i < me.languages.length; i++) {
            var language = me.languages[i];
            language.gui.appendTo(_container);
        }

    })();

    this.buttons = (function () {
        var _panel = jQuery('<div/>', {
            id: 'question-buttons-panel',
            'class': 'question-buttons-panel'
        }).appendTo($(me.ui.container()));;

        var _container = jQuery('<div/>', {
            id: 'question-buttons-container',
            'class': 'question-buttons-container'
        }).appendTo($(_panel));

        var _ok = jQuery('<input/>', {
            id: 'question-button-ok',
            'class': 'question-button',
            'type': 'submit',
            'value': 'OK'
        }).
        bind({
            'click': function () {
                me.events.trigger({
                    'type': 'confirm'
                });
            }
        }).appendTo($(_container));

        var _cancel = jQuery('<input/>', {
            id: 'question-button-cancel',
            'class': 'question-button',
            'type': 'submit',
            'value': 'Cancel'
        }).
        bind({
            'click': function () {
                me.events.trigger({
                    'type': 'cancel'
                });
            }
        }).appendTo($(_container));

        return {
            disable: function () {
                $(_ok).attr('disabled', 'disabled');
            },
            enable: function () {
                $(_ok).removeAttr('disabled');
            }
        }

    })();

    //==============================================

    function createLanguageCollection(languages) {
        var arr = [];
        for (var i = 0; i < languages.length; i++){
            var languageJson = languages[i];
            arr[i] = new Language({
                id:   languageJson.Language.Id,
                name: languageJson.Language.Name,
                flag: languageJson.Language.Flag,
                options: languageJson.Options
            });
        }

        return arr;

    }

}




function Language(properties) {
    var me = this;
    this.id = properties.id;
    this.name = properties.name;
    this.flag = properties.image;
    
    this.gui = (function () {
        var isCollapsed = false;
        var $container;
        var $options;
        var $buttons;

        (function createGUI() {
            $container = jQuery('<div/>', {
                id: 'language_' + me.name,
                'class': 'language'
            });

            var $info = jQuery('<div/>', {
                'class': 'info'
            }).appendTo($($container));


            var $collapse = jQuery('<div/>', {
                'class': 'collapse'
            })
            .bind({
                'click': function () {
                    if (isCollapsed === true) {
                        _expand();
                    } else {
                        _collapse();
                    }
                }
            })
            .appendTo($($info));

            var $flag = jQuery('<div/>', {
                'class': 'flag',
            }).css({
                'background-image': me.flag
            }).appendTo($($info));

            var $name = jQuery('<div/>', {
                'class': 'name',
                'html': me.name
            }).appendTo($($info));


            //Options.
            $options = jQuery('<div/>', {
                'class': 'options'
            }).appendTo($($container));




            //Buttons.
            $buttons = jQuery('<div/>', {
                'class': 'buttons'
            }).appendTo($($container));

            var $add = jQuery('<div/>', {
                'class': 'button add',
                html: 'Add'
            }).
            bind({
                'click': function () {
                    var option = new Option({
                        'language' : me
                    });
                    var editPanel = new EditPanel({
                        'option' : option
                    });
                    editPanel.bind({
                        'confirm': function (e) {
                            var option = e.option;
                            option.id = e.name;
                            option.update(e.name, e.weight);
                            option.draw();
                            me.options.setItem(option.id, option);
                        }
                    });
                    editPanel.display();
                    //Tworzenie nowej opcji
                    //var option = new PreOption(me, ++me.optionNum);
                    //Edit panel.
                }
            }).appendTo($($buttons));

        })();

        function _collapse() {
            isCollapsed = true;
            $($options).css({
                'display': 'none'
            });
            $($buttons).css({
                'display': 'none'
            });
        }

        function _expand() {
            isCollapsed = false;
            _refreshOptionsPanel();
            $($buttons).css({
                'display': 'block'
            });
        }

        function _refreshOptionsPanel() {
            $($options).css({
                'display': (me.options.size() === 0 ? 'none' : 'block')
            });
        }

        return {
            collapse: function () {
                _collapse();
            },
            expand: function () {
                _expand();
            },
            appendTo: function (parent) {
                $container.appendTo($(parent));
            },
            container: function(){
                return $container;
            },
            addOption: function (optionContainer) {
                $(optionContainer).appendTo($($options));
            },
            removeOption: function () {

            },
            refreshOptionsPanel: function () {
                _refreshOptionsPanel();
            }
        }

    })();

    this.options = createOptionsSet(properties.options);
    this.gui.refreshOptionsPanel();

    //=========================================
    function createOptionsSet(options) {
        var _ = new HashTable(null);
        for (var i = 0; i < options.length; i++) {
            var optionJson = options[i];
            var option = new Option({
                id: optionJson.Id,
                content: optionJson.Content,
                questionId: optionJson.QuestionId,
                weight: optionJson.Weight,
                language: me
            });
            _.setItem(option.id, option);
            option.draw();
        }

        return _;

    }

}
Language.prototype.removeOption = function (option) {
    this.options.removeItem(option.id);
    this.gui.refreshOptionsPanel();
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





function Option(properties) {
    var me = this;
    this.id = properties.id;
    this.language = properties.language;
    this.content = properties.content || '';
    this.weight = properties.weight || 1;



    this.gui = (function () {
        var _container = jQuery('<div/>', {
            'class': 'option'
        });

        var _content;
        var _weight;

        (function createGUI() {
            var _delete = jQuery('<div/>', {
                'class': 'button delete',
                'title': 'Delete this option'
            }).bind({
                click: function (e) {
                    me.remove();
                }
            }).appendTo($(_container));

            var _edit = jQuery('<div/>', {
                'class': 'button edit',
                'title': 'Edit this option'
            }).bind({
                click: function (e) {
                    var editPanel = new EditPanel({
                        'option': me
                    });
                    editPanel.bind({
                        'confirm': function (e) {
                            me.update(e.name, e.weight);
                        }
                    });
                    editPanel.display();
                }
            }).appendTo($(_container));

            _content = jQuery('<div/>', {
                'class': 'content',
                'data-value': me.content,
                'html': contentToHtml()
            }).appendTo($(_container));

            _weight = jQuery('<div/>', {
                'class': 'weight',
                'html': me.weight
            }).appendTo($(_container));

        })();

        return {
            remove: function () {
                _container.remove();
            },
            appendTo: function (parent) {
                _container.appendTo($(parent));
            },
            container: function () {
                return _container;
            },
            draw: function () {
                me.language.gui.addOption(_container);
            },
            update: function () {
                $(_content).html(contentToHtml(me.content));
                $(_weight).html(me.weight);
            }
        }

    })();

    function contentToHtml() {
        var replaced = me.content.replace(/\[/g, '|$').replace(/\]/g, '|');
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

    }

    function toHtml() {
        var html = '<div class="button delete" title="Delete this option"></div>';
        html += '<div class="button edit" title="Edit this option"></div>';
        html += '<div class="content" data-value="' + me.content + '">';
        html += contentToHtml(me.content);
        html += '</div>';
        html += '<div class="weight" data-value="' + me.weight + '">' + me.weight + '</div>';

        return html;

    }

}

Option.prototype.isUniqueContent = function (content) {
    return this.language.isUnique(content.trim(), this.name);
}
Option.prototype.update = function (content, weight) {
    this.content = content;
    this.weight = weight;
    this.gui.update();
}
Option.prototype.remove = function () {
    this.language.removeOption(this);
    this.gui.remove();
}
Option.prototype.draw = function () {
    this.gui.draw();
}





var nameChecker = (function () {
    var nameExists = false;

    function _check(params) {
        var MAX_LENGTH = 255;
        var name = params.value;
        var id = params.id;

        if (!name) {
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
            url: "/Questions/CheckName",
            type: "post",
            data: JSON.stringify({
                name: name,
                id: id
            }),
            contentType: "application/json; charset=utf-8",
            datatype: "json",
            async: false,
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
            return _check(params);
        }
    }

})();




Question.prototype.displayEditForm = function () {
    this.ui.display();
}






function EditPanel(properties) {
    this.MIN_WEIGHT = 1;
    this.MAX_WEIGHT = 10;
    var me = this;
    this.option = properties.option;

    this.gui = (function () {
        var $background = jQuery('<div/>', {
                id: 'edit-option-background',
                'class': 'question-background'
            }).
            css({
                'display': 'none',
                'z-index': my.ui.addTopLayer()
            }).appendTo($(document.body));

        var $events = jQuery('<div/>', {
            'class': 'events-container'
        }).bind({
            'confirm': function () {
                me.destroy();
            }
        }).appendTo($background);

        var $container = jQuery('<div/>', {
                'class': 'edit-container'
            }).
            css({
                'z-index': my.ui.addTopLayer()
            }).appendTo($($background));

        var $frame = jQuery('<div/>', {
            'class': 'relative'
        }).appendTo($($container));


        var $close = jQuery('<div/>', {
            'class': 'edit-close'
        })
        .bind({
            'click': function () {
                me.destroy();
            }
        })
        .appendTo($($frame));


        var name = (function () {
            var timer;

            var _container = jQuery('<div/>', {
                'class': 'line'
            }).appendTo($($frame));

            var $label = jQuery('<div/>', {
                'class': 'label',
                html: 'Name'
            }).appendTo($(_container));

            var $error = jQuery('<div/>', {
                'class': 'error'
            }).appendTo($(_container));

            var $errorContent = jQuery('<div/>', {
                'class': 'error-content'
            }).appendTo($($error));

            var $statusIcon = jQuery('<span/>', {
                'class': 'icon'
            }).appendTo($(_container));

            var $textbox = jQuery('<input/>', {
                'type': 'text',
                'class': 'default'
            }).bind({
                'keyup': function () {
                    if (timer) {
                        clearTimeout(timer);
                    }
                    timer = setTimeout(function () {
                        me.validateName();
                    }, 150);
                },
                'change': function () {
                    me.validateName();
                },
                'mouseup': function (e) {
                    e.preventDefault();
                }
            }).
            on({
                'focus': function (e) {
                    this.select();
                }
            })
            .val(me.option.content)
            .focus()
            .appendTo(jQuery('<span/>').
                bind({
                    'click': function () {
                        $textbox.focus();
                    }
                }).appendTo($(_container)));


            function _valid(){
                $($error).css({ 'visibility': 'hidden' });
                $($statusIcon).removeClass('iconInvalid').addClass('iconValid');
                $($textbox).removeClass('invalid').addClass('valid');
                buttons.enable();
                
            }

            function _invalid(msg) {
                $($errorContent).text(msg);
                $($error).css({ 'visibility': 'visible' });
                $($statusIcon).removeClass('iconValid').addClass('iconInvalid');
                $($textbox).removeClass('valid').addClass('invalid');
                buttons.disable();
            }

            return {
                value: function () {
                    return $($textbox).val();
                },
                valid: function () {
                    _valid();
                },
                invalid: function (msg) {
                    _invalid(msg);
                },
                focus: function () {
                    $($textbox).focus();
                }
            }

        })();

        var weight = (function () {
            var CHECKED_CSS_CLASS = "weight-checked";
            var _value = me.option.weight;

            var _container = jQuery('<div/>', {
                'class': 'line'
            }).appendTo($($frame));

            var $label = jQuery('<div/>', {
                'class': 'label',
                html: 'Weight'
            }).appendTo($(_container));

            var iconsContainer = jQuery('<div/>', {
                'class': 'weight-icons-container'
            }).bind({
                'clickIcon': function (e) {
                    $($textbox).val(e.weight);
                }
            }).appendTo($(_container));

            var icons = jQuery('<div/>', {
                'class': 'weight-icons'
            }).bind({
                'changeValue': function (e) {
                    if (e.weight !== me.value) {
                        _setValue(e.weight);
                    }
                },
                'clickIcon': function (e) {
                    _setValue(e.weight);
                }
            }).appendTo($(iconsContainer));

            for (var i = me.MIN_WEIGHT - 1; i < me.MAX_WEIGHT; i++){
                var icon = jQuery('<div/>', {
                    'id': i,
                    'class': 'weight-icon',
                    html: i + 1
                }).bind({
                    'click': function (e) {
                        $(icons).trigger({
                            'type': 'clickIcon',
                            'weight': (this.id * 1 + 1)
                        });
                    }
                }).appendTo($(icons));
            }


            function _setValue(value) {
                _value = value;
                var cls = CHECKED_CSS_CLASS;
                $('.weight-icon').each(function () {
                    var $value = $(this).html() * 1;
                    if ($value <= value * 1) {
                        $(this).addClass(cls);
                    } else {
                        $(this).removeClass(cls);
                    }
                });
            }

            var $textbox = jQuery('<input/>', {
                'type': 'text',
                'class': 'default centered'
            }).bind({
                'change': function () {
                    var value = Math.min(Math.max(me.MIN_WEIGHT, $(this).val() * 1), me.MAX_WEIGHT);
                    $(this).val(value);
                    $(icons).trigger({
                        'type': 'changeValue',
                        'weight': value
                    });
                }
            }).on({
                'focus': function (e) {
                    this.select();
                }
            })
            .val(me.option.weight)
            .appendTo(jQuery('<span/>').
                bind({
                    'click': function () {
                        $($textbox).focus();
                    }
                }).appendTo($(_container)));

            _setValue(me.option.weight);


            return {
                value: function () {
                    return $($textbox).val();
                }
            }

        })();

        var buttons = (function (){
            var _container = jQuery('<div/>', {
                'class': 'line'
            }).appendTo($($frame));

            var _frame = jQuery('<div/>', {
                'class': 'edit-buttons'
            }).appendTo($(_container));

            var _ok = jQuery('<input/>', {
                'type': 'submit',
                'value': 'Confirm',
                'class': 'question-button'
            }).bind({
                'click': function () {
                    $events.trigger({
                        'type' : 'confirm',
                        'name': name.value(),
                        'weight': weight.value(),
                        'option': me.option
                    });
                }
            }).appendTo($(_frame));

            var _cancel = jQuery('<input/>', {
                'type': 'submit',
                'value': 'Cancel',
                'class': 'question-button'
            }).bind({
                'click': function () {
                    me.destroy();
                }
            }).appendTo($(_frame));

            function _enable() {
                $(_ok).removeAttr('disabled');
            }

            function _disable() {
                $(_ok).attr('disabled', 'disabled');
            }

            return {
                enable: function () {
                    _enable();
                },
                disable: function () {
                    _disable();
                }
            }

        })();

        return {
            destroy: function () {
                $($background).remove();
            },
            display: function () {
                $($background).css({
                    'display' : 'block'
                });
                name.focus();
            },
            name: function () {
                return name;
            },
            weight: function () {
                return weight;
            },
            trigger: function (e) {
                $events.trigger(e);
            },
            bind: function(a){
                $events.bind(a);
            }
        }

    })();

    this.validateName = function () {
        var name = me.gui.name().value();
        var isValid = isValidName(name);

        if (isValid === true) {
            me.gui.name().valid();
        } else {
            me.gui.name().invalid(isValid);
        }

    }

    function isValidName(name) {
        if (name.length === 0) {
            return MessageBundle.get(dict.NameCannotBeEmpty);
        } else if (!me.option.isUniqueContent(name)) {
            return MessageBundle.get(dict.NameAlreadyExists);
        } else {
            return true;
        }
    }

    this.getName = function () {
        return me.gui.name().value();
    }
    this.getWeight = function () {
        return me.gui.weight().value();
    }

}
EditPanel.prototype.display = function () {
    this.validateName();
    this.gui.display();
}
EditPanel.prototype.destroy = function () {
    this.gui.destroy();
}
EditPanel.prototype.bind = function(e){
    this.gui.bind(e);
}
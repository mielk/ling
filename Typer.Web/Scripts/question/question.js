$(function () {
    $('.edit-question').bind({
        'click': function () {
            var id = Number(this.innerHTML);
            if ($.isNumeric(id)) {
                editQuestion(id);
            }
        }
    });

    var questionJSON = getQuestion(1);
    var question = new Question(questionJSON, {
                            blockOtherElements: true
                        });
    question.displayEditForm();

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


function Question(data, properties) {
    var me = this;
    this.id = data.Id;
    this.name = data.Name;
    this.properties = properties || {};


    this.ui = (function () {
        var _background;
        if (me.properties.blockOtherElements) {
            _background = jQuery('<div/>', {
                id: 'question-background',
                'class': 'question-background'
            }).
            css({
                'display' : 'none'
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
                alert('confirm');
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


                var $timer;
                $value;
                if (properties.editable) {
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
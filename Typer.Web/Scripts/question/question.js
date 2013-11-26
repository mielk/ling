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
    this.id = data.id;
    this.name = data.name;
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
            }
        });

        return {
            trigger: function (e) {
                _container.trigger(e);
            }
        }

    })();

    this.main = (function () {

    })();

}

Question.prototype.displayEditForm = function () {
    this.ui.display();
}
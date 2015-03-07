function TestController(params) {

    'use strict';

    var self = this;
    self.TestController = true;
    self.userId = params.userId;
    self.baseLanguage = params.baseLanguage;
    self.learnedLanguage = params.learnedLanguage;

    self.events = mielk.eventHandler();

    self.queries = mielk.hashTable();
    self.currentQuery = undefined;
    self.answerStatus = false;
    self.left = 0;
    self.done = 0;
    self.correct = 0;

    //Controls
    self.leftControl = $('#test-left')[0];
    self.doneControl = $('#test-done')[0];
    self.correctControl = $('#test-correct')[0];
    self.resultControl = $('#test-result')[0];
    self.questionControl = $('#test-question')[0];
    self.answerControl = $('#test-answer-text')[0];
    self.correctAnswers = $('#test-correct-answers')[0];

    //Bind events.
    $(self.answerControl).bind({
        keypress: function (e) {

            if (e.which === 13) {

                var value = e.target.value;

                //Check if answer is given at all.
                if (value.trim().length) {
                    self.answerStatus = true;
                    self.checkAnswer(value);
                    $(self.correctAnswers).focus();
                }

            }

        }
    });


    $(self.correctAnswers).bind({
        keypress: function (e) {
            self.runTest();
        }
    });


}

TestController.prototype = {

    trigger: function (e) {
        this.events.trigger(e);
    }

    , bind: function (e) {
        this.events.bind(e);
    }

    , loadQueries: function () {
        var self = this;

        mielk.db.fetch('Test', 'GetQueries', {
              'userId': 1
            , 'baseLanguage': 1
            , 'learnedLanguage': 2
        }, {
            async: true,
            cache: false,
            callback: function (result) {
                self.createQueries(result.queries);
                self.runTest();
            },
            errorCallback: function () {
                alert(error);
            }
        });

    }

    , createQueries: function (data) {
        var self = this;

        mielk.arrays.each(data, function (item) {
            var query = new UserQuery(item);
            self.queries.setItem(query.QuestionId, query);
            self.left += query.ToDo;
        });

        self.refreshView();

    }

    , refreshView: function () {
        var self = this;
        $(self.leftControl).html(self.left);
        $(self.doneControl).html(self.done);
        $(self.correctControl).html(self.correct);
        $(self.resultControl).html(self.done > 0 ?
            Math.floor((self.correct / self.done) * 100)
            : '-');

    }

    , runTest: function () {
        var self = this;
        var query = self.drawQuery();
        query.bind({
              answered: function (e) {
                alert('answered');
              }
            , loaded: function (e) {
                self.currentQuery = e.query;
                $(self.questionControl).
                    css({
                        'display': 'block'
                    }).
                    html(e.displayed);

                //Prepare for a new query.
                self.answerStatus = false;
                self.clearAnswer();
                self.clearCorrectAnswers();
                $(self.answerControl).focus();

            }

        });
        query.ask();

    }

    , drawQuery: function() {
        var self = this;
        var number = Math.floor(Math.random() * self.left) + 1;
        var total = 0;
        var query;

        self.queries.each(function (key, value) {

            if (!query) {
                total += value.ToDo;
                if (total >= number) {
                    query = value;
                    return;
                }
            }

        });
        
        return query;

    }

    , checkAnswer: function (value) {
        var self = this;
        var isCorrect = self.currentQuery.checkAnswer(value);

        //Update stats.
        self.done++;
        if (isCorrect) {
            self.correct++;
            self.left--;
        } else {
            self.left++;
        }
        self.refreshView();


        //Highlight [Answer] textbox depending on the result.
        $(self.answerControl).addClass(isCorrect ? 'correct' : 'incorrect');

        //Display correct results in [Answer] textbox.
        self.currentQuery.showCorrectAnswers();

        //Send results to the database.
        self.currentQuery.saveAnswer(isCorrect);

    }

    , clearCorrectAnswers: function () {
        var container = $('#test-correct-answers')[0];

        $(container).empty();
        $(container).css({
            'display': 'none'
        });

    }

    , clearAnswer: function () {
        var self = this;

        $(self.answerControl).
            html('').
            removeClass('correct').
            removeClass('incorrect');

    }

}






function UserQuery(params) {

    'use strict';

    var self = this;
    self.UserQuery = true;
    self.UserId = params.UserID;
    self.QuestionId = params.QuestionID;
    self.BaseLanguage = params.BaseLanguage;
    self.LearnedLanguage = params.LearnedLanguage;
    self.Counter = params.Counter;
    self.Correct = params.CorrectAnswers;
    self.Last50 = params.Last50;
    self.ToDo = params.ToDo;

    self.events = mielk.eventHandler();

    self.displayed = '';
    self.correct = [];
    self.loaded = false;

}

UserQuery.prototype = {

    trigger: function (e) {
        this.events.trigger(e);
    }

    , bind: function (e) {
        this.events.bind(e);
    }

    , ask: function () {
        var self = this;

        mielk.db.fetch('Questions', 'GenerateQuery', {
            'questionId': self.QuestionId
            , 'baseLanguage': self.BaseLanguage
            , 'learnedLanguage': self.LearnedLanguage
        }, {
            async: true,
            cache: false,
            callback: function (result) {
                self.displayed = result.displayed;
                self.correct = result.correct;
                self.trigger({
                    type: 'loaded'
                    , query: self
                    , displayed: self.displayed
                    , correct: self.correct
                });
            },
            errorCallback: function (error) {
                alert(error);
            }
        });

    }

    , checkAnswer: function (value) {
        var self = this;
        var comparisonValue = value.trim().toUpperCase();

        for (var i = 0; i < self.correct.length; i++) {
            var correctValue = self.correct[i].trim().toUpperCase();

            if (comparisonValue === correctValue) {
                return true;
            }

        }

        return false;

    }

    , showCorrectAnswers: function () {
        var self = this;
        var container = $('#test-correct-answers')[0];

        mielk.arrays.each(self.correct, function (item) {
            var ctrl = jQuery('<div/>', {
                  'class': 'correct-line'
                , 'html': item
            }).appendTo(container);
        });

        $(container).css({
            'display': 'block'
        });


    }

    , saveAnswer: function (result) {
        var self = this;
        self.Counter++;
        if (result) {
            self.Correct++;
            self.ToDo--;
        } else {
            self.ToDo++;
        }
        self.Last50 = ((result ? 1 : 0) + self.Last50).substring(0, 50);


        //Send answer details to server.
        mielk.db.fetch('Test', 'SaveAnswer', {
            'questionId': self.QuestionId
            , 'userId': self.UserId
            , 'baseLanguage': self.BaseLanguage
            , 'learnedLanguage': self.LearnedLanguage
            , 'counter': self.Counter
            , 'correct': self.Correct
            , 'last50': self.Last50
            , 'toDo': self.ToDo
        }, {
            async: true,
            cache: false,
            callback: function (result) {
                mielk.notify.display('saved', true);
            },
            errorCallback: function (error) {
                mielk.notify.display(error, false);
            }
        });


    }

};
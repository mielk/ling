/*
 * Previous query
 *
 * Date: 2014-05-14 15:49
 *
 */
function PreviousQuery(controller, params) {

    'use strict';

    var self = this;

    //Class signature.
    self.PreviousQuery = true;

    //Instance properties.
    self.controller = controller;
    self.query = params.query;
    self.givenAnswer = params.givenAnswer;
    self.isCorrect = params.isCorrect;


    //UI controls.
    self.ui = (function () {
        var container = jQuery('<div/>', {
            'class': 'previous-query-container'
        });
        container.addClass(self.isCorrect ? 'previous-query-correct' : 'previous-query-incorrect');

        var metadataContainer = jQuery('<div/>', {
            'class': 'previous-query-metadata-container'
        }).appendTo(container);

        var questionSubpanel = jQuery('<div/>', {
            'class': 'previous-query-metadata-subpanel previous-query-question',
            'html': self.query.displayed
        }).appendTo(metadataContainer);

        var correctAnswersSubpanel = jQuery('<div/>', {
            'class': 'previous-query-metadata-subpanel'
        }).appendTo(metadataContainer);

        var editIcon = jQuery('<div/>', {
            'class': 'previous-query-edit-icon'
        }).appendTo(metadataContainer);


        //Correct answers.
        var correctAnswersCounter = self.query.correct;
        var maxCorrectAnswersDisplayed = 2;
        for (var i = 0; i < Math.min(self.query.correct.length, maxCorrectAnswersDisplayed); i++) {
            var correctAnswer = jQuery('<div/>', {
                'class': 'previous-query-correct-answer',
                'html': self.query.correct[i]
            }).appendTo(correctAnswersSubpanel);
        }
        if (correctAnswersCounter > maxCorrectAnswersDisplayed) {
            var correctAnswer = jQuery('<div/>', {
                'class': 'previous-query-correct-answer previous-query-other-correct',
                'html': 'i ' + (correctAnswersCounter - maxCorrectAnswersDisplayed) + ' innych odpowiedzi'
            }).appendTo(correctAnswersSubpanel);
        }
        

        var myAnswersContainer = jQuery('<div/>', {
            'class': 'previous-query-my-answer-container'
        }).appendTo(container);

        var myAnswerLabel = jQuery('<div/>', {
            'class': 'previous-query-my-answer',
            'html': self.givenAnswer
        }).appendTo(myAnswersContainer);


        var statsContainer = jQuery('<div/>', {
            'class': 'previous-query-stats-container'
        }).appendTo(container);

        var questionsCounterIcon = jQuery('<div/>', {
            'class': 'previous-query-start-icon query-counter-icon'
        }).appendTo(statsContainer);

        var questionsCounterValue = jQuery('<div/>', {
            'class': 'query-stat-value',
            'html': self.query.Counter
        }).appendTo(statsContainer);

        var correctAnswersCounterIcon = jQuery('<div/>', {
            'class': 'previous-query-start-icon query-correct-counter-icon'
        }).appendTo(statsContainer);

        var correctAnswersCounterValue = jQuery('<div/>', {
            'class': 'query-stat-value',
            'html': self.query.Correct
        }).appendTo(statsContainer);

        var incorrectAnswersCounterIcon = jQuery('<div/>', {
            'class': 'previous-query-start-icon query-incorrect-counter-icon'
        }).appendTo(statsContainer);

        var incorrectAnswersCounterValue = jQuery('<div/>', {
            'class': 'query-stat-value',
            'html': (self.query.Counter - self.query.Correct)
        }).appendTo(statsContainer);

        var correctnessValue = jQuery('<div/>', {
            'class': 'query-stat-value query-correct-percent',
            'html': (100 * self.query.Correct / self.query.Counter).toFixed(1) + '%'
        }).appendTo(statsContainer);


        editIcon.bind({
            click: function () {
                var questionId = self.query.QuestionId;
                var query = new Query(Ling.Queries.getQuery(questionId));
                query.bind({
                    confirm: function (e) {
                        self.controller.runTest();
                    },
                    cancel: function (e) {
                        self.controller.runTest();
                    }
                });
                query.edit();
            }
        });


        var parentContainer = controller.previousQueriesContainer;
        $(parentContainer).prepend(container);

        return {
            view: container
        };

    })();

}
mielk.objects.addProperties(PreviousQuery.prototype, {

    remove: function () {
        this.ui.view.remove();
    }

});
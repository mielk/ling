$(function () {

    var tc = new TestController({
          userId: 1
        , baseLanguage: 1
        , learnedLanguage: 2
    });

    tc.loadQueries();

});
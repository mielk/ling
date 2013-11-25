$(function () {
    var questionJSON = loadQuestion(1);
    alert('done');
});

function loadQuestion(questionId) {
    var question;

    $.ajax({
        url: "/Questions/GetQuestion",
        type: "GET",
        //data: JSON.stringify({
        //    id: questionId
        //}),
        data: { 'id': questionId },
        datatype: "json",
        async: false,
        success: function (result) {
            alert(result);
        },
        error: function (msg) {
            alert(msg.status + " | " + msg.statusText);
        }
    });

}
my.categories = my.categories || {
    root : getRoot()
}

function getRoot(){
    var root;

    $.ajax({
        url: "/Categories/GetCategories",
        type: "GET",
        datatype: "json",
        async: false,
        success: function (result) {
            root = result;
        },
        error: function (msg) {
            alert(msg.status + " | " + msg.statusText);
        }
    });

    return root;

}

$(function () {

    //$.noty.defaults = {
    //    layout: 'bottomRight',
    //    theme: 'defaultTheme',
    //    type: 'alert',
    //    text: 'notification',
    //    dismissQueue: true, // If you want to use queue feature set this true
    //    template: '<div class="noty_message"><span class="noty_text"></span><div class="noty_close"></div></div>',
    //    animation: {
    //        open: { height: 'toggle' },
    //        close: { height: 'toggle' },
    //        easing: 'swing',
    //        speed: 500 // opening & closing animation speed
    //    },
    //    timeout: false, // delay for closing event. Set false for sticky notifications
    //    force: false, // adds notification to the beginning of queue when set to true
    //    modal: false,
    //    maxVisible: 5, // you can set max visible notification for dismissQueue true option
    //    closeWith: ['click'], // ['click', 'button', 'hover']
    //    callback: {
    //        onShow: function () { },
    //        afterShow: function () { },
    //        onClose: function () { },
    //        afterClose: function () { }
    //    },
    //    buttons: false // an array of buttons
    //};

    var n = noty({ text: 'noty - a jquery notification library!' });

});
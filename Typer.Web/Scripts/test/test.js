﻿$(function () {

    var container = $('#parent')[0];

    var spinner = new SpinnerWrapper(container);

    $(container).bind({
        click: function() {
            spinner.stop();
        }
    });

    

});
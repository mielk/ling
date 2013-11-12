$(document).ready(function () {
    adjustPlaceholder();
    setFocusForUsernameControl();
});


function adjustPlaceholder() {
    var supported = Modernizr.input.placeholder;
    $("#account label").css({ 'display' : (supported ? 'none' : 'block') });
}

function setFocusForUsernameControl() {
    $("#Username").focus();
}
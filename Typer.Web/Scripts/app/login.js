$(document).ready(function () {
    adjustPlaceholder();
});

function adjustPlaceholder() {
    var supported = Modernizr.input.placeholder;
    $("#account label").css({ 'display' : (supported ? 'none' : 'block') });
}
$(document).ready(function () {
    adjustPlaceholder();
});

function adjustPlaceholder() {
    var supported = Modernizr.input.placeholder;
    $("#account label").css({ 'display': (supported ? 'none' : 'block') });
}


var userRegistrator = (function () {

    //Confirmation button.
    var registerButton = $("btnRegister")[0];

    //Properties.
    var username = "";
    var password = "";
    var confirmPassword = "";
    var email = "";
    var country = "";

    //HTML fields.
    var controls = {
        username: $("Username")[0],
        password: $("Password")[0],
        confirmPassword: $("ConfirmPassword")[0],
        email: $("Email")[0],
        country: $("Country")[0]
    }
    

    (function applyRequiredStyle() {
        alert(100);
    })();


    return {

        setUsername: function (username) {

        }

    }

})();
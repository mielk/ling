$(document).ready(function () {
    adjustPlaceholder();
    model();
});

function adjustPlaceholder() {
    var supported = Modernizr.input.placeholder;
    $("#account label").css({ 'display': 'block' });
}




var model = function (){

    //Confirmation button.
    var btn = $("#btnRegister")[0];

    //Inactive controls.
    var inactive = new HashTable(null);

    //Control groups.
    var controls = new HashTable(null);
    controls.setItem('username', new ControlGroup('div_username', checkUsername));
    controls.setItem('password', new ControlGroup('div_password', checkPassword));
    


    

    function isValid() {
        return (inactive.size() > 0 ? false : true);
    }

    function checkState() {
        alert("Not implemented yet.");
    }




    return {

        getControlGroup: function (name) {
            return controls.getItem(name);
        },

        addToInactive: function (control) {
            inactive.setItem(control, true);
        },

        removeFromInactive: function (control) {
            inactive.removeItem(control);
        }

    }



};




function ControlGroup(id, fn) {
    var me = this; //To be used in events binding.

    this.container = $('#' + id)[0];

    this.getControl = function(selector){
        return $(this.container).find('.' + selector)[0];
    }

    this.formatAsValid = function () {
        alert('valid');
    }

    this.formatAsInvalid = function () {
        alert('invalid');
    }

    //Bind change event to value control.
    $(this.getValueControl()).bind({
        'change': function () {
            var isValid = fn(me.getValue());
            me.format(isValid);
        }
    });

}
ControlGroup.prototype.getContainer = function () {
    return this.container;
}
ControlGroup.prototype.getValueControl = function () {
    return this.getControl('default');
}
ControlGroup.prototype.getStateIconControl = function () {
    return this.getControl('icon');
}
ControlGroup.prototype.getErrorControl = function () {
    return this.getControl('error');
}
ControlGroup.prototype.getValue = function () {
    var ctrl = $(this.getValueControl());
    return ctrl.val();
}
ControlGroup.prototype.format = function (isValid) {
    if (isValid) {
        this.formatAsValid();
    } else {
        this.formatAsInvalid();
    }
}






function checkUsername(username) {
    alert('checkUsername for ' + username);
    return true;
}

function checkPassword(password) {
    alert('checkPassword for ' + password);
    return false;
}

function checkIfPasswordsMatch(password, confirmPassword) {

}

function checkMail(mail) {

}

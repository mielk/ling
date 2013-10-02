$(document).ready(function () {
    //$(document).bind({
    //    'keydown': function (e) {
    //        $('#ConfirmPassword').text(e.target);
    //    }
    //});

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
    controls.setItem('mail', new ControlGroup('div_mail', checkMail));

    controls.each(
        function (key, value) {
            $(value.getContainer()).bind({
                'validation': function (e) {
                    validation(e.id, e.status);
                }
            });
            value.validate();
        }
    );
    

    function isValid() {
        return (inactive.size() > 0 ? false : true);
    }

    function checkState() {
        if (isValid()) {
            $(btn).removeAttr('disabled');
        } else {
            $(btn).attr('disabled','disabled');
        }
    }

    function validation(id, value) {
        if (value) {
            inactive.removeItem(id);
        } else {
            inactive.setItem(id, id);
        }
        checkState();
    }


};




function ControlGroup(_id, _fn) {
    var me = this; //To be used in events binding.

    this.id = _id;
    this.container = $('#' + _id)[0];

    this.getControl = function(selector){
        return $(this.container).find('.' + selector)[0];
    }

    this.formatAsValid = function () {
        $(this.getValueControl()).
            removeClass('invalid').
            addClass('valid');
        $(this.getErrorControl()).css({
            'visibility': 'hidden'
        });
        $(this.getStateIconControl()).
            removeClass('iconInvalid').
            addClass('iconValid');
    }

    this.formatAsInvalid = function () {
        $(this.getValueControl()).
            removeClass('valid').
            addClass('invalid');
        $(this.getErrorControl()).css({
            'visibility': 'visible'
        });
        $(this.getStateIconControl()).
            removeClass('iconValid').
            addClass('iconInvalid');
    }

    this._validate = function () {
        var isValid = _fn(me.getValue());
        if (isValid === true) {
            me.format(true);
        } else {
            //Add error message.
            me.format(false);
            $(me.getErrorTextField()).text(isValid);
        }

        $(me.container).trigger({
            type: 'validation',
            id: me.id,
            status: (isValid === true ? true : false)
        });

    }


    //Bind change event to value control.
    $(this.getValueControl()).bind({
        'keyup': function () {
            me._validate();
        },
        'change': function () {
            me._validate();
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
ControlGroup.prototype.getErrorTextField = function () {
    return this.getControl('error_content');
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
ControlGroup.prototype.validate = function () {
    this._validate();
}




/*
 * Username must have 6-20 characters. Only letters,
 * digits and underscore are accepted.
 */
function checkUsername(username) {
    var MIN_LENGTH = 5;
    var MAX_LENGTH = 20;

    if (!username) {
        return MessageBundle.get(dict.UsernameCannotBeEmpty);
    } else if (username.length < MIN_LENGTH) {
        return MessageBundle.get(dict.UsernameMustBeLongerThan, [MIN_LENGTH]);
    } else if (username.length > MAX_LENGTH) {
        return MessageBundle.get(dict.UsernameCannotBeLongerThan, [MAX_LENGTH]);
    } else if (!text.isLetter(username.charAt(0))) {
        return MessageBundle.get(dict.UsernameMustStartWithLetter);
    } else if (!text.containLettersNumbersUnderscore(username)) {
        return MessageBundle.get(dict.UsernameContainsIllegalChar);
    } else {
        return true;
    }

}

function checkPassword(password) {
    return true;
}

function checkIfPasswordsMatch(password, confirmPassword) {

}

function checkMail(mail) {
    if (!mail) {
        return MessageBundle.get(dict.MailCannotBeEmpty);
    } else if (!text.isValidMail(mail)) {
        return MessageBundle.get(dict.IllegalMailFormat);
    } else {
        return true;
    }
}


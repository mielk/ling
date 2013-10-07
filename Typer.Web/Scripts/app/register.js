﻿var model;

$(document).ready(function () {
    adjustPlaceholder();
    setFocusForUsernameControl();
    model = modelConstructor();
});


function adjustPlaceholder() {
    var supported = Modernizr.input.placeholder;
    $("#account label").css({ 'display': 'block' });
}

function setFocusForUsernameControl() {
    $("#Username").focus();
}


var modelConstructor = function () {

    //Confirmation button.
    var btn = $("#btnRegister")[0];

    //Inactive controls.
    var inactive = new HashTable(null);

    //Control groups.
    var controls = new HashTable(null);
    controls.setItem('username', new ControlGroup('div_username', checkUsername));
    controls.setItem('password', new ControlGroup('div_password', checkPassword));
    controls.setItem('confirmPassword', new ControlGroup('div_confirm_password', matchPasswords));
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
            $(btn).attr('disabled', 'disabled');
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


    return {
        getPassword: function () {
            var controlGroup = controls.getItem('password');
            return controlGroup ? controlGroup.getValue() : null;
        }
    }

};




function ControlGroup(_id, _fn) {
    var me = this; //To be used in events binding.

    this.id = _id;
    this.container = $('#' + _id)[0];

    this.getControl = function (selector) {
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
    var valueControl = $(this.getValueControl());
    valueControl.bind({
        'keyup': function () {
            me._validate();
        },
        'change': function () {
            me._validate();
        },
        'mouseup': function (e) {
            e.preventDefault();
        }
    });
    valueControl.on({
        'focus': function (e) {
            this.select();
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
    } else if (userAlreadyExists(username)) {
        return MessageBundle.get(dict.UsernameAlreadyExists);
    } else {
        return true;
    }

}

function userAlreadyExists(username) {
    $.ajax({
        type: "POST",
        url: "Login/CheckUser",
        //data: "{'username':'" + username + "'}",
        data: JSON.stringify({ username: "xyz" }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {
            alert(msg + ":" + msg.d);
            alert("OK");
            return true;
        },
        error: function (msg) {
            alert(msg.status + ":" + msg.statusText);
            alert('error');
            return false;
        }
    });

}





function checkPassword(password) {
    var MIN_LENGTH = 6;
    if (!password) {
        return MessageBundle.get(dict.PasswordCannotBeEmpty);
    } else if (password.length < MIN_LENGTH) {
        return MessageBundle.get(dict.PasswordTooShort, [MIN_LENGTH]);
    } else if (!password.match(/^.*(?=.*\d)(?=.*[a-zA-Z]).*$/)) {
        return MessageBundle.get(dict.IllegalPasswordFormat);
    } else {
        return true;
    }
}

function matchPasswords(confirmPassword) {
    if (!confirmPassword) {
        return MessageBundle.get(dict.ConfirmPasswordCannotBeEmpty);
    } else {
        var currentPassword = model ? model.getPassword() : null;
        return checkIfPasswordsMatch(currentPassword, confirmPassword);
    }
}

function checkIfPasswordsMatch(password, confirmPassword) {
    if (password !== confirmPassword) {
        return MessageBundle.get(dict.PasswordsDontMatch);
    } else {
        return true;
    }
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
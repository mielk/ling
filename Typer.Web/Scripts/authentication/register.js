var model;

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
    
    //Creating links between data fields (i.e. [ConfirmPassword] must 
    //be verified every time [Password] field is being changed.
    (function () {
        var pswd = controls.getItem('password');
        var confPswd = controls.getItem('confirmPassword');
        pswd.addLinked('confirmPassword', confPswd);
    })();



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
    this.linked = new HashTable(null);

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

        //Verify linked controls.
        verifyLinked();

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


    var verifyLinked = function () {
        me.linked.each(
            function (key, value) {
                value.validate();
            }
        );
    }


    //Bind change event to value control.
    var timer;
    var valueControl = $(this.getValueControl());
    valueControl.bind({
        'keyup': function () {
            if (timer) {
                clearTimeout(timer);
            }
            timer = setTimeout(function () {
                me._validate();
            }, 150);
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




ControlGroup.prototype.addLinked = function (key, value) {
    this.linked.setItem(key, value);
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
var userExists = false;

function checkUsername(username) {
    var MIN_LENGTH = 5;
    var MAX_LENGTH = 20;

    if (!username) {
        return MessageBundle.get(dict.UsernameCannotBeEmpty);
    } else if (username.length < MIN_LENGTH) {
        return MessageBundle.get(dict.UsernameMustBeLongerThan, [MIN_LENGTH]);
    } else if (username.length > MAX_LENGTH) {
        return MessageBundle.get(dict.UsernameCannotBeLongerThan, [MAX_LENGTH]);
    } else if (!my.text.isLetter(username.charAt(0))) {
        return MessageBundle.get(dict.UsernameMustStartWithLetter);
    } else if (!my.text.containLettersNumbersUnderscore(username)) {
        return MessageBundle.get(dict.UsernameContainsIllegalChar);
    } else {
        userAlreadyExists(username);

        if (userExists) {
            return MessageBundle.get(dict.UsernameAlreadyExists);
        } else {
            return true;
        }

    }

}


function userAlreadyExists(username) {
    $.ajax({
        url: "CheckUsername",
        type: "post",
        data: JSON.stringify({ username: username }),
        contentType: "application/json; charset=utf-8",
        datatype: "json",
        async: false,
        success: function (result) {
            userExists = (result.IsExisting === true);
        },
        error: function (msg) {
            alert("[register.js::userAlreadyExists] " + msg.status + " | " + msg.statusText);
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
    var pswdVerification = checkPassword(password);
    if (pswdVerification !== true) {
        return pswdVerification;
    } else if (password !== confirmPassword) {
        return MessageBundle.get(dict.PasswordsDontMatch);
    } else {
        return true;
    }
}



var mailExists = false;
function checkMail(mail) {
    if (!mail) {
        return MessageBundle.get(dict.MailCannotBeEmpty);
    } else if (!my.text.isValidMail(mail)) {
        return MessageBundle.get(dict.IllegalMailFormat);
    } else {
        mailAlreadyExists(mail);
        if (mailExists) {
            return MessageBundle.get(dict.MailAlreadyExists);
        } else {
            return true;
        }
    }
}

function mailAlreadyExists(mail) {
    $.ajax({
        url: "CheckMail",
        type: "post",
        data: JSON.stringify({ mail: mail }),
        contentType: "application/json; charset=utf-8",
        datatype: "json",
        async: false,
        success: function (result) {
            mailExists = (result.IsExisting === true);
        },
        error: function (msg) {
            alert("[register.js::mailAlreadyExists] " + msg.status + " | " + msg.statusText);
        }
    });

}
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
    $("#Name").focus();
}


var modelConstructor = function () {

    //Confirmation button.
    var btn = $("#btnSave")[0];

    //Inactive controls.
    var inactive = new HashTable(null);

    //Control groups.
    var controls = new HashTable(null);
    controls.setItem('name', new ControlGroup('div_name', checkName));

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






var nameExists = false;

function checkName(name) {
    var MAX_LENGTH = 255;

    if (!name) {
        return MessageBundle.get(dict.NameCannotBeEmpty);
    } else if (username.length > MAX_LENGTH) {
        return MessageBundle.get(dict.NameCannotBeLongerThan, [MAX_LENGTH]);
    } else {
        nameAlreadyExists(name);

        if (nameExists) {
            return MessageBundle.get(dict.NameAlreadyExists);
        } else {
            return true;
        }

    }

}


function userAlreadyExists(name) {
    $.ajax({
        url: "CheckName",
        type: "post",
        data: JSON.stringify({ name: name }),
        contentType: "application/json; charset=utf-8",
        datatype: "json",
        async: false,
        success: function (result) {
            nameExists = (result.IsExisting === true);
        },
        error: function (msg) {
            alert("[register.js::nameAlreadyExists] " + msg.status + " | " + msg.statusText);
        }
    });

}
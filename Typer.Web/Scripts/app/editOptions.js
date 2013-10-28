var languages = new HashTable(null);
var options = new HashTable(null);
var editPanel;

$(function () {

    $('.language').each(function (i, obj) {
        var language = new Language(this);
    });

    editPanel = new EditPanel();

});


function EditPanel() {
    var me = this;
    this.inactiveLayer = $('#inactive-layer')[0];
    this.container = $('#edit-container')[0];
    this.name = $(this.container).find('#name')[0];
    this.nameErrorContent = $(this.container).find('#name-error-content')[0];
    this.nameError = $(this.container).find('#name-error')[0];
    this.nameErrorIcon = $(this.container).find('#name-error-icon')[0];
    this.weight = $(this.container).find('#weight')[0];
    this.weightIconsContainer = $(this.container).find('#weight-icons')[0];
    this.weightIcons = new WeightIcons(editPanel, this.weightIconsContainer);
    this.cancel = $(this.container).find('#cancel-edit')[0];
    this.confirm = $(this.container).find('#confirm-edit')[0];
    this.currentOption;

    //weight-icons
    this.close = $('#edit-close')[0];


    $(this.close).bind({
        'click': function () {
            me.hide();
        }
    });

    $(this.cancel).bind({
        'click': function () {
            me.hide();
        }
    });

    $(this.confirm).bind({
        'click': function () {
            if (me.currentOption) {
                me.currentOption.update(me.getName(), me.getWeight());
            }
            me.hide();
        }
    });


    var timer;
    $(this.name).
        bind({
            'keyup': function () {
                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(function () {
                    me.validateName();
                }, 150);
            },
            'change': function () {
                me.validateName();
            },
            'mouseup': function (e) {
                e.preventDefault();
            }
        }).
        on({
            'focus': function (e) {
                this.select();
            }
        });

    $(this.weight).
        bind({
            'change': function () {
                $(me.weightIconsContainer).trigger({
                    'type': 'changeValue',
                    'weight': $(this).val()
                });
            }
        }).
        on({
            'focus': function (e) {
                this.select();
            }
        });

    $(this.weightIconsContainer).bind({
        'clickIcon': function (e) {
            $(me.weight).val(e.weight);
        }
    });


    this.validateName = function () {
        var ctrl = $(this.name);
        var name = ctrl.val();
        var isValid = isValidName(name);

        if (isValid === true) {
            this.markNameAsValid();
        } else {
            this.markNameAsInvalid(isValid);
        }

    }

    function isValidName(name) {
        if (name.length === 0) {
            return MessageBundle.get(dict.NameCannotBeEmpty);
        } else if(!isUniqueContent(me.currentOption, name)) {
            return MessageBundle.get(dict.NameAlreadyExists);
        } else {
            return true;
        }
    }

    this.markNameAsValid = function () {
        $(this.nameError).css({ 'visibility': 'hidden' });
        $(this.nameErrorIcon).removeClass('iconInvalid').addClass('iconValid');
        $(this.name).removeClass('invalid').addClass('valid');
        $(this.confirm).removeAttr('disabled');
    }
    this.markNameAsInvalid = function (msg) {
        $(this.nameErrorContent).text(msg);
        $(this.nameError).css({ 'visibility': 'visible' });        
        $(this.nameErrorIcon).removeClass('iconValid').addClass('iconInvalid');
        $(this.name).removeClass('valid').addClass('invalid');
        $(this.confirm).attr('disabled', 'disabled');
    }
    this.getName = function () {
        return $(this.name).val();
    }
    this.getWeight = function () {
        return $(this.weight).val();
    }

}
EditPanel.prototype.display = function (option) {
    this.currentOption = option;
    $(this.name).val(option.getContent());
    $(this.weight).val(option.getWeight());
    this.validateName();
    this.weightIcons.setValue(option.getWeight());
    $(this.inactiveLayer).css({
        'display': 'block'
    });
    $(this.container).css({
        'display': 'block'
    });
}
EditPanel.prototype.hide = function () {
    this.currentOption = null;
    $(this.inactiveLayer).css({
        'display': 'none'
    });
    $(this.container).css({
        'display': 'none'
    });
}





function WeightIcons(parent, container) {
    var me = this;
    this.CHECKED_CSS_CLASS = "weight-checked";
    this.parent = parent;
    this.container = container;
    this.icons = new HashTable(null);
    this.value = 0;

    $(this.container).find('.weight-icon').each(function (i, obj) {
        $(obj).bind({
            'click': function (e) {
                $(me.container).trigger({
                    'type': 'clickIcon',
                    'weight': (this.id * 1 + 1)
                });
            }
        });
        me.icons.setItem(obj.id, obj);
    });

    $(this.container).bind({
        'changeValue': function (e) {
            if (e.weight !== me.value) {
                me.setValue(e.weight);
            }
        },
        'clickIcon': function (e) {
            me.setValue(e.weight);
        }
    });

}
WeightIcons.prototype.setValue = function (value) {
    this.value = value;
    var cls = this.CHECKED_CSS_CLASS;
    this.icons.each(function (i, obj) {
        if (i < value) {
            $(obj).addClass(cls);
        } else {
            $(obj).removeClass(cls);
        }
    });
}



function Language(container) {
    var me = this;
    this.container = container;
    this.name = $(this.container).attr('data-value');
    this.options = new HashTable(null);
    
    $(this.container).find('.option').each(function (i, obj) {
        var option = new Option(obj, me);
        me.options.setItem(option.getName(), option);
    });

}
Language.prototype.getName = function () {
    return this.name;
}
Language.prototype.isUnique = function (content, optionId) {
    var unique = true;
    this.options.each(function (key, option) {
        if (option.getContent() === content) {
            if (option.getName() !== optionId) {
                unique = false;
            }
        }
    });
    return unique;
}



function Option(_container, language) {
    var me = this;
    this.language = language;
    this.container = _container;
    this.delete = control("delete");
    this.edit = control("edit");
    this.content = control("content");
    this.weight = control("weight");
    
    this.name = _container.id;

    function control(selector) {
        return $(_container).find('.' + selector)[0];
    }


    $(this.delete).bind({
        click: function (e) {
            alert('delete');
        }
    });

    $(this.edit).bind({
        click: function (e) {
            editPanel.display(me);
        }
    });

}

Option.prototype.getName = function () {
    return this.name;
}
Option.prototype.getContent = function () {
    var value = $(this.content).attr('data-value');
    return value;
}
Option.prototype.getWeight = function () {
    var value = $(this.weight).attr('data-value');
    return value;
}
Option.prototype.getLanguage = function () {
    return this.language;
}
Option.prototype.update = function (content, weight) {
    $(this.content).
        html(
            contentToHtml(content)
        ).
        attr({
            'data-value' : content
        });
    $(this.weight).
        text(weight).
        attr({
            'data-value': weight
        });
        
}

function contentToHtml(content) {
    //var replaced = text.replaceAll(content, "[", "|$");
    var replaced = content.replace(/\[/g, '|$').replace(/\]/g, '|');
    var parts = replaced.split("|");

    var result = '';
    for (var part = 0; part < parts.length; part++) {
        var s = parts[part];
        if (s.length > 0) {
            result += '<span class="';
            result += (text.startsWith(s, '$') ? 'complex' : 'plain');
            result += '">';
            result += s.replace("$", "");
            result += '</span>';
        }
    }

    return result;

}

function isUniqueContent(option, content) {
    var language = option.getLanguage();
    return language.isUnique(content.trim(), option.getName());
}
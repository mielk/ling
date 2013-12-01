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
    this.MIN_WEIGHT = 1;
    this.MAX_WEIGHT = 10;
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
                var value = Math.min(Math.max(me.MIN_WEIGHT, $(this).val() * 1), me.MAX_WEIGHT);
                $(this).val(value);
                $(me.weightIconsContainer).trigger({
                    'type': 'changeValue',
                    'weight': value
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

    $(this.name).focus();

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




function Language(container) {
    var me = this;
    this.container = container;
    this.flag = $(this.container).find('.flag')[0];
    this.collapseButton = $(this.container).find('.collapse')[0];
    this.name = $(this.container).attr('data-value');
    this.options = new HashTable(null);
    this.optionNum = 0;
    this.addButton = $(this.container).find('.add')[0];
    this.isCollapsed = false;
    this.optionsPanel = $(this.container).find('.options')[0];
    this.buttonsPanel = $(this.container).find('.buttons')[0];

    $(this.container).find('.option').each(function (i, obj) {
        var option = new Option(obj, me);
        var name = option.getName();
        me.options.setItem(name, option);
        if (name * 1 > me.optionNum) {
            me.optionNum = name;
        }
    });

    $(this.addButton).bind({
        'click': function () {
            var option = new PreOption(me, ++me.optionNum);
            editPanel.display(option);
        }
    });

    $(this.collapseButton).bind({
        'click': function () {
            if (me.isCollapsed === true) {
                me.expand();
            } else {
                me.collapse();
            }
        }
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
Language.prototype.removeOption = function (option) {
    this.options.removeItem(option.getName());
}
Language.prototype.createOption = function (_id, content, weight) {
    var container = jQuery('<div/>', {
        id: _id,
        'class': 'option',
        html: optionToHtml(_id, content, weight)
    }).appendTo($(this.container).find('.options')[0]);
    var option = new Option(container, this);
    this.options.setItem(_id, option);
}
Language.prototype.collapse = function () {
    this.isCollapsed = true;
    $(this.optionsPanel).css({
        'display' : 'none'
    });
    $(this.buttonsPanel).css({
        'display': 'none'
    });
}
Language.prototype.expand = function () {
    this.isCollapsed = false;
    $(this.optionsPanel).css({
        'display': 'block'
    });
    $(this.buttonsPanel).css({
        'display': 'block'
    });
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
            me.remove();
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
Option.prototype.remove = function () {
    this.language.removeOption(this);
    $(this.container).remove();
}



function PreOption(language, number) {
    var me = this;
    this.language = language;
    this.name = number;
}
PreOption.prototype.getName = function () {
    return this.name;
}
PreOption.prototype.getContent = function () {
    return '';
}
PreOption.prototype.getWeight = function () {
    return 1;
}
PreOption.prototype.getLanguage = function () {
    return this.language;
}
PreOption.prototype.update = function (content, weight) {
    this.language.createOption(this.name, content, weight);
}


function contentToHtml(content) {
    var replaced = content.replace(/\[/g, '|$').replace(/\]/g, '|');
    var parts = replaced.split("|");

    var result = '';
    for (var part = 0; part < parts.length; part++) {
        var s = parts[part];
        if (s.length > 0) {
            result += '<span class="';
            result += (my.text.startsWith(s, '$') ? 'complex' : 'plain');
            result += '">';
            result += s.replace("$", "");
            result += '</span>';
        }
    }

    return result;

}

function optionToHtml(id, content, weight) {
    var html = '<div class="button delete" title="Delete this option"></div>';
    html += '<div class="button edit" title="Edit this option"></div>';
    html += '<div class="content" data-value="' + content + '">';
    html += contentToHtml(content);
    html += '</div>';
    html += '<div class="weight" data-value="' + weight + '">' + weight + '</div>';

    return html;

}




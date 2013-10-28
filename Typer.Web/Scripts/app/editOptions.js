var options = new HashTable(null);
var editPanel;

$(function () {

    $('.option').each(function (i, obj) {
        var option = new Option(obj);
        options.setItem(option.getName(), option);
    });

    editPanel = new EditPanel();

});


function EditPanel() {
    var me = this;
    this.inactiveLayer = $('#inactive-layer')[0];
    this.container = $('#edit-container')[0];
    this.name = $(this.container).find('#name')[0];
    this.weight = $(this.container).find('#weight')[0];
    this.weightIconsContainer = $(this.container).find('#weight-icons')[0];
    this.weightIcons = new WeightIcons(editPanel, this.weightIconsContainer);


    //weight-icons
    this.close = $('#edit-close')[0];


    $(this.close).bind({
        'click': function () {
            me.hide();
        }
    });

    $(this.name).
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


}
EditPanel.prototype.display = function (option) {
    $(this.name).val(option.getContent());
    $(this.weight).val(option.getWeight());
    this.weightIcons.setValue(option.getWeight());
    $(this.inactiveLayer).css({
        'display': 'block'
    });
    $(this.container).css({
        'display': 'block'
    });
}
EditPanel.prototype.hide = function () {
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



function Option(_container) {
    var me = this;
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
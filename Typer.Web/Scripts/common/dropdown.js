﻿
function DropDown(properties) {
    this.DropDown = true;
    var self = this;
    self.options = new HashTable(null);

    self.container = properties.container;
    self.selection = jQuery('<select/>', {
        'class': 'dropdown-select'
    }).appendTo($(self.container));

    self.eventHandler = new EventHandler();

    self.loadData(properties.data);

    self.render(properties);

}
DropDown.prototype.loadData = function (data) {

    this.data = new HashTable(null);

    for (var i = 0; i < data.length; i++) {
        var item = data[i];
        var key = item.key || item.name;
        this.data.setItem(key, item);
    }

};
DropDown.prototype.render = function (params) {
    var self = this;

    //Put an empty option if placeholder is defined.
    if (params.placeholder) {
        jQuery('<option/>').appendTo(self.selection);
    }

    self.data.each(function(key, value){
        var option = jQuery('<option/>', {
            value: key,
            html: value.name
        });
        option.appendTo(self.selection);
        self.options.setItem(key, option);
    });

    self.selection.select2({
        placeholder: params.placeholder || '',
        allowClear: params.allowClear || false
    });

    self.selection.bind({
        change: function (e) {
            var value = e.val;
            var item = self.data.getItem(value);

            self.trigger({
                type: 'change',
                value: value,
                item: item
            });

        }
    });

};
DropDown.prototype.bind = function (e) {
    this.eventHandler.bind(e);
};
DropDown.prototype.trigger = function (e) {
    this.eventHandler.trigger(e);
};
DropDown.prototype.select = function (item) {
    var key = item.key || item.name;
    var $item = this.data.getItem(key);
    if ($item) {
        $(this.selection).select2('val', $item.name);
    }
};
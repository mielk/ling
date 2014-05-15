
function DropDown(properties) {
    this.DropDown = true;
    var self = this;
    self.options = mielk.hashTable();
    self.data = mielk.hashTable();
    self.params = {
        placeholder: properties.placeholder,
        allowClear: properties.allowClear
    }

    self.container = properties.container;
    self.selection = jQuery('<select/>', {
        'class': 'dropdown-select'
    }).appendTo($(self.container));

    self.eventHandler = mielk.eventHandler();
    self.loadData(properties.data);

}
DropDown.prototype.loadData = function (data) {

    this.data = mielk.hashTable();

    if (data) {
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            var key = item.key || item.name;
            this.data.setItem(key, item);
        }
    }

    this.render();

};
DropDown.prototype.render = function () {
    var self = this;

    $(self.selection).empty();

    //Put an empty option if placeholder is defined.
    if (self.params.placeholder) {
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
        placeholder: self.params.placeholder || '',
        allowClear: self.params.allowClear || false
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
    var key = (my.values.isNumber(item) || my.values.isString(item) ? item : item.key || item.name);
    var $item = this.data.getItem(key);
    if ($item) {
        //$(this.selection).select2('val', $item.name);
        $(this.selection).select2('val', key);
    }
};
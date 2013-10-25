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
    //this.name = $('#edit-name');
    //this.weight = $('#edit-weight');
    this.close = $('#edit-close')[0];


    $(this.close).bind({
        'click': function () {
            me.hide();
        }
    });

}
EditPanel.prototype.display = function (option) {
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
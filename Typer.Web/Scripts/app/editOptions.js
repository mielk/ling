var options = new HashTable(null);

$(function () {
    $('.option').each(function (i, obj) {
        var option = new Option(obj);
        options.setItem(option.getName(), option);
    });

});

var editPanel = function () {

    var inactiveLayer = $('#inactive-layer')[0];
    var container = $('#edit-container')[0];
    var name = $('#edit-name')[0];
    var weight = $('#edit-weight')[0];

    return {

        display: function () {

        }

    }

}();


function Option(_container) {
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
            alert('edit');
        }
    });

}

Option.prototype.getName = function () {
    return this.name;
}


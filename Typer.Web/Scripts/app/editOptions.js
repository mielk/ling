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

    alert(this.name);


    function control(selector) {
        return $(this.container).find('.' + selector)[0];
    }

}

Option.prototype.getName = function () {
    return this.name;
}


$(function () {

    var data = [
        { key: 'a', name: 'A', object: { key: 'a' } },
        { key: 'b', name: 'B', object: { key: 'b' } }
    ];

    var container = $('#parent')[0];

    var dropdown = new DropDown({
        container: container,
        data: data,
        placeholder: 'Select option',
        allowClear: true
    });

    dropdown.bind({
        change: function (e) {
            var x = e;
        }
    });
});
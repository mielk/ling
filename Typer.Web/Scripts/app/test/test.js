$(function () {

    var container = $('#test-container')[0];
    var result = $('#result')[0];

    var checkbox = my.ui.checkbox({
        container: container,
        name: 'test',
        caption: 'Test checkbox',
        checked: true
    });

    checkbox.bind({
        click: function (e) {
            $(result).css({
                'background-color': e.value ? 'red' : 'green'
            });
        }
    });

    //var radio = my.ui.radio({
    //    container: container,
    //    name: 'test',
    //    options: {
    //        a: { key: 'a', value: 1 },
    //        b: { key: 'b', value: 2, checked: true },
    //        c: { key: 'c', value: 3 },
    //        d: { key: 'd', value: 4 }
    //    }
    //});

    //radio.bind({
    //    click: function(e) {
    //        $(result).html(e.caption);
    //    }
    //});

});
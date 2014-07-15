module('VariantsManager tests', {
    setup: function () {
        $.mockjaxClear();
        //mock.mockIcpAjaxService("");
    },
    teardown: function () {
        $.mockjaxClear();
    }
});


test('Variants manager test', function () {
    expect(1);

    //Arrange
    var x = 2;

    //Act
    var y = 1;

    //Assert
    equal(x, y, 'X must be equal to Y');

});

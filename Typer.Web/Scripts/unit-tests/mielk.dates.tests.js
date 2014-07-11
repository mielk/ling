module('mielk.dates tests', {
    setup: function () {
        $.mockjaxClear();
        //mock.mockIcpAjaxService("");
    },
    teardown: function () {
        $.mockjaxClear();
    }
});


test('Test', function () {
    expect(1);

    //Arrange
    var x = 1;
    
    //Act
    var y = 1;

    //Assert
    equal(x, y, 'X must be equal to Y');

});

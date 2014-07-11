module('productViewModel tests');

test('After creation  of product view model, fields are set to default values', function () {
    expect(7);

    //Arrange
    
    //Act
    var subject = my.productViewModel();

    //Assert
    equal(subject.Code, '', 'Default for Code is \'\' ');
    equal(subject.Name, '', 'Default for Name is \'\' ');
    equal(subject.Unit, '', 'Default for Unit is \'\' ');
    equal(subject.TypedPricePerUnit(), 0, 'Default for price is 0');
    equal(subject.TypedVatRate(), 0, 'Default for vat is 0');
    equal(subject.Checked(), false, 'Default checked is false');
    equal(subject.Id, undefined, 'Default for Id is undefined');

});


test('ProductViewModel creation with parameter sets the id to this parameter', function () {
    expect(1);
    //Arrange

    //Act
    var subject = my.productViewModel(784);

    //Assert
    equal(subject.Id, 784, 'Id is set for value passed as parameter');
});

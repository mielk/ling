module('amountMassUpdateViewModel tests');

test('After creation of amount mass update view model, fields are set to default values', function () {
    expect(4);

    //Arrange

    //Act
    var subject = my.amountMassUpdateViewModel();

    //Assert
    equal(subject.ProductId(), 0, 'Default for Code is 0 ');
    equal(subject.ProductName(), '', 'Default for Name is \'\' ');
    equal(subject.SelectedType(), subject.DefaultType, 'Default for SelectedType is ' + subject.DefaultType.name);
    equal(subject.Value(), 0, 'Default for Value is 0');

});

test('After resetting of amount mass update view model, fields are set to default values', function () {
    expect(4);

    //Arrange
    var subject = my.amountMassUpdateViewModel();
    subject.ProductId(2);
    subject.ProductName('name');
    subject.SelectedType(subject.AvailableTypes()[1]);
    subject.Value(3);

    //Act
    subject.Reset();

    //Assert
    equal(subject.ProductId(), 0, 'Default for Code is 0 ');
    equal(subject.ProductName(), '', 'Default for Name is \'\' ');
    equal(subject.SelectedType(), subject.DefaultType, 'Default for SelectedType is ' + subject.DefaultType.name);
    equal(subject.Value(), 0, 'Default for Value is 0');

});

test('After setting product ProductId and ProductName for this view model are set to this product', function () {
    expect(2);

    //Arrange
    var productId = 1;
    var productName = 'name';
    var subject = my.amountMassUpdateViewModel();
    var mockCorrectionItemViewModel = function() {
        return {
            ProductId: function () {
                return productId;
            },
            ProductName: function () {
                return productName;
            }
        };
    };

    //Act
    subject.SetProduct(new mockCorrectionItemViewModel());

    //Assert
    equal(subject.ProductId(), productId, 'ProductId should be set to ' + productId);
    equal(subject.ProductName(), productName, 'ProductName should be set to ' + productName);
    
});

test('If value is empty this view model is not valid', function() {
    expect(1);
    
    //Arrange
    var subject = my.amountMassUpdateViewModel();

    //Act
    subject.Value('');

    //Assert
    equal(subject.IsValid(), false, 'IsValid status of this view model should be set to false, since value is empty');

});

test('After applying setNetPriceTo all items of the specified type and only them have net price equal to the given value', function () {
    var length = 5;
    expect(length);

    //Arrange
    var productId = 1;
    var initialValue = 10;
    var newValue = 2;
    var items = prepareTestItemsArray(length, productId, initialValue);
    
    var subject = my.createAmountMassUpdateViewModelFromJson({ Items: items, ProductId: productId, Value: newValue });

    //Act
    subject.Apply();

    //Assert
    for (var i = 0; i < length; i++) {
        var item = items()[i];
        var x = item.ProductId() + ' | ' + item.PricePerUnitNet()
        if (item.ProductId() === productId) {
            equal(item.PricePerUnitNet(), newValue, 'NetPrice of this item should be set to ' + newValue);
        } else {
            equal(item.PricePerUnitNet(), initialValue, 'NetPrice of this item should remain unaltered');
        }
    }

});

test('After applying changeNetPriceBy all items of the specified type and only them have net price changed by the given value', function () {
    var length = 5;
    expect(length);

    //Arrange
    var productId = 1;
    var initialValue = 2;
    var change = 1;
    var items = prepareTestItemsArray(length, productId, initialValue);

    var subject = my.createAmountMassUpdateViewModelFromJson({ Items: items, ProductId: productId, Value: change, Type: 'changeBy' });

    //Act
    subject.Apply();

    //Assert
    for (var i = 0; i < length; i++) {
        var item = items()[i];
        if (item.ProductId() === productId) {
            equal(item.PricePerUnitNet(), initialValue + change, 'NetPrice of this item should be changed to ' + (initialValue + change));
        } else {
            equal(item.PricePerUnitNet(), initialValue, 'NetPrice of this item should remain unaltered');
        }
    }

});

test('After applying changeNetPriceBy with negative value all items of the specified type and only them have net price changed by the given value', function () {
    var length = 5;
    expect(length);

    //Arrange
    var productId = 1;
    var initialValue = 2;
    var change = -1;
    var items = prepareTestItemsArray(length, productId, initialValue);

    var subject = my.createAmountMassUpdateViewModelFromJson({ Items: items, ProductId: productId, Value: change, Type: 'changeBy' });

    //Act
    subject.Apply();

    //Assert
    for (var i = 0; i < length; i++) {
        var item = items()[i];
        if (item.ProductId() === productId) {
            equal(item.PricePerUnitNet(), initialValue + change, 'NetPrice of this item should be changed to ' + (initialValue + change));
        } else {
            equal(item.PricePerUnitNet(), initialValue, 'NetPrice of this item should remain unaltered');
        }
    }

});

test('After applying changeNetPriceBy result has exactly two decimal places', function() {
    expect(1);
    
    //Arrange
    var productId = 1;
    var initialValue = 1008.09;
    var change = 20;
    var item = new my.CreateCorrectionItemViewModelFromJson({ ProductId: productId, PricePerUnitNet: initialValue });
    var items = ko.observableArray([]);
    items.push(item);
    var subject = my.createAmountMassUpdateViewModelFromJson({ Items: items, ProductId: productId, Value: change, Type: 'changeBy' });

    //Act
    subject.Apply();

    //Assert
    var expected = 1028.09;
    equal(item.PricePerUnitNet(), expected, 'NetPrice of this item should be changed to ' + expected);

});

test('After applying setNetPriceTo result has exactly two decimal places', function () {
    expect(1);

    //Arrange
    var productId = 1;
    var initialValue = 20;
    var change = "1008.09";
    var item = new my.CreateCorrectionItemViewModelFromJson({ ProductId: productId, PricePerUnitNet: initialValue });
    var items = ko.observableArray([]);
    items.push(item);
    var subject = my.createAmountMassUpdateViewModelFromJson({ Items: items, ProductId: productId, Value: change, Type: 'setTo' });

    //Act
    subject.Apply();

    //Assert
    var expected = 1008.09;
    equal(item.PricePerUnitNet(), expected, 'NetPrice of this item should be set to ' + expected);

});

function prepareTestItemsArray(length, productId, initialValue) {
    var items = ko.observableArray([]);
    items.push(new my.CreateCorrectionItemViewModelFromJson({ ProductId: productId, PricePerUnitNet: initialValue }));
    for (var i = 1; i < length; i++) {
        items.push(new my.CreateCorrectionItemViewModelFromJson({ ProductId: productId + (randomBoolean() ? 1 : 0), PricePerUnitNet: initialValue }));
    }
    
    return items;

}

function randomBoolean() {
    return Math.random() < 0.5 ? false : true;
}
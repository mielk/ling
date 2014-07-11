module('EditInvoiceVM tests', {
    setup: function() {
        my.config.setAppPath("");
        $.mockjaxClear();
        mock.mockIcpAjaxService("");
    },
    teardown: function() {
        $.mockjaxClear();
    }
});

//TODO: tests should be atomic, refactor so there is one business assert per test
//TODO: tests take too long, refactor class to allow custom data provider instead of mocking ajax

test('editInvoiceCorrectionViewModel creation, Data is loading flag is set after creation and cleared after reading data', function () {
    expect(2);

    // Act 
    
    var subject = new my.editInvoiceCorrectionViewModel(1,false,'1234','1234',my.invoiceDataService, new my.ClientInvoiceCalculations());
    // Assert

    equal(subject.DataIsLoading.state(), true, "Data Should be loading immiedietely after creation - running asynchronously");
    stop();
    var intervalid = setInterval(function() {
        if (!subject.DataIsLoading.state()) {
            clearInterval(intervalid);
            equal(subject.DataIsLoading.state(), false, "Data Should be loading immiedietely after creation - running asynchronously");
            start();
        }
    },100);
    
});

test('editInvoiceCorrectionViewModel creation, after data load product list is not empty ', function () {
    expect(2);

    //Arrange

    // Act 
    var subject = new my.editInvoiceCorrectionViewModel(1, false, '1234', '1234', my.invoiceDataService, my.ClientInvoiceCalculations);
    equal(subject.Products().length, 0, 'Product lenght should be empty while data has not been read yet');

    stop();
    var intervalid = setInterval(function () {
        if (!subject.DataIsLoading.state()) {
            clearInterval(intervalid);
            assert();
            start();
        }
    }, 100);

    //Assert
    var assert = function () {
        notEqual(subject.Products(), 0, 'Product lenght should not be empty (read from json)');
    };

;
});

test('editInvoiceCorrectionViewModel creation, after creation it has specific products in array ', function () {
    expect(9);

    //Arrange

    // Act 
    var subject = new my.editInvoiceCorrectionViewModel(1, false, '', '', my.invoiceDataService, my.ClientInvoiceCalculations);
    stop();
    var intervalid = setInterval(function () {
        if (!subject.DataIsLoading.state()) {
            clearInterval(intervalid);
            assert();
            start();
        }
    }, 100);

    //Assert
    var assert = function () {
        equal(subject.Products().length, 5, 'There were 5 product items in source data');

        equal(subject.Products()[0].Id, '1', '');
        equal(subject.Products()[0].Code, '9999','');
        equal(subject.Products()[0].Name, 'Product 1','');
        equal(subject.Products()[0].Unit, 'hours', '');
        
        equal(subject.Products()[4].Id, '5', '');
        equal(subject.Products()[4].Code, '1235', '');
        equal(subject.Products()[4].Name, 'Product 5', '');
        equal(subject.Products()[4].Unit, 'hours', '');
    };

    
});

test('editInvoiceCorrectionViewModel, adding product causes it to appear in ItemsAfter list, with himms and mps of original customer ', function () {
    expect(7);

    //Arrange
    var subject = new my.editInvoiceCorrectionViewModel(1, false, '7548', '6589', my.invoiceDataService, my.ClientInvoiceCalculations);
    stop();
    var intervalid = setInterval(function () {
        if (!subject.DataIsLoading.state()) {
            clearInterval(intervalid);
            act();
            assert();
            start();
        }
    }, 100);
    
    // Act 
    var act = function () {
        subject.Products()[0].Checked(true);
        subject.AddSelectedProductsAsItems();
    };

    //Assert
    var assert = function () {
        equal(subject.ItemsAfter().length, 1, 'After adding one product, this product should appear in itemsAfter array');
        equal(subject.ItemsAfter()[0].ProductName(), subject.Products()[0].Name, 'Item name is the same as product name');
        
        equal(subject.ItemsAfter()[0].ProductUnit(), subject.Products()[0].Unit, ' Item unit is same as product unit');
        equal(subject.ItemsAfter()[0].Quantity(), 1, 'Items quantity after adding is 1');
        equal(subject.ItemsAfter()[0].ProductId(), subject.Products()[0].Id, ' ProductId in item should be the same as product\'s Id');
        equal(subject.ItemsAfter()[0].CustomerHimmsMid(), '6589', 'Himms assigned to item should be the same as customer himmms mid');
        equal(subject.ItemsAfter()[0].CustomerMpsMid(), '7548', 'MPS assigned to item should be the same as customer MPS mid');


    };

    ;
});

test('editInvoiceCorrectionViewModel, changing AddedProductHimms and AddedProductMps causes to new values be added to items ', function () {
    expect(2);

    //Arrange
    var subject = new my.editInvoiceCorrectionViewModel(1, false, '7548', '6589', my.invoiceDataService, my.ClientInvoiceCalculations);
    stop();
    var intervalid = setInterval(function () {
        if (!subject.DataIsLoading.state()) {
            clearInterval(intervalid);
            act();
            assert();
            start();
        }
    }, 100);

    // Act 
    var act = function () {
        subject.AddedProductHimmsMid("1111");
        subject.AddedProductMpsMid("2222");
        subject.Products()[0].Checked(true);
        subject.AddSelectedProductsAsItems();
    };

    //Assert
    var assert = function () {
        
        equal(subject.ItemsAfter()[0].CustomerHimmsMid(), '1111', 'Himms assigned to item should be the one last changed in EditInvoice');
        equal(subject.ItemsAfter()[0].CustomerMpsMid(), '2222', 'MPS assigned to item should be the one last changed in EditInvoice');


    };

    ;
});
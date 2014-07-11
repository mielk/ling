module("InvoiceDataService Test");

test("json received from InvoiceDataService.getProduct  is mocked by mockjax", function() {
    expect(1);

    //Arrange
    my.config.setAppPath("");
    
    $.mockjaxClear();
    mock.mockIcpAjaxService("");

    stop();
    //Act
    my.invoiceDataService.getProducts(function(data) {
        deepEqual( data,JSON.parse(mock.ProductJsonString), "Mocked and received product jsons strings should be equal");
        start();
    }, function(data) {
        ok(false, "Error callback was called");
        start();
    });

    $.mockjaxClear();
});

test("json received from InvoiceDataService.getInvoice is mocked by mockjax", function () {
    expect(1);

    //Arrange
    my.config.setAppPath("");

    $.mockjaxClear();
    mock.mockIcpAjaxService("");

    stop();
    //Act
    my.invoiceDataService.getInvoices(function (data) {
        deepEqual(data, JSON.parse(mock.InvoiceJsonString), "Mocked and received invoice jsons strings should be equal");
        start();
    }, function (data) {
        ok(false, "Error callback was called");
        start();
    });

    $.mockjaxClear();
});

test("json received from InvoiceDataService.getInvoiceitems is mocked by mockjax", function () {
    expect(1);

    //Arrange
    my.config.setAppPath("");

    $.mockjaxClear();
    mock.mockIcpAjaxService("");

    stop();
    //Act
    my.invoiceDataService.getOriginalInvoiceItems(1,function (data) {
        deepEqual(data, JSON.parse(mock.InvoiceItemsJsonString), "Mocked and received invoice items jsons strings should be equal");
        start();
    }, function (data) {
        ok(false, "Error callback was called");
        start();
    });

    $.mockjaxClear();
});
module('DataIsLoading Unit Tests');



test('We can create dataisLoading structure', function() {
    expect(1);

    my.dataIsLoadingFlag(true);
    ok(true, "DataIsLoading constructed");
});

test('After creating to true, data is loading structure resolves to true', function () {
    expect(1);

    equal(my.dataIsLoadingFlag(true).state(), true, "");
});

test('We can set one field ', function () {
    expect(1);
    var loadingFlag = my.dataIsLoadingFlag(true);
    loadingFlag.invoiceItemsAreLoading(false);
    ok(true, "Field set");
});

test('After creating to true, and setting one to false, state is true', function () {
    expect(1);
    var loadingFlag = my.dataIsLoadingFlag(true);
    loadingFlag.invoiceItemsAreLoading(false);
    equal(loadingFlag.state(), true, "");
});

test('After creating to true, and setting all to false, state is false', function () {
    expect(1);
    var loadingFlag = my.dataIsLoadingFlag(true);
    loadingFlag.invoiceItemsAreLoading(false);
    loadingFlag.productsAreLoading(false);
    
    equal(loadingFlag.state(), false, "");
});
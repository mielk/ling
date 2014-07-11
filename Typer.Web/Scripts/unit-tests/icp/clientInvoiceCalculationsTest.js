module("client invoice calculations tests");

SetUpItems = function() {

    var item1 = my.correctionItemViewModel();
    item1.Quantity(50);
    item1.VatRate(10);
    item1.PricePerUnitNet(10);

    var item2 = my.correctionItemViewModel();
    item2.Quantity(100);
    item2.VatRate(20);
    item2.PricePerUnitNet(2);
    
    var item3 = my.correctionItemViewModel();
    item3.Quantity(300);
    item3.VatRate(0);
    item3.PricePerUnitNet(5);

    var itemList = [item1, item2, item3];

    return itemList;
};

test("Calculated Total Value is sum of items Gross value", function() {
    expect(1);

    var items = SetUpItems();
    var subject = new my.ClientInvoiceCalculations();

    var result = subject.CalculateTotalValue(items);

    equal(result, 2290, "Summing up Items total value");
});

test("Calculated Total Value returns 0 when nothing passed", function () {
    expect(1);

    var subject = new my.ClientInvoiceCalculations();

    var result = subject.CalculateTotalValue();

    equal(result, 0);
});

test("Calculated Total Value returns 0 when passed undefined", function () {
    expect(1);

    var subject = new my.ClientInvoiceCalculations();

    var result = subject.CalculateTotalValue(undefined);

    equal(result, 0);
});

test("Calculated Total Value returns 0 when passed emptyArray", function () {
    expect(1);

    var array = [];
    var subject = new my.ClientInvoiceCalculations();

    var result = subject.CalculateTotalValue(array);

    equal(result, 0);
});

test("Calculated Exempt Fees is a sum of value for products with 0% VAT", function() {
    expect(1);

    var items = SetUpItems();
    var subject = new my.ClientInvoiceCalculations();

    var result = subject.CalculateExemptFees(items);

    equal(result, 1500);
});

test("Calculated Exempt Fees returns 0 when nothing passed", function () {
    expect(1);

    var subject = new my.ClientInvoiceCalculations();

    var result = subject.CalculateExemptFees();

    equal(result, 0);
});

test("Calculated Exempt Fees returns 0 when passed undefined", function () {
    expect(1);

    var subject = new my.ClientInvoiceCalculations();

    var result = subject.CalculateExemptFees(undefined);

    equal(result, 0.00);
});

test("Calculated Taxed Fees should be a sum of net value of items with non zero VAT tax rate", function() {
    expect(1);

    var items = SetUpItems();
    var subject = new my.ClientInvoiceCalculations();
    
    var result = subject.CalculateTaxedFees(items);

    equal(result, 700);
});

test("Calculated Vat amount should be a sum of vat tax applied to items", function() {
    expect(1);

    var items = SetUpItems();
    var subject = new my.ClientInvoiceCalculations();
    
    var result = subject.CalculateTotalVatAmount(items);

    equal(result, 90);
});

test("Taxed Gross Total should be a sum of Gross value of items with non zero VAT tax", function() {
    expect(1);
    var items = SetUpItems();
    var subject = new my.ClientInvoiceCalculations();
    
    var result = subject.CalculateGrossTotal(items);

    equal(result, 790);
});
module('QUnit introduction tests');

test('Test of qunit setup', function() {
    ok(1 == "1", "Passed!");
});

test('Intentionally broken and fixed test', function () {
    equal(1, 1, "This test is intentionally broken to test team city integration, integration went well so i'm fixing it not to show red on results");
});

module('Mockjax introduction tests');

test(' Check if you can read what mockjax sends', function() {
    window.expect(2);

    // Arrange
    $.mockjaxClear();
    $.mockjax({
        url: 'sampleUrl',
        responseTime: 750,
        response: function () {
            this.responseText = '{"Id":1,"Code":"9999","Name":"Ajax Test"}';
        }
    });
    
    
    // Act/Assert
    stop();
    $.ajax({
        url: 'sampleUrl',
        type: "GET",
        dataType: "json",
        success: function(json) {
            ok(json, "Data has been returned");
            equal(1, json.Id, "Id should be 1");
            start();
        }
    });

    
    $.mockjaxClear();
});

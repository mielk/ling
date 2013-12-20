test("ShouldListManagerHaveFilter", function () {
    var manager = new ListManager({});
    ok(manager.filer);
});
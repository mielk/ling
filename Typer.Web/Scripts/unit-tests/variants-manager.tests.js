module('VariantsManager tests', {
    setup: function () {
        $.mockjaxClear();
        //mock.mockIcpAjaxService("");
    },
    teardown: function () {
        $.mockjaxClear();
    }
});



function createContainer(content) {

    var container = jQuery('<div/>', {
        'class': 'ui-unit-test-container'
    });

    container.appendTo(document.body);

    return container;

}

function createQueryOptions() {

}

function createVariantSets(counter) {
    var result = mielk.hashTable();;
    for (var i = 0; i < counter; i++) {
        var set = new VariantSet(null, { Id: i });
        result.setItem(i, set);
    }
}

function createQuery(params) {
    var query = new Query({
        Id: 1,
        Name: 'TestQuery',
        Weight: 10,
        IsActive: true,
        Options: params.options || []
    });

    if (params.sets) {
        query.createVariantSets(params.sets);
    }

    return query;

}

test('After separating variant set from a group with more than one item, new group with this variant set only should be created', function () {
    expect(1);

    //Arrange
    var sets = [
        { Id: 1, LanguageId: 1, Related: [2, 3] },
        { Id: 2, LanguageId: 2, Related: [1, 3] },
        { Id: 3, LanguageId: 3, Related: [1, 2] }
    ];

    var query = createQuery({ sets: sets });
    var manager = new VariantsManager(query);
    manager.display();

    var set = query.sets.getItem(1);

    //Act
    set.separate();
    

    //Assert
    equal(manager.groups.size(), 2, 'Manager should have 2 groups now.');

});
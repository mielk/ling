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
    manager.confirm();

    var set = query.sets.getItem(1);

    //Act
    set.separate();


    //Assert
    equal(manager.groups.size(), 2, 'Manager should have 2 groups now.');

});

test('If all variant sets are connected variant manager has only one group', function () {
    expect(2);

    //Arrange
    var sets = [
        { Id: 1, LanguageId: 1, Related: [2, 3] },
        { Id: 2, LanguageId: 2, Related: [1, 3] },
        { Id: 3, LanguageId: 3, Related: [1, 2] }
    ];

    var query = createQuery({ sets: sets });

    //Act
    var manager = new VariantsManager(query);

    //Assert
    equal(manager.groups.size(), 1, 'Manager should have 1 group');
    equal(manager.groups.values()[0].sets.size(), 3, 'Variants group should have 3 items.');

});

test('Variant manager has three group with single item if there are three sets without any connections', function () {
    expect(4);

    //Arrange
    var sets = [
        { Id: 1, LanguageId: 1, Related: [] },
        { Id: 2, LanguageId: 2, Related: [] },
        { Id: 3, LanguageId: 3, Related: [] }
    ];

    var query = createQuery({ sets: sets });

    //Act
    var manager = new VariantsManager(query);
    var groups = manager.groups.values();

    //Assert
    equal(manager.groups.size(), 3, 'Manager should have 3 groups');
    equal(groups[0].sets.size(), 1, 'First group should have 1 item.');
    equal(groups[1].sets.size(), 1, 'Second group should have 1 item.');
    equal(groups[2].sets.size(), 1, 'Third group should have 1 item.');

});

test('Variant manager has proper number and size of groups', function () {
    expect(3);

    //Arrange
    var sets = [
        { Id: 1, LanguageId: 1, Related: [2] },
        { Id: 2, LanguageId: 2, Related: [1] },
        { Id: 3, LanguageId: 3, Related: [] }
    ];

    var query = createQuery({ sets: sets });

    //Act
    var manager = new VariantsManager(query);
    var groups = manager.groups.values();

    //Assert
    equal(manager.groups.size(), 2, 'Manager should have 3 groups');
    equal(groups[0].sets.size(), 2, 'First group should have 2 items.');
    equal(groups[1].sets.size(), 1, 'Second group should have 1 item.');

});

function WordListManager(properties) {

    'use strict';

    //Default properties for this type of list.
    var defaultParams = {
          pageItems: Ling.Config.entities.pageSize
        , currentPage: 1
        , columns: ['id', 'name', 'weight', 'type', 'categories']
        , filters: ['wordtype', 'weight', 'categories', 'text']
    };
    var params = properties ? properties : {};
    mielk.objects.addProperties(params, defaultParams);
    
    //Inherit from ListManager.
    ListManager.call(this, params);

    var self = this;

    //Class signature.
    self.WordListManager = true;
    self.name = 'Words';
    
}
mielk.objects.extend(ListManager, WordListManager);
mielk.objects.addProperties(WordListManager.prototype, {
    
    createObject: function (properties) {
        return new Metaword(properties);
    },

    emptyItem: function (filters) {
        return new Metaword({
            Id: 0
            , Name: ''
            , Weight: (filters.weight && filters.weight.from && filters.weight.from === filters.weight.to ? filters.weight.from : 1)
            , Type: filters.wordtype ? filters.wordtype.id : 0
            , IsActive: true
            , CreatorId: Ling.Users.Current.id
            , CreateDate: new Date().getTime
            , IsApproved: false
            , Positive: 0
            , Negative: 0
            , Categories: (filters.categories && filters.categories.length === 1 ? filters.categories : [])
            , 'new': true
        });
    }

});
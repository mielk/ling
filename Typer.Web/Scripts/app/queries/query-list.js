
function QueryListManager(properties) {

    'use strict';

    //Default properties for this type of list.
    var defaultParams = {
          pageItems: Ling.Config.entities.pageSize
        , currentPage: 1
        , columns: ['id', 'name', 'weight', 'categories']
        , filters: ['weight', 'categories', 'text']
    };
    var params = properties ? properties : {};
    mielk.objects.addProperties(params, defaultParams);

    //Inherit from ListManager.
    ListManager.call(this, params);

    var self = this;

    //Class signature.
    self.QueryListManager = true;
    self.name = 'Questions';

}
mielk.objects.extend(ListManager, QueryListManager);
mielk.objects.addProperties(QueryListManager.prototype, {
    
    createObject: function(properties) {
        return new Query(properties);
    },

    emptyItem: function (filters) {
        return new Query({
            Id: 0
            , Name: ''
            , Weight: (filters.weight && filters.weight.from && filters.weight.from === filters.weight.to ? filters.weight.from : 1)
            , IsActive: true
            , CreatorId: Ling.Users.Current.id
            , CreateDate: new Date()
            , IsApproved: false
            , Positive: 0
            , Negative: 0
            , Categories: (filters.categories && filters.categories.length === 1 ? filters.categories : [])
            , IsNew: true
        });
    }
    
});
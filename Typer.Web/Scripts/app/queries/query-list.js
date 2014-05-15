
function QueryListManager(properties) {

    'use strict';

    //Default properties for this type of list.
    var defaultParams = {
          pageItems: 10
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
    self.name = 'Queries';

}
mielk.objects.extend(ListManager, QueryListManager);
mielk.objects.addProperties(QueryListManager.prototype, {
    
    createObject: function(properties) {
        return new Query(properties);
    },

    createListItem: function(object) {
        //return new QuestionListItem(this, object);
    },

    emptyItem: function() {
        //var filters = this.filterManager.filters;
        //return new Question({
        //    Id: 0,
        //    Name: '',
        //    Weight: filters.weight || 1,
        //    IsActive: true,
        //    CreatorId: 1,
        //    CreateDate: new Date().getTime,
        //    IsApprover: false,
        //    Positive: 0,
        //    Negative: 0,
        //    Categories: (filters.categories && filters.categories.length === 1 ? filters.categories : []),
        //    'new': true
        //});
    }
    
});
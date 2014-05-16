
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



//Klasa reprezentująca pojedynczy wpis na liście zapytań.
function QueryListItem(controller, properties) {

    'use strict';

    var self = this;

    //Class signature.
    self.QueryListItem = true;
    self.name = 'query';

    ListItem.call(self, controller, properties);

    self.view = new QueryListItemView(self.controller, self);

}
mielk.objects.extend(ListItem, QueryListItem);
mielk.objects.addProperties({

    detailsTableName: 'GetWords'

});





function QuestionListItemView(manager, item) {
    ListItemView.call(this, manager, item);
    this.QuestionListItemView = true;
}
mielk.objects.extend(ListItemView, QuestionListItemView);
QuestionListItemView.prototype.loadDetails = function () {
    var self = this;
    var object = self.object;
    var spinner = new SpinnerWrapper($(this.details));

    $.ajax({
        url: '/Questions/GetOptions',
        type: "GET",
        data: {
            'id': object.id,
            'languages': self.manager.getLanguagesIds()
        },
        datatype: "json",
        async: true,
        cache: false,
        traditional: true,
        success: function (result) {
            self.renderItems(result);
            spinner.stop();
        },
        error: function () {
            spinner.stop();
            self.loadDetails();
        }
    });
};
QuestionListItemView.prototype.renderItems = function (options) {
    var self = this;
    var languages = self.manager.getLanguages();
    var columns = {};

    for (var i = 0; i < languages.length; i++) {
        var language = languages[i];
        var column = jQuery('<div/>', {
            'class': 'details-column'
        }).appendTo(self.details);
        columns[language.id] = column;
    }

    for (var j = 0; j < options.length; j++) {
        var option = options[j];
        var languageId = option.LanguageId;
        var languageColumn = columns[languageId];
        var icon = jQuery('<div/>', {
            'class': 'details-icon',
            title: option.Name
        }).appendTo(languageColumn);
        $(icon).addClass(option.IsCompleted ? 'complete' : 'incomplete');
    }

};




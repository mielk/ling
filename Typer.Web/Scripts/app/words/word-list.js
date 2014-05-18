
function WordListManager(properties) {

    'use strict';

    //Default properties for this type of list.
    var defaultParams = {
          pageItems: 10
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

    emptyItem: function () {
        //var filters = this.filterManager.filters;
        //return new Metaword({
        //    Id: 0,
        //    Name: '',
        //    Weight: (filters.weight && filters.weight.from && filters.weight.from === filters.weight.to ? filters.weight.from : 1),
        //    Type: filters.wordtype || 0,
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





function WordListItemView(manager, item) {
    ListItemView.call(this, manager, item);
    this.WordListItemView = true;
    var self = this;

    //Add panels specific for this type of objects.
    this.type = jQuery('<div/>', { 'class': 'type', html: self.object.wordtype.symbol }).appendTo($(this.container));
    $(this.categories).before(this.type);

    this.object.bind({
        changeWordtype: function (e) {
            self.type.html(e.wordtype.symbol);
        }
    });

}
mielk.objects.extend(ListItemView, WordListItemView);
//WordListItemView.prototype.loadDetails = function () {
//    var self = this;
//    var object = self.object;
//    var spinner = new SpinnerWrapper($(this.details));

//    $.ajax({
//        url: '/Words/GetWords',
//        type: "GET",
//        data: {
//            'id': object.id,
//            'languages': self.manager.getLanguagesIds()
//        },
//        datatype: "json",
//        async: true,
//        cache: false,
//        traditional: true,
//        success: function (result) {
//            self.renderItems(result);
//            spinner.stop();
//        },
//        error: function () {
//            spinner.stop();
//            self.loadDetails();
//        }
//    });

//};
WordListItemView.prototype.renderItems = function (words) {
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

    for (var j = 0; j < words.length; j++) {
        var word = words[j];
        var languageId = word.LanguageId;
        var languageColumn = columns[languageId];
        var icon = jQuery('<div/>', {
            'class': 'details-icon',
            title: word.Name
        }).appendTo(languageColumn);
        $(icon).addClass(word.IsCompleted ? 'complete' : 'incomplete');
    }

};


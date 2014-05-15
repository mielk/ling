
function ListFilterManager(controller, filters) {

    'use strict';

    ListManagerPanel.call(this, controller);
    var self = this;

    //Class signature.
    self.ListFilterManager = true;
    

    self.filtersObject = function ($filters) {
        var result = {};
        mielk.arrays.each($filters ? $filters : [], function (item) {
            result[item] = true;
        });
        return result;
    };

    self.panel = new FilterPanel(self.filtersObject(filters));
    self.panel.bind({
        filter: function (e) {
            self.controller.filter(e);
        }
    });

    self.filters = {
        wordtype: 0,
        categories: [],
        text: '',
        weight: { from: 0, to: 0 }
    };

}
mielk.objects.extend(ListManagerPanel, ListFilterManager);
mielk.objects.addProperties(ListFilterManager.prototype, {
    
    //Funkcja zmieniająca ustawienie podanego filtra.
    changeFilterValue: function(key, value) {
        if (value !== null && value !== undefined) {
            this.filters[key] = value;
        }
    },

    view: function() {
        return this.panel.view();
    },

    filter: function(e) {
        //var self = this;

        ////Update filters values array.
        //for (var key in this.filters) {
        //    if (e.hasOwnProperty(key)) {
        //        var value = e[key];
        //        this.filters[key] = value;
        //    }
        //}

        //$.ajax({
        //    url: '/' + self.controller.name + '/Filter',
        //    type: "GET",
        //    data: {
        //        'wordtype': this.filters.wordtype,
        //        'lowWeight': this.filters.weight.from,
        //        'upWeight': this.filters.weight.to,
        //        'categories': this.filters.categories,
        //        'text': this.filters.text,
        //        'page': e.page || 1,
        //        'pageSize': e.pageItems || self.controller.pageItems()
        //    },
        //    traditional: true,
        //    datatype: "json",
        //    async: false,
        //    cache: false,
        //    success: function(result) {
        //        self.controller.trigger({
        //            type: 'filter',
        //            items: result.items,
        //            total: result.total,
        //            page: e.page || 1
        //        });
        //    },
        //    error: function(msg) {
        //        alert(msg.status + " | " + msg.statusText);
        //        return null;
        //    }
        //});

    }
});
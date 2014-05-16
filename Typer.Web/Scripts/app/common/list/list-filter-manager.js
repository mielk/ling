
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
        wordtype: Ling.Enums.Wordtypes.getDefault().id,
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

    filter: function (e) {

        var self = this;
        var controller = self.controller;
        
        //Update filters values array.
        for (var key in this.filters) {
            if (e.hasOwnProperty(key)) {
                var value = e[key];
                this.filters[key] = value;
            }
        }

        mielk.db.fetch(controller.name, 'Filter', {
            'wordtype': self.filters.wordtype,
            'lowWeight': self.filters.weight.from,
            'upWeight': self.filters.weight.to,
            'categories': self.filters.categories,
            'text': self.filters.text,
            'page': e.page || 1,
            'pageSize': e.pageSize || controller.pageItems()
        }, {
            async: false,
            cache: false,
            traditional: true,
            callback: function(result) {
                controller.trigger({
                    type: 'filter',
                    items: result.items,
                    total: result.total,
                    page: e.page || 1
                });
            },
            errorCallback: function() {
                mielk.notify.display('Error when trying to filter [' + controller.name + ']', false);
            }
        });

    }
});
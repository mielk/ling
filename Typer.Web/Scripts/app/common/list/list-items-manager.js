
function ListItemsManager(controller) {

    'use strict';

    var self = this;
    
    //Class signature.
    self.ListItemsManager = true;

    //Inherit from ListManagerPanel class.
    ListManagerPanel.call(self, controller);
    
    self.items = [];

    self.ui = (function() {
        var container = jQuery('<div/>');

        function addItem(content) {
            $(content).appendTo(container);
        }

        function clear() {
            $(container).empty();
        }

        return {            
              view: container
            , addItem: addItem
            , clear: clear
        };

    })();

    controller.bind({
        filter: function (e) {
            self.refresh(e.items);
        }
    });

}
mielk.objects.extend(ListManagerPanel, ListItemsManager);
mielk.objects.addProperties(ListItemsManager.prototype, {    
    
    refresh: function (items) {
        var self = this;
        var counter = 0;

        self.clear();

        mielk.arrays.each(items, function (item) {
            var object = self.controller.createObject(item);
            var listItem = object.toListItem();

            self.ui.addItem(listItem.view());
            self.items[counter++] = object;

        });

        this.loadDetails();

    },
    
    clear: function () {
        this.items.length = 0;
        this.ui.clear();
    },
    
    loadDetails: function () {
        mielk.arrays.each(this.items, function(entity) {
            entity.listItem.loadDetails();
        });
    },
    
    view: function() {
        return this.ui.view;
    }
    
});
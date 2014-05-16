
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

        mielk.arrays.each(items, function(item) {
            var object = this.controller.createObject(item);
            mielk.notify.display('list-items-manager.js :: usunięta zmienna listItem, od teraz będzie zawarta w obiekcie typu Metaword / Query', false);
            //var listItem = this.controller.createListItem(object);
            self.ui.addItem(object.view);
            self.items[counter++] = item;
        });

        this.loadDetails();

    },
    
    clear: function () {
        this.items.length = 0;
        this.ui.clear();
    },
    
    loadDetails: function () {
        mielk.arrays.each(this.items, function(item) {
            item.loadDetails();
        });
    },
    
    view: function() {
        return this.ui.view;
    }
    
});
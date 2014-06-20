//Podklasa reprezentująca panel edycji dla subitemów.
//Dziedziczy po głównej klasie edycji.
function EditOptionPanel(entity) {

    'use strict';

    var self = this;

    self.EditOptionPanel = true;

    EditPanel.call(self, entity);

}
mielk.objects.extend(EditPanel, EditOptionPanel);
mielk.objects.addProperties(EditOptionPanel.prototype, {
      //[Override]
      initialize: function() {
        this.insertMetadata();
        this.insertProperties();
        this.insertDetails();
    }
    
    , insertProperties: function() {
        var self = this;

        //Tworzy kontener do przechowywania szczegółowych informacji.
        var container = jQuery('<div/>', {
            'class': 'subitem-properties-container'
        });

        //Iterate trough all properties and create a UI for each of them.
        self.editObject.properties.each(function(key, item) {
            var propertyContainer = jQuery('<div/>', { 'class': 'property-container' });
            var control = item.property.type.control({
                name: item.property.name,
                container: propertyContainer,
                value: item.value ? item.value.id : item.property.defaultValue,
                options: item.property.options
            });

            if (!control) return;

            //Attach events handlers to this control.
            var eventName = item.property.changeEventName();
            control.bind({
                click: function(e) {
                    item.value = e.object;
                    
                    self.editObject.trigger({
                        type: eventName,
                        property: item.property,
                        value: item.value,
                        propagate: false
                    });
                }
            });

            //Attach event of changing value.
            var events = {};
            events[eventName] = function (e) {
                if (e.propagate !== false) {
                    var value = e.value.property.isBoolean() ? e.value.value : e.value.id;
                    control.change(value);
                }
            };
            self.editObject.bind(events);

            $(control.view).appendTo(container);

        });

        self.ui.appendDetailsView(container);

    }

    //[Override]
    , insertDetails: function() {

        var grammarPanel = new GrammarPanel(this.editObject);
        this.ui.appendDetailsView(grammarPanel.view());

    }

});
//Podklasa reprezentująca panel edycji dla subitemów.
//Dziedziczy po głównej klasie edycji.
function EditQueryPanel(entity) {

    'use strict';

    var self = this;

    self.EditQueryPanel = true;

    EditPanel.call(self, entity);

}
mielk.objects.extend(EditPanel, EditQueryPanel);
mielk.objects.addProperties(EditQueryPanel.prototype, {
      //[Override]
      initialize: function() {
        this.insertMetadata();
        this.insertVariantSetsManager();
        this.insertDetails();
    }

    //Wstawia ramkę przeznaczoną do definiowania zestawów wariantów.
    , insertVariantSetsManager: function() {
        var panel = new VariantSetsPanel(this.editObject);
        this.ui.append(panel.view(), 'details');
    }

});



function VariantSetsPanel(query) {

    'use strict';

    var self = this;
    self.VariantSetsPanel = true;

    self.query = query;

    self.ui = (function () {

        var container = jQuery('<div/>', {
            'class': 'variant-sets-panel'
        });

        var editButton = jQuery('<input/>', {
            'class': 'variant-button-edit',
            'type': 'submit',
            'value': 'Edit variants'
        }).appendTo(container);

        editButton.bind({
            click: function () {
                alert(100);
                //self.object.editVariants();
            }
        });

        function displayVariantSets() {
            self.query.sets.each(function (key, set) {
                var block = set.getBlock();
                block.bind({
                    click: function (e) {
                        alert(block.set.tag + ' clicked');
                    }
                })
                $(block.view).appendTo(container);
            });
        }


        (function initialize() {
            displayVariantSets();
        })();

        return {
            view: container
        };

    })();

}
VariantSetsPanel.prototype = {

    view: function () {
        return this.ui.view;
    }

};
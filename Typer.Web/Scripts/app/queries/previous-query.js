/*
 * Previous query
 *
 * Date: 2014-05-14 15:49
 *
 */
function PreviousQuery(controller, params) {

    'use strict';

    var self = this;

    //Class signature.
    self.PreviousQuery = true;

    //Instance properties.
    self.controller = controller;

    self.query = params.Query;
    self.stats = params.Stats;

    //UI controls.
    self.editIcon = 1;

}
mielk.objects.addProperties(PreviousQuery.prototype, {

    remove: function () {
        this.parent.removeItem(this);
        this.trigger({ type: 'remove' });
    }

    , htmlContent: function () {
        var self = this;
        var content = self.content;
        var parts = content.split('#');

        //UI.
        var container = jQuery('<div/>');
        mielk.arrays.each(parts, function (part) {
            if (!part) return;

            if ($.isNumeric(part)) {
                // ReSharper disable once UnusedLocals
                var variant = (function () {
                    var id = Number(part);
                    var set = self.parent.getVariantSet(id);
                    var view = jQuery('<span/>', {
                        'class': 'complex',
                        html: set.tag
                    });
                    $(view).appendTo(container);
                })();

                //Dodać binding.

            } else {
                var span = jQuery('<span/>', {
                    'class': 'plain',
                    html: part
                });
                $(span).appendTo(container);
            }

        });

        return container;

    }

});
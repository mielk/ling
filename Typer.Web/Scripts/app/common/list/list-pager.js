
//Klasa obsługująca oznaczanie stron i przeskakiwanie pomiędzy stronami.
function ListPager(controller, properties) {

    'use strict';

    var self = this;
    
    //Class signature.
    self.ListPager = true;
    
    ListManagerPanel.call(self, controller);
    
    self.pageItems = properties.pageItems || 10;
    self.page = properties.page || 1;
    self.totalItems = properties.totalItems || 0;
    self.totalPages = 1;

    self.events = (function() {
        self.controller.bind({
            filter: function (e) {
                self.page = e.page;
                self.setTotalItems(e.total);
                self.refresh();
            }
        });
    })();

    self.ui = (function () {
        
        var container = jQuery('<div/>', {
            'class': 'pager'
        });

        mielk.notify.display('Zmienić sposób prezentacji podstron w list-pager.js', false);

        // ReSharper disable UnusedLocals
        var first =     element('first',    'First',    function () { self.controller.moveToPage(1); });
        var previous =  element('previous', 'Previous', function () { self.controller.moveToPage(self.page - 1); });
        var current =   element('current',  '',         function () { });
        var next =      element('next',     'Next',     function () { self.controller.moveToPage(self.page + 1); });
        var last =      element('last',     'Last',     function () { self.controller.moveToPage(self.totalPages); });
        // ReSharper restore UnusedLocals

        function element(cssClass, caption, callback) {
            return jQuery('<div/>', {
                'class': 'pager-item ' + cssClass,
                html: caption
            }).bind({
                click: callback
            }).appendTo($(container));
        }

        return {
            view: container,
            currentHtml: function (value) {
                if (value === undefined) {
                    return current.innerHTML;
                } else {
                    $(current).html(value);
                }
                return true;
            },
            enablePrevious: function (value) {
                display(first, value);
                display(previous, value);
            },
            enableNext: function (value) {
                display(next, value);
                display(last, value);
            }
        };

    })();

}
mielk.objects.extend(ListManagerPanel, ListPager);
mielk.objects.addProperties(ListPager.prototype, {    
    setTotalItems: function (items) {
        this.totalItems = items;
        this.totalPages = Math.max(Math.floor(this.totalItems / this.pageItems) + (this.totalItems % this.pageItems ? 1 : 0), 1);
    }, 
    
    view: function () {
        return this.ui.view;
    },
    
    refresh: function () {
        this.ui.currentHtml(this.page + '/' + this.totalPages);
        this.ui.enablePrevious(this.page !== 1);
        this.ui.enableNext(this.page !== this.totalPages);
    }  
});
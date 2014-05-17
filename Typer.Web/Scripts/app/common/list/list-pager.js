
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
        
        var labels = [];

        var container = jQuery('<div/>', {
            'class': 'pager'
        });

        function label(i) {
            return jQuery('<div/>', {
                'class': 'pager-label' + (i === self.page ? ' active' : ''),
                html: i
            }).bind({
                click: function () {
                    self.controller.moveToPage(i);
                }
            }).appendTo(container);
        }

        function addSeparator() {
            return jQuery('<div/>', {
                  'class': 'pager-label separator'
                , 'html': '...'
            }).appendTo(container);
        }

        function addLabels(numbers) {
            var current = 0;
            clear();

            mielk.arrays.each(numbers, function (index) {

                if (current !== (index - 1)) {
                    //Jeżeli jest różnica większa niż 1, wstawia ...
                    addSeparator();
                }

                var lbl = label(index);
                labels.push(lbl);

                current = index;

            });

        }
            
        function clear(){
            $(container).empty();
            labels.length = 0;
        }

        return {
              view: container
            , addLabels: addLabels
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
        var numbers = this.calculateDisplayedPages();
        this.ui.addLabels(numbers);
    },

    //Funkcja wyznaczająca, które numery podstron mają być widoczne
    //w zależności od aktualnie aktywnej podstrony i łącznej liczby
    //podstron.
    calculateDisplayedPages: function(){
        var START_ITEMS = 3;
        var END_ITEMS = 3;
        var NEIGHBOUR_ITEMS = 4;
        var total = START_ITEMS + END_ITEMS + 2 * NEIGHBOUR_ITEMS + 1;

        var array = [];
        if (this.totalPages <= total) {
            for (var i = 1; i <= this.totalPages; i++) {
                array.push(i);
            }
        } else {

            var j = 1;
            var left = (this.page - NEIGHBOUR_ITEMS <= START_ITEMS ? total - END_ITEMS : START_ITEMS);
            var right = (this.page + NEIGHBOUR_ITEMS >= this.totalPages - END_ITEMS ? total - START_ITEMS : END_ITEMS);

            //Dodaje pierwsze podstrony.
            for (j = 1; j <= left; j++) {
                array.push(j);
            }

            //Dodaje aktualnie wybraną podstronę oraz po cztery
            //sąsiednie podstrony ([!] ale tylko w sytuacji, kiedy
            //podstrony nie zostały dołączone do grupy początkowych
            //lub końcowych podstron - stąd to sprawdzenie czy left
            //i right mają normalną długość, czy też są powiększone
            //o aktualnie wyświetlaną stronę i jej sąsiadów. W przeciwnym
            //razie w ogóle nie są wyświetlane w oddzielnej pętli.
            if (left === START_ITEMS && right === END_ITEMS) {
                for (j = this.page - NEIGHBOUR_ITEMS; j <= this.page + NEIGHBOUR_ITEMS; j++) {
                    array.push(j);
                }
            }

            //Dodaje ostatnie podstrony.
            for (j = this.totalPages - right + 1; j <= this.totalPages; j++) {
                array.push(j);
            }

        }

        return array;

    }
});
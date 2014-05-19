
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
        var startItems = 3;
        var endItems = 3;
        var neighbourItems = 4;
        var total = startItems + endItems + 2 * neighbourItems + 1;

        var array = [];
        if (this.totalPages <= total) {
            for (var i = 1; i <= this.totalPages; i++) {
                array.push(i);
            }
        } else {

            var j;
            var left = (this.page - neighbourItems <= startItems ? total - endItems : startItems);
            var right = (this.page + neighbourItems >= this.totalPages - endItems ? total - startItems : endItems);

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
            if (left === startItems && right === endItems) {
                for (j = this.page - neighbourItems; j <= this.page + neighbourItems; j++) {
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
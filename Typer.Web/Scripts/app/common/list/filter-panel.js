
function FilterPanel(properties) {

    'use strict';

    var self = this;

    //Class signature.
    self.FilterPanel = true;

    self.filters = mielk.hashTable();
    self.eventHandler = mielk.eventHandler();
    self.ui = new FilterPanelView(self, properties);

    self.setFilters(properties);
    self.addConfirmationButton();
    self.addCollapser(properties.collapser, properties.visible);

}
FilterPanel.prototype = {
    bind: function (e) {
        this.eventHandler.bind(e);
        return this;
    },

    trigger: function (e) {
        this.eventHandler.trigger(e);
        return this;
    },

    collapse: function () {
        this.ui.collapse();
    },

    expand: function () {
        this.ui.expand();
    },

    setFilters: function(properties){
        var self = this;

        if (properties.wordtype) self.addFilter('wordtype', new WordTypeFilter(self));
        if (properties.weight) self.addFilter('weight', new WeightFilter(self));
        if (properties.text) self.addFilter('text', new TextFilter(self));
        if (properties.categories) self.addFilter('categories', new CategoryFilter(self));

        //Renderowanie filtrów. Odbywa się osobno, ponieważ w momencie renderowania
        //pierwszego filtra potrzebna jest już informacja ile będzie łącznie filtrów,
        //żeby odpowiednio rozmieścić je w panelu.
        this.filters.each(function (key, value) {
            self.ui.addFilter(key, value);
        });

    },

    addConfirmationButton: function(){
        this.button = new FilterButton(this);
        this.ui.append(this.button, 'buttons');
    },

    addCollapser: function(flag, visible){
        if (flag !== false) {
            this.collapser = new FilterCollapser(this, visible ? true : false);
            this.ui.append(this.collapser);
        }
    },

    filter: function () {
        var eventParams = {
            type: 'filter'
        };

        this.refreshFilterValues();

        this.filters.each(function(key, filter) {
            eventParams[filter.name] = filter.value;
        });

        this.eventHandler.trigger(eventParams);

    },

    refreshFilterValues: function () {
        this.filters.each(function (key, filter) {
            if (filter.AbstractFilter) filter.refresh();
        });
    },

    addFilter: function (name, filter) {
        this.filters.setItem(name, filter);
    },

    view: function () {
        return this.ui.view();
    }

};




function FilterPanelView(parent, properties) {

    'use strict';

    var self = this;

    //Class signature.
    self.FilterPanelView = true;

    self.parent = parent;
    self.added = mielk.hashTable();
    self.render(properties);

}
FilterPanelView.prototype = {

    collapse: function () {
        $(this.panel).css({
            'display': 'none'
        });
    },

    expand: function () {
        $(this.panel).css({
            'display': 'block'
        });
    },

    render: function(properties){
        this.container = jQuery('<div/>', { 'class': 'filter-container' });
        this.panel = jQuery('<div/>', { 'class': 'filter-panel' }).appendTo($(this.container));
        if (properties.minWidth === false) {
            $(this.panel).css({
                '-moz-min-width': 'auto',
                '-ms-min-width': 'auto',
                '-o-min-width': 'auto',
                '-webkit-min-width': 'auto',
                'min-width': 'auto'
            });
        }

        this.left = jQuery('<div/>', { 'class': 'left' }).appendTo($(this.panel));
        this.buttons = jQuery('<div/>', { 'class': 'button' }).appendTo($(this.panel));
        this.right = jQuery('<div/>', { 'class': 'right' }).appendTo(jQuery('<span/>', { 'class': 'full-height block' }).appendTo($(this.panel)));

        this.container.appendTo(properties.container);

    },

    append: function (element, parent) {
        var div = this[parent];
        //Jeżeli nie znaleziono panelu z podanym id, 
        //element zostaje dodany do głównego kontenera.
        $(element.view()).appendTo(div ? div : this.container);
    },

    addFilter: function (key, filter) {
        var total = this.parent.filters.size();
        var added = this.added.size();
        var panel = (added++ < total / 2 ? this.left : this.right);
        $(filter.view()).appendTo($(panel));

        //Kolekcja [added] zbiera informacje o już dodanych filtrach, głównie
        //po to, żeby wiedzieć ile filtrów zostało już wrzuconych i do którego
        //panelu (lewego czy prawego) powinien trafić kolejny filtr.
        this.added.setItem(key, filter);

    },

    view: function () {
        return this.container;
    }

    //UI components.

};



//Przycisk służący do zatwierdzania ustawionych 
//filtrów i rozpoczęcia filtrowania listy.
function FilterButton(panel) {

    'use strict';

    var self = this;

    //Class signature.
    self.FilterButton = true;

    self.panel = panel;
    self.ui = (function () {
        var button = jQuery('<div/>', {
            'class': 'search-button', html: 'Search'
        }).bind({
            click: function () {
                self.panel.filter();
            }
        }).appendTo(jQuery('<div/>', { 'class': 'label-table' }));

        return {
            view: button
        };

    })();

}
FilterButton.prototype.view = function () {
    return this.ui.view;
};



//Klasa obsługująca zwijanie i rozwijanie panelu filtra.
function FilterCollapser(panel, visibility) {

    'use strict';

    var self = this;

    //Class signature.
    self.FilterCollapser = true;

    self.panel = panel;
    self.visible = visibility;
    self.ui = (function () {
        var container = jQuery('<div/>', {
            'class': 'search-collapser'
        }).bind({
            click: function () {
                self.changeStatus();
            }
        });

        return {
            view: container
        };

    })();


    (function initialize(){
        self.changeStatus(visibility);
    })();

}
FilterCollapser.prototype = {
    view: function() {
        return this.ui.view;
    },

    changeStatus: function(value) {
        var state = (value !== undefined ? value : !this.visible);
        this.visible = state;
        if (state) {
            this.panel.expand();
        } else {
            this.panel.collapse();
        }

    }
};




//Klasa abstrakcyjna po której dziedziczą wszystkie filtry.
function AbstractFilter(panel) {

    'use strict';

    var self = this;
    
    //Class signature.
    self.AbstractFilter = true;

    self.panel = panel;
    self.ui = (function () {
        var container = jQuery('<div/>', { 'class': 'single-panel' });
        var labelContainer = jQuery('<div/>', { 'class': 'label-container' }).appendTo($(container));
        // ReSharper disable UnusedLocals
        var label = jQuery('<div/>', { 'class': 'label', html: self.name }).
            appendTo(jQuery('<div/>', { 'class': 'label-table' }).appendTo($(labelContainer)));
        var content = $(self.content.view).appendTo(container);
        // ReSharper restore UnusedLocals        

        return {
            view: container
        };

    })();

}
AbstractFilter.prototype = {    

    view: function () {
        return this.ui.view;
    },
    
    refresh: function() {
        alert('Must be defined in implementing class');
    }

};



//Filtr wg typu wyrazu.
function WordTypeFilter(panel) {

    'use strict';

    var self = this;

    //Class signature.
    self.WordTypeFilter = true;
    self.name = 'wordtype';
    self.content = (function () {

        var container = jQuery('<div/>', {
            id: 'word-type',
            'class': 'word-type content-container'
        });

        var dropdownData = Ling.Enums.Wordtypes.getValues();
        var dropdown = new DropDown({
            container: container
            ,data: dropdownData
        });

        dropdown.bind({
            change: function (e) {
                self.value = e.item && e.item.id ? e.item.id : 0;
            }
        });

        return {
            view: container
        };

    })();
    self.value = 1;

    AbstractFilter.call(self, panel);

}
mielk.objects.extend(AbstractFilter, WordTypeFilter);
mielk.objects.addProperties(WordTypeFilter.prototype, {
    
    refresh: function() {
        this.value = this.value || 0;
    }

});



//Filtr wg wagi wyrazu.
function WeightFilter(panel) {

    'use strict';

    var self = this;
    
    //Class signature.
    self.WeightFilter = true;
    self.name = 'weight';
    self.minWeight = 1;
    self.maxWeight = 10;
    self.value = {
        from: 0,
        to: 0
    };
    self.content = (function () {

        // ReSharper disable UnusedLocals

        var container = jQuery('<div/>', {
            'class': 'content-container'
        });

        var valueField = function (name) {

            var label = jQuery('<div/>', { 'class': 'label', html: name }).
                appendTo(jQuery('<div/>', { 'class': 'label-table' }).
                appendTo(jQuery('<div/>', { 'class': 'lbl' }).appendTo(container)));

            var input = jQuery('<input/>', { type: 'text' }).
                bind({
                    click: function () {
                        this.select(); this.focus();
                    },
                    blur: function () {
                        var value = mielk.numbers.checkValue($(this).val(), self.minWeight, self.maxWeight);
                        self.value[name] = value;
                        $(this).val(value ? value : '');
                    }
                }).
                appendTo(container);

            return {
                value: function () {
                    return mielk.numbers.checkValue($(input).val(), self.minWeight, self.maxWeight);
                }
            };

        };

        var from = valueField('from');
        var to = valueField('to');

        return {
            view: container
            , from: function () {
                return from.value();
            }
            , to: function () {
                return to.value();
            }
        };

        // ReSharper restore UnusedLocals

    })();
    
    AbstractFilter.call(self, panel);

}
mielk.objects.extend(AbstractFilter, WeightFilter);
mielk.objects.addProperties(WeightFilter.prototype, {

    refresh: function () {
        this.value.from = this.content.from();
        this.value.to = this.content.to();
    }

});



//Klasa obsługująca filtr wg kategorii.
function CategoryFilter(panel) {

    'use strict';

    var self = this;
    
    //Class signature.
    self.CategoryFilter = true;
    self.name = 'categories';
    self.categories = [];
    self.value = [];
    self.content = (function() {
        var container = jQuery('<div/>', {
            'class': 'content-container'
        });

        var addButton = jQuery('<div/>', {
            'class': 'search-select-categories-button'
        }).bind({
            click: function() {
                self.showTree();
            }
        });
        $(addButton).appendTo(container);


        //Funkcja dodająca nową kategorię.
        function addCategory(category) {
            $(category).appendTo(container);
        }

        //Funkcja usuwająca wszystkie dotychczasowe kategorie.
        function clear() {
            $(container).find('.category').remove();
        }

        return {            
              view: container
            , addCategory: addCategory
            , clear: clear
        };

    })();

    AbstractFilter.call(self, panel);

}
mielk.objects.extend(AbstractFilter, CategoryFilter);
mielk.objects.addProperties(CategoryFilter.prototype, {    

    changeCategories: function (items) {
        var self = this;
        self.categories.length = 0;
        self.content.clear();

        mielk.arrays.each(items, function (item) {
            self.addCategory(item);
        });
    },

    addCategory: function (item) {
        var node = item;
        var category = node.object;
        var selected = function ($parent, $node) {
            var $category = $node.object;


            // ReSharper disable UnusedLocals
            var ui = (function () {

                var container = jQuery('<div/>', {
                    'class': 'category'
                });

                var remove = jQuery('<div/>', {
                    'class': 'remove-category'
                }).appendTo(container);

                var name = jQuery('<div/>', {
                    'class': 'category-name',
                    html: $category.path()
                }).appendTo(container);

                $(remove).bind({
                    click: function () {
                        $node.select(false, true, true, true);  //TreeNode.prototype.select = function (value, applyForChildren, applyForParent, refreshSelected)
                        $(container).remove();
                        $parent.remove($category);
                    }
                });

                return {
                    container: container
                };

            })();
            // ReSharper restore UnusedLocals

            return {
                view: function() {
                    return ui.container;
                }
            };

        }(this, node);

        this.content.addCategory(selected.view());
        this.categories.push(category);

    },

    remove: function (category) {
        var array = [];

        mielk.arrays.each(this.categories, function (item) {
            if (item !== category) {
                array.push(item);
            }
        });

        this.categories = array;

    },

    refresh: function () {
        var array = [];
        mielk.arrays.each(this.categories, function (category) {
            var descendants = category.getDescendants();
            mielk.arrays.each(descendants, function (item) {
                array.push(item.key);
            });
        });

        this.value = array;

    },

    showTree: function () {
        var self = this;

        //Destroy previous tree if it is still open.
        if (self.tree) {
            self.tree.destroy();
        }

        //Create new tree view.
        self.tree = new Tree({
              'mode': MODE.MULTI
            , 'root': Ling.Categories.getRoot()
            , 'selected': self.categories
            , 'blockOtherElements': true
            , 'showSelection': true
            , 'hidden': true
        });
        self.tree.reset({ unselect: false, collapse: false });

        self.tree.eventHandler.bind({
            confirm: function (e) {
                self.changeCategories(e.item);
                self.tree.destroy();
            },
            add: function (e) {
                Ling.Categories.addNew(e);
            },
            remove: function (e) {
                Ling.Categories.remove(e);
            },
            rename: function (e) {
                Ling.Categories.updateName(e);
            },
            transfer: function (e) {
                Ling.Categories.updateParent(e);
            }
        });

        self.tree.show();

    }
    
});



//Klasa obsługująca filtrowanie wyników wg tekstu.
function TextFilter(panel) {

    'use strict';

    var self = this;
    
    //Class signature.
    self.TextFilter = true;
    self.name = 'text';
    self.value = '';
    self.content = (function() {
        var container = jQuery('<div/>', {
            'class': 'content-container'
        });
        
        var textbox = jQuery('<input/>', {
            id: 'text-contain',
            'class': 'contain',
            type: 'text'
        }).bind({        
            click: function() {
                this.select();
                this.focus();
            },
            keyup: function () {
                setTimeout(function () {
                    self.refresh();
                }, 50);
            }
        }).appendTo(container);

        function value() {
            return $(textbox).val();
        }

        return {
              view: container
            , value: value
    };

    })();

    AbstractFilter.call(self, panel);

}
mielk.objects.extend(AbstractFilter, TextFilter);
mielk.objects.addProperties(TextFilter.prototype, {    
    refresh: function () {
        this.value = this.content.value();
    }
});
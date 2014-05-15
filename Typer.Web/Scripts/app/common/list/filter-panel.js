
function FilterPanel(properties) {

    'use strict';

    var self = this;

    //Class signature.
    self.FilterPanel = true;

    self.filters = mielk.hashTable();
    self.eventHandler = mielk.eventHandler();
    self.view = new FilterPanelView(self, properties);

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
        this.view.collapse();
    },

    expand: function () {
        this.view.expand();
    },

    setFilters: function(properties){
        if (properties.wordtype) this.addFilter('wordtype', new WordTypeFilter(this));
        //if (properties.weight) this.addFilter('weight', new WeightFilter(this));
        //if (properties.text) this.addFilter('text', new TextFilter(this));
        //if (properties.categories) this.addFilter('categories', new CategoryFilter(this));
    },

    addConfirmationButton: function(){
        this.button = new FilterButton(this);
        this.view.append(this.button, 'buttons');
    },

    addCollapser: function(flag, visible){
        if (flag !== false) {
            this.collapser = new FilterCollapser(this, visible ? true : false);
            this.view.append(this.collapser);
        }
    },

    filter: function () {
        //var e = {};

        //this.refreshFilterValues();

        //this.filters.each(function (key, filter) {
        //    e[filter.name] = filter.value;
        //});

        //e.type = 'filter';
        //this.eventHandler.trigger(e);

    },

    refreshFilterValues: function () {
        //this.filters.each(function (key, filter) {
        //    if (filter.refresh && typeof (filter.refresh) === 'function') {
        //        filter.refresh();
        //    }
        //});
    },

    addFilter: function (name, filter) {
        this.filters.setItem(name, filter);
        this.view.addFilter(name, filter);
    },

    view: function () {
        return this.view.container;
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

    }

    //UI components.

};



//Przycisk służący do zatwierdzania ustawionych filtrów
//i rozpoczęcia filtrowania listy.
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
    view: function(){
        return this.ui.view;
    },

    changeStatus: function (value) {
        var state = (value !== undefined ? value : !this.visible);
        this.visible = state;
        if (state) {
            this.panel.expand();
        } else {
            this.panel.collapse();
        }

    }
}







//Klasa obsługująca kontener graficzny dla filtrów.
function FilterContainer(filter, properties) {

    'use strict';

    var self = this;

    //Class signature.
    self.FilterContainer = true;

    self.filter = filter;
    self.ui = (function () {
        var container = jQuery('<div/>', { 'class': 'single-panel' });
        var labelContainer = jQuery('<div/>', { 'class': 'label-container' }).appendTo(container);
        var label = jQuery('<div/>', { 'class': 'label', html: properties.name }).
            appendTo(jQuery('<div/>', { 'class': 'label-table' }).appendTo(labelContainer));
        var content = $(properties.content).appendTo(container);
    })();

}



//Filtr wg typu wyrazu.
function WordTypeFilter(panel) {

    'use strict';

    var self = this;

    //Class signature.
    self.WordTypeFilter = true;

    self.panel = panel;
    self.name = 'wordtype';
    self.value = null;

    self.ui = (function () {

        var container = jQuery('<div/>', {
            id: 'word-type',
            'class': 'word-type content-container'
        });

        var dropdownData = Ling.Enums.Wordtypes.getValues();
        var dropdown = new DropDown({
              container: container
            , data: dropdownData
        });

        dropdown.bind({
            select: function (e) {
                self.value = e.object && e.object.id ? e.object.id : 0;
            }
        });

        return {
            view: container
        };

    })();

    self.container = new FilterContainer(self, { name: self.name, content: self.ui.view });

}
WordTypeFilter.prototype = {

    refresh: function () {
        this.value = this.value || 0;
    },

    view: function () {
        return this.ui.view;
    }

};




//function WeightFilter(manager) {
//    var me = this;
//    this.minWeight = 1;
//    this.maxWeight = 10;
//    this.manager = manager;
//    this.name = 'weight';
//    this.value = {
//        from: 0,
//        to: 0
//    };
    

//    this.container = jQuery('<div/>', {
//        'class': 'content-container'
//    });
    
//    // ReSharper disable once UnusedLocals
//    var fromLabel = jQuery('<div/>', { 'class' : 'label', html: 'from' }).
//        appendTo(jQuery('<div/>', { 'class' : 'label-table' }).
//        appendTo(jQuery('<div/>', { 'class' : 'lbl' }).appendTo($(this.container))));

//    this.fromInput = jQuery('<input/>', { type: 'text' }).
//        bind({        
//            click: function () {
//                this.select(); this.focus();
//            },
//            blur: function () {
//                me.value.from = me.getProperValue($(this).val());
//                $(this).val(me.value.from ? me.value.from : '');
//            }
//        });
//    $(this.fromInput).appendTo($(this.container));

//    // ReSharper disable once UnusedLocals
//    var toLabel = jQuery('<div/>', { 'class' : 'label', html: 'to' }).
//        appendTo(jQuery('<div/>', { 'class' : 'label-table' }).
//        appendTo(jQuery('<div/>', { 'class' : 'lbl' }).appendTo($(this.container))));

//    this.toInput = jQuery('<input/>', { type: 'text' }).
//        bind({        
//            click: function () {
//                this.select(); this.focus();
//            },
//            blur: function () {
//                me.value.to = me.getProperValue($(this).val());
//                $(this).val(me.value.to ? me.value.to : '');
//            }
//        });
//    $(this.toInput).appendTo($(this.container));

//    this.panel = new FilterPanel(this, {
//        name: 'weight',
//        content: me.container
//    });

//}
//WeightFilter.prototype.refresh = function() {
//    this.value.from = this.getProperValue($(this.fromInput).val());
//    this.value.to = this.getProperValue($(this.toInput).val());
//};
//WeightFilter.prototype.getProperValue = function(value) {
//    var $value = Number(value);
//    if (!$.isNumeric($value) || $value === 0) return 0;
//    return Math.max(Math.min(this.maxWeight, $value), this.minWeight);
//};

//function CategoryFilter(manager) {
//    var me = this;
//    this.manager = manager;
//    this.name = 'categories';
//    this.categories = [];
//    this.value = [];

//    this.container = jQuery('<div/>', {
//        'class': 'content-container'
//    });

//    this.addButton = jQuery('<div/>', {
//        'class': 'search-select-categories-button'
//    });
//    $(this.addButton).appendTo($(this.container));
    
//    this.tree = new Tree({
//        'mode': MODE.MULTI,
//        'root': Ling.CATEGORIES.getRoot(),
//        'selected': me.value,
//        'blockOtherElements': true,
//        'showSelection': true,
//        'hidden': true
//    });

//    this.tree.reset({ unselect: false, collapse: false });
//    this.tree.eventHandler.bind({
//        confirm: function (e) {
//            me.changeCategories(e.item);
//            me.tree.hide();
//        },
//        add: function (e) {
//            my.categories.addNew(e);
//        },
//        remove: function (e) {
//            my.categories.remove(e);
//        },
//        rename: function (e) {
//            my.categories.updateName(e);
//        },
//        transfer: function (e) {
//            my.categories.updateParent(e);
//        }
//    });


//    $(this.addButton).bind({
//        click: function() {
//            me.tree.show();
//        } 
//    });

//    this.panel = new FilterPanel(this, {
//        name: 'categories',
//        content: me.container
//    });

//}
//CategoryFilter.prototype.changeCategories = function (items) {
//    this.value = [];
//    $(this.container).find('.category').remove();
    
//    for (var i = 0; i < items.length; i++) {
//        var node = items[i];
//        var category = node.object;
//        var selected = new SelectedCategory(this, node);
//        selected.container.appendTo($(this.container));
//        this.categories.push(category);
//    }
//};
//CategoryFilter.prototype.remove = function (category) {
//    var array = [];
//    for (var i = 0; i < this.categories.length; i++) {
//        var item = this.categories[i];
//        if (item !== category) {
//            array.push(item);
//        }
//    }
    
//    this.categories = array;
    
//};
//CategoryFilter.prototype.refresh = function () {
//    var array = [];
//    for (var i = 0; i < this.categories.length; i++) {
//        var category = this.categories[i];
//        var descendants = category.getDescendants();
//        for (var j = 0; j < descendants.length; j++) {
//            var item = descendants[j];
//            array.push(item.key);
//        }
//    }
//    this.value = array;
//};

//function SelectedCategory(parent, node) {
//    var me = this;
//    this.node = node;
//    this.category = node.object;
//    this.parent = parent;
    
//    this.container = jQuery('<div/>', {
//        'class': 'category'
//    });
//    this.remove = jQuery('<div/>', {
//        'class': 'remove-category'
//    }).appendTo($(this.container));
//    this.name = jQuery('<div/>', {
//        'class': 'category-name',
//        html: me.category.path()
//    }).appendTo($(this.container));

//    $(this.remove).bind({
//        click: function () {
//            me.node.select(false, true, true, true);
//            $(me.container).remove();
//            me.parent.remove(me.category);
//        }
//    });

//}


//function TextFilter(manager) {
//    var me = this;
//    this.manager = manager;
//    this.name = 'text';
//    this.value = '';
//    this.container = jQuery('<div/>', {
//        'class': 'content-container'
//    });
//    this.textbox = jQuery('<input/>', {
//        id: 'text-contain',
//        'class': 'contain',
//        type: 'text'
//    }).bind({        
//        click: function() {
//            this.select();
//            this.focus();
//        },
//        keyup: function () {
//            setTimeout(function () {
//                me.refresh();
//            }, 50);   
//        }
//    });
//    $(this.textbox).appendTo($(this.container));

//    this.panel = new FilterPanel(this, {
//        name: 'text',
//        content: me.container
//    });

//}
//TextFilter.prototype.refresh = function() {
//    this.value = $(this.textbox).val();
//};
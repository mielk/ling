function FilterManager(properties) {
    var me = this;
    this.filters = new HashTable(null);

    this.eventHandler = new EventHandler();

    //UI components.
    this.container = jQuery('<div/>', { 'class': 'filter-container' });
    this.panel = jQuery('<div/>', { 'class': 'filter-panel' }).appendTo($(this.container));

    var left = jQuery('<div/>', { 'class': 'left' }).appendTo($(this.panel));
    var buttons = jQuery('<div/>', { 'class': 'button' }).appendTo($(this.panel));
    var right = jQuery('<div/>', { 'class': 'right' }).appendTo(jQuery('<span/>', { 'class': 'full-height' }).appendTo($(this.panel)));

    if (properties.wordtype) this.addFilter('wordtype', new WordTypeFilter(this), left);
    if (properties.weight) this.addFilter('weight', new WeightFilter(this), left);
    if (properties.categories) this.addFilter('categories', new CategoryFilter(this), right);
    if (properties.text) this.addFilter('text', new TextFilter(this), right);

    this.button = new FilterButton(this).appendTo($(buttons));

    this.collapser = new FilterCollapser(this, properties.visible ? true : false).appendTo($(this.container));

    $(this.container).appendTo($(properties.container));

}
FilterManager.prototype.bind = function (e) {
    this.eventHandler.bind(e);
    return this;
};
FilterManager.prototype.trigger = function (e) {
    this.eventHandler.trigger(e);
    return this;
};
FilterManager.prototype.collapse = function(){
    $(this.panel).css({
        'display' : 'none'
    });
}
FilterManager.prototype.expand = function(){
    $(this.panel).css({
        'display' : 'block'
    });
}
FilterManager.prototype.filter = function () {
    var e = {};

    this.filters.each(function (key, filter) {
        e[filter.name] = filter.value;
    });


    e.type = 'filter';
    this.eventHandler.trigger(e);

}
FilterManager.prototype.addFilter = function(name, filter, panel){
    this.filters.setItem(name, filter);
    $(filter.panel.container).appendTo($(panel));
}



function FilterButton(manager){
    var me = this;
    this.manager = manager;

    this.button = jQuery('<div/>', { 
        'class': 'search-button', html: 'Search' 
    }).bind({
        click: function () {
            me.manager.filter();
        } 
    }).appendTo(jQuery('<div/>', { 'class': 'label-table' }));
}
FilterButton.prototype.appendTo = function(parent){
    $(this.button).appendTo($(parent));
    return this;
}

function FilterCollapser(manager, visibility){
    var me = this;
    this.manager = manager;
    this.visible = visibility;
    this.container = jQuery('<div/>', { 
        'class': 'search-collapser'
    }).bind({
        click: function () {
            me.changeStatus();
        }
    });

    (function ini(){
        me.changeStatus(me.visible);
    })();

}
FilterCollapser.prototype.appendTo = function(parent){
    $(this.container).appendTo($(parent));
    return this;
}
FilterCollapser.prototype.changeStatus = function(value){
    var $value = (value !== undefined ? value : !this.visible);
    if ($value){
        this.manager.expand();
    } else {
        this.manager.collapse();
    }
}


function FilterPanel(filter, properties){
    var me = this;
    this.filter = filter;

    this.container = jQuery('<div/>', {'class': 'single-panel'});
    this.labelContainer = jQuery('<div/>', {'class': 'label-container'}).appendTo($(this.container));
    this.label = jQuery('<div/>', {'class': 'label', html: properties.name}).appendTo(jQuery('<div/>', {'class': 'label-table'}).appendTo($(this.labelContainer)));
    
    this.content = properties.content;
    $(this.content).appendTo($(this.container));

}


function WordTypeFilter(manager) {
    var me = this;
    this.manager = manager;
    this.name = 'wordtype';
    this.value = null;

    var dropdownData = [];
    for (var key in TYPE) {
        if (TYPE.hasOwnProperty(key)) {
            var type = TYPE[key];
            if (type.id) {
                var object = {
                    key: type.id,
                    name: type.name,
                    object: type
                };
                dropdownData.push(object);                
            }
        }
    }

    this.container = jQuery('<div/>', {
        id: 'word-type',
        'class': 'word-type content-container'
    });
    this.dropdown = new DropDown({            
        container: me.container,
        data: dropdownData,
        slots: 4,
        caseSensitive: false,
        confirmWithFirstClick: true
    });

    this.dropdown.bind({
        select: function(e) {
            me.value = e.object;
        }
    });


    this.panel = new FilterPanel(this, {
        name: me.name,
        content: me.container
    });

}

function WeightFilter(manager) {
    var me = this;
    this.minWeight = 1;
    this.maxWeight = 10;
    this.manager = manager;
    this.name = 'weight';
    this.value = {
        from: 0,
        to: 0
    };
    

    this.container = jQuery('<div/>', {
        'class': 'content-container'
    });
    var fromLabel = jQuery('<div/>', { 'class' : 'label', html: 'from' }).
        appendTo(jQuery('<div/>', { 'class' : 'label-table' }).
        appendTo(jQuery('<div/>', { 'class' : 'lbl' }).appendTo($(this.container))));

    this.fromInput = jQuery('<input/>', { type: 'text' }).
        bind({        
            click: function () {
                this.select(); this.focus();
            },
            blur: function () {
                me.value.from = getProperValue($(this).val());
                $(this).val(me.value.from ? me.value.from : '');
            }
        });
    $(this.fromInput).appendTo($(this.container));

    var toLabel = jQuery('<div/>', { 'class' : 'label', html: 'to' }).
        appendTo(jQuery('<div/>', { 'class' : 'label-table' }).
        appendTo(jQuery('<div/>', { 'class' : 'lbl' }).appendTo($(this.container))));

    this.toInput = jQuery('<input/>', { type: 'text' }).
        bind({        
            click: function () {
                this.select(); this.focus();
            },
            blur: function () {
                me.value.to = getProperValue($(this).val());
                $(this).val(me.value.to ? me.value.to : '');
            }
        });
    $(this.toInput).appendTo($(this.container));

    function getProperValue(value) {
        var $value = Number(value);
        if (!$.isNumeric($value) || $value === 0) return 0;
        return Math.max(Math.min(me.maxWeight, $value), me.minWeight);
    }

    this.panel = new FilterPanel(this, {
        name: 'weight',
        content: me.container
    });

}

function CategoryFilter(manager) {
    var me = this;
    this.manager = manager;
    this.name = 'categories';
    this.value = [];

    this.container = jQuery('<div/>', {
        'class': 'content-container'
    });

    this.addButton = jQuery('<div/>', {
        'class': 'select-categories-button'
    });
    $(this.addButton).appendTo($(this.container));
    
    this.tree = new Tree({
        'mode': MODE.MULTI,
        'root': my.categories.getRoot(),
        'selected': me.value,
        'blockOtherElements': true,
        'showSelection': true,
        'hidden': true
    });

    this.tree.reset({ unselect: false, collapse: false });
    this.tree.eventHandler.bind({
        confirm: function (e) {
            me.changeCategories(e.item);
            me.tree.hide();
        },
        add: function (e) {
            my.categories.addNew(e);
        },
        remove: function (e) {
            my.categories.remove(e);
        },
        rename: function (e) {
            my.categories.updateName(e);
        },
        transfer: function (e) {
            my.categories.updateParent(e);
        }
    });


    $(this.addButton).bind({
        click: function() {
            me.tree.show();
        } 
    });

    this.panel = new FilterPanel(this, {
        name: 'categories',
        content: me.container
    });

}
CategoryFilter.prototype.changeCategories = function (items) {
    this.value = [];
    $(this.container).find('.category').remove();
    
    for (var i = 0; i < items.length; i++) {
        var node = items[i];
        var category = node.object;
        var selected = new SelectedCategory(this, node);
        selected.container.appendTo($(this.container));
        this.value.push(category);
    }
};
CategoryFilter.prototype.remove = function (category) {
    var array = [];
    for (var i = 0; i < this.value.length; i++) {
        var item = this.value[i];
        if (item !== category) {
            array.push(item);
        }
    }
    
    this.value = array;
    
};

function SelectedCategory(parent, node) {
    var me = this;
    this.node = node;
    this.category = node.object;
    this.parent = parent;
    
    this.container = jQuery('<div/>', {
        'class': 'category'
    });
    this.remove = jQuery('<div/>', {
        'class': 'remove-category'
    }).appendTo($(this.container));
    this.name = jQuery('<div/>', {
        'class': 'category-name',
        html: me.category.path()
    }).appendTo($(this.container));

    $(this.remove).bind({
        click: function () {
            me.node.select(false, true, true, true);
            $(me.container).remove();
            me.parent.remove(me.category);
        }
    });

}


function TextFilter(manager) {
    var me = this;
    this.manager = manager;
    this.name = 'text';
    this.value = '';
    this.container = jQuery('<div/>', {
        'class': 'content-container'
    });
    this.textbox = jQuery('<input/>', {
        id: 'text-contain',
        'class': 'contain',
        type: 'text'
    }).bind({        
       click: function() {
           this.select();
           this.focus();
       },
       keyup: function () {
           var $me = this;
           setTimeout(function () {
               var value = $($me).val();
               me.value = value;
           }, 50);   
       }
    });
    $(this.textbox).appendTo($(this.container));

    this.panel = new FilterPanel(this, {
        name: 'text',
        content: me.container
    });

}
function SearchManager() {
    var me = this;
    this.wordType = new WordType(this);
    this.weight = new Weight(this);
    this.categories = new Categories(this);
    this.text = new TextSearch(this);
    //UI components.
    this.container = $('.filter-panel')[0];
    this.button = $('#search-button')[0];
    this.active = false;

    this.collapser = $('.search-collapser')[0];
    $(this.collapser).bind({
        click: function () {
            if (me.active) {
                me.active = false;
                $(me.container).css({                    
                   'display' : 'none' 
                });
            } else {
                me.active = true;
                $(me.container).css({
                    'display': 'block'
                });
            }
       }
    });

    this.eventHandler = new EventHandler();
    $(this.button).bind({
        click: function () {
            me.eventHandler.trigger({                
                type: 'filter',
                wordtype: me.wordType.value,
                weight: {
                    from: me.weight.values.from,
                    to: me.weight.values.to
                },
                categories: me.categories.selected,
                text: me.text.value
            });
        } 
    });

    (function ini() {
        $(me.container).css({
            'display': me.active ? 'block' : 'none'
        });
    })();

}
SearchManager.prototype.bind = function(e) {
    this.eventHandler.bind(e);
};
SearchManager.prototype.trigger = function (e) {
    this.eventHandler.trigger(e);
};

function WordType(manager) {
    var me = this;
    this.manager = manager;
    this.container = $('#word-type')[0];
    this.value = null;

    if (!this.container) return;

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

    if (this.container) {
        this.dropdown = this.dropdown || new DropDown({            
            container: me.container,
            data: dropdownData,
            slots: 4,
            caseSensitive: false,
            confirmWithFirstClick: true
        });
    }

    this.dropdown.bind({
        select: function(e) {
            me.value = e.object;
        }
    });


}

function Weight(manager) {
    var me = this;
    this.minWeight = 1;
    this.maxWeight = 10;
    this.manager = manager;
    this.values = {
        from: 0,
        to: 0
    };
    this.fromWeight = $('#fromWeight')[0];
    this.toWeight = $('#toWeight')[0];

    $(this.fromWeight).bind({        
        click: function () {
            this.select();
            this.focus();
        },
        blur: function () {
            me.values.from = getProperValue($(this).val());
            $(this).val(me.values.from ? me.values.from : '');
        }
    });

    $(this.toWeight).bind({        
        click: function () {
            this.select();
            this.focus();
        },
        blur: function () {
            me.values.to = getProperValue($(this).val());
            $(this).val(me.values.to ? me.values.to : '');
        }
    });
    
    function getProperValue(value) {
        var $value = Number(value);
        if (!$.isNumeric($value) || $value === 0) return 0;
        return Math.max(Math.min(me.maxWeight, $value), me.minWeight);
    }

}

function Categories(manager) {
    var me = this;
    this.manager = manager;
    this.addButton = $('#select-categories')[0];
    this.container = $('#categories')[0];
    this.selected = [];
    this.tree = new Tree({
        'mode': MODE.MULTI,
        'root': my.categories.getRoot(),
        'selected': me.selected,
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

}
Categories.prototype.changeCategories = function (items) {
    this.selected = [];
    $(this.container).find('.category').remove();
    
    for (var i = 0; i < items.length; i++) {
        var node = items[i];
        var category = node.object;
        var selected = new SelectedCategory(this, node);
        selected.container.appendTo($(this.container));
        this.selected.push(category);
    }
};
Categories.prototype.remove = function (category) {
    var array = [];
    for (var i = 0; i < this.selected.length; i++) {
        var item = this.selected[i];
        if (item !== category) {
            array.push(item);
        }
    }
    
    this.selected = array;
    
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


function TextSearch(manager) {
    var me = this;
    this.manager = manager;
    this.textbox = $('#text-contain')[0];
    this.value = '';

    $(this.textbox).bind({        
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

}
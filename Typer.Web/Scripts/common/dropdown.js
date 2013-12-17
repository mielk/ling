//$(function () {

//    //Switching off selecting text.
//    $(document).
//        bind({
//            'mousedown': function (e) {
//                var $this = $(this);
//                e.preventDefault();

//                // Make every element on page unselectable
//                //$('*').addClass('unselectable');
//                $(document.body).addClass('unselectable');

//                // Some setup here, like remembering the original location, etc
//                $(window).on('mousemove', function () {
//                    // Do the thing!
//                    $this.on('mouseup', function () {
//                        $(document.body).removeClass('unselectable');
//                        //$('*').removeClass('unselectable');
//                        // Other clean-up tasks here
//                    });
//                });
//            }
//        });

//});


function DropDown(properties) {
    this.eventHandler = new EventHandler();
    this.view = new DropDownView(this, properties);
    this.options = {
        slots: properties.slots || 10,
        caseSensitive: properties.caseSensitive || false,
        confirmWithFirstClick: properties.confirmWithFirstClick || false
    };
    this.filter = new DropDownFilter(this);
    this.navigator = new DropDownNavigator(this);
    this.render = new DropDownRenderManager(this);
    this.optionsManager = new DropDownOptionsManager(this, properties.data);

    this.render.render();
    this.render.display(false);

    this.eventHandler.bind({        
       select: function() {
           //my.notify.display('Option ' + e.object.name + ' selected', true);
       } 
    });

}
DropDown.prototype.clear = function() {
    this.view.clear();
};
DropDown.prototype.appendTo = function(container) {
    this.view.appendTo(container);
};
DropDown.prototype.bind = function(e) {
    this.eventHandler.bind(e);
};
DropDown.prototype.trigger = function(e) {
    this.eventHandler.trigger(e);
};
DropDown.prototype.activate = function () {
    this.filter.activate();
};
DropDown.prototype.deactivate = function () {
    this.trigger({
        type: 'deactivate'
    });
};
DropDown.prototype.select = function(object) {
    this.trigger({
        type: 'select',
        object: object
    });
    this.filter.activate(object.name);
    //this.deactivate();
};



function DropDownView(dropdown, properties) {
    var me = this;
    this.dropdown = dropdown;

    //UI components.
    //Parental container.
    var parent = properties.container;
    $(parent).css({
        'overflow-y': 'visible',
        'z-index': 1
    });
    
    this.container = jQuery('<div/>', {
        'class': 'dropdown-container',
        'visibility': 'visible'
    }).appendTo($(parent));

    this.arrow = jQuery('<div/>', {
        'class': 'dropdown-arrow'
    }).appendTo($(this.container));

    var textspan = jQuery('<span/>', {
        'class': 'textbox'
    }).bind({
        'click': function () {
            if (me.textbox) {
                $(me.textbox).focus();
            }
        }
    }).appendTo($(me.container));

    this.textbox = jQuery('<input/>', {
        type: 'textbox',
        'class': 'dropdown-textbox'
    }).appendTo($(textspan));

    this.dropdown.bind({
        select: function(e) {
            me.textbox.val(e.object.name);
        }
    });

}
DropDownView.prototype.clear = function() {

};
DropDownView.prototype.appendTo = function(container) {
    $(this.container).appendTo($(container));
};
DropDownView.prototype.add = function(element) {
    $(element).appendTo($(this.container));
};


function DropDownFilter(dropdown) {
    var me = this;
    this.dropdown = dropdown;
    this.active = false;
    this.textbox = me.dropdown.view.textbox;
    this.filter = '';

    $(this.textbox).bind({
        focus: function () {
            me.active = true;
        },
        keydown: function(e) {
            if (me.active && e.which === 27) {
                e.preventDefault();
                e.stopPropagation();
                me.dropdown.clear();
                me.dropdown.deactivate();
            }
        },
        keyup: function (e) {
            var ctrl = e.currentTarget;
            var text = ctrl.value;
            if (me.filter != text) {
                var append = (text.indexOf(me.filter) >= 0 ? true : false);
                me.filter = text;
                me.runFilter(append);
            }
        },
        click: function() {
            me.dropdown.render.activate();
        }
    });

    $(this.dropdown).bind({
        deactivate: function() {
            me.clear();
        }
    });

}
DropDownFilter.prototype.activate = function (selected) {
    var me = this;
    if (selected) me.filter = selected;
    $(this.textbox).val(me.filter);
    this.dropdown.render.activate(false);
    $(this.textbox).select();
    $(this.textbox).focus();
};
DropDownFilter.prototype.deactivate = function () {
    this.active = false;
};
DropDownFilter.prototype.clear = function() {
    this.filter = '';
    $(this.textbox).val(this.filter);
    this.dropdown.optionsManager.clear();
};
DropDownFilter.prototype.runFilter = function (append) {
    var manager = this.dropdown.optionsManager;
    if (append) {
        manager.filter(this.filter);
    } else {
        manager.filterFromScratch(this.filter);
    }

    this.dropdown.render.clear();
    this.dropdown.render.render();
    this.dropdown.render.display(this.dropdown.optionsManager.filtered.length);

};


function DropDownNavigator(dropdown) {
    var me = this;
    this.dropdown = dropdown;


    $(document).bind({
        'keydown': function (e) {

            var filterActive = me.dropdown.filter.active;

            function preventDefault() {
                e.preventDefault();
                e.stopPropagation();
            }

            switch (e.which) {
                case 13:
                    if (filterActive) return;
                    me.dropdown.render.selectCurrent();
                    break;
                case 27: //Escape
                    if (filterActive) return;
                    preventDefault();
                    me.dropdown.render.activate(false);
                    me.dropdown.filter.activate();
                    break;
                case 38: //Arrow up
                    preventDefault();
                    if (filterActive) return;
                    me.dropdown.render.moveCursor(-1);
                    break;
                case 40: //Arrow down
                    preventDefault();
                    if (!e.shiftKey) {
                        me.dropdown.filter.deactivate();
                        me.dropdown.render.activate(true);
                        me.dropdown.render.moveCursor(1);
                    }
                    break;
                case 36: //Home
                    if (filterActive) return;
                    preventDefault();
                    me.dropdown.render.moveToFirst();
                    break;
                case 35: //End
                    if (filterActive) return;
                    preventDefault();
                    me.dropdown.render.moveToLast();
                    break;
                case 33: //PageUp
                    if (filterActive) return;
                    preventDefault();
                    me.dropdown.render.moveMore(-1);
                    break;
                case 34: //PageDown
                    if (filterActive) return;
                    preventDefault();
                    me.dropdown.render.moveMore(1);
                    break;
                    
            }
        }
    });

}


function DropDownRenderManager(dropdown) {
    // ReSharper disable once UnusedLocals
    var me = this;
    this.dropdown = dropdown;
    this.slots = [];
    this.slots.length = this.dropdown.options.slots;
    this.startCounter = 0;
    this.activeIndex = -1;
    this.activeSlot = null;
    
    
    this.container = jQuery('<div/>', {
        'class': 'dropdown-options-container'
    }).css({
        'display': 'block'
    });
    this.dropdown.view.add(this.container);
    
    this.options = jQuery('<div/>', {
        'class': 'dropdown-options'
    }).appendTo($(this.container));

    this.scrollbar = new DropDownScrollbar(this);

    
    this.dropdown.bind({
        select: function () {
            display(me.container, false);
        },
        deactivate: function() {
            me.clear();
            me.activate(false);
        }
    });
    
    this.createSlots();

}
DropDownRenderManager.prototype.createSlots = function () {
    for (var i = 0; i < this.slots.length; i++) {
        this.slots[i] = new DropDownSlot(this, i);
    }
};
DropDownRenderManager.prototype.append = function(element) {
    $(element).appendTo($(this.container));
};
DropDownRenderManager.prototype.addSlot = function (slot) {
    $(slot).appendTo($(this.options));
};
DropDownRenderManager.prototype.render = function () {
    var size = this.dropdown.optionsManager.selectedCounter();
    var slots = this.slots.length;
    var start = Math.max(Math.min(this.startCounter, size - slots), 0);
    var data = this.dropdown.optionsManager.getDataArray(start, start + slots - 1);
    var filter = this.dropdown.optionsManager.filterText;
    
    for (var i = 0; i < data.length; i++) {
        var slot = this.slots[i];
        slot.insertOption(data[i], filter);
    }

    this.scrollbar.adjust(slots, size, start);

};
DropDownRenderManager.prototype.moveCursor = function (offset) {
    
    //Special case - if first item is selected and offset is one position up, 
    //the list lost its focus, and textbox is being activated.
    if (this.activeIndex === 0 && this.startCounter === 0 && offset < 0) {
        this.clear();
        this.dropdown.filter.activate();
        return;
    }

    var newIndex = this.activeIndex + offset;
    if (newIndex >= this.slots.length || newIndex < 0) {
        this.moveList(offset);
    } else {
        this.activeIndex = newIndex;
        if (this.activeSlot) {
            this.activeSlot.activate(false);
        }
        this.activeSlot = this.slots[this.activeIndex];
        this.activeSlot.activate(true);
    }

};
DropDownRenderManager.prototype.moveList = function (offset) {
    var slots = this.slots.length;
    var size = this.dropdown.optionsManager.selectedCounter();
    var newCounter = this.startCounter + offset;
    var maxCounter = size - slots;
    
    if (newCounter < 0 && this.activeIndex > 0) {
        this.moveToFirst();
        this.render();
    } else if (newCounter < 0 && this.activeIndex === 0) {
        //Already first item.
    } else if (newCounter > maxCounter && this.activeIndex < slots - 1) {
        this.moveToLast();
    } else if (newCounter > maxCounter && this.active === slots - 1) {
        //Already last item.
    } else {
        this.startCounter = Math.min(Math.max(newCounter, 0), maxCounter);
        this.render();
    }
  
};
DropDownRenderManager.prototype.moveMore = function(offset) {
    this.moveCursor(offset * this.slots.length);
};
DropDownRenderManager.prototype.moveToFirst = function () {
    this.moveTo(0, 0);
};
DropDownRenderManager.prototype.moveToLast = function () {
    var size = this.dropdown.optionsManager.selectedCounter();
    var slots = this.slots.length;
    this.moveTo(size - slots, slots - 1);
};
DropDownRenderManager.prototype.moveTo = function(counter, index) {
    this.startCounter = counter;
    this.activeIndex = index;
    if (this.activeSlot) {
        this.activeSlot.activate(false);
    }
    this.activeSlot = this.slots[this.activeIndex];
    this.activeSlot.activate(true);
    this.render();
};
DropDownRenderManager.prototype.clear = function() {
    if (this.activeSlot) {
        this.activeSlot.activate(false);
    }
    this.startCounter = 0;
    this.activeIndex = -1;
};
DropDownRenderManager.prototype.activate = function (value) {
    var state = (this.slots[0].option !== null && value !== false);
    this.display(state);
    
    if (!state) {
        this.activeIndex = -1;
        this.startCounter = 0;
    }

    this.dropdown.filter.active = !state;
};
DropDownRenderManager.prototype.display = function(value) {
    $(this.container).css({
        'display': (value ? 'block' : 'none')
    });
    if (value) {
        this.scrollbar.adjust();
    }
};
DropDownRenderManager.prototype.selectCurrent = function () {
    if (this.activeSlot) {
        this.activeSlot.select();
    }
};


function DropDownSlot(manager, index) {
    // ReSharper disable once UnusedLocals
    var me = this;
    this.manager = manager;
    this.dropdown = manager.dropdown;
    this.index = index;
    this.option = null;
    this.active = false;
    
    //UI components.
    this.container = jQuery('<div/>', {
        'class': 'dropdown-option'
    }).bind({
        'mousedown': function () {
            me.select();
        }
    });

    this.manager.addSlot($(this.container));

}
DropDownSlot.prototype.insertOption = function (option, filter) {
    this.option = option;
    if (option) {
        this.show();
        $(this.container).html(option.html(filter));
    } else {
        this.hide();
    }
};
DropDownSlot.prototype.hide = function() {
    $(this.container).css({
        'display': 'none'
    });
};
DropDownSlot.prototype.show = function () {
    $(this.container).css({
        'display': 'block'
    });
};
DropDownSlot.prototype.activate = function (value) {
    var selectedClass = 'dropdown-selected';
    this.active = value;
    
    if (value) {
        $(this.container).addClass(selectedClass);
    } else {
        $(this.container).removeClass(selectedClass);
    }
    
};
DropDownSlot.prototype.select = function () {
    this.dropdown.select(this.option.object);
};


function DropDownScrollbar(manager) {
    // ReSharper disable once UnusedLocals
    var me = this;
    this.manager = manager;
    this.dropdown = manager.dropdown;
    
    //UI components.
    this.container = jQuery('<div/>', {
        'class': 'dropdown-scrollbar'
    });
    this.manager.append($(this.container));

    this.panel = jQuery('<div/>', {
        'class': 'dropdown-scrollbar-pointer-container'
    }).appendTo($(this.container));
    
    this.pointer = jQuery('<div/>', {
        'class': 'dropdown-scrollbar-pointer'
    }).appendTo($(this.panel));

}
DropDownScrollbar.prototype.adjust = function (slots, size, start) {
    size = size || this.dropdown.optionsManager.selectedCounter();
    slots = slots || this.dropdown.render.slots.length;
    start = start || Math.max(Math.min(this.dropdown.render.startCounter, size - slots), 0);

    if (size > slots) {
        
        $(this.container).css({            
            'display': 'block'
        });

        var height = $(this.container).height();

        var $height = ((slots * height / size) - 2) + 'px';
        var $top = ((start * height / size) + 1) + 'px';

        $(this.pointer).css({            
            'height': $height,
            'top': $top
        });
        
    } else {
        $(this.container).css({
            'display': 'none'
        });
    }
};


function DropDownOptionsManager(dropdown, data) {
    // ReSharper disable once UnusedLocals
    var me = this;
    this.dropdown = dropdown;
    
    this.options = {};
    this.sorted = [];

    this.filterText = '';
    this.filtered = [];

    this.loadData(data);

}
DropDownOptionsManager.prototype.loadData = function (data) {
    var me = this;
    if (data.length) { //Array
        for (var i = 0; i < data.length; i++) {
            var option = new DropDownOption(me, data[i]);
            var key = option.key || option.name;
            this.options[key] = option;
        }
    } else {
        for (var $key in data) {
            if (data.hasOwnProperty($key)) {
                var item = data[$key];
                var $option = new DropDownOption(me, item);
                key = $option.key || $option.name;
                this.options[key] = $option;
            }
        }
    }

    this.sorted = my.array.objectToArray(this.options);
    this.sorted.sort(function (a, b) {
        return a.name < b.name ? -1 : 1;
    });
    this.filtered = this.sorted;

};
DropDownOptionsManager.prototype.getDataArray = function (start, end) {
    var array = [];
    for (var i = start; i <= end; i++) {
        if (i < this.filtered.length) {
            array.push(this.filtered[i]);
        } else {
            array.push(null);
        }
    }
    return array;
};
DropDownOptionsManager.prototype.selectedCounter = function() {
    return this.filtered.length;
};
DropDownOptionsManager.prototype.get = function(index) {
    if (index >= 0 && index < this.filtered.length) {
        return this.filtered[index];
    }
    return null;
};
DropDownOptionsManager.prototype.filter = function(filter) {
    this.filterText = filter;
    var array = [];
    var caseSensitive = this.dropdown.options.caseSensitive;

    for (var i = 0; i < this.filtered.length; i++) {
        var option = this.filtered[i];
        if (option.matchFilter(filter, caseSensitive)) {
            array.push(option);
        }
    }

    this.filtered = array;

};
DropDownOptionsManager.prototype.filterFromScratch = function(filter) {
    var caseSensitive = this.dropdown.options.caseSensitive;
    this.filterText = filter;
    this.filtered.length = 0;
    
    if (filter.length) {
        for (var j = 0; j < this.sorted.length; j++) {
            var option = this.sorted[j];
            if (option.matchFilter(filter, caseSensitive)) {
                this.filtered.push(option);
            }
        }
    } else {
        for (var i = 0; i < this.sorted.length; i++) {
            this.filtered.push(this.sorted[i]);
        }
    }

};
DropDownOptionsManager.prototype.clear = function() {
    this.filtered = this.sorted;
};

function DropDownOption(manager, properties) {
    // ReSharper disable once UnusedLocals
    var me = this;
    this.dropdown = manager.dropdown;
    this.manager = manager;
    this.key = (typeof (properties.key) === 'function' ? properties.key() : properties.key) || '';
    this.name = (typeof (properties.name) === 'function' ? properties.name() : properties.name) || '';
    if (!this.key) this.key = this.name;
    this.object = (typeof (properties.object) === 'function' ? properties.object() : properties.object) || '';
    this.prepend = properties.prepend || '';
    this.append = properties.append || '';
}
DropDownOption.prototype.matchFilter = function(filter, caseSensitive) {
    var position = (caseSensitive ? this.name.indexOf(filter) : this.name.toLowerCase().indexOf(filter.toLowerCase()));
    return (position >= 0);
};
DropDownOption.prototype.html = function (filter) {
    var classFound = 'dropdown-matched-text';
    var openTag = '<span class="' + classFound + '">';
    var closeTag = '</span>';
    var filterStart = this.name.toLowerCase().indexOf(filter.toLowerCase());
    var filterCase = this.name.substr(filterStart, filter.length);

    var html = this.prepend + (filter ? this.name.replace(filterCase, openTag + filterCase + closeTag)  : this.name) + this.append;

    return html;

};
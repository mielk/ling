var searchData = [
    //{ name: 'Europe', countries: ['Polska', 'Albania', 'Luksemburg'] },
    //{ name: 'South America', countries: ['Brazil', 'Venezuela', 'Argentina'] },
    { name: 'A' },
    { name: 'B' },
    { name: 'C' },
    { name: 'D' },
    { name: 'E' },
    { name: 'F' },
    { name: 'G' },
    { name: 'H' },
    { name: 'I' },
    { name: 'J' },
    { name: 'K' },
    { name: 'L' },
    { name: 'M' },
    { name: 'N' },
    { name: 'O' },
    { name: 'P' },
    { name: 'Q' },
    { name: 'R' },
    { name: 'S' },
    { name: 'T' },
    { name: 'U' },
    { name: 'V' },
    { name: 'W' },
    { name: 'X' },
    { name: 'Y' },
    { name: 'Z' }
];



$(function () {

    //Switching off selecting text.
    $(document).
        bind({
            'mousedown': function (e) {
                var $this = $(this);
                e.preventDefault();

                // Make every element on page unselectable
                //$('*').addClass('unselectable');
                $(document.body).addClass('unselectable');

                // Some setup here, like remembering the original location, etc
                $(window).on('mousemove', function () {
                    // Do the thing!
                    $this.on('mouseup', function () {
                        $(document.body).removeClass('unselectable');
                        //$('*').removeClass('unselectable');
                        // Other clean-up tasks here
                    });
                });
            }
        });

});


function DropDown(properties) {
    this.view = new DropDownView(this, properties);
    this.options = {
        slots: properties.slots || 10
    };
    this.eventHandler = new EventHandler();
    this.navigator = new DropDownNavigator(this);
    this.render = new DropDownRenderManager(this);
    this.optionsManager = new DropDownOptionsManager(this, properties.data);

    this.render.render();

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





function DropDownView(dropdown, properties) {
    var me = this;
    this.dropdown = dropdown;

    //UI components.
    //Parental container.
    var parent = properties.container;
    $(parent).css({
        'overflow': 'visible',
        'z-index': 2
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

}
DropDownView.prototype.clear = function() {

};
DropDownView.prototype.appendTo = function(container) {
    $(this.container).appendTo($(container));
};
DropDownView.prototype.add = function(element) {
    $(element).appendTo($(this.container));
};

function DropDownNavigator(dropdown) {
    var me = this;
    this.dropdown = dropdown;


    $(document).bind({
        'keydown': function (e) {
            if (e.which === 27) {   //Escape
                me.dropdown.clear();
                me.dropdown.deactivate();
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
    this.startCounter = -1;
    
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
    
    for (var i = 0; i < data.length; i++) {
        var slot = this.slots[i];
        slot.insertOption(data[i]);
    }

    this.scrollbar.adjust(slots, size, start);

};


function DropDownSlot(manager, index) {
    // ReSharper disable once UnusedLocals
    var me = this;
    this.manager = manager;
    this.dropdown = manager.dropdown;
    this.index = index;
    this.option = null;
    
    //UI components.
    this.container = jQuery('<div/>', {
        'class': 'dropdown-option'
    });

    this.manager.addSlot($(this.container));

}
DropDownSlot.prototype.insertOption = function(option) {
    if (option) {
        this.show();
        $(this.container).html(option.name);
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
DropDownScrollbar.prototype.adjust = function(slots, items, startIndex) {
    if (items > slots) {
        $(this.container).css({            
            'display': 'block' 
        });

        $(this.pointer).css({            
            'height': (slots * 100 / items) + '%',
            'top': (startIndex * 100 / items) + '%'
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




function optionLabel(index) {
    //--- UI components ---
    var selectedCssClass = 'dropdown-selected';
    var $container = $('<div>', { id: ('mlq_option_' + new Date().getTime()), 'class': 'dropdown-option' }).
                                                            css({ 'display': 'block', 'padding-top': '2px' });
    var $index = index;
    var $object;
    //---------------------

    function optionContainer() {
        return $($container);
    }

    return {
        insert: function (div) {
            $o = optionContainer();
            $o.appendTo(div);
            $o.
                bind({
                    mousedown: function (e) {
                        if ($object != $selectedOption) {
                            $selectedOption = $object;
                            if ($selectedOption) {
                                events().trigger({
                                    'type': 'selected',
                                    'option': $selectedOption,
                                    'object': $selectedOption.getObject(),
                                    'text': $selectedOption.getCaption()
                                });
                            }
                        }
                    },
                    mousemove: function (e) {
                        hoverOption($index);
                    },
                    keyup: function (e) {
                        switch (e.which) {
                            case 13:
                                container().trigger({
                                    'type': 'selected',
                                    'object': $object,
                                    'control': $o,
                                    'text': $o.html()
                                });
                                break;
                        }
                    }
                });
        },
        getHeight: function () {
            var $o = optionContainer();
            return $o.height() //+ my.ui.extraHeight($o);
        },
        setContent: function (content) {
            optionContainer().html(content);
        },
        setObject: function (object) {
            $object = object;
        },
        show: function () {
            optionContainer().css('display', 'block');
        },
        hide: function () {
            optionContainer().css('display', 'none');
        },
        getIndex: function () {
            return $index;
        },
        getObject: function () {
            return $object;
        },
        select: function () {
            optionContainer().addClass(selectedCssClass);
        },
        deselect: function () {
            optionContainer().removeClass(selectedCssClass);
        }
    }
}










function DropDown2(properties) {
    var $parent = properties.parent ? $(properties.parent) : $(document.body);
    //---------------------------------
    var $id = properties.id || ('mlq_dropdown_' + new Date().getTime());
    var $caption = properties.caption || 'Select option ...';
    var $options = properties.data || [];
    //var $width = properties.width || 200;
    var $optionHeight = properties.optionHeight || 24;
    var $visibleOptions = properties.visibleOptions || 10;
    var $txtWidth = 0.8;
    var $mustMatch = (properties.mustMatch === undefined ? true : properties.mustMatch);
    var $caseSensitive = properties.caseSensitive || false;
    var $searchedField = properties.searched || 'name';
    var $displayedField = properties.displayed || 'name';
    //---------------------------------
    var _container;
    var _textbox;
    var _arrow;
    var _optionsArea;
    var _events;
    //--- States ----------------------
    var $text = '';
    var $selectedOption = null;
    //---------------------------------


    //Initializing this drop-down ...
    createUI();
    optionsArea().render();
    //-------------------------------



    /* === Global events =========================== */
    events().bind({
        'selected': function (e) {

            if (e.option) {
                var $t = e.text;
                textbox().val($t);
                clearFilter();
            }

        },
        'deactivate': function (e) {
            _remove();
        }
    });

    container().bind({
        'focusout': function (e) {
            optionsArea().render(false);
        }
    });


    textbox().bind({
        'click': function (e) {
            var $o = optionsArea();
            if (!$o.isVisible()) {
                $o.render(true);
            }
        },
        'keyup': function (e) {
            switch (e.which) {
                case 13: //Enter
                    var _selected = optionsArea().getCurrentObject();
                    if (_selected != $selectedOption) {
                        $selectedOption = _selected;

                        //Jeżeli list wyświetlanych opcji zawiera tylko jeden
                        //element, jest on automatycznie wybierany.
                        if (!$selectedOption) {
                            $selectedOption = optionsArea().getOnlyOption();
                        }

                        if ($selectedOption) {
                            events().trigger({
                                'type': 'selected',
                                'option': $selectedOption,
                                'object': $selectedOption.getObject(),
                                'text': $selectedOption.getCaption()
                            });
                        }

                    }

                    break;

                case 9:     //Horizontal tab
                case 16:    //Data link escape
                    //Żeby uniknąć filtrowania listy w momencie wejścia do textbox().
                    break;

                case 27: //Escape
                    container().trigger({ type: 'clear' });
                    break;
                case 38: //Arrow up.
                    container().trigger({ type: 'arrow_up' });
                    break;
                case 39: //Arrow right.
                    var _selected = optionsArea().getCurrentObject();
                    if (_selected != $selectedOption) {
                        $selectedOption = _selected;
                        if ($selectedOption) {
                            events().trigger({
                                'type': 'selected',
                                'option': $selectedOption,
                                'object': $selectedOption.getObject(),
                                'text': $selectedOption.getCaption()
                            });
                        }
                    }
                    break;
                case 40: //Arrow down.
                    container().trigger({ type: 'arrow_down' });
                    break;
                default:
                    var ctrl = e.currentTarget;
                    var text = ctrl.value;
                    if ($text != text) {
                        var append = (text.indexOf($text) >= 0 ? true : false);
                        $text = text;
                        container().trigger({ type: 'filter', 'append': append, 'filterText': $text });
                    }
            }
        }
    });
    /* ==================================== */



    /* ==================================== */
    function optionsArea() {
        if (!_optionsArea) {
            _optionsArea = function () {
                //States & properties.
                var $start = 0;
                //UI components.
                var $container;
                var $optionLabels = [];
                //Logic.
                var $optionObjects = [];
                var $displayed = $optionObjects;
                var $selected = null;
                var $visible = false;


                //Zdarzenie 'selected' jest przypisane do kontrolki events(), a nie
                //container(), jak pozostałe zdarzenia, ponieważ musi być widoczne
                //również na zewnątrz DropDowna.
                events().bind({
                    'selected': function (e) {
                        if ($selected) {
                            $selected.deselect();
                            filter({ 'filterText': e.text });
                        }
                        _render(false);
                    }
                });

                container().bind({
                    'filter': function (e) {
                        if (e.append) {
                            filter();
                        } else {
                            filterFromScratch();
                        }
                    },
                    'arrow_up': function (e) {
                        moveUp();
                    },
                    'arrow_down': function (e) {
                        moveDown();
                    },
                    'clear': function (e) {
                        filterFromScratch();
                        //$displayed = [];
                        clearSelection();
                        optionsArea().render(false);
                    }
                });



                //Translate array of options into objects.
                (function convertOptionsToObjects() {
                    _refreshOptions();
                })();


                function optionsContainer() {
                    if (!$container) {
                        $container = $('<div>', { id: 'mlq_optionsContainer_' + new Date().getTime(), 'class': 'dropdown-options-container' }).
                            appendTo(container()).css({ 'display': 'none' });

                        for (var i = 0; i < $visibleOptions; i++) {
                            $optionLabels[i] = optionLabel(i);
                            $optionLabels[i].insert($container);
                        }

                    }

                    return $($container);

                }


                function _refreshOptions() {
                    $optionObject = [];
                    for (var i = 0; i < $options.length; i++) {
                        var _opt = $options[i];
                        $optionObjects[i] = option({
                            'index': i,
                            'value': _opt,
                            'prepend': _opt.prepend,
                            'caption': (_opt[$displayedField] || _opt.name || _opt.text || _opt.key || _opt.displayed || _opt.label || _opt.value || _opt[$searchedField])
                        });
                    }
                }


                function optionLabel(index) {
                    //--- UI components ---
                    var SELECTED_CSS_CLASS = 'dropdown-selected';
                    var $container = $('<div>', { id: ('mlq_option_' + new Date().getTime()), 'class': 'dropdown-option' }).
                                                                            css({ 'display': 'block', 'padding-top': '2px' });
                    var $index = index;
                    var $object;
                    //---------------------

                    function optionContainer() {
                        return $($container);
                    }

                    return {
                        insert: function (div) {
                            $o = optionContainer();
                            $o.appendTo(div);
                            $o.
                                bind({
                                    mousedown: function (e) {
                                        if ($object != $selectedOption) {
                                            $selectedOption = $object;
                                            if ($selectedOption) {
                                                events().trigger({
                                                    'type': 'selected',
                                                    'option': $selectedOption,
                                                    'object': $selectedOption.getObject(),
                                                    'text': $selectedOption.getCaption()
                                                });
                                            }
                                        }
                                    },
                                    mousemove: function (e) {
                                        hoverOption($index);
                                    },
                                    keyup: function (e) {
                                        switch (e.which) {
                                            case 13:
                                                container().trigger({
                                                    'type': 'selected',
                                                    'object': $object,
                                                    'control': $o,
                                                    'text': $o.html()
                                                });
                                                break;
                                        }
                                    }
                                });
                        },
                        getHeight: function () {
                            var $o = optionContainer();
                            return $o.height() //+ my.ui.extraHeight($o);
                        },
                        setContent: function (content) {
                            optionContainer().html(content);
                        },
                        setObject: function (object) {
                            $object = object;
                        },
                        show: function(){
                            optionContainer().css('display', 'block');
                        },
                        hide: function(){
                            optionContainer().css('display', 'none');
                        },
                        getIndex: function () {
                            return $index;
                        },
                        getObject: function () {
                            return $object;
                        },
                        select: function () {
                            optionContainer().addClass(SELECTED_CSS_CLASS);
                        },
                        deselect: function () {
                            optionContainer().removeClass(SELECTED_CSS_CLASS);
                        }
                    }
                }


                //===================================
                function filterFromScratch(e) {
                    //Reset the array of displayed.
                    var j = 0;
                    var visibility = true;
                    var $filter = (e ? e.filterText : '') || $text;

                    if ($filter.length > 0) {
                        $displayed = [];
                        for (var i = 0; i < $optionObjects.length; i++) {
                            var opt = $optionObjects[i];
                            if (opt.matchFilter($filter)) {
                                $displayed[j++] = opt;
                            }
                        }

                    } else {

                        //Czyści podświetlenie z dotychczasowej listy
                        //wyświetlanych itemów.
                        for (var i = 0; i < $displayed.length; i++) {
                            var opt = $displayed[i];
                            if (opt) opt.clear();
                        }

                        $displayed = $optionObjects;
                        visibility = false;
                    }

                    _render(visibility);

                }


                //===================================
                function filter(e) {
                    //Reset the array of displayed.
                    var j = 0;
                    var visibility = true;
                    var $filter = (e ? e.filterText : '') || $text;


                    if ($filter.length > 0) {
                        var $matched = [];
                        for (var i = 0; i < $displayed.length; i++) {
                            var opt = $displayed[i];
                            if (opt.matchFilter($filter)) {
                                $matched[j++] = opt;
                            }
                        }

                        $displayed = $matched;

                    } else {

                        //Czyści podświetlenie z dotychczasowej listy
                        //wyświetlanych itemów.
                        for (var i = 0; i < $displayed.length; i++) {
                            var opt = $displayed[i];
                            if (opt) opt.clear();
                        }
                        $displayed = $optionObjects;
                        visibility = false;
                    }

                    _render(visibility);

                }

                //===================================

                function hoverOption(index) {

                    //Deselect the previously selected option.
                    if ($selected) $selected.deselect();

                    //Select new option.
                    $selected = $optionLabels[index];
                    $selected.select();

                }

                //===================================

                function moveDown() {

                    var index = ($selected ? $selected.getIndex() : -1);

                    //If the last options is currently selected, there is
                    //no possibility to move down.
                    if (index < $visibleOptions - 1) {

                        hoverOption(++index);

                        //Show the options container.
                        if (!$visible) _render(true);

                    } else {

                        //clearSelection();
                        //_render(false);

                    }

                }


                //===================================

                function moveUp() {

                    var index = ($selected ? $selected.getIndex() : -1);

                    //If the last options is currently selected, there is
                    //no possibility to move down.
                    if (index > 0) {

                        hoverOption(--index);

                    } else {

                        clearSelection();
                        _render(false);

                    }

                }

                //===================================

                function clearSelection() {
                    if ($selected) $selected.deselect();
                    $selected = null;
                }

                //===================================

                function _render(visibility) {

                    $container = optionsContainer();

                    if (visibility) {

                        //Temporarily hide container to avoid screen flickering.
                        $container.css({ 'display': 'none' });

                        $startIndex = ($displayed.length <= $visibleOptions ? 0 : $start);
                        $endIndex = ($displayed.length <= $visibleOptions ? $displayed.length - 1 : $start + $visibleOptions - 1);
                        $height = 0;

                        for (var i = $startIndex; i < $visibleOptions; i++) {
                            //Create references to option and label.
                            var option = $displayed[i];
                            var label = $optionLabels[i];
                            //Calculate the height of container.
                            //$height += label.getHeight();

                            if (i <= $endIndex) {
                                //Assign object and its text to the label.
                                var text = option.getContent();
                                label.setContent(text);
                                label.setObject(option);
                                label.show();
                            } else {
                                label.hide();
                            }
                        }

                    }


                    clearSelection();
                    $visible = visibility;



                    //Restore container visibility or hide it (depending on the value of 'visibility' parameter).
                    $container.css({
                        //'height': (visibility ? $height + 'px' : '0px'),
                        'display': (visibility ? 'block' : 'none'),
                        'border-bottom': (visibility && $displayed.length > 0 ? '1px #6d7c99 solid' : 'none')
                    });

                }




                /* ==================================== */
                return {
                    render: function (visibility) {
                        _render(visibility);
                    },
                    //----------------------------------
                    isVisible: function () {
                        return $visible;
                    },
                    //----------------------------------
                    //Jeżeli przy aktualnym filtrze na wyświetlanej liście znajduje się
                    //tylko jedna opcja, to jest ona zwracana. W przeciwnym razie
                    //zwracane jest null.
                    getOnlyOption: function () {
                        if ($displayed.length == 1) {
                            return $displayed[0];
                        }
                        return null;
                    },
                    //----------------------------------
                    getCurrentObject: function () {
                        return ($selected ? $selected.getObject() : null);
                    },
                    //----------------------------------
                    refresh: function () {
                        _refreshOptions();
                    },
                    //----------------------------------
                    forceFilter: function () {
                        filterFromScratch();
                    }
                }
                /* ==================================== */


            }();
        }

        return _optionsArea;

    }

    /* ==================================== */

    function option(e) {
        var $index = e.index || 0;
        var $value = e.value || null;
        var $caption = e.caption || $value;
        var $prepend = (e.prepend === undefined ? '' : e.prepend);
        var $image;
        //--- Filtering ---
        var $base;
        var $html;
        //-----------------



        function clearContent() {
            $html = $caption;
        }


        container().bind({
            'filter': function (e) { clearContent(); }
        });


        return {
            //----------------------------------
            matchFilter: function (base) {
                var $base = base;
                var $position = ($caseSensitive ? $caption.indexOf(base) : $caption.toLowerCase().indexOf(base.toLowerCase()));

                if ($position >= 0) {
                    var baseEnd = $position + base.length;
                    $html = $caption.substr(0, $position) + '<span class="dropdown-matched-text">' +
                            $caption.substr($position, base.length) + '</span>' +
                            $caption.substr(baseEnd, $caption.length - baseEnd);
                    return true;
                } else {
                    return false;
                }

            },
            //----------------------------------
            getContent: function () {
                var s = $html || $caption; 
                return ($prepend ? $prepend + s : s);
            },
            //----------------------------------
            getCaption: function () {
                return $caption;
            },
            //----------------------------------
            getObject: function () {
                return $value;
            },
            //----------------------------------
            clear: function () {
                $html = $caption;
            }
            //----------------------------------
        }

    }
    /* ==================================== */


    function clearFilter() {
        $text = '';
        optionsArea().forceFilter();
    }


    function _remove() {
        container().remove();
    }


    (function () {
        $(_textbox).focus();
    })();


    /* ==================================== */
    return {
        //----------------------------------
        getSelected: function () {
            return $selectedOption;
        },
        //----------------------------------
        loadOptions: function (options) {
            if (options) {
                $options = options;
                optionsArea().refresh();
                optionsArea().render(false);
            }
        },
        //----------------------------------
        clearSelection: function () {
            $selectedOption = null;
            textbox().val('');
            clearFilter();
        },
        //----------------------------------
        listener: function () {
            return events();
        },
        //----------------------------------

        //----------------------------------
        activate: function () {
            textbox().focus();
        }
    };
    /* ==================================== */

}
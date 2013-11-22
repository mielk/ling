var searchData =  [
                { name: 'Europe', countries: ['Polska', 'Albania', 'Luksemburg'] },
                { name: 'South America', countries: ['Brazil', 'Venezuela', 'Argentina'] }
            ]



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
                $(window).on('mousemove', function (e) {
                    // Do the thing!
                    $this.on('mouseup', function (e) {
                        $(document.body).removeClass('unselectable');
                        //$('*').removeClass('unselectable');
                        // Other clean-up tasks here
                    });
                });
            }
        });

});



function DropDown(properties) {
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


    //Uzyskiwanie dostępu do kontrolek tego drop-downa.
    function container() {
        if (!_container) createUI();
        return $(_container);
    }

    function textbox() {
        if (!_textbox) createUI();
        return $(_textbox);
    }

    function arrow() {
        if (!_arrow) createUI();
        return $(_arrow);
    }

    function events() {
        if (!_events) createUI();
        return $(_events);
    }






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





    function createUI() {
        if (!_container) {
            _container = $('<div>', { id: $id, 'class': 'dropdown-container' }).appendTo($parent).css({ 'visibility': 'visible' });
            _arrow = $('<div>', { id: $id + '_textbox', 'class': 'dropdown-arrow' }).appendTo(_container);

            var _txtSpan = jQuery('<span/>', {
                    'class': 'textbox'
                }).
                bind({
                    'click': function () {
                        if (_textbox) {
                            $(_textbox).focus();
                        }
                    }
                }).
                appendTo(_container);

            _textbox = jQuery('<input/>', {
                id: $id + '_textbox',
                type: 'textbox',
                'class': 'dropdown-textbox'
            }).appendTo(_txtSpan);

            _events = $('<div>', { id: 'main_events_listener', 'class': 'eventsListener' }).css('display', 'none').appendTo(_container);

            _optionsArea = optionsArea();
        }
    }


    $(document).bind({
        'keydown': function (e) {
            if (e.which === 27) {   //Escape
                $(_textbox).val('');
                $(_events).trigger({
                    'type' : 'deactivate'
                });
            }
        }
    });


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
        appendTo: function (parent) {
            container().appendTo(parent);
            //adjustControls();
        },
        //----------------------------------
        addListener: function (fn) {
            container().bind({
                'selected': fn
            });
        },
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
        activate: function () {
            textbox().focus();
        }
    }
    /* ==================================== */

}

function ini() {
    var $main = document.getElementById('main');

    var a = DropDown($main, { options: [
            { name: 'Europe', countries: ['Polska', 'Albania', 'Luksemburg'] },
            { name: 'South America', countries: ['Brazil', 'Venezuela', 'Argentina'] },
    ], displayedField: 'name'
    });

    var b = DropDown($main, { options: [] });
    a.listener().bind({
        'selected': function (e) {
            b.clearSelection();
            b.loadOptions(e.object ? e.object.countries : null);
        }
    });

}



function DropDown(parent, e) {
    var $parent = $(parent) || $(document.body);
    //---------------------------------
    var $e = e || {};
    var $id = $e.id || ('mlq_dropdown_' + new Date().getTime());
    var $caption = $e.caption || 'Select option ...';
    var $options = $e.options || [];
    var $width = $e.width || 200;
    var $optionHeight = $e.optionHeight || 24;
    var $visibleOptions = $e.visibleOptions || 10;
    var $txtWidth = 0.8;
    var $mustMatch = ($e.mustMatch !== undefined ? $e.mustMatch : true);
    var $caseSensitive = $e.caseSensitive || false;
    var $displayedField = $e.displayedField || 'name';
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
                            appendTo(container()).css({ 'visibility': 'hidden' });

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
                        $optionObjects[i] = option({ 'index': i, 'value': $options[i], 'caption': $options[i][$displayedField] });
                    }
                }


                function optionLabel(index) {
                    //--- UI components ---
                    var SELECTED_CSS_CLASS = 'dropdown-selected';
                    var $container = $('<div>', { id: ('mlq_option_' + new Date().getTime()), 'class': 'dropdown-option' }).
                                                                            css({ 'visibility': 'visible', 'padding-top': '2px' });
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
                            var width = $o.width();
                            var extraWidth = my.ui.extraWidth($o);
                            $o.
                                css({
                                    'height': $optionHeight,
                                    'line-height': $optionHeight + 'px',
                                    'width': width - extraWidth
                                }).
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
                return $o.height() + my.ui.extraHeight($o);
            },
            setContent: function (content) {
                optionContainer().html(content);
            },
            setObject: function (object) {
                $object = object;
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
            $container.css({ 'visibility': 'hidden' });

            $startIndex = ($displayed.length <= $visibleOptions ? 0 : $start);
            $endIndex = ($displayed.length <= $visibleOptions ? $displayed.length - 1 : $start + $visibleOptions - 1);
            $height = 0;

            for (var i = $startIndex; i <= $endIndex; i++) {
                //for (var i = 0; i < $displayed.length; i++) {
                //Create references to option and label.
                var option = $displayed[i];
                var label = $optionLabels[i];
                //Calculate the height of container.
                $height += label.getHeight();
                //Assign object and its text to the label.
                var text = option.getContent();
                label.setContent(text);
                label.setObject(option);
            }

        }


        clearSelection();
        $visible = visibility;



        //Restore container visibility or hide it (depending on the value of 'visibility' parameter).
        $container.css({
            'height': (visibility ? $height + 'px' : '0px'),
            'visibility': 'visible',
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


} ();
}

return _optionsArea;

}
    
    /* ==================================== */

    function option(e) {
        var $index = e.index || 0;
        var $value = e.value || null;
        var $caption = e.caption || $value;
        var $image;
        //--- Filtering ---
        var $base;
        var $html;
        //-----------------



        function clearContent() {
            $html = $caption;
        }


        container().bind({
            'filter': function (e) { clearContent();}
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
                return $html || $caption;
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
            _container = $('<div>', { id: $id, 'class': 'dropdown-container' }).appendTo($parent).css({ 'visibility' : 'hidden' });
            _textbox = $('<input>', { id: $id + '_textbox', 'class': 'dropdown-textbox' }).appendTo(_container);
            _arrow = $('<div>', { id: $id + '_textbox', 'class': 'dropdown-arrow' }).appendTo(_container);
            _events = $('<div>', { id: 'main_events_listener', 'class': 'eventsListener' }).css('display', 'none').appendTo(_container);

            _optionsArea = optionsArea();
            adjustControls();
            //!!!optionsArea();
        }
    }


    function adjustControls() {
        //Container.
        container().css({ 'width': $width });

        //Text box and expand arrow.
        var t = textbox();
        var txtWidth = t.width();
        var txtExtraWidth = my.ui.extraWidth(t);
        t.css({
            'height': $optionHeight,
            'width' : t.width() - my.ui.extraWidth(t)
        });

        var a = arrow();
        a.css({
            'height': $optionHeight,
            'width' : a.width() - my.ui.extraWidth(a)
        });

        //Unhide container.
        container().css({ 'visibility' : 'visible' });

    }

    function clearFilter() {
        $text = '';
        optionsArea().forceFilter();
    }




    /* ==================================== */
    return {
        //----------------------------------
        appendTo: function (parent) {
            container().appendTo(parent);
            adjustControls();
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
        }
        //----------------------------------
    }
    /* ==================================== */

}
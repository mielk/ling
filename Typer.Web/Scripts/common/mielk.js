/*
 * mielk JavaScript library v0.0.1
 *
 * Date: 2014-02-21 14:31
 *
 */
(function (window) {

    'use strict';

    //Classes

    function hashTable(obj) {
        var self = this;
        self.HashTable = true;
        self.length = 0;
        self.items = {};


        (function init() {

            if (obj instanceof Object) {
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        self.items[key] = obj[key];
                        self.length++;
                    }
                }
            }

        })();

        this.setItem = function (key, value) {
            var previous = null;
            if (this.hasItem(key)) {
                previous = this.items[key];
            } else {
                this.length++;
            }
            this.items[key] = value;
            return previous;
        };

        this.getItem = function (key) {
            return this.hasItem(key) ? this.items[key] : undefined;
        };

        this.hasItem = function (key) {
            return this.items.hasOwnProperty(key);
        };

        this.removeItem = function (key) {
            if (this.hasItem(key)) {
                var previous = this.items[key];
                this.length--;
                delete this.items[key];
                return previous;
            } else {
                return undefined;
            }
        };

        this.keys = function () {
            var keys = [];
            for (var k in this.items) {
                if (this.hasItem(k)) {
                    keys.push(k);
                }
            }
            return keys;
        };

        this.values = function () {
            var values = [];
            for (var k in this.items) {
                if (this.hasItem(k)) {
                    values.push(this.items[k]);
                }
            }
            return values;
        };

        this.each = function ($fn) {
            for (var k in this.items) {
                if (this.hasItem(k)) {
                    $fn(k, this.items[k]);
                }
            }
        };

        this.size = function () {
            return this.length;
        };

        this.clear = function () {
            this.items = {};
            this.length = 0;
        };

        this.clone = function (deep) {
            var clone = new hashTable(null);
            for (var key in self.items) {
                if (self.items.hasOwnProperty(key)) {
                    var item = self.items[key];
                    var cloned = deep ? mielk.objects.clone(item, deep) : item;
                    clone.setItem(key, cloned);
                }
            }

            return clone;

        };

    }

    function eventHandler() {
        this.EventHandler = true;
        var listener = {};

        return {
            bind: function (e) {
                $(listener).bind(e);
            },
            trigger: function (e) {
                $(listener).trigger(e);
            }
        };

    }

    function resizableDiv(params) {
        var self = this;
        self.ResizableDiv = true;
        self.eventHandler = new eventHandler();

        self.id = params.id || 'id';
        self.parent = params.parent;
        self.minHeight = params.minHeight || 200;
        self.maxHeight = params.maxHeight || 800;

        //State.
        self.resizable = false;
        self.isMinimized = false;

        //Current position.
        self.x = 0;
        self.y = 0;

        //GUI.
        self.ui = (function () {
            var menuBarId = '_bar';
            var containerId = '_container';
            var resizerId = '_resizer';

            var container = $('<div>', {
                id: self.id + containerId,
                'class': 'resizable-panel'
            });
            $(container).appendTo(self.parent);

            var menubar = $('<div>', {
                id: self.id + menuBarId,
                html: self.id,
                'class': 'menuBar'
            }).dblclick(function () {
                if (self.isMinimized) {
                    self.maximize();
                } else {
                    self.minimize();
                }
            });
            menubar.appendTo(container);

            var div = $('<div>', {
                id: self.id,
                'class': params['class']
            });
            div.appendTo(container);
            //Set initial height if applicable.
            if (params.height) {
                $(div).height(params.height);
            }

            var resizer = $('<div>', {
                id: self.id + resizerId,
                'class': 'resizer'
            }).bind({
                mousedown: function (e) {
                    e.preventDefault();
                    self.setAsResizable(true);
                }
            });
            resizer.appendTo(container);


            return {
                container: container,
                content: div,
                height: function () {
                    return $(div).height();
                },
                setHeight: function (height) {
                    $(div).height(height);
                },
                hide: function () {
                    $(div).css({
                        'display': 'none'
                    });
                    $(resizer).css({
                        'display': 'none'
                    });
                },
                show: function () {
                    $(div).css({
                        'display': 'block'
                    });
                    $(resizer).css({
                        'display': 'block'
                    });
                },
                css: function (css) {
                    $(div).css(css);
                },
                getX: function (e) {
                    return (mielk.ui.getPosition(e).x - $(div).offset().left);
                },
                getY: function (e) {
                    return (mielk.ui.getPosition(e).y - $(div).offset().top);
                },
                setCaption: function (caption) {
                    $(menubar).html(caption);
                }
            };

        })();

        //Events binder.
        // ReSharper disable once UnusedLocals
        var events = (function () {

            $(document).bind({
                mousemove: function (e) {
                    e.preventDefault();
                    self.resize(e);
                },
                mouseup: function () {
                    self.setAsResizable(false);
                }
            });

        })();

    }
    resizableDiv.prototype = {
        bind: function (e) {
            this.eventHandler.bind(e);
        },
        trigger: function (e) {
            this.eventHandler.trigger(e);
        },
        container: function () {
            return this.ui.container;
        },
        content: function () {
            var div = this.ui.content[0];
            return div;
        },
        resize: function (e) {
            if (this.resizable) {
                var prevY = (this.y ? this.y : -1);
                this.y = this.getY(e);
                this.y = (this.y > this.maxHeight ? this.maxHeight : (this.y < this.minHeight ? this.minHeight : this.y));
                if (prevY === -1) prevY = this.y;

                var height = this.y - prevY + this.ui.height();
                height = (height < this.minHeight ? this.minHeight : (height > this.maxHeight ? this.maxHeight : height));
                this.ui.setHeight(height);

                this.eventHandler.trigger({
                    type: 'resize',
                    height: height
                });

            }
        },
        minimize: function () {
            this.ui.hide();
            this.isMinimized = true;
        },
        maximize: function () {
            this.ui.show();
            this.isMinimized = false;
        },
        setAsResizable: function (value) {
            if (value) {
                this.resizable = true;
                this.ui.css('backgroundColor', '#D6EFF9;');
            } else {
                this.resizable = false;
                this.ui.css('backgroundColor', 'white;');
                this.x = 0;
                this.y = 0;
            }
        },
        disableResizing: function () {
            //MOUSE_CLICKED = 0;
            //mainFrame.setCurrentDiv(null);
            this.ui.css({ 'backgroundColor': 'white;' });
            this.resized = false;
            this.x = 0;
            this.y = 0;
        },
        enableResizing: function () {
            this.ui.css({ 'backgroundColor': '#D6EFF9;' });
            this.resized = true;
            this.resize();
        },
        getX: function () {
            return this.ui.getX();
        },
        getY: function () {
            return this.ui.getY();
        },
        setCaption: function (caption) {

        }
    };



    //Modules

    var objects = (function () {

        //Class inheritance.
        function extend(base, sub) {
            // Avoid instantiating the base class just to setup inheritance
            // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
            // for a polyfill
            sub.prototype = Object.create(base.prototype);
            // Remember the constructor property was set wrong, let's fix it
            sub.prototype.constructor = sub;
            // In ECMAScript5+ (all modern browsers), you can make the constructor property
            // non-enumerable if you define it like this instead
            Object.defineProperty(sub.prototype, 'constructor', {
                enumerable: false,
                value: sub
            });
        }

        function isFunction(object) {
            return (object && typeof (object) === 'function');
        }

        function addProperties(object, properties) {
            for (var key in properties) {
                if (properties.hasOwnProperty(key)) {
                    object[key] = properties[key];
                }
            }
            return object;
        }
        
        function deleteProperties(object, properties) {
            mielk.arrays.each(properties, function(property) {
                if (object.hasOwnProperty(property)) {
                    delete object[property];
                }
            });
        }
        

        //Funkcja wywołująca podaną funkcję fn
        //dla każdego elementu obiektu object.
        function each(object, $fn) {
            for (var key in object) {
                if (object.hasOwnProperty(key)) {
                    var item = object[key];
                    $fn(key, item);
                }
            }
        }


        //Funkcja klonująca podaną wartość, niezależnie od jej typu.
        function clone(value, deep) {
            
            if (!value) {
                return value;
            } else if (value.clone && typeof(value.clone) === 'function') {
                return value.clone(deep);
            } else if ($.isArray(value)) {
                return mielk.arrays.clone(value, deep);
            } else if (value instanceof Object) {
                return cloneObject(value, deep);
            } else {
                //Primitive values.
                return value;
            }
        }


        //Funkcja klonująca wartości obiektowe.
        function cloneObject(object, deepCopy) {
            var $clone = {};

            each(object, function (key, value) {
                if (typeof (value) !== 'function') {
                    $clone[key] = deepCopy ? clone(value) : value;
                }
            });

            return $clone;
        }

        return {
            extend: extend
            , isFunction: isFunction
            , addProperties: addProperties
            , deleteProperties: deleteProperties
            , each: each
            , clone: clone
        };


    })();

    var notify = (function () {
        var options = {};
        var defaultSettings = {
            clickToHide: true,
            autoHide: true,
            autoHideDelay: 2000,
            arrowShow: false,
            elementPosition: 'bottom right',
            globalPosition: 'bottom right',
            style: 'bootstrap',
            className: 'info',
            showAnimation: 'slideDown',
            showDuration: 400,
            hideAnimation: 'slideUp',
            hideDuration: 500,
            gap: 2
        };


        /*
         * reset
         * Function to restore default settings.
         */
        function reset() {
            options = {
                clickToHide: defaultSettings.clickToHide,
                autoHide: defaultSettings.autoHide,
                autoHideDelay: defaultSettings.autoHideDelay,
                arrowShow: defaultSettings.arrowShow,
                elementPosition: defaultSettings.elementPosition,
                globalPosition: defaultSettings.globalPosition,
                style: defaultSettings.style,
                className: defaultSettings.className,
                showAnimation: defaultSettings.showAnimation,
                showDuration: defaultSettings.showDuration,
                hideAnimation: defaultSettings.hideAnimation,
                hideDuration: defaultSettings.hideDuration,
                gap: defaultSettings.gap
            };
        }


        /*
         * display
         * Function to display message box on the screen.
         */
        function display(message, state, properties) {
            changeState(state);
            applyCustomProperties(properties);
            $.notify(message, options);
            reset();
        }


        /*
         * Function to change the class of the displayed
         * notification based on the given string.
         */
        function changeState(state) {
            if (state === true || state === 'success') {
                options.className = 'success';
            } else if (state === false || state === 'error') {
                options.className = 'error';
            } else if (state === 'warn' || state === 'warning') {
                options.className = 'warn';
            } else {
                options.className = defaultSettings.className;
            }
        }



        /*
         * applyCustomProperties
         * Function to apply custom properties for
         * the notification to be displayed.
         */
        function applyCustomProperties(properties) {
            for (var key in properties) {
                if (properties.hasOwnProperty(key)) {
                    options[key] = properties[key];
                }
            }
        }


        /*
         * changeSettings
         */
        function changeSettings(properties) {
            for (var key in properties) {
                if (properties.hasOwnProperty(key)) {
                    defaultSettings[key] = properties[key];
                }
            }
        }


        /*
         * Initializing this function.
         */
        (function initialize() {
            reset();
        })();



        return {
            display: display,
            changeSettings: changeSettings
        };



    })();

    var validation = (function () {

        function coalesce(value, ifFalse) {
            return value ? value : ifFalse;
        }


        function isNumber(n) {
            return typeof n === 'number' && !isNaN(parseFloat(n)) && isFinite(n);
        }

        function isString(s) {
            return typeof s === 'string';
        }


        function validator(object) {

            var instance = (function (obj) {
                var invalid = mielk.hashTable();

                return {
                    validation: function (e) {
                        if (e.status) {
                            invalid.removeItem(e.id);
                        } else {
                            invalid.setItem(e.id, e.id);
                        }

                        if (obj.trigger && typeof (obj.trigger) === 'function') {
                            obj.trigger({
                                type: 'validation',
                                status: invalid.size() === 0
                            });
                        }

                    }
                };

            })(object);

            return instance;

        }


        return {
              coalesce: coalesce
            , isNumber: isNumber
            , isString: isString
            , validator: validator
        };


    })();

    var db = (function () {

        function fetch(controller, method, data, params) {
            var $result;
            var successCallback = (params && params.callback && typeof (params.callback) === 'function' ? params.callback : null);
            var errorCallback = (params && params.errorCallback && typeof (params.errorCallback) === 'function' ? params.errorCallback : null);

            $.ajax({
                url: '/' + controller + '/' + method,
                type: 'GET',
                data: data,
                datatype: 'json',
                async: (params && params.async ? true : false),
                cache: false,
                traditional: (params && params.traditional ? true : false),
                success: function (result) {
                    if (successCallback) {
                        $result = successCallback(result);
                    } else {
                        $result = result;
                    }
                },
                error: function (msg) {
                    mielk.notify.display('Error in mielk.db.fetch: ' + controller + '.' + method, false);
                    if (errorCallback) {
                        errorCallback(msg);
                    } else {
                        alert(msg.status + ' | ' + msg.statusText);
                    }
                }
            });

            return $result;

        }

        function post(controller, method, json, params) {
            var $result;
            var successCallback = (params && params.callback && typeof (params.callback) === 'function' ? params.callback : null);
            var errorCallback = (params && params.errorCallback && typeof (params.errorCallback) === 'function' ? params.errorCallback : null);
            var data = {'json': json };

            $.ajax({
                url: '/' + controller + '/' + method,
                type: 'POST',
                data: data,
                datatype: 'json',
                async: true,
                success: function (result) {
                    if (successCallback) {
                        $result = successCallback(result);
                    } else {
                        $result = result;
                    }
                    return $result;
                },
                error: function (msg) {
                    mielk.notify.display('Error in mielk.db.fetch: ' + controller + '.' + method, false);
                    if (errorCallback) {
                        errorCallback(msg);
                    } else {
                        alert(msg.status + ' | ' + msg.statusText);
                    }
                }
            });

        }


        return {
              fetch: fetch
            , post: post
        };

    })();

    var ui = (function () {

        var currentTopLayer = 9;

        function getPosition(e) {
            var x = 0;
            var y = 0;

            if (!e) e = window.event;
            if (e.pageX || e.pageY) {
                x = e.pageX;
                y = e.pageY;
            } else if (e.clientX || e.clientY) {
                x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
            }

            return {
                x: x,
                y: y
            };

        }

        function getPositionInElement(e, element) {
            //var x, y;
            //var imgPos = findPosition(element);

            //if (!e) e = window.event;

            //if (e.pageX || e.pageY) {
            //    x = e.pageX;
            //    y = e.pageY;
            //} else if (e.clientX || e.clientY) {
            //    x = e.clientX + document.body.scrollLeft
            //      + document.documentElement.scrollLeft;
            //    y = e.clientY + document.body.scrollTop
            //      + document.documentElement.scrollTop;
            //}

            //return {
            //    x: x - imgPos[0],
            //    y: y - imgPos[1]
            //};

        }

        function findPosition(element) {
            //if (element.offsetParent !== undefined) {
            //    for (var x = 0, y = 0; element; element = element.offsetParent) {
            //        x += element.offsetLeft;
            //        y += element.offsetTop;
            //    }

            //    return {
            //        x: x,
            //        y: y
            //    };

            //} else {

            //    return {
            //        x: element.x,
            //        y: element.y
            //    };

            //}
        }
        
        function topLayer() {
            return currentTopLayer++;
        }

        function radio(params) {
            var control = (function() {
                var name = params.name;
                var options = mielk.hashTable();
                var evHandler = mielk.eventHandler();
                var value = params.value || undefined;
                var total = params.options.length;
                var selected;
                var gui = (function () {
                    var container;
                    var label;
                    var panel;
                    
                    function createView() {
                        container = jQuery('<div/>', {
                            'class': 'radio-container'
                        });

                        label = jQuery('<div/>', {
                              'class': 'radio-label'
                            , html: name
                        });

                        panel = jQuery('<div/>', {
                            'class': 'radio-options-container'
                        });


                        $(label).appendTo(container);
                        $(panel).appendTo(container);
                        $(container).appendTo(params.container);
                    }

                    (function initialize() {
                        createView();
                    })();

                    return {
                        view: container,
                        append: function(item) {
                            $(item).appendTo(panel);
                        }
                    };

                })();

                function createOptions() {
                    params.options.each(function (k, v) {
                        var opt = option(k, v);
                        options.setItem(k, opt);
                    });
                }

                function option($key, $object) {
                    var key = $key;
                    var object = $object;
                    var caption = object.name || object.caption || object.key;
                    var optionUi = (function () {
                        var container;
                        var input;

                        function createContainer() {
                            container = jQuery('<div/>').css({
                                'width': (100 / total) + '%',
                                'float': 'left'
                            });

                            gui.append(container);

                        }
                        
                        function createInput() {
                            input = jQuery('<input/>', {
                                type: 'radio',
                                name: name,
                                value: key,
                                checked: object.checked ? true : false,
                                'class': 'radio-option'
                            }).css({
                                'float': 'left',
                                'margin-right': '6px',
                                'border': 'none'
                            }).bind({
                                'click': function () {
                                    evHandler.trigger({
                                        type: 'click',
                                        caption: caption,
                                        object: object,
                                        value: object.value
                                    });
                                }
                            });
                            

                            if (object.checked) {
                                value = object.value;
                                selected = object;
                            }

                            var label = jQuery('<label>').
                                bind({
                                    click: function () {
                                        select();
                                    }
                                }).
                                attr('for', input).
                                css({ 'height': 'auto', 'width': 'auto' }).
                                text(caption);

                            input.appendTo(label);
                            label.appendTo(container);

                        }
                        
                        function check(val) {
                            $(input).prop('checked', val);
                        }

                        function isClicked() {
                            return $(input).prop('checked');
                        }

                        (function initialize() {
                            createContainer();
                            createInput();
                        })();



                        return {
                              view: container
                            , select: select
                            , check: check
                            , isClicked: isClicked
                        };

                    })();

                    function select() {
                        optionUi.check(true);
                        value = object.value;
                        selected = this;
                        evHandler.trigger({
                              type: 'click'
                            , caption: caption
                            , option: this
                            , object: object
                            , value: object.value
                        });
                    }
                    
                    function unselect() {
                        optionUi.check(false);
                    }

                    return {
                          select: select
                        , unselect: unselect
                        , key: key
                        , isClicked: optionUi.isClicked
                        , caption: caption
                    };

                }
                
                function change(val) {
                    var $selected = options.getItem(val);
                    if ($selected) $selected.select();
                }

                (function initialize() {
                    createOptions();
                    change(params.value);
                })();


                return {
                    bind: function (e) {
                        evHandler.bind(e);
                    }
                    , trigger: function (e) {
                        evHandler.trigger(e);
                    }
                    , value: value
                    , change: change
                    , view: gui.view
                };

            })();

            return control;

        }

        function checkbox(params) {
            var control = (function (){
                var name = params.name;
                var caption = params.caption || name;
                var options = params.options;
                var evHandler = mielk.eventHandler();
                var selected = $.isNumeric(params.value) ? options.getItem(params.value) : params.value;
                var checked = false;
                
                var gui = (function () {
                    var container;
                    var label;
                    var box;
                    
                    function createView() {
                        container = jQuery('<div/>', {
                            'class': 'radio-container'
                        });
                        
                        box = jQuery('<input/>', {
                            type: 'checkbox',
                            checked: checked
                        }).css({
                            'float': 'left',
                            'margin-right': '6px',
                            'border': 'none'
                        }).bind({
                            'click': function (e) {
                                change(!checked);
                                e.stopPropagation();
                            }
                        });

                        label = jQuery('<label>', {
                            'class': 'bold'
                        }).attr('for', box)
                          .bind({
                              click: function () {
                                  change(!checked);
                              }
                            })
                          .css({ 'height': 'auto' })
                          .text(caption);

                        $(box).appendTo(label);
                        $(label).appendTo(container);
                        $(container).appendTo(params.container);
                    }

                    function check(value) {
                        $(box).prop('checked', value);
                    }

                    (function initialize() {
                        createView();
                    })();

                    return {
                          view: container
                        , check: check
                    };

                })();

                function change(val) {
                    if (checked !== val) {
                        checked = val;
                        selected = getOption(val);
                        gui.check(val);
                        evHandler.trigger({
                              type: 'click'
                            , value: checked
                            , option: selected
                            , object: selected
                        });
                    }
                }
                

                function getOption(value) {
                    var option = null;
                    options.each(function (k, v) {
                        if (!option && ((value && v.value) || (!value && !v.value))) {
                            option = v;
                        }
                    });
                    return option;
                }


                (function initialize() {
                    change(selected.value ? true : false);
                })();


                return {
                    bind: function (e) {
                        evHandler.bind(e);
                    }
                    , trigger: function (e) {
                        evHandler.trigger(e);
                    }
                    , value: function() {
                        return null;
                    }
                    , change: function(val) {
                        change(val ? true : false);
                    }
                    , view: gui.view
                };

            })();
            
            return control;
            
        }

        function modalPopup(content) {

            var popup = (function() {
                var background = jQuery('<div/>', {
                    'id': 'test'
                });
                background.css({
                    'position': 'fixed',
                    'display': 'block',
                    'top': 0,
                    'left': 0,
                    'width': '100%',
                    'height': '100%',
                    'background-color': 'rgba(100, 100, 100, 0.85)',
                    'overflow-y': 'auto',
                    'z-index': topLayer()
                });
                $(background).appendTo(document.body);
                background.bind({
                    click: function() {
                        $(background).remove();
                    }
                });

                var frame = jQuery('<div/>');
                frame.css({
                    'position': 'relative'
                    ,'display': 'table'
                    ,'-moz-box-sizing': 'border-box'
                    ,'-webkit-box-sizing': 'border-box'
                    ,'box-sizing': 'border-box'
                    ,'border': '3px solid #999'
                    ,'background-color': '#eee'
                    ,'padding': '12px'
                    ,'width':'auto'
                    ,'height':'auto'
                    ,'margin':'50px auto'
                });
                frame.appendTo(background);

                $(content).appendTo(frame);


                return {                    
                    destroy: function() {
                        $(background).remove();
                    }
                };


            })();

            return popup;

        }

        return {
              getPosition: getPosition
            , getPositionInElement: getPositionInElement
            , findPosition: findPosition
            , topLayer: topLayer
            , radio: radio
            , checkbox: checkbox
            , modalPopup: modalPopup
        };

    })();

    var spinner = (function () {
        var background = null;
        var $spinner = null;

        function createBackground() {
            background = jQuery('<div/>').css({
                'background-color': 'transparent',
                'z-index': 9999,
                'position': 'absolute',
                'width': '20%',
                'height': '150px',
                'left': '40%',
                'right': '40%',
                'top': '200px',
                'display': 'none'
            }).appendTo($(document.body));
        }

        function start() {
            if (!background) createBackground();
            $(background).css('display', 'block');
            $spinner = new SpinnerWrapper($(background));
        }

        function stop() {
            $(background).css('display', 'none');
            if ($spinner) $spinner.stop();
        }

        function innerSpinner(container) {
            return new SpinnerWrapper($(container));
        }

        return {
              start: start
            , stop: stop
            , innerSpinner: innerSpinner
        };

    })();

    var arrays = (function () {

        function getLastItem(array) {
            var item = array[array.length - 1];
            return item;
        }

        function fromObject(object) {
            var array = [];
            for (var key in object) {
                if (object.hasOwnProperty(key)) {
                    var item = object[key];
                    array.push(item);
                }
            }
            return array;
        }

        function equal(arr1, arr2) {
            if (arr1 && arr2) {
                if (arr1.length === arr2.length) {
                    for (var i = 0; i < arr1.length; i++) {
                        var object = arr1[i];
                        var found = false;
                        for (var j = 0; j < arr2.length; j++) {
                            // ReSharper disable once ExpressionIsAlwaysConst
                            var obj2 = arr2[j];
                            if (!found && obj2 === object) {
                                found = true;
                            }
                        }

                        if (!found) {
                            return false;
                        }

                    }

                    return true;

                }
                return false;
            }

            return false;

        }

        function remove(array, item) {
            var after = [];
            if (!array || !array.length) return array;

            for (var i = 0; i < array.length; i++) {
                var object = array[i];
                if (object !== item) {
                    after.push(object);
                }
            }

            return after;

        }

        function getMax(array, f, start, end) {
            var result = null;
            var $start = start || 0;
            var $end = Math.min(end, array.length - 1) || array.length - 1;
            for (var i = $start; i < $end; i++) {
                var item = array[i];
                var value = f(item);
                if (!result || value > result) result = value;
            }

            return result;

        }

        function getMin(array, f, start, end) {
            var result = null;
            var $start = start || 0;
            var $end = Math.min(end, array.length - 1) || array.length - 1;
            for (var i = $start; i < $end; i++) {
                var item = array[i];
                var value = f(item);
                if (!result || value < result) result = value;
            }

            return result;

        }

        function firstGreater(array, value, f, returnIndex) {

            if (array) {
                var size = array.length;
                var start = 0;
                var end = size - 1;

                //If the first item is greater than value searched
                //or the last item is less than value searched, null is returned.
                if (fn(array[start], value) === 1 && f(array[end], value) === -1) {
                    return null;
                }

                do {

                    var index = Math.round((end - start) / 2) + start;

                    var item = array[index];
                    var result = f(item, value);
                    if (result === true) {
                        return returnIndex ? index : item;
                    } else if (result === 1) {
                        end = index - 1;
                    } else if (result === -1) {
                        start = index + 1;
                    }

                } while (end >= start);

            }

            return null;

        }

        //Metoda wywołująca podaną funkcję fn dla każdego
        //elementu z tablicy array.
        function each(array, $fn) {
            if (array && Array.isArray(array)) {
                for (var i = 0; i < array.length; i++) {
                    var item = array[i];
                    $fn(item);
                }
            }
        }

        //Funkcja klonująca podaną tablicę.
        function clone(array) {
            var $clone = [];

            each(array, function (item) {
                $clone.push(item);
            });

            return $clone;

        }

        return {
              getLastItem: getLastItem
            , fromObject: fromObject
            , equal: equal
            , remove: remove
            , getMax: getMax
            , getMin: getMin
            , firstGreater: firstGreater
            , each: each
            , clone: clone
        };

    })();

    var numbers = (function () {

        function generateUuid() {
            var d = new Date().getTime();
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
            });
            return uuid;
        }

        function log10(x) {
            return Math.log(x) / Math.LN10;
        }

        function addThousandSeparator(number, separator) {
            number += '';
            var x = number.split('.');
            var x1 = x[0];
            var x2 = x.length > 1 ? '.' + x[1] : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + separator + '$2');
            }
            return x1 + x2;
        }

        function checkValue(value, min, max) {
            var $value = Number(value);
            if (!$.isNumeric($value) || $value === 0) return 0;
            return Math.max(Math.min(max, $value), min);
        }

        return {
              generateUUID: generateUuid
            , log10: log10
            , addThousandSeparator: addThousandSeparator
            , checkValue: checkValue
        };

    })();

    var text = (function () {

        function onlyDigits(s) {
            return (s + '').match(/^-?\d*/g);
        }

        function countMatchedEnd(base, compared) {
            var counter = 0;
            var baseLength = base.length;
            var comparedLength = compared.length;
            for (var i = 1; i < comparedLength; i++) {

                if (i > baseLength) return counter;

                var $base = base.charAt(baseLength - i);
                var $compared = compared.charAt(comparedLength - i);

                if ($base !== $compared) {
                    return counter;
                } else {
                    counter++;
                }

            }

            return counter;

        }

        function substring(base, start, end, isCaseSensitive) {
            var tempBase, tempStart, tempEnd;

            //Checks if all the parameters are defined.
            if (base === undefined || base === null || start === undefined || start === null || end === undefined || end === null) {
                return '';
            }


            if (isCaseSensitive) {
                tempBase = base ? base.toString() : 0;
                tempStart = start ? start.toString() : 0;
                tempEnd = end ? end.toString() : 0;
            } else {
                tempBase = base.toString().toLowerCase();
                tempStart = start.toString().toLowerCase();
                tempEnd = end.toString().toLowerCase();
            }


            //Wyznacza pozycje początkowego i końcowego stringa w stringu bazowym.
            var iStart = (tempStart.length ? tempBase.indexOf(tempStart) : 0);
            //alert('baseString: ' + baseString + '; start: ' + start + '; end: ' + end + '; caseSensitive: ' + isCaseSensitive);
            if (iStart < 0) {
                return '';
            } else {
                var iEnd = (tempEnd.length ? tempBase.indexOf(tempEnd, iStart + tempStart.length) : tempBase.length);
                return (iEnd < 0 ? '' : base.toString().substring(iStart + tempStart.length, iEnd));
            }

        }

        function isLetter($char) {
            return ($char.length === 1 && $char.match(/[a-z]/i) ? true : false);
        }

        function containLettersNumbersUnderscore(str) {
            return (str.match(/^\w+$/) ? true : false);
        }

        function isValidMail(mail) {
            return (mail.match(/^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/) ? true : false);
        }

        function startsWith(base, prefix) {
            var s = base.substr(0, prefix.length);
            return (s === prefix);
        }

        function toCamelCase(str) {
            var words = str.split(' ');
            
            if (words.length === 0) {
                return '';
            } else if (words.length === 1) {
                return toSentenceCase(words[0]);
            } else {
                var result = '';
                mielk.arrays.each(words, function (word) {
                    result += toSentenceCase(word);
                });
                return result;
            }

        }

        function toSentenceCase(str) {
            return str.substr(0, 1).toUpperCase() + str.substr(1, str.length - 1);
        }

        function parse(txt) {
            if (txt === '*' || txt === 'true') {
                return true;
            } else if (txt === '' || txt === 'false') {
                return false;
            } else if ($.isNumeric(txt)) {
                return Number(txt);
            } else {
                return txt;
            }
        }

        function valueToText(value) {
            if (value === true) {
                return '*';
            } else if (value === false) {
                return '';
            } else {
                return value;
            }
        }

        function matchEnd(base, compared) {
            var counter = countMatchedEnd(base, compared);
            if (counter === 0) return '';
            return compared.substring(compared.length - counter, counter);

        }

        function cut(base, chars) {
            if (chars > base.length) return base;
            return base.substring(0, base.length - chars);
        }
        
        function replaceGlobal(str, find, replace) {
            return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
        }

        function escapeRegExp(string) {
            return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
        }

        return {
            cut: cut,
            countMatchedEnd: countMatchedEnd,
            onlyDigits: onlyDigits,
            substring: substring,
            isLetter: isLetter,
            containLettersNumbersUnderscore: containLettersNumbersUnderscore,
            isValidMail: isValidMail,
            startsWith: startsWith,
            valueToText: valueToText,
            matchEnd: matchEnd,
            parse: parse,
            replaceGlobal: replaceGlobal,
            toCamelCase: toCamelCase,
            toSentenceCase: toSentenceCase
        };

    })();

    var dates = (function () {

        function toString(date) {
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var day = date.getDate();
            return year + '-' +
                (month < 10 ? '0' : '') + month + '-' +
                (day < 10 ? '0' : '') + day;
        }

        function fromString(s) {
            var year = s.substr(0, 4) * 1;
            var month = s.substr(5, 2) * 1 - 1;
            var day = s.substr(8, 2) * 1;
            return new Date(year, month, day);
        }

        function daysDifference(start, end) {
            var milisInDay = 86400000;
            var startDay = Math.floor(start.getTime() / milisInDay);
            var endDay = Math.floor(end.getTime() / milisInDay);
            return (endDay - startDay);
        }

        function weeksDifference(start, end) {
            var result = Math.floor(daysDifference(start, end) / 7);
            return (end.getDay() < start.getDay() ? result : result);
        }

        //    return {
        //        TIMEBAND: $timeband,

        //        /*   Funkcja:    dateDifference
        //        *    Opis:       Funkcja zwraca różnicę pomiędzy datami [start] i [end],
        //        *                wyrażoną w jednostkach przypisanych do podanego timebandu.
        //        */
        //        dateDifference: function (timeband, start, end) {
        //            switch (timeband) {
        //                case $timeband.D:
        //                    return this.daysDifference(start, end);
        //                case $timeband.W:
        //                    return this.weeksDifference(start, end);
        //                case $timeband.M:
        //                    return this.monthsDifference(start, end);
        //                default:
        //                    return 0;
        //            }
        //        },


        //        /*-------------------------------*/


        //        /*   Funkcja:    daysDifference
        //        *    Opis:       Funkcja zwraca różnicę pomiędzy datami [start] i [end],
        //        *                wyrażoną w dniach.
        //        */
        //        daysDifference: function (start, end) {
        //            return daysDifference(start, end);
        //        },


        //        /*-------------------------------*/


        //        /*   Funkcja:    weeksDifference
        //        *    Opis:       Funkcja zwraca różnicę pomiędzy datami [start] i [end],
        //        *                wyrażoną w tygodniach.
        //        */
        //        weeksDifference: function (start, end) {
        //            return weeksDifference(start, end);
        //        },


        //        /*-------------------------------*/


        //        /*   Funkcja:    monthsDifference
        //        *    Opis:       Funkcja zwraca różnicę pomiędzy datami [start] i [end],
        //        *                wyrażoną w miesiącach.
        //        */
        //        monthsDifference: function (start, end) {
        //            var yearStart = start.getFullYear();
        //            var monthStart = start.getMonth();
        //            var yearEnd = end.getFullYear();
        //            var monthEnd = end.getMonth();

        //            return (monthEnd - monthStart) + (12 * (yearEnd - yearStart));

        //        },


        //        /*-------------------------------*/


        //        /*   Funkcja:    workingDays
        //        *    Opis:       Funkcja zwraca liczbę dni pracujących pomiędzy dwiema datami.
        //        */
        //        workingDays: function (start, end) {
        //            var sDate = (start.getDay() > 5 ? start.getDate() - (start.getDay() - 5) : start);
        //            var eDate = (end.getDay() > 5 ? end.getDate() - (end.getDay() - 5) : end);
        //            return (weeksDifference(sDate, eDate) * 5) + (eDate.getDay() - sDate.getDay());
        //        },


        //        /*-------------------------------*/


        //        /*-------------------------------*/


        //        /*   Funkcja:    getMonth
        //        *    Opis:       Funkcja zwracająca nazwę podanego miesiąca.
        //        */
        //        monthName: function (month, isShort) {
        //            var months = {
        //                1: ['styczeń', 'sty'],
        //                2: ['luty', 'lut'],
        //                3: ['marzec', 'mar'],
        //                4: ['kwiecień', 'kwi'],
        //                5: ['maj', 'maj'],
        //                6: ['czerwiec', 'cze'],
        //                7: ['lipiec', 'lip'],
        //                8: ['sierpień', 'sie'],
        //                9: ['wrzesień', 'wrz'],
        //                10: ['październik', 'paź'],
        //                11: ['listopad', 'lis'],
        //                12: ['grudzień', 'gru']
        //            };

        //            return months[month][isShort ? 1 : 0];

        //        }
        //    };


        return {
            toString: toString,
            fromString: fromString,
            daysDifference: daysDifference,
            weeksDifference: weeksDifference
        };

    })();

    var fn = (function() {

        function run(f, param) {
            if (f && typeof(f) === 'function') {
                return f(param);
            }

            return null;

        }


        return {
            run: run
    };

    })();

    /*
     * Wrapper for functions defined above.
     */
    var mielk = {
          hashTable: function (obj) { return new hashTable(obj); }
        , eventHandler: function () { return new eventHandler(); }
        , resizableDiv: function (params) { return new resizableDiv(params); }
        , notify: notify
        , objects: objects
        , validation: validation
        , db: db
        , ui: ui
        , spinner: spinner
        , arrays: arrays
        , numbers: numbers
        , text: text
        , dates: dates
        , fn: fn
    };



    // Expose mielk to the global object
    window.mielk = mielk;


})(window);



//my.ui = (function () {

//    var topLayer = 0;

//    return {
//        extraWidth: function (element) {
//            if (element) {
//                var $e = $(element);
//                if ($e) {
//                    return $e.padding().left + $e.padding().right +
//                        $e.border().left + $e.border().right +
//                        $e.margin().left + $e.margin().right;
//                } else {
//                    return 0;
//                }
//            } else {
//                return 0;
//            }
//        },

//        extraHeight: function (element) {
//            if (element) {
//                var $e = $(element);
//                if ($e) {
//                    return $e.padding().top + $e.padding().bottom +
//                        $e.border().top + $e.border().bottom +
//                        $e.margin().top + $e.margin().bottom;
//                } else {
//                    return 0;
//                }
//            } else {
//                return 0;
//            }
//        },

//        moveCaret: function (win, charCount) {
//            var sel, range;
//            if (win.getSelection) {
//                sel = win.getSelection();
//                if (sel.rangeCount > 0) {
//                    var textNode = sel.focusNode;
//                    var newOffset = sel.focusOffset + charCount;
//                    sel.collapse(textNode, Math.min(textNode.length, newOffset));
//                }
//            } else if ((sel = win.document.selection)) {
//                if (sel.type != 'Control') {
//                    range = sel.createRange();
//                    range.move('character', charCount);
//                    range.select();
//                }
//            }
//        },

//        addTopLayer: function () {
//            return ++topLayer;
//        },

//        releaseTopLayer: function () {
//            topLayer--;
//        },

//        display: function (div, value) {
//            $(div).css({ 'display': (value ? 'block' : 'none') });
//        },


//})();


//})();

///* Funkcje daty i czasu */
//my.dates = (function () {


//})();


//my.grammarProperties = (function () {

//    var properties = new HashTable(null);

//    function get(id) {
//        var object = properties.getItem(id);
//        if (!object) {
//            object = fetch(id);
//            if (object) properties.setItem(id, object);
//        }
//        return object;
//    }

//    function fetch(id) {
//        var data = my.db.fetch('Words', 'GetProperty', { 'id': id });

//        //Create options collection.
//        var options = new HashTable(null);
//        for (var i = 0; i < data.Options.length; i++) {
//            var object = data.Options[i];
//            var option = {
//                id: object.Id,
//                propertyId: object.PropertyId,
//                name: object.Name,
//                value: object.Value,
//                default: object.Default
//            };
//            options.setItem(option.id, option);
//        }

//        return {
//            id: data.Id,
//            languageId: data.LanguageId,
//            name: data.Name,
//            type: data.Type,
//            'default': data.Default,
//            options: options
//        };

//    }

//    return {
//        get: get,
//        fetch: fetch
//    };

//})();
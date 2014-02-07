var my = my || {};


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


WORDTYPE = {
    NOUN: { id: 1, name: 'noun', symbol: 'N' },
    VERB: { id: 2, name: 'verb', symbol: 'V' },
    ADJECTIVE: { id: 3, name: 'adjective', symbol: 'A' },
    OTHER: { id: 4, name: 'other', symbol: 'O' },
    getItem: function (value) {
        for (var key in WORDTYPE) {
            if (WORDTYPE.hasOwnProperty(key)) {
                var object = WORDTYPE[key];
                if (object.id === value) {
                    return object;
                }
            }
        }
        return null;
    },
    getValues: function () {
        var array = [];
        for (var key in this) {
            if (this.hasOwnProperty(key)) {
                var item = this[key];
                if (item && item.id) {
                    var object = {
                        id: item.id,
                        name: item.name,
                        object: item
                    };
                    array.push(object);
                }
            }
        }
        return array;
    }
};


//HashTable
function HashTable(obj) {
    this.length = 0;
    this.items = {};
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            this.items[p] = obj[p];
            this.length++;
        }
    }

    this.setItem = function(key, value) {
        var previous = undefined;
        if (this.hasItem(key)) {
            previous = this.items[key];
        } else {
            this.length++;
        }
        this.items[key] = value;
        return previous;
    };

    this.getItem = function(key) {
        return this.hasItem(key) ? this.items[key] : undefined;
    };

    this.hasItem = function(key) {
        return this.items.hasOwnProperty(key);
    };

    this.removeItem = function(key) {
        if (this.hasItem(key)) {
            var previous = this.items[key];
            this.length--;
            delete this.items[key];
            return previous;
        } else {
            return undefined;
        }
    };

    this.keys = function() {
        var keys = [];
        for (var k in this.items) {
            if (this.hasItem(k)) {
                keys.push(k);
            }
        }
        return keys;
    };

    this.values = function() {
        var values = [];
        for (var k in this.items) {
            if (this.hasItem(k)) {
                values.push(this.items[k]);
            }
        }
        return values;
    };

    this.each = function(fn) {
        for (var k in this.items) {
            if (this.hasItem(k)) {
                fn(k, this.items[k]);
            }
        }
    };

    this.size = function() {
        return this.length;
    };

    this.clear = function() {
        this.items = {};
        this.length = 0;
    };
}


//Class to handle events.
function EventHandler() {
    this.listener = {};
}
EventHandler.prototype.trigger = function (e) {
    $(this.listener).trigger(e);
};
EventHandler.prototype.bind = function (e) {
    $(this.listener).bind(e);
};





my.notify = (function() {
    var options = {
        clickToHide: true,
        autoHide: true,
        autoHideDelay: 2000,
        arrowShow: false,
        // default positions
        elementPosition: 'bottom right',
        globalPosition: 'bottom right',
        style: 'bootstrap',
        className: 'success',
        showAnimation: 'slideDown',
        showDuration: 400,
        hideAnimation: 'slideUp',
        hideDuration: 500,
        gap: 2
    };

    return {
        display: function(msg, success) {
            options.className = (success ? 'success' : 'error');
            $.notify(msg, options);
        }
    };


})();

my.ui = (function () {

    var topLayer = 0;

    return {
        extraWidth: function(element) {
            if (element) {
                var $e = $(element);
                if ($e) {
                    return $e.padding().left + $e.padding().right +
                        $e.border().left + $e.border().right +
                        $e.margin().left + $e.margin().right;
                } else {
                    return 0;
                }
            } else {
                return 0;
            }
        },

        extraHeight: function(element) {
            if (element) {
                var $e = $(element);
                if ($e) {
                    return $e.padding().top + $e.padding().bottom +
                        $e.border().top + $e.border().bottom +
                        $e.margin().top + $e.margin().bottom;
                } else {
                    return 0;
                }
            } else {
                return 0;
            }
        },

        moveCaret: function(win, charCount) {
            var sel, range;
            if (win.getSelection) {
                sel = win.getSelection();
                if (sel.rangeCount > 0) {
                    var textNode = sel.focusNode;
                    var newOffset = sel.focusOffset + charCount;
                    sel.collapse(textNode, Math.min(textNode.length, newOffset));
                }
            } else if ((sel = win.document.selection)) {
                if (sel.type != "Control") {
                    range = sel.createRange();
                    range.move("character", charCount);
                    range.select();
                }
            }
        },

        addTopLayer: function() {
            return ++topLayer;
        },

        releaseTopLayer: function() {
            topLayer--;
        },
        
        display: function (div, value) {
            $(div).css({ 'display': (value ? 'block' : 'none') });
        },
        
        radio: function (params) {
            var name = params.name;
            var options = new HashTable(null);
            var eventHandler = new EventHandler();
            var panel = jQuery('<div/>').css({
                'display': 'block',
                'position': 'relative',
                'float': 'left',
                'width': '100%',
                'height': '100%'
            }).appendTo($(params.container));
            var value = params.value || undefined;
            var selected;

            //Create items.
            var total = Object.keys(params.options).length;
            var option = function ($key, $object) {
                var key = $key;
                var caption = $object.name || $object.caption || $object.key;
                var object = $object;
                var container = jQuery('<div/>').css({
                    'width': (100 / total) + '%',
                    'float': 'left'
                }).appendTo(panel);

                var input = jQuery('<input/>', {
                    type: 'radio',
                    name: name,
                    value: $key,
                    checked: $object.checked ? true : false,
                    'class': 'radio-option'
                }).css({
                    'float': 'left',
                    'margin-right': '6px',
                    'border': 'none'
                }).bind({
                    'click': function () {
                        eventHandler.trigger({
                            type: 'click',
                            caption: caption,
                            object: object,
                            value: object.value
                        });
                    }
                });

                if ($object.checked) {
                    value = $object.value;
                    selected = $object;
                }

                var label = jQuery('<label>').
                    attr('for', input).
                    css({ 'height': 'auto', 'width': 'auto' }).
                    text(caption);
                input.appendTo(label);
                label.appendTo(container);

                return {
                    select: function () {
                        $(input).prop('checked', true);
                        eventHandler.trigger({
                            type: 'click',
                            caption: caption,
                            object: object,
                            value: object.value
                        });
                    },
                    unselect: function () {
                        $(input).prop('checked', false);
                    },
                    key: function () {
                        return key;
                    },
                    isClicked: function () {
                        return $(input).prop('checked');
                    },
                    caption: function () {
                        return caption;
                    }
                };

            };

            for (var k in params.options) {
                if (params.options.hasOwnProperty(k)) {
                    var $option = option(k, params.options[k]);
                    options.setItem($option.key(), $option);
                }
            }

            eventHandler.bind({
                click: function (e) {
                    value = e.object.value;
                    if (selected) selected.
                    selected = e.object;
                }
            });

            return {
                bind: function (e) {
                    eventHandler.bind(e);
                },
                trigger: function (e) {
                    eventHandler.trigger(e);
                },
                value: function () {
                    return value;
                },
                change: function ($value) {
                    var $selected = options.getItem($value);
                    if ($selected) {
                        selected = $selected;
                        selected.select();
                    }
                    //printStates();
                }
            };

        },

        checkbox: function(params) {
            var name = params.name;
            var caption = params.caption || name;
            var checked = params.checked ? true : false;
            var eventHandler = new EventHandler();
            var panel = jQuery('<div/>').css({
                'display': 'block',
                'position': 'relative',
                'float': 'left',
                'width': '100%',
                'height': '100%'
            }).appendTo($(params.container));

            var box = jQuery('<input/>', {
                type: 'checkbox',
                checked: checked
            }).css({
                'float': 'left',
                'margin-right': '6px',
                'border': 'none'
            }).bind({                
               'click': function() {
                   checked = !checked;
                   eventHandler.trigger({
                       type: 'click',
                       value: checked
                   });
               } 
            });

            eventHandler.bind({                
               click: function(e) {
                   $(box).prop('checked', e.value);
               } 
            });
            
            var label = jQuery('<label>').
                attr('for', box).
                css({ 'height': 'auto' }).
                text(caption);

            $(box).appendTo(label);
            $(label).appendTo(panel);

            function change(value) {
                if (checked !== value) {
                    checked = value;
                    eventHandler.trigger({
                        type: 'click',
                        value: checked
                    });
                }
            }

            return {
                bind: function (e) {
                    eventHandler.bind(e);
                },
                trigger: function (e) {
                    eventHandler.trigger(e);
                },
                value: function() {
                    return checked;
                },
                change: function (value) {
                    if (value) {
                        change(true);
                    } else {
                        change(false);
                    }
                }
            };

        }

    };

})();

/* Funkcje tekstowe */
my.text = (function () {

    function countMatchedEnd(base, compared) {
        var counter = 0;
        var baseLength = base.length;
        var comparedLength = compared.length;
        for (var i = 1; i < comparedLength; i++) {

            if (i > baseLength) return counter;

            var $base = base.charAt(baseLength - i);
            var $compared = compared.charAt(comparedLength - i);

            if ($base != $compared) {
                return counter;
            } else {
                counter++;
            }

        }

        return counter;

    }

    return {
        /*  Funkcja:    onlyDigits
         *  Opis:       Funkcja usuwa z podanego stringa wszystkie
         *              znaki nie będące cyframi.
         */
        onlyDigits: function(s) {
            return (s + '').match(/^-?\d*/g);
        },


        /*-------------------------------*/


        /*  Funkcja:    substring
         *  Opis:       Funkcja zwraca podciąg znaków tekstu bazowego [base]
         *              znajdujący się pomiędzy podanymi znacznikami [start]
         *              oraz [end].
         */
        substring: function(base, start, end, isCaseSensitive) {
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

        },

        isLetter: function($char) {
            return ($char.length === 1 && $char.match(/[a-z]/i) ? true : false);
        },

        containLettersNumbersUnderscore: function(str) {
            return (str.match(/^\w+$/) ? true : false);
        },

        isValidMail: function(mail) {
            return (mail.match(/^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/) ? true : false);
        },

        startsWith: function(base, prefix) {
            var s = base.substr(0, prefix.length);
            return (s === prefix);
        },
        
        parse: function(text) {
            if (text === '*' || text === 'true') {
                return true;
            } else if (text === '' || text === 'false') {
                return false;
            } else if ($.isNumeric(text)) {
                return Number(text);
            } else {
                return text;
            }
        },
        
        valueToText: function(value) {
            if (value === true) {
                return '*';
            } else if (value === false) {
                return '';
            } else {
                return value;
            }
        },

        matchEnd: function (base, compared) {
            var counter = countMatchedEnd(base, compared);
            if (counter === 0) return '';
            return compared.substring(compared.length - counter, counter);

        },

        countMatchedEnd: function (base, compared) {
            return countMatchedEnd(base, compared);
        },

        cut: function (base, chars) {
            if (chars > base.length) return base;
            return base.substring(0, base.length - chars);
        }

    };

})();

my.array = (function () {
    return {
        objectToArray: function(object) {
            var array = [];
            for (var key in object) {
                if (object.hasOwnProperty(key)) {
                    var item = object[key];
                    array.push(item);
                }
            }
            return array;
        },
        equal: function (arr1, arr2) {
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
            
        },
        remove: function (array, item) {
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
    };
})();

/* Funkcje daty i czasu */
my.dates = (function () {

    var $timeband = {
        D: { name: 'day', period: 1 },
        W: { name: 'week', period: 7 },
        M: { name: 'month', period: 30 }
    };
    
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

    return {        
        TIMEBAND: $timeband,

        /*   Funkcja:    dateDifference
        *    Opis:       Funkcja zwraca różnicę pomiędzy datami [start] i [end],
        *                wyrażoną w jednostkach przypisanych do podanego timebandu.
        */
        dateDifference: function(timeband, start, end) {
            switch (timeband) {
                case $timeband.D:
                    return this.daysDifference(start, end);
                case $timeband.W:
                    return this.weeksDifference(start, end);
                case $timeband.M:
                    return this.monthsDifference(start, end);
                default:
                    return 0;
            }
        },


        /*-------------------------------*/


        /*   Funkcja:    daysDifference
        *    Opis:       Funkcja zwraca różnicę pomiędzy datami [start] i [end],
        *                wyrażoną w dniach.
        */
        daysDifference: function(start, end) {
            return daysDifference(start, end);
        },


        /*-------------------------------*/


        /*   Funkcja:    weeksDifference
        *    Opis:       Funkcja zwraca różnicę pomiędzy datami [start] i [end],
        *                wyrażoną w tygodniach.
        */
        weeksDifference: function(start, end) {
            return weeksDifference(start, end);
        },


        /*-------------------------------*/


        /*   Funkcja:    monthsDifference
        *    Opis:       Funkcja zwraca różnicę pomiędzy datami [start] i [end],
        *                wyrażoną w miesiącach.
        */
        monthsDifference: function(start, end) {
            var yearStart = start.getFullYear();
            var monthStart = start.getMonth();
            var yearEnd = end.getFullYear();
            var monthEnd = end.getMonth();

            return (monthEnd - monthStart) + (12 * (yearEnd - yearStart));

        },


        /*-------------------------------*/


        /*   Funkcja:    workingDays
        *    Opis:       Funkcja zwraca liczbę dni pracujących pomiędzy dwiema datami.
        */
        workingDays: function(start, end) {
            var sDate = (start.getDay() > 5 ? start.getDate() - (start.getDay() - 5) : start);
            var eDate = (end.getDay() > 5 ? end.getDate() - (end.getDay() - 5) : end);
            return (weeksDifference(sDate, eDate) * 5) + (eDate.getDay() - sDate.getDay());
        },


        /*-------------------------------*/


        /*   Funkcja:    toString
        *    Opis:       Funkcja zwraca tekstową reprezentację danej daty.
        */
        toString: function(date) {
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var day = date.getDate();
            return year + '-' +
                (month < 10 ? '0' : '') + month + '-' +
                (day < 10 ? '0' : '') + day;
        },


        /*-------------------------------*/


        /*   Funkcja:    fromString
        *    Opis:       Funkcja konwertująca podany tekst na datę.
        */
        fromString: function(s) {
            var year = s.substr(0, 4) * 1;
            var month = s.substr(5, 2) * 1 - 1;
            var day = s.substr(8, 2) * 1;
            return new Date(year, month, day);
        },


        /*-------------------------------*/


        /*   Funkcja:    getMonth
        *    Opis:       Funkcja zwracająca nazwę podanego miesiąca.
        */
        monthName: function(month, isShort) {
            var months = {
                1: ['styczeń', 'sty'],
                2: ['luty', 'lut'],
                3: ['marzec', 'mar'],
                4: ['kwiecień', 'kwi'],
                5: ['maj', 'maj'],
                6: ['czerwiec', 'cze'],
                7: ['lipiec', 'lip'],
                8: ['sierpień', 'sie'],
                9: ['wrzesień', 'wrz'],
                10: ['październik', 'paź'],
                11: ['listopad', 'lis'],
                12: ['grudzień', 'gru']
            };

            return months[month][isShort ? 1 : 0];

        }
    };

})();

my.values = (function () {
    return {
        coalesce: function (value, ifFalse) {
            return (value ? value : ifFalse);
        },
        isNumber: function (n){
            return typeof n === 'number' && !isNaN(parseFloat(n)) && isFinite(n);    
        },
        isString: function(value) {
            return typeof value === 'string';
        }
        
    };
})();


function Language(properties) {
    this.Language = true;
    this.id = properties.id;
    this.name = properties.name;
    this.flag = properties.flag;
}
my.languages = (function () {

    var used = null;

    function loadLanguages() {

        var userId = my.user.id();

        $.ajax({
            url: '/Language/GetUserLanguages',
            type: "GET",
            data: {
                'userId': userId,
            },
            datatype: "json",
            async: false,
            traditional: false,
            success: function (result) {
                used = [];
                for (var i = 0; i < result.length; i++) {
                    var object = result[i];
                    var language = new Language({
                        id: object.Id,
                        name: object.Name,
                        flag: object.Flag
                    });
                    used.push(language);
                }
            },
            error: function () {
                my.notify.display('Error when trying to load user languages', false);
            }
        });



    }

    return {
        userLanguages: function() {
            if (!used) {
                loadLanguages();
            }
            return used;
        },
        userLanguagesId: function() {
            if (!used) {
                loadLanguages();
            }

            var ids = [];
            for (var i = 0; i < used.length; i++) {
                var language = used[i];
                ids.push(language.id);
            }

            return ids;
        },
        get: function(id) {
            if (!used) {
                loadLanguages();
            }

            for (var i = 0; i < used.length; i++) {
                var language = used[i];
                if (language.id === id) {
                    return language;
                }
            }

            return null;

        }
        
        
    };

})();

my.user = (function () {
    var currentUserId = 1;

    return {
        id: function() {
            return currentUserId;
        }
    };

})();

my.db = (function() {
    return {        
        fetch: function (controller, method, data, params) {
            var $result;
            var callback = (params && params.callback && typeof (params.callback) === 'function' ? params.callback : null);

            $.ajax({
                url: '/' + controller + '/' + method,
                type: "GET",
                data: data,
                datatype: "json",
                async: (params && params.async ? true : false),
                cache: false,
                traditional: (params && params.traditional ? true : false),
                success: function (result) {
                    if (callback) {
                        $result = callback(result);
                    } else {
                        $result = result;
                    }
                },
                error: function (msg) {
                    alert(msg.status + " | " + msg.statusText);
                }
            });

            return $result;
        }
    };
})();


my.grammarProperties = (function () {

    var properties = new HashTable(null);

    function get(id) {
        var object = properties.getItem(id);
        if (!object) {
            object = fetch(id);
            if (object) properties.setItem(id, object);
        }
        return object;
    }

    function fetch(id) {
        var data = my.db.fetch('Words', 'GetProperty', { 'id': id });

        //Create options collection.
        var options = new HashTable(null);
        for (var i = 0; i < data.Options.length; i++) {
            var object = data.Options[i];
            var option = {                
                id: object.Id,
                propertyId: object.PropertyId,
                name: object.Name,
                value: object.Value,
                default: object.Default
            };
            options.setItem(option.id, option);
        }

        return {            
            id: data.Id,
            languageId: data.LanguageId,
            name: data.Name,
            type: data.Type,
            'default': data.Default,
            options: options
        };
        
    }

    return {
        get: get,
        fetch: fetch
    };
    
})();
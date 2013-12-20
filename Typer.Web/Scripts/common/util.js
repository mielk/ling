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
        
        display: function(div, value) {
                    $(div).css({ 'display': (value ? 'block' : 'none') });
        }
    };

})();

/* Funkcje tekstowe */
my.text = (function () {

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
            
        }
    };
})();

/* Funkcje daty i czasu */
my.dates = (function () {

    return {        
        TIMEBAND: {
            D: { name: 'day', period: 1 },
            W: { name: 'week', period: 7 },
            M: { name: 'month', period: 30 }
        },

        /*   Funkcja:    dateDifference
        *    Opis:       Funkcja zwraca różnicę pomiędzy datami [start] i [end],
        *                wyrażoną w jednostkach przypisanych do podanego timebandu.
        */
        dateDifference: function(timeband, start, end) {
            switch (timeband) {
            case TIMEBAND.D:
                return this.daysDifference(start, end);
            case TIMEBAND.W:
                return this.weeksDifference(start, end);
            case TIMEBAND.M:
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
            var milisInDay = 86400000;
            var startDay = Math.floor(start.getTime() / milisInDay);
            var endDay = Math.floor(end.getTime() / milisInDay);
            return (endDay - startDay);
        },


        /*-------------------------------*/


        /*   Funkcja:    weeksDifference
        *    Opis:       Funkcja zwraca różnicę pomiędzy datami [start] i [end],
        *                wyrażoną w tygodniach.
        */
        weeksDifference: function(start, end) {
            var result = Math.floor(daysDifference(start, end) / 7);
            return (end.getDay() < start.getDay() ? result : result);
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
        }
    };
})();
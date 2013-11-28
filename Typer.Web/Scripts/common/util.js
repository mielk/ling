var my = my || {};



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

    this.setItem = function (key, value) {
        var previous = undefined;
        if (this.hasItem(key)) {
            previous = this.items[key];
        }
        else {
            this.length++;
        }
        this.items[key] = value;
        return previous;
    }

    this.getItem = function (key) {
        return this.hasItem(key) ? this.items[key] : undefined;
    }

    this.hasItem = function (key) {
        return this.items.hasOwnProperty(key);
    }

    this.removeItem = function (key) {
        if (this.hasItem(key)) {
            previous = this.items[key];
            this.length--;
            delete this.items[key];
            return previous;
        }
        else {
            return undefined;
        }
    }

    this.keys = function () {
        var keys = [];
        for (var k in this.items) {
            if (this.hasItem(k)) {
                keys.push(k);
            }
        }
        return keys;
    }

    this.values = function () {
        var values = [];
        for (var k in this.items) {
            if (this.hasItem(k)) {
                values.push(this.items[k]);
            }
        }
        return values;
    }

    this.each = function (fn) {
        for (var k in this.items) {
            if (this.hasItem(k)) {
                fn(k, this.items[k]);
            }
        }
    }

    this.size = function () {
        return this.length;
    }

    this.clear = function () {
        this.items = {}
        this.length = 0;
    }
}



my.ui = function () {

    return {

        extraWidth: function (element) {
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

        extraHeight: function (element) {
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

        moveCaret : function (win, charCount) {
            var sel, range;
            if (win.getSelection) {
                sel = win.getSelection();
                if (sel.rangeCount > 0) {
                    var textNode = sel.focusNode;
                    var newOffset = sel.focusOffset + charCount;
                    sel.collapse(textNode, Math.min(textNode.length, newOffset));
                }
            } else if ( (sel = win.document.selection) ) {
                if (sel.type != "Control") {
                    range = sel.createRange();
                    range.move("character", charCount);
                    range.select();
                }
            }
        },

        placeCaret: function (win, position) {

        }

    }

}();



/* Funkcje tekstowe */
my.text = function () {

    return {

        /*  Funkcja:    onlyDigits
         *  Opis:       Funkcja usuwa z podanego stringa wszystkie
         *              znaki nie będšce cyframi.
         */
        onlyDigits: function (s) {
            return (s + '').match(/^-?\d*/g);
        },


        /*-------------------------------*/


        /*  Funkcja:    substring
         *  Opis:       Funkcja zwraca podcišg znaków tekstu bazowego [base]
         *              znajdujšcy się pomiędzy podanymi znacznikami [start]
         *              oraz [end].
         */
        substring: function (base, start, end, isCaseSensitive) {
            var tempBase, tempStart, tempEnd;

            //Checks if all the parameters are defined.
            if (base === undefined || start === undefined || end === undefined) {
                return '';
            }


            if (isCaseSensitive) {
                tempBase = base.toString();
                tempStart = start.toString();
                tempEnd = end.toString();
            } else {
                tempBase = base.toString().toLowerCase();
                tempStart = start.toString().toLowerCase();
                tempEnd = end.toString().toLowerCase();
            }


            //Wyznacza pozycje poczštkowego i końcowego stringa w stringu bazowym.
            var iStart = (tempStart.length ? tempBase.indexOf(tempStart) : 0);
            //alert('baseString: ' + baseString + '; start: ' + start + '; end: ' + end + '; caseSensitive: ' + isCaseSensitive);
            if (iStart < 0) {
                return '';
            } else {
                var iEnd = (tempEnd.length ? tempBase.indexOf(tempEnd, iStart + tempStart.length) : tempBase.length);
                return (iEnd < 0 ? '' : base.toString().substring(iStart + tempStart.length, iEnd));
            }

        },


        isLetter: function (char) {
            return (char.length === 1 && char.match(/[a-z]/i) ? true : false);
        },

        containLettersNumbersUnderscore: function (str) {
            return (str.match(/^\w+$/) ? true : false);
        },

        isValidMail: function (mail) {
            return (mail.match(/^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/) ? true : false);
        },

        startsWith: function (base, prefix) {
            var s = base.substr(0, prefix.length);
            return (s === prefix);
        }



    }

}();











/* Funkcje daty i czasu */
my.dates = function () {

    return {

        /*   Funkcja:    dateDifference
        *    Opis:       Funkcja zwraca różnicę pomiędzy datami [start] i [end],
        *                wyrażonš w jednostkach przypisanych do podanego timebandu.
        */
        dateDifference: function (timeband, start, end) {
            switch (timeband) {
                case TIMEBAND.D: return this.daysDifference(start, end);
                case TIMEBAND.W: return this.weeksDifference(start, end);
                case TIMEBAND.M: return this.monthsDifference(start, end);
                default: return 0;
            }
        },


        /*-------------------------------*/


        /*   Funkcja:    daysDifference
        *    Opis:       Funkcja zwraca różnicę pomiędzy datami [start] i [end],
        *                wyrażonš w dniach.
        */
        daysDifference: function (start, end) {
            var MILIS_IN_DAY = 86400000;
            var startDay = Math.floor(start.getTime() / MILIS_IN_DAY);
            var endDay = Math.floor(end.getTime() / MILIS_IN_DAY);
            return (endDay - startDay);
        },


        /*-------------------------------*/


        /*   Funkcja:    weeksDifference
        *    Opis:       Funkcja zwraca różnicę pomiędzy datami [start] i [end],
        *                wyrażonš w tygodniach.
        */
        weeksDifference: function (start, end) {
            var result = Math.floor(daysDifference(start, end) / 7);
            return (end.getDay() < start.getDay() ? result : result);
        },


        /*-------------------------------*/


        /*   Funkcja:    monthsDifference
        *    Opis:       Funkcja zwraca różnicę pomiędzy datami [start] i [end],
        *                wyrażonš w miesišcach.
        */
        monthsDifference: function (start, end) {
            var yearStart = start.getFullYear();
            var monthStart = start.getMonth();
            var yearEnd = end.getFullYear();
            var monthEnd = end.getMonth();

            return (monthEnd - monthStart) + (12 * (yearEnd - yearStart));

        },


        /*-------------------------------*/


        /*   Funkcja:    workingDays
        *    Opis:       Funkcja zwraca liczbę dni pracujšcych pomiędzy dwiema datami.
        */
        workingDays: function (start, end) {
            var sDate = (start.getDay() > 5 ? start.getDate() - (start.getDay() - 5) : start);
            var eDate = (end.getDay() > 5 ? end.getDate() - (end.getDay() - 5) : end);
            return (weekDifference(sDate, eDate) * 5) + (eDate.getDay() - sDate.getDay());
        },


        /*-------------------------------*/


        /*   Funkcja:    toString
        *    Opis:       Funkcja zwraca tekstowš reprezentację danej daty.
        */
        toString: function (date) {
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
        fromString: function (s) {
            var year = s.substr(0, 4) * 1;
            var month = s.substr(5, 2) * 1 - 1;
            var day = s.substr(8, 2) * 1;
            return new Date(year, month, day);
        },


        /*-------------------------------*/


        /*   Funkcja:    getMonth
        *    Opis:       Funkcja zwracajšca nazwę podanego miesišca.
        */
        monthName: function (month, isShort) {
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

    }

}();
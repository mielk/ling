﻿function Entity(properties) {

    'use strict';

    var self = this;

    //Class signature.
    self.Entity = true;

    //Events listener.
    self.eventHandler = mielk.eventHandler();

    //Properties.
    self.id = properties.Id || 0;
    self.name = properties.Name || '';
    self.weight = properties.Weight || 1;
    self.isActive = (properties.IsActive !== undefined ? properties.IsActive : true);
    self.creatorId = properties.CreatorId || 1;
    self.createDate = properties.CreateDate || new Date();
    self.isApproved = properties.IsApproved || false;
    self.positive = properties.Positive || 0;
    self.negative = properties.Negative || 0;
    self.categories = self.loadCategories(properties.Categories || properties.categories || []) || [];
    self.isNew = properties.isNew || properties.IsNew || false;

    //Subitems assigned to this entity (i.e. words for Metaword, options for Query).
    self.items = self.createItemsMap(properties.Words || properties.Options || []);

    //Views.
    self.listItem = null;

}
Entity.prototype = {

      detailsMethodName: 'GetWords'

    , controllerName: 'Words'

    , trigger: function (e) {
        this.eventHandler.trigger(e);
    }

    , bind: function (e) {
        this.eventHandler.bind(e);
    }

    , key: function () {
        return this.name;
    }

    //Funkcja zwracająca obiekty typu Category przypisane do tego Entity.
    , loadCategories: function (categories) {
        var array = [];

        mielk.arrays.each(categories, function (object) {
            var category = null;

            if (object.Category) {
                category = object;
            } else if (object.Id) {
                category = Ling.Categories.getCategory(object.Id);
            } else if ($.isNumeric(object)) {
                category = Ling.Categories.getCategory(object);
            }

            if (category) array.push(category);

        });

        return array;

    }

    , toListItem: function () {
        this.listItem = this.listItem || new ListItemView(this);
        return this.listItem;
    }

    //Metoda abstrakcyjna, musi być zaimplementowana w każdej klasie
    //dziedziczączej po tej - określa zestaw kontrolek specyficznych
    //dla danego podtypu entity, które mają być wyświetlone w ListView,
    //np. dla wyrazów dodatkowym elementem będzie właściwość [Wordtype].
    , additionalViewItems: function () {
        alert('Must be defined in implementing class');
    }

    //Pobiera informacje na temat elementów przypisanych do obiektu
    //reprezentowanego przez ten ListItem. Np. dla Metaword wyświetla
    //stan wszystkich przypisanych do niego wyrazów.
    , getDetails: function (fnSuccess, fnError, async) {

        mielk.db.fetch(this.controllerName, this.detailsMethodName, {
            'id': this.id,
            'languages': Ling.Users.Current.getLanguagesIds()
        }, {
            async: async !== undefined ? async : true,
            traditional: true,
            cache: false,
            callback: fnSuccess,
            errorCallback: fnError
        });

    }

    //Metoda ustawiająca wagę tego Entity do podanej wartości.
    , setWeight: function (weight) {

        //Sprawdź czy waga w ogóle została zmieniona.
        if (weight === this.weight) return;

        var self = this;
        var minWeight = Ling.Config.entities.minWeight;
        var maxWeight = Ling.Config.entities.maxWeight;
        self.weight = mielk.numbers.checkValue(weight, minWeight, maxWeight);

        self.service.updateWeight(self.id, self.name, self.weight, function(result){
            if (result !== false) {
                self.trigger({
                    type: 'changeWeight',
                    weight: weight
                });
            }
        });

    }

    //Funkcja służąca do aktywacji lub deaktywacji tego Entity.
    , activate: function (value) {

        var self = this;

        //Jeżeli funkcja została wywołana bez podania wartości,
        //ustawiana jest wartość odwrotna do aktualnej.
        var status = (value === undefined ? !this.isActive : value);

        var callback = function (result) {
            self.isActive = status;
            if (result !== false) {
                self.trigger({
                    type: 'activate',
                    value: status
                });
            }
        };

        if (status) {
            this.service.activate(self.id, self.name, callback);
        } else {
            this.service.deactivate(self.id, self.name, callback);
        }

    }

    , loadDetails: function () {
        var self = this;

        //Jeżeli szczegóły tej encji zostały już wcześniej pobrane,
        //nie ma sensu pobierać ich ponownie.
        //Dodatkowo, ponowne pobieranie powoduje kasowanie wyedytowanych
        //danych, które nie zdążyły jeszcze zostać zapisane do bazy.
        if (self.loaded) return;

        var fnSuccess = function (result) {
            self.items = self.createItemsMap(result);
            self.loaded = true;
        };

        var fnError = function() {
            mielk.notify.display('Error when trying to get items of the entity | Group: ' + self.controllerName + ' | Id: ' + self.id, false);
        };

        self.getDetails(fnSuccess, fnError, false);

    }
      

    //Funkcja rozdzielająca podane itemy (Word/QuestionOption)
    //do odpowiednich kolekcji.
    , createItemsMap: function (items) {
        var self = this;

        //Clear previous items collection.
        var table = mielk.hashTable();

        //Create language subcollections.
        mielk.arrays.each(Ling.Users.Current.getLanguages(), function(language) {
            var languageId = language.id;
            table.setItem(languageId, mielk.hashTable());
        });

        //Add items to subcollections (ignore words of
        //languages not assigned to current user).
        mielk.arrays.each(items, function (value) {
            var languageId = value.LanguageId;
            var set = table.getItem(languageId);
            if (set) {
                var subitem = self.createSubItem(value);
                var key = subitem.key();
                set.setItem(key, subitem);
            }
        });

        return table;

    }

    //Editing entity.
    , edit: function () {
        var self = this;

        self.loadDetails();
        
        var editPanel = new EditPanel(self);
        editPanel.show();
        editPanel.bind({
            confirm: function (e) {
                self.update(e.object);
            }
        });

    }


    //Updating properties of this entity. Abstract, must be defined in implementing class.
    , update: function () {
        alert('Must be defined in implemented class');
    }
      
    //Funkcja zwracająca DataTransferObject dla tej encji.
    , dto: function() {
        alert('Must be defined in implemented class');
    }

    //Tworzy obiekt zależny względem tego entity, np. Word dla Metaword
    //albo QueryOption dla Query.
    , createSubItem: function () {
        alert('Must be defined in implemented class');
    }

    //Zwraca tablicę zawierającą definicję zestawu danych, które
    //mają być wyświetlane w panelu edycji tego Entity.
    , getDatalinesDefinitions: function (object) {
        var datalines = [];
        var properties = object.getEditedPropertiesList();

        //[Id]
        if ($.inArray(Ling.Enums.Properties.Id, properties) > -1) {
            datalines.push({
                    property: Ling.Enums.Properties.Id,
                    index: 0,
                    label: dict.Id.get(),
                    value: object.id,
                    callback: function(value) {
                        object.id = value;
                    },
                    inputCss: {
                        'width': '60px',
                        'text-align': 'center',
                        'border': '1px solid #777',
                        'background-color': 'white'
                    }
            });
        }


        //[Name]
        if ($.inArray(Ling.Enums.Properties.Name, properties) > -1) {
            datalines.push({
                    property: Ling.Enums.Properties.Name,
                    index: 1,
                    label: dict.Name.get(),
                    value: object.name,
                    callback: function(value) {
                        object.name = value;
                        object.trigger({ type: 'changeName', value: value });
                    },
                    validation: function(params) {
                        return object.entity.checkName(params.value);
                    },
                    editable: true
            });
        }
        
        
        //[Weight]
        if ($.inArray(Ling.Enums.Properties.Weight, properties) > -1) {
            var weightPanel = new WeightPanel({
                value: object.weight
                , callback: function (value) {
                    object.weight = value;
                    object.trigger({ type: 'changeWeight', value: value });
                }
                , css: { 'margin': '9px 0', 'height': '16px' }
            });
            datalines.push({
                property: 'weight',
                index: 2,
                label: dict.Weight.get(),
                value: object.weight,
                panel: weightPanel.view()
            });
        }
        

        //[Category]
        if ($.inArray(Ling.Enums.Properties.Categories, properties) > -1) {
            var categoryPanel = new CategoryPanel({
                categories: object.categories || []
                , callback: function (result) {
                    object.categories = result;
                }
            });
            datalines.push({
                property: 'category'
                , index: 3
                , label: dict.Categories.get()
                , value: object.categories
                , panel: categoryPanel.view()
            });
        }
        




        //Add class-specific fields.
        mielk.arrays.each(this.getSpecificDatalinesDefinitions(object), function (item) {
            datalines.push(item);
        });

        datalines.sort(function (a, b) {
            return a.index < b.index ? -1 : 1;
        });

        return datalines;

    }


    , removeItem: function (item) {
        if (this.items) {
            var set = this.items.getItem(item.language.id);
            if (set) {
                set.removeItem(item.name);
            }
        }
    }

    //Zwraca listę właściwości, które mają być edytowane w panelu edycji
    //dla tego typu Entity.
    , getEditedPropertiesList: function() {
        return [
              Ling.Enums.Properties.Id
            , Ling.Enums.Properties.Name
            , Ling.Enums.Properties.Weight
            , Ling.Enums.Properties.Categories
        ];
    }

    //Zwraca tablicę zawierającą definicję zestawu danych
    //specyficzne dla danej podklasy typu Entity.
    , getSpecificDatalinesDefinitions: function () {
        alert('Must be defined in implemented class');
    }

    //Funkcja sprawdzająca czy Entity o takiej nazwie już istnieje.
    , checkName: function (name) {
        var maxLength = 255;

        if (!name.trim()) {
            return dict.NameCannotBeEmpty.get();
        } else if (name.length > maxLength) {
            return dict.NameCannotBeLongerThan.get([maxLength]);
        } else {
            var nameExists = this.service.nameAlreadyExists(this.id, name);
            if (nameExists) {
                return dict.NameAlreadyExists.get();
            } else {
                return true;
            }
        }

    }

    , getProperty: function (key) {
        if (this.hasOwnProperty(key)) {
            return this[key];
        }
        return null;
    }

    , getItemByName: function (languageId, name) {
        var item = null;
        var language = this.items.getItem(languageId);
        if (language) {
            language.each(function(key, value) {
                if (!item) {
                    if (value.name === name) {
                        item = value;
                    }
                }
            });
        }
        
        return item;

    }

    , addItem: function (item) {
        var languageId = item.language.id;
        var set = this.items.getItem(languageId);
        set.setItem(item.name || item.content, item);
        item.isNew = false;
    }

    //, update: function () {
    //    alert('Must by defined by implementing class');
    //}



};




function ListItemView(entity) {

    'use strict';

    var self = this;

    //Class signature.
    self.ListItemView = true;

    self.entity = entity;

    //UI elements.
    self.ui = (function () {

        var container = jQuery('<div/>', {
            'class': 'item' + (self.entity.isActive ? '' : ' inactive' )
        });

        // ReSharper disable once UnusedLocals
        var id = jQuery('<div/>', { 'class': 'id', html: self.entity.id }).appendTo(container);

        var name = jQuery('<div/>', { 'class': 'name', html: self.entity.name }).appendTo(container);

        var weight = new WeightPanel({
              value: self.entity.weight
            , callback: function (value) {
                self.entity.setWeight(value);
            }
        });
        $(weight.view()).appendTo(container);

        var categories = jQuery('<div/>', {
            'class': 'categories',
            html: Ling.Categories.toString(self.entity.categories, false)
        }).appendTo(container);

        var details = jQuery('<div/>', {
            'class': 'list-item-details',
            'id': 'details_' + self.entity.id
        }).appendTo(container);

        // ReSharper disable once UnusedLocals
        var edit = jQuery('<div/>', {
            'class': 'list-item-icon edit-list-item'
        }).bind({
            click: function () {
                self.entity.edit();
            }
        }).appendTo(container);

        var activateButton = jQuery('<a/>', {
            'class': 'list-item-icon' + (self.entity.isActive ? ' deactivate-list-item' : ' activate-list-item')
        }).bind({
            click: function () {
                self.entity.activate();
            }
        }).appendTo(container);

        // ReSharper disable once UnusedLocals
        var events = (function () {
            self.entity.bind({
                activate: function (e) {
                    activate(e.value);
                },
                changeName: function (e) {
                    name.html(e.name);
                },
                changeCategories: function (e) {
                    categories.html(Ling.Categories.toString(e.categories));
                },
                change: function () {
                    //self.loadDetails();
                }
            });
        })();


        function activate(value) {
            if (value) {
                $(container).removeClass('inactive');
                $(activateButton).removeClass('activate-list-item');
                $(activateButton).addClass('deactivate-list-item');
            } else {
                $(container).addClass('inactive');
                $(activateButton).removeClass('deactivate-list-item');
                $(activateButton).addClass('activate-list-item');
            }
        }

        function addDetails(content) {
            $(details).empty();
            $(content).appendTo(details);
        }

        function addSpinner() {
            var spinner = new SpinnerWrapper($(details));
            return spinner;
        }

        function addItem(item, before) {
            var beforeControl = $(container).find('.' + before)[0];

            if (beforeControl) {
                $(beforeControl).before(item);
            } else {
                $(item).appendTo(container);
            }
        }

        function addSpecificViewItems(items) {
            mielk.arrays.each(items, function (object) {
                addItem(object.item, object.before);
            });
        }

        function refresh() {
            $(id).html(self.entity.id);
            $(name).html(self.entity.name);
            weight.setValue(self.entity.value);
            $(categories).html(Ling.Categories.toString(self.entity.categories, false));
            self.loadDetails();
        }

        (function initialize() {
            activate(self.entity.isActive);
            addSpecificViewItems(self.entity.additionalViewItems());
        })();


        return {
              view: container
            , activate: activate
            , addDetails: addDetails
            , addSpinner: addSpinner
            , addItem: addItem
            , refresh: refresh
        };

    })();
    
    //Events handler.
    self.events = (function() {
        self.entity.bind({            
            updated: function () {
                self.ui.refresh();
           }
        });
    })();

}
ListItemView.prototype = {

    activate: function (value) {
        this.ui.activate(value);
    },

    //Odświeża widok reprezentujący poditemy przypisane do tego wyrazu/zapytania.
    loadDetails: function () {
        
        if (this.entity.items) {
            //Jeżeli itemy są już załadowane, od razu
            //przekazywane  są do metody renderującej.
            var $content = this.renderItems(this.entity.items);
            this.ui.addDetails($content);
            
        } else {
            
            //Jeżeli wyrazy/podzapytania nie są jeszcze wczytane,
            //są w tym momencie pobierane z bazy danych.
            var self = this;
            var spinner = self.ui.addSpinner();

            var fnSuccess = function (result) {
                var content = self.renderItems(result);
                self.ui.addDetails(content);
                spinner.stop();
            };

            var fnError = function () {
                spinner.stop();
            };

            self.entity.getDetails(fnSuccess, fnError);
        }

    },

    //Funkcja wyświetlająca dane dotyczące szczegółów dla
    //tego entity. Np. dla metawyrazów wyświetla graficzną
    //informację ile słów jest przypisanych do tego metawyrazu
    //w każdym z języków i czy ich odmiana gramatyczna jest
    //już kompletna.
    renderItems: function (items) {
        //Jeżeli itemy przekazane są w postaci HashMapy, dodawanie
        //odbywa się w inny sposób niż w przypadku tablicy.
        if (items.HashTable) {
            return this.renderItemsFromHashMap(items);
        } else {
            return this.renderItemsFromArray(items);
        }

    },
    
    renderItemsFromArray: function(items) {
        var languages = Ling.Users.Current.getLanguages();
        var container = jQuery('<div/>');
        var columns = {};

        //Iteruje przez wszystkie dostępne języki i dla
        //każdego z nich tworzy oddzielną kolumnę.
        mielk.arrays.each(languages, function (language) {
            var column = jQuery('<div/>', {
                'class': 'details-column'
            }).appendTo(container);
            columns[language.id] = column;
        });

        //Iteruje po wszystkich znalezionych słowach i przydziela je
        //do odpowiednich kolumn.
        mielk.arrays.each(items, function (item) {
            var languageId = item.LanguageId;
            var languageColumn = columns[languageId];
            var icon = jQuery('<div/>', {
                'class': 'details-icon',
                title: item.Name
            }).appendTo(languageColumn);
            $(icon).addClass(item.IsCompleted ? 'complete' : 'incomplete');
        });

        return container;

    },
    
    renderItemsFromHashMap: function(items) {
        var container = jQuery('<div/>');

        //Iteruje przez wszystkie dostępne języki, dla
        //każdego z nich tworzy oddzielną kolumnę i dodaje
        //do niej przypisane do tego języka wyrazy.
        items.each(function(key, language) {
            var column = jQuery('<div/>', {
                'class': 'details-column'
            }).appendTo(container);

            language.each(function(k, v) {
                var icon = jQuery('<div/>', {
                    'class': 'details-icon',
                    title: v.Name || v.name
                }).appendTo(column);
                $(icon).addClass(v.IsCompleted || v.isCompleted ? 'complete' : 'incomplete');
            });

        });

        return container;
        
    },

    addItemToUi: function (item, before) {
        this.ui.addItem(item, before);
    },

    view: function () {
        return this.ui.view;
    }

};



function WeightPanel(params) {

    'use strict';

    var self = this;

    //Class signature.
    self.WeightPanel = true;

    self.minWeight = Ling.Config.entities.minWeight;
    self.maxWeight = Ling.Config.entities.maxWeight;
    //self.entity = entity;
    //self.listItemView = listItemView;       //Odnosi się do obiektu ListItemView, w którym znajdzie się ten WeightPanel.
    self.callback = params.callback;          //Funkcja odpalana po zmianie wartości właściwości Weight.

    self.ui = (function () {
        var container = null;
        var icons = [];

        function createContainer() {
            container = jQuery('<div/>', {
                'class': 'weight-panel'
            });
        }

        function applyCustomCss() {
            if (params && params.css) {
                $(container).css(params.css);
            }
        }

        function createIcons() {

            var createIcon = function (index) {
                var dom = jQuery('<a/>', {
                    'class': 'weight'
                }).bind({
                    click: function () {
                        self.changeValue(index + 1);
                    }
                }).appendTo(container);

                return {
                    activate: function (value) {
                        if (value) {
                            $(dom).addClass('checked');
                        } else {
                            $(dom).removeClass('checked');
                        }
                    }
                };

            };

            for (var i = 0; i < self.maxWeight; i++) {
                icons[i] = createIcon(i);
            }
        }

        function refresh(value) {
            for (var j = 0; j < value; j++) {
                icons[j].activate(true);
            }
            for (var k = value; k < icons.length; k++) {
                icons[k].activate(false);
            }
        }

        (function initialize() {
            createContainer();
            applyCustomCss();
            createIcons();
            refresh(params.value || 1);
        })();

        return {
            refresh: refresh,
            view: container
        };

    })();

}
WeightPanel.prototype = {

    view: function () {
        return this.ui.view;
    }

    , changeValue: function (value) {
        mielk.fn.run(this.callback, value);
        this.ui.refresh(value);
    }
    
    , setValue: function(value) {
        this.ui.refresh(value);
    }

};




function CheckboxPanel(params) {

    'use strict';

    var self = this;

    //Class signature.
    self.CheckboxPanel = true;
    self.value = params.value;

    self.callback = params.callback;          //Funkcja odpalana po zmianie wartości właściwości tego checkboxa.

    self.ui = (function () {
        var container = null;
        var box = null;

        function createContainer() {
            container = jQuery('<span/>', {
                'class': 'block'
            }).css({
                  'text-align': 'left'
                , 'float': 'left'
                , 'margin': '0'
                , 'height': '100%'
                , 'width': 'auto'
                , 'background-color': 'transparent'
            });

            box = jQuery('<input/>', {
                  'type': 'checkbox'
                , 'class': 'field default'
            }).css({
                'height': '24px',
                'width': '24px',
                'margin': '5px 0'
            }).prop({
                'checked': self.value
            }).change(function () {
                var value = box.prop('checked');
                self.changeValue(value);
            }).appendTo(container);

        }

        function applyCustomCss() {
            if (params && params.css) {
                $(container).css(params.css);
            }
        }

        function refresh(value) {
            self.value = value;
            $(box).prop('checked', value);
        }

        (function initialize() {
            createContainer();
            applyCustomCss();
        })();

        return {
              view: container
            , refresh: refresh
        };

    })();

}
CheckboxPanel.prototype = {

    view: function () {
        return this.ui.view;
    }

    , changeValue: function (value) {
        mielk.fn.run(this.callback, value);
        this.ui.refresh(value);
    }

    , setValue: function (value) {
        this.ui.refresh(value);
    }

};





//Klasa reprezentująca panel do wybierania kategorii.
function CategoryPanel(params) {

    'use strict';

    var self = this;

    //Class signature.
    self.CategoryPanel = true;

    self.categories = params.categories;
    self.callback = params.callback;

    self.ui = (function () {

        var container = jQuery('<span/>', {
            'class': 'block'
        });

        // ReSharper disable once UnusedLocals
        var editButton = jQuery('<input/>', {
            'id': 'select-categories',
            'class': 'select-categories-button',
            'type': 'submit',
            'value': '...'
        }).css({
            'float': 'right'
        }).on({
            'click': function () {
                self.selectCategories();
            }
        }).appendTo(container);

        var value = jQuery('<span/>', {
            'class': 'selected-categories block'
        }).css({

        }).appendTo(container);

        return {
              refresh: function () {
                $(value).html(Ling.Categories.toString(self.categories, true));
            }
            , view: container
        };

    })();

    (function initialize() {
        self.refresh();
    })();

}

CategoryPanel.prototype = {
    refresh: function() {
        this.ui.refresh();
    },
    view: function() {
        return this.ui.view;
    },
    selectCategories: function() {
        var self = this;
        var tree = new Tree({
            'mode': MODE.MULTI,
            'root': Ling.Categories.getRoot(),
            'selected': self.categories,
            'blockOtherElements': true,
            'showSelection': true,
            'hidden': true
        });

        tree.reset({
            unselect: false,
            collapse: false
        });

        tree.eventHandler.bind({
            confirm: function(e) {
                var categories = [];
                mielk.arrays.each(e.item, function(category) {
                    categories.push(category.object);
                });

                self.categories = categories;
                mielk.fn.run(self.callback(categories));
                self.refresh();
                tree.destroy();

            },
            add: function(e) {
                Ling.Categories.addNew(e);
            },
            remove: function(e) {
                Ling.Categories.remove(e);
            },
            rename: function(e) {
                Ling.Categories.updateName(e);
            },
            transfer: function(e) {
                Ling.Categories.updateParent(e);
            }
        });

        tree.show();

    }
};
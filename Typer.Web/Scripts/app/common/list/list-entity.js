
function Entity(properties) {

    'use strict';

    var self = this;

    //Class signature.
    self.Entity = true;

    //Events listener.
    self.eventHandler = mielk.eventHandler();

    //Properties.
    self.id = properties.Id || 0;
    self.name = properties.Name;
    self.weight = properties.Weight || 1;
    self.isActive = (properties.IsActive !== undefined ? properties.IsActive : true);
    self.creatorId = properties.CreatorId || 1;
    self.createDate = properties.CreateDate || new Date().getDate;
    self.isApproved = properties.IsApproved || false;
    self.positive = properties.Positive || 0;
    self.negative = properties.Negative || 0;
    self.categories = self.loadCategories(properties.Categories) || [];
    self.new = properties.new || false;

    //Subitems assigned to this entity (i.e. words for Metaword, options for Query).
    self.items = {};

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
    , getDetails: function (fnSuccess, fnError) {

        mielk.db.fetch(this.controllerName, this.detailsMethodName, {
            'id': this.id,
            'languages': Ling.Users.Current.getLanguagesIds()
        }, {
            async: true,
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
        
        var fnSuccess = function (result) {
            //Clear previous items collection.
            self.items = mielk.hashTable();

            mielk.arrays.each(result, function (value) {
                var languageId = value.LanguageId;

                if (!self.items.hasItem(languageId)) {
                    self.items.setItem(languageId, mielk.hashTable());
                }

                var set = self.items.getItem(languageId);
                var subitem = self.createSubItem(value);
                set.setItem(subitem.name, subitem);

            });

        }

        var fnError = function () {
            mielk.notify.display('Error when trying to get items of the entity | Group: ' + self.controllerName + ' | Id: ' + self.id, false);
        }

        self.getDetails(fnSuccess, fnError);

    }



    //Editing entity.
    , edit: function () {
        //Zapewnia, że przed wyświetleniem panelu edycji,
        //odpowiednie składniki zostaną załadowane do tego Entity.
        this.loadDetails();

        var editPanel = new EditPanel(this);
        editPanel.show();
    }

    //Tworzy obiekt zależny względem tego entity, np. Word dla Metaword
    //albo QueryOption dla Query.
    , createSubItem: function (properties) {
        alert('Must be defined in implemented class');
    }

    //Zwraca tablicę zawierającą definicję zestawu danych, które
    //mają być wyświetlane w panelu edycji tego Entity.
    , getDatalinesDefinitions: function (object) {
        var datalines = [];

        //[Id]
        datalines.push({
              property: 'id'
            , label: dict.Id.get()
            , value: object.id
            , callback: function (value) {
                object.id = value;
            }
            , inputCss: {
                  'width': '60px'
                , 'text-align': 'center'
                , 'border': '1px solid #777'
                , 'background-color': 'white'
            }
        });


        //[Name]
        datalines.push({
              property: 'name'
            , label: dict.Name.get()
            , value: object.name
            , callback: function (value) {
                object.name = value;
            }
            , validation: function (params) {
                return object.entity.checkName(params.value);
            }
            , editable: true
        });


        return datalines;

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



    //, editItem: function () {
    //    alert('Must be defined by implementing class');
    //}

    //, getProperty: function (key) {
    //    if (this.hasOwnProperty(key)) {
    //        return this[key];
    //    }
    //    return null;
    //}





    //, update: function () {
    //    alert('Must by defined by implementing class');
    //}

    //, edit: function () {
    //    alert('list-entity.js:edit');
    //    var editItem = this.editItem();
    //    var editPanel = this.editPanel(editItem);
    //    editPanel.display();
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

        var id = jQuery('<div/>', { 'class': 'id', html: self.entity.id }).appendTo(container);

        var name = jQuery('<div/>', { 'class': 'name', html: self.entity.name }).appendTo(container);

        var weight = new WeightPanel(self.entity, self, {});
        $(weight.view()).appendTo(container);

        var categories = jQuery('<div/>', {
            'class': 'categories',
            html: Ling.Categories.toString(self.entity.categories, false)
        }).appendTo(container);

        var details = jQuery('<div/>', {
            'class': 'list-item-details',
            'id': 'details_' + self.entity.id
        }).appendTo(container);

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
        };

    })();
    
}
ListItemView.prototype = {

    activate: function (value) {
        this.ui.activate(value);
    },

    //Odświeża widok reprezentujący poditemy przypisane do tego wyrazu/zapytania.
    loadDetails: function () {
        var self = this;
        var spinner = self.ui.addSpinner();

        var fnSuccess = function (result) {
            var content = self.renderItems(result);
            self.ui.addDetails(content);
            spinner.stop();
        }

        var fnError = function () {
            spinner.stop();
        }

        self.entity.getDetails(fnSuccess, fnError);

    },

    //Funkcja wyświetlająca dane dotyczące szczegółów dla 
    //tego entity. Np. dla metawyrazów wyświetla graficzną 
    //informację ile słów jest przypisanych do tego metawyrazu
    //w każdym z języków i czy ich odmiana gramatyczna jest
    //już kompletna.
    renderItems: function (items) {
        var self = this;
        var languages = Ling.Users.Current.getLanguages();
        var container = jQuery('<div/>');
        var columns = {};

        //Iteruje przez wszystkie dostępne języki i dla każdego z nich
        //sprawdza ile wyrazów/podzapytań jest dodanych w bazie.
        mielk.arrays.each(languages, function (language) {
            var column = jQuery('<div/>', {
                'class': 'details-column'
            }).appendTo(container);
            columns[language.id] = column;
        });


        //Iteruje po wszystkich znalezionych słowach i przydziela je
        //do odpowiednich kolumn.
        mielk.arrays.each(items, function(item){
            var languageId = item.LanguageId;
            var languageColumn = columns[languageId];
            var icon = jQuery('<div/>', {
                'class': 'details-icon',
                title: item.Name
            }).appendTo(languageColumn);
            $(icon).addClass(item.IsCompleted ? 'complete' : 'incomplete');
        })

        return container;

    },

    addItemToUi: function (item, before) {
        this.ui.addItem(item, before);
    },

    view: function () {
        return this.ui.view;
    }

};



function WeightPanel(entity, listItemView, properties) {

    'use strict';

    var self = this;

    //Class signature.
    self.WeightPanel = true;

    self.minWeight = Ling.Config.entities.minWeight;
    self.maxWeight = Ling.Config.entities.maxWeight;
    self.entity = entity;
    self.listItemView = listItemView;       //Odnosi się do obiektu ListItemView, w którym znajdzie się ten WeightPanel.

    self.ui = (function () {
        var container = null;
        var icons = [];

        function createContainer() {
            container = jQuery('<div/>', {
                'class': 'weight-panel'
            });
        };

        function applyCustomCss() {
            if (properties && properties.css) {
                $(container).css(properties.css);
            }
        };

        function createIcons() {

            var createIcon = function (index) {
                var dom = jQuery('<a/>', {
                    'class': 'weight'
                }).bind({
                    click: function () {
                        self.entity.setWeight(index + 1);
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
        };

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
            refresh(self.entity.weight || 1);
        })();

        return {
            refresh: refresh,
            view: container
        };

    })();

    self.entity.bind({
        changeWeight: function (e) {
            self.ui.refresh(e.weight);
        }
    });

}
WeightPanel.prototype = {

    view: function () {
        return this.ui.view;
    }

};
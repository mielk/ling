
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
    self.isActive = properties.IsActive || true;
    self.creatorId = properties.CreatorId || 1;
    self.createDate = properties.CreateDate || new Date().getDate;
    self.isApproved = properties.IsApproved || false;
    self.positive = properties.Positive || 0;
    self.negative = properties.Negative || 0;
    self.categories = self.loadCategories(properties.Categories) || [];
    self.new = properties.new || false;

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

        self.service.updateWeight({
            id: self.id,
            weight: self.weight,
            name: self.name,
            callback: function (result) {
                if (result !== false) {
                    self.trigger({
                        type: 'changeWeight',
                        weight: weight
                    });
                }
            }
        });

    }

    //, activate: function (value) {
    //    var self = this;
    //    var status = (value === undefined ? !this.isActive : value);
    //    var e = {
    //        id: self.id,
    //        name: self.name,
    //        callback: function (result) {
    //            self.isActive = status;
    //            if (result !== false) {
    //                self.trigger({
    //                    type: 'activate',
    //                    value: status
    //                });
    //            }
    //        }
    //    };

    //    if (status) {
    //        this.service.activate(e);
    //    } else {
    //        this.service.deactivate(e);
    //    }

    //}

    //, editPanel: function () {
    //    alert('Must be defined by implementing class');
    //}

    //, editItem: function () {
    //    alert('Must be defined by implementing class');
    //}

    //, getProperty: function (key) {
    //    if (this.hasOwnProperty(key)) {
    //        return this[key];
    //    }
    //    return null;
    //}

    //, checkName: function (name) {
    //    alert('list-entity.js:checkName');
    //    var maxLength = 255;

    //    if (!name.trim()) {
    //        return MessageBundle.get(dict.NameCannotBeEmpty);
    //    } else if (name.length > maxLength) {
    //        return MessageBundle.get(dict.NameCannotBeLongerThan, [maxLength]);
    //    } else {
    //        var nameExists = this.service.nameAlreadyExists(this.id, name);
    //        if (nameExists) {
    //            return MessageBundle.get(dict.NameAlreadyExists);
    //        } else {
    //            return true;
    //        }

    //    }

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
            html: Ling.Categories.toString(self.entity.categories)
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

    renderItems: function (items) {
        //Zwraca widok HTML do wstawienia w panelu Details.
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
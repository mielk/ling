
function GrammarProperty(params) {

    'use strict';

    var self = this;

    //Class signature.
    self.GrammarProperty = true;
    
    //Instance properties.
    self.id = params.Id;
    self.name = params.Name;
    self.defaultValue = null;
    self.language = Ling.Languages.getLanguage(params.LanguageId);
    self.type = Ling.Enums.DataTypes.getByProperty('id', params.Type);
    self.options = self.createOptionsCollection(params.Options);

    (function initialize() {
        self.findDefault();
    })();

}
GrammarProperty.prototype = {    
    
      createOptionsCollection: function (options) {
        var self = this;
        var map = mielk.hashTable();
        
        mielk.arrays.each(options, function (raw) {
            var option = {                
                  id: raw.Id
                , property: self
                , name: raw.Name
                , value: raw.Value
                , isDefault: raw.Default
            };
            map.setItem(option.id, option);
        });

        return map;

    }
    
    , findDefault: function () {
        var self = this;
        self.options.each(function(key, value) {
            if (value.isDefault) {
                self.defaultValue = value;
            }
        });
    }

    , getOption: function (value) {
        return this.options.getItem(value);
    }

};



function GrammarFormGroup(params) {

    'use strict';

    var self = this;

    self.GrammarFormGroup = true;

    //Instance properties.
    self.id = params.Id;
    self.name = params.Name;
    self.index = params.Index;
    self.isHeader = params.IsHeader;
    self.language = Ling.Languages.getLanguage(params.LanguageId);
    self.wordtype = Ling.Enums.Wordtypes.getItem(params.WordtypeId);

    //Load grammar forms.
    self.forms = self.loadForms(params.Forms);

}
GrammarFormGroup.prototype = {
    loadForms: function (forms) {
        var table = mielk.hashTable();
        var self = this;
        //Adding grammar forms assigned to this form group.
        mielk.arrays.each(forms, function (raw) {
            var form = new GrammarFormDefinition(raw, self);
            table.setItem(form.id, form);
        });

        return table;

    }
};



function GrammarFormDefinition(params, group) {

    'use strict';

    var self = this;
    
    self.GrammarFormDefinition = true;

    //Instance properties.
    self.id = params.Id;
    self.group = group;
    self.index = params.Index;
    self.displayed = params.Displayed;

    //Load sub-collections.
    self.properties = self.loadProperties(params.Properties);
    self.inactiveRules = self.loadInactiveRules(params.InactiveRules);


}
GrammarFormDefinition.prototype = {
    loadProperties: function (properties) {
        var table = mielk.hashTable();
        var self = this;
        //Adding grammar forms assigned to this form group.
        mielk.arrays.each(properties, function (raw) {
            var property = new GrammarFormProperty(raw, self);
            table.setItem(property.id, property);
        });

        return table;

    },

    loadInactiveRules: function (rules) {
        var table = mielk.hashTable();
        var self = this;
        //Adding grammar forms assigned to this form group.
        mielk.arrays.each(rules, function (raw) {
            var rule = new GrammarFormInactiveRule(raw, self);
            table.setItem(rule.id, rule);
        });

        return table;

    }

};



function GrammarFormProperty(params, definition) {

    'use strict';

    var self = this;

    self.GrammarFormProperty = true;

    //Instance properties.
    self.id = params.Id;
    self.definition = definition;
    self.property = Ling.Grammar.getProperty(params.PropertyId);
    self.value = self.property ? self.property.getOption(params.ValueId) : null;

}

function GrammarFormInactiveRule(params, definition) {

    'use strict';

    var self = this;

    self.GrammarFormInactiveRule = true;

    //Instance properties.
    self.id = params.Id;
    self.definition = definition;
    self.property = Ling.Grammar.getProperty(params.PropertyId);
    self.value = self.property ? self.property.getOption(params.ValueId) : null;

}


$(function() {

    'use strict';


    var grammar = (function() {

        var properties = mielk.hashTable();
        var requirements = mielk.hashTable();
        var grammarForms = mielk.hashTable();

        //Private functions.
        function trigger(actionName, callback) {
            mielk.db.fetch('Grammar', actionName, {
                'languages': Ling.Users.Current.getLanguagesIds()
            }, {
                async: false,
                cache: false,
                traditional: true,
                callback: function(results) {
                    callback(results);
                }
            });
        }

        function loadProperties(results) {

            mielk.arrays.each(results, function (property) {
                var prop = new GrammarProperty(property);
                properties.setItem(prop.id, prop);
            });

        }

        function loadWordsProperties(results) {

            //Create initial empty map language/wordtype.
            createLanguageWordtypeMap(requirements);

            //Distribute properties to the proper language/wordtype pair.
            mielk.arrays.each(results, function (req) {

                var languageSet = requirements.getItem(req.LanguageId);
                if (!languageSet) return;

                var wordtypeArray = languageSet.getItem(req.WordtypeId);
                if (!wordtypeArray) return;

                var property = properties.getItem(req.PropertyId);
                if (!property) return;

                wordtypeArray.push(property);

            });
            
        }

        function loadGrammarForms(results) {

            //Create initial empty map language/wordtype.
            createLanguageWordtypeMap(grammarForms);

            //Distribute grammar forms to the proper language/wordtype pair.
            mielk.arrays.each(results, function (raw) {
                var group = new GrammarFormGroup(raw)

                var languageSet = grammarForms.getItem(group.language.id);
                if (!languageSet) return;

                var wordtypeArray = languageSet.getItem(group.wordtype.id);
                if (!wordtypeArray) return;

                wordtypeArray.push(group);

            });

        }

        function createLanguageWordtypeMap(set) {

            //Create separate hashTable for each language.
            var languages = Ling.Users.Current.getLanguages();
            mielk.arrays.each(languages, function (language) {
                var table = mielk.hashTable();
                set.setItem(language.id, table);

                //In each language hashTable create separate array for each wordtype.
                mielk.arrays.each(Ling.Enums.Wordtypes.getValues(), function (wordtype) {
                    table.setItem(wordtype.id, []);
                });

            });
        }

        //Public functions.
        function getPropertiesForLanguage(language) {
            var result = [];
            properties.each(function(key, value) {
                if (value.language.id === language) {
                    result.push(value);
                }
            });
            
            return result;
            
        }
        
        function getProperty(id) {
            var property = properties.getItem(id);
            return property;
        }
        
        function getRequiredProperties(languageId, wordtypeId) {
            var language = requirements.getItem(languageId);
            if (!language) return [];

            var wordtypeArray = language.getItem(wordtypeId);
            return wordtypeArray;
             
        }

        function getRequiredGrammarForms(languageId, wordtypeId) {
            var language = grammarForms.getItem(languageId);
            if (!language) return [];

            var array = language.getItem(wordtypeId);
            return array;

        }



        function initialize() {
            trigger('GetGrammarProperties', loadProperties);
            trigger('GetWordsRequiredProperties', loadWordsProperties);
            trigger('GetGrammarFormGroups', loadGrammarForms);
        };


        return {
              getProperty: getProperty
            , getPropertiesForLanguage: getPropertiesForLanguage
            , getRequiredProperties: getRequiredProperties
            , getRequiredGrammarForms: getRequiredGrammarForms
            , initialize: initialize
        };

    })();


    //Add as an item of Ling library.
    Ling.Grammar = grammar;
    Ling.Grammar.initialize();

});
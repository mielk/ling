
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

};



$(function() {

    'use strict';


    var grammar = (function() {

        var properties = mielk.hashTable();
        var requirements = mielk.hashTable();


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

            //Create separate hashTable for each language.
            var languages = Ling.Users.Current.getLanguages();
            mielk.arrays.each(languages, function (language) {
                var table = mielk.hashTable();
                requirements.setItem(language.id, table);
                
                //In each language hashTable create separate array for each wordtype.
                mielk.arrays.each(Ling.Enums.Wordtypes.getValues(), function(wordtype) {
                    table.setItem(wordtype.id, []);
                });

            });

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
            return properties.getItem(id);
        }
        
        function getRequiredProperties(languageId, wordtypeId) {
            var language = requirements.getItem(languageId);
            if (!language) return [];

            var wordtypeArray = language.getItem(wordtypeId);
            return wordtypeArray;

        }



        (function initialize() {
            trigger('GetGrammarProperties', loadProperties);
            trigger('GetWordsRequiredProperties', loadWordsProperties);
        })();


        return {            
              getProperty: getProperty
            , getPropertiesForLanguage: getPropertiesForLanguage
            , getRequiredProperties: getRequiredProperties
        };

    })();


    //Add as an item of Ling library.
    Ling.Grammar = grammar;

});
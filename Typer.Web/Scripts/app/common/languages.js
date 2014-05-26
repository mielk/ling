function Language(properties) {

    'use strict';

    var self = this;
    self.Language = true;
    self.id = properties.id;
    self.name = properties.name;
    self.flag = properties.flag;

}


$(function () {

    var languages = (function(){

        var items = mielk.hashTable();

        function loadLanguages(){
            mielk.db.fetch('Language', 'GetLanguages', {}, {
                async: false,
                cache: false,
                callback: function (result) {

                    mielk.arrays.each(result, function (languageData) {
                        var language = new Language({
                              id: languageData.Id
                            , name: languageData.Name
                            , flag: languageData.Flag
                        });
                        items.setItem(language.id, language);
                    });
                },
                errorCallback: function () {
                    mielk.notify.display(dict.LoadingLanguagesError.get());
                }
            });
        }

        function getLanguage(id) {
            return items.getItem(id);
        }

        (function initialize(){
            loadLanguages();
        })();

        return {
            getLanguage: getLanguage
        };

    })();

    Ling.Languages = languages;

});
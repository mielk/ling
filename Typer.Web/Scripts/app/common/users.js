
function User(properties) {

    'use strict';

    var self = this;
    
    //Class signature.
    self.User = true;

    self.id = properties.id;
    self.languages = null;

}
User.prototype = {

    //Funkcja zwracająca listę języków przypisanych do tego usera.
    getLanguages: function () {
        'use strict';
        if (!this.languages) this.loadLanguages();
        return this.languages;
    },

    //Funkcja zwracająca tablicę zawierającą numery Id języków przypisanych do tego usera.
    getLanguagesIds: function () {
        'use strict';
        if (!this.languages) this.loadLanguages();

        var ids = [];
        mielk.arrays.each(this.languages, function (language) {
            ids.push(language.id);
        });

        return ids;

    },

    loadLanguages: function () {
        'use strict';
        var self = this;
        var languages = [];

        mielk.db.fetch('Language', 'GetUserLanguages', {
            'userId': this.id
        }, {
            async: false,
            cache: false,
            callback: function (result) {
                
                mielk.arrays.each(result, function (item) {
                    languages.push(Ling.Languages.getLanguage(item));
                });

                self.languages = languages;

            }
        });

    }

};

$(function () {

    'use strict';

    var users = (function () {

        var currentUser = new User({
            id: 1
        });

        function setCurrentUser(user) {
            if (user.User) {
                currentUser = user;
            } else {
                if ($.isNumeric(user)) {
                    currentUser = new User({
                        id: user
                    });
                }
            }
        }

        return {
              Current: currentUser
            , SetCurrentUser: setCurrentUser
        };

    })();


    //Add as an item of STOCK library.
    Ling.Users = users;

});
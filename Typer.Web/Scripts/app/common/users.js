
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
        if (!this.languages) this.loadLanguages();
        return this.languages;
    },

    //Funkcja zwracająca tablicę zawierającą numery Id języków przypisanych do tego usera.
    getLanguagesIds: function(){
        if (!this.languages) this.loadLanguages();

        var ids = [];
        mielk.arrays.each(this.languages, function (language) {
            ids.push(language.id);
        });

        return ids;

    },

    loadLanguages: function () {
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
        userLanguages: function () {
            if (!used) {
                loadLanguages();
            }
            return used;
        },
        userLanguagesId: function () {
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
        get: function (id) {
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
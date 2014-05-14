﻿/*
 * Ling main JavaScript module
 *
 * Date: 2014-05-13 16:26
 *
 */

$(function () {
    
    'use strict';
    var dict = [];
    var entry = function ($name, $translations) {
        var name = $name;
        var translations = $translations;

        return {
            get: function(params, language) {

                //Check type of language parameter. It can be passed
                //as a text or as a object of Language class.
                var lng = (language && language.Language ? language : LING.LOCALIZATION.getCurrentLanguage());

                var text = translations.hasOwnProperty(lng.code) ? translations[lng.code] : name;

                if (params && params.length) {
                    for (var index = 0; index < params.length; ++index) {
                        var toBeReplaced = '{' + index + '}';
                        var replacement = (params[index] ? params[index] : toBeReplaced);
                        text = mielk.text.replaceGlobal(text, toBeReplaced, replacement);
                    }
                }

                return text;

            }
        };

    };

    function addEntries(entries) {
        for (var key in entries) {
            if (entries.hasOwnProperty(key)) {
                var $translations = entries[key];
                dict[key] = entry(key, $translations);
            }
        }
    };

    //Actual translations.
    (function initializeDictionary() {

        var entries = {            
            UsernameCannotBeEmpty: {
                POL: 'Nazwa użytkownika nie może być pusta',
                ENG: 'Username cannot be empty'
            },
            UsernameMustBeLongerThan: {
                POL: 'Nazwa użytkownika musi mieć co najmniej {0} znaków',
                ENG: 'Username must be longer than {0} characters'
            },
            UsernameCannotBeLongerThan: {
                POL: 'Nazwa użytkownika nie może być dłuższa niż {0} znaków',
                ENG: 'Username cannot be longer than {0} characters'
            },
            UsernameMustStartWithLetter: {
                POL: 'Nazwa użytkownika musi rozpoczynać się literą',
                ENG: 'Username must start with letter'
            },
            UsernameContainsIllegalChar: {
                POL: 'Nazwa użytkownika może zawierać tylko liczby, cyfry oraz podkreślenie (_)',
                ENG: 'Username can contain only letters, digits and underscore (_)'
            },
            UsernameAlreadyExists: {
                POL: 'Użytkownik o takiej nazwie już istnieje',
                ENG: 'This name has been used already'
            },
            MailCannotBeEmpty: {
                POL: 'Pole e-mail nie może pozostać puste',
                ENG: 'E-mail cannot be empty'
            },
            IllegalMailFormat: {
                POL: 'Nieprawidłowy format adresu e-mail',
                ENG: 'Illegal e-mail format'
            },
            MailAlreadyExists: {
                POL: 'Podany e-mail jest już zarejestrowany w naszej bazie',
                ENG: 'This e-mail has been used already'
            },
            MailDoesntExists: {
                POL: 'Podany e-mail nie jest zarejestrowany w naszej bazie. Proszę użyć adresu e-mail podanego podczas rejestracji.',
                ENG: 'This e-mail is not registered in our database. Please use the e-mail given during registration.'
            },
            MailAlreadyActivated: {
                POL: 'Konto powiązane z tym adresem e-mail zostało już aktywowane.',
                ENG: 'Account linked to this e-mail has been already activated'
            },
            PasswordCannotBeEmpty: {
                POL: 'Hasło nie może być puste',
                ENG: 'Password cannot be empty'
            },
            PasswordTooShort: {
                POL: 'Hasło musi składać się co najmniej z {0} znaków',
                ENG: 'Password must contain at least {0} characters'
            },
            IllegalPasswordFormat: {
                POL: 'Hasło musi zawierać co najmniej jedną literę i jedną cyfrę',
                ENG: 'Password must contain at least one letter and one digit'
            },
            ConfirmPasswordCannotBeEmpty: {
                POL: 'Potwierdzenie hasła nie może być puste',
                ENG: 'Confirm password cannot be empty'
            },
            PasswordsDontMatch: {
                POL: 'Podane hasła różnią się od siebie',
                ENG: "Passwords don't match"
            },
            NameCannotBeEmpty: {
                POL: 'Nazwa nie może być pusta',
                ENG: 'Name cannot be empty'
            },
            NameCannotBeLongerThan: {
                POL: 'Nazwa nie może być dłuższa niż {0} znaków',
                ENG: 'Name cannot be longer than {0} characters'
            },
            NameAlreadyExists: {
                POL: 'Istnieje już zapytanie o takiej nazwie',
                ENG: 'This name has been used already'
            },
            NodeCannotBeMovedToDescendant: {
                POL: 'Element nie może być przeniesiony do własnego potomka',
                ENG: 'Node cannot be moved into its own descendant'
            },
            NodeCannotBeMovedToItself: {
                POL: 'Element nie może być przeniesiony do samego siebie',
                ENG: 'Node cannot be moved into itself'
            },
            WordtypeCannotBeEmpty: {
                POL: 'Część mowy nie może być pusta',
                ENG: 'Wordtype cannot be empty'
            }
        };

        addEntries(entries);


    })();
    
    // Expose ling to the global object
    window.dict = dict;

});





$(function () {

    'use strict';

    var localizationManager = (function () {

        var languages = {
            POL: { code: 'POL', name: 'polski' },
            ENG: { code: 'ENG', name: 'English' }
        };

        var currentLanguage = languages.POL;

        return {
            languages: languages,
            getCurrentLanguage: function() {
                return currentLanguage;
            },
            changeCurrentLanguage: function(language) {
                currentLanguage = language;
            }
        };

    })();


    //Add as an item of STOCK library.
    LING.LOCALIZATION = localizationManager;
    
});
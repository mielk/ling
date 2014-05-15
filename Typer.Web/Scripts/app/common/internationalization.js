/*
 * Ling main JavaScript module
 *
 * Date: 2014-05-13 16:26
 *
 */

$(function () {
    
    'use strict';

    var dict = {};
    var entry = function ($name, $translations) {
        var name = $name;
        var translations = $translations;

        return {
            get: function(params, language) {

                //Check type of language parameter. It can be passed
                //as a text or as a object of Language class.
                var lng = (language && language.Language ? language : Ling.Localization.getCurrentLanguage());

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
                  POL: 'Część mowy nie może być pusta'
                , ENG: 'Wordtype cannot be empty'
            },
            
            //Kategorie
            CategoryNameChanged: {
                  POL: 'Nazwa kategorii została zmieniona na {0}'
                , ENG: 'Category changed its name to {0}'
            },
            CategoryNameChangedError: {
                  POL: 'Błąd podczas zmiany nazwy kategorii z {0} na {1}'
                , ENG: 'Error when trying to change category\'s name from {0} to {1}'
            },
            CategoryParentChanged: {
                  POL: 'Kategoria {0} została przeniesiona do grupy {1}'
                , ENG: 'Category {0} has been moved to the group {1}'
            },
            CategoryParentChangedError: {
                  POL: 'Błąd podczas próby przeniesienia kategorii {0} do grupy {1}'
                , ENG: 'Error when trying to move category {0} to the group {1}'
            },
            CategoryRemoved: {
                  POL: 'Kategoria {0} została usunięta'
                , ENG: 'Category {0} has been removed'
            },
            CategoryRemovedError: {
                  POL: 'Błąd podczas próby usunięcia kategorii {0}'
                , ENG: 'Error when trying to remove category {0}'
            },
            CategoryAdded: {
                  POL: 'Dodano kategorię {0}'
                , ENG: 'Category {0} has been added'
            },
            CategoryAddedError: {
                  POL: 'Błąd podczas próby dodania kategorii {0}'
                , ENG: 'Error when trying to add category {0}'
            },
            
            //Metawords
            MetawordCheckIfNameExistsError: {
                  POL: 'Błąd podczas próby sprawdzenia czy istnieje już metawyraz o nazwie {0}'
                , ENG: 'Error when trying to check if there is already metaword with name {0}'
            },
            MetawordCategoryAssigned: {
                  POL: 'Kategorie {1} zostały przypisane do wyrazu {0}'
                , ENG: 'Categories {1} have been assigned to word {0}'
            }, 
            MetawordCategoryAssignedError: {
                  POL: 'Błąd podczas próby przypisania nowych kategorii do wyrazu {0}'
                , ENG: 'Error when trying to assign the given categories to word {0}'
            },
            MetawordActivated: {
                  POL: 'Wyraz {0} został aktywowany'
                , ENG: 'Metaword {0} has been activated'
            },
            MetawordActivatedError: {
                  POL: 'Błąd podczas próby aktywacji metawyrazu {0}'
                , ENG: 'Error when trying to activate metaword {0}'
            },
            MetawordDeactivated: {
                  POL: 'Wyraz {0} został zdeaktywowany'
                , ENG: 'Metaword {0} has been deactivated'
            },
            MetawordDeactivatedError: {
                  POL: 'Błąd podczas próby deaktywacji metawyrazu {0}'
                , ENG: 'Error when trying to deactivate metaword {0}'
            },
            MetawordUpdateWeight: {
                  POL: 'Wyraz {0} zmienił wagę na {1}'
                , ENG: 'Metaword {0} has changed its weight to {1}'
            },
            MetawordUpdateWeightError: {
                  POL: 'Błąd podczas zmiany wagi dla metawyrazu {0}'
                , ENG: 'Error when trying to change the weight of the word {0}'
            },
            MetawordUpdate: {
                  POL: 'Właściwości metawyrazu {0} zostały zmienione'
                , ENG: 'Metaword {0} has been updated'
            },
            MetawordUpdateError: {
                  POL: 'Błąd podczas próby zmiany właściwości metawyrazu {0}'
                , ENG: 'Error when trying to update metaword {0}'
            },
            MetawordAdded: {
                  POL: 'Metawyraz {0} został dodany do bazy'
                , ENG: 'Metaword {0} has been added'
            },
            MetawordAddedError: {
                  POL: 'Błąd podczas próby dodania metawyrazu {0} do bazy'
                , ENG: 'Error when trying to add metaword {0}'
            },
            GetMetawordWordsError: {
                  POL: 'Błąd podczas próby pobrania wyrazów dla metawyrazu {0}'
                , ENG: 'Error when trying to get words for metaword {0}'
            },
            

            //Querys
            QueryCheckIfNameExistsError: {
                  POL: 'Błąd podczas próby sprawdzenia czy istnieje już zapytanie o nazwie {0}'
                , ENG: 'Error when trying to check if there is already query with name {0}'
            },
            QueryCategoryAssigned: {
                  POL: 'Kategorie {1} zostały przypisane do zapytania {0}'
                , ENG: 'Categories {1} have been assigned to query {0}'
            }, 
            QueryCategoryAssignedError: {
                  POL: 'Błąd podczas próby przypisania nowych kategorii do zapytania {0}'
                , ENG: 'Error when trying to assign the given categories to query {0}'
            },
            QueryActivated: {
                  POL: 'Zapytanie {0} zostało aktywowane'
                , ENG: 'Query {0} has been activated'
            },
            QueryActivatedError: {
                  POL: 'Błąd podczas próby aktywacji zapytania {0}'
                , ENG: 'Error when trying to activate query {0}'
            },
            QueryDeactivated: {
                  POL: 'Zapytanie {0} zostało zdeaktywowane'
                , ENG: 'Query {0} has been deactivated'
            },
            QueryDeactivatedError: {
                  POL: 'Błąd podczas próby deaktywacji zapytania {0}'
                , ENG: 'Error when trying to deactivate query {0}'
            },
            QueryUpdateWeight: {
                  POL: 'Zapytanie {0} zmieniło wagę na {1}'
                , ENG: 'Query {0} has changed its weight to {1}'
            },
            QueryUpdateWeightError: {
                  POL: 'Błąd podczas zmiany wagi dla zapytania {0}'
                , ENG: 'Error when trying to change the weight of the query {0}'
            },
            QueryUpdate: {
                  POL: 'Właściwości zapytania {0} zostały zmienione'
                , ENG: 'Query {0} has been updated'
            },
            QueryUpdateError: {
                  POL: 'Błąd podczas próby zmiany właściwości zapytania {0}'
                , ENG: 'Error when trying to update query {0}'
            },
            QueryAdded: {
                  POL: 'Zapytanie {0} zostało dodane do bazy'
                , ENG: 'Query {0} has been added'
            },
            QueryAddedError: {
                  POL: 'Błąd podczas próby dodania zapytania {0} do bazy'
                , ENG: 'Error when trying to add query {0}'
            },
            GetQueryOptionsError: {
                  POL: 'Błąd podczas próby pobrania opcji dla zapytania {0}'
                , ENG: 'Error when trying to fetch options for query {0}'
            },
            GetQueryVariantSetsError: {
                  POL: 'Błąd podczas próby pobrania wariant-setów dla zapytania {0}'
                , ENG: 'Error when trying to fetch variant sets for query {0}'
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

        var currentLanguage = Ling.Enums.Languages.POL;

        return {
            getCurrentLanguage: function() {
                return currentLanguage;
            },
            changeCurrentLanguage: function(language) {
                currentLanguage = language;
            }
        };

    })();


    //Add as an item of STOCK library.
    Ling.Localization = localizationManager;
    
});
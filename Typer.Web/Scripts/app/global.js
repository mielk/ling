var Language = Language || {
    POL: { code: 'POL', name: 'polski' },
    ENG: { code: 'ENG', name: 'English' }
};


var my = my || {};
my.language = Language.ENG;


var dict = dict || {
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
    }
}


var MessageBundle = MessageBundle || (function () {

    return {
        get: function (msg, params) {
            var text = msg[my.language.code];

            if (params) {
                for (index = 0; index < params.length; ++index) {
                    var toBeReplaced = '{' + index + '}';
                    text = text.replace(toBeReplaced, params[index]);
                }
            }

            return text;

        }
    }


}());
var Language = Language || {
    POL: { code: 'POL', name: 'polski' },
    ENG: { code: 'ENG', name: 'English' }
};


var my = my || {
    language: Language.ENG
};


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
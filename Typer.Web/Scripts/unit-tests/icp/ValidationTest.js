module('validation tests');

test('Substitute method return a given char if base text is selected in a whole', function () {
    expect(1);

    //Arrange
    var base = 'string';
    var position = { start: 0, end: base.length };
    var charCode = 65;
    var character = String.fromCharCode(charCode);
    

    //Act
    var result = my.validation.Utils.Substitute(base, position, charCode);

    //Assert
    equal(result, character, 'Selection should be replaced by the given character');

});

test('Substitute method append a given character at the end of the string if the caret is at the end and nothing is selected', function () {
    expect(1);

    //Arrange
    var base = 'string';
    //If caret is at the end of the string, both start and end properties are equal to the length of this string
    var position = { start: base.length, end: base.length };
    var charCode = 65;
    var character = String.fromCharCode(charCode);


    //Act
    var result = my.validation.Utils.Substitute(base, position, charCode);

    //Assert
    equal(result, base + character, 'Given character should be appended at the end of the string');

});

test('Substitute method append a given character at the beginning of the string if the caret is at the end and nothing is selected', function () {
    expect(1);

    //Arrange
    var base = 'string';
    var position = { start: 0, end: 0 };
    var charCode = 65;
    var character = String.fromCharCode(charCode);


    //Act
    var result = my.validation.Utils.Substitute(base, position, charCode);

    //Assert
    equal(result, character + base, 'Given character should be appended at the beginning of the string');

});

test('Substitute method insert a given character in the middle of the string if the caret is in the middle and nothing is selected', function () {
    expect(1);

    //Arrange
    var base = 'string';
    var position = { start: 3, end: 3 };
    var charCode = 65;
    var character = String.fromCharCode(charCode);


    //Act
    var result = my.validation.Utils.Substitute(base, position, charCode);

    //Assert
    var expected = 'strAing';
    equal(result, expected, 'strAing is expected');

});

test('Substitute method replace a selected part of string with the given character', function () {
    expect(1);

    //Arrange
    var base = 'string';
    var position = { start: 1, end: 3 };
    var charCode = 65;
    var character = String.fromCharCode(charCode);


    //Act
    var result = my.validation.Utils.Substitute(base, position, charCode);

    //Assert
    var expected = 'sAing';
    equal(result, expected, 'sAing is expected');

});

test('IsInArray method returns true if the given array contains the given value', function () {
    expect(1);

    //Arrange
    var array = [0, 1, 2, 3, 4, 5];
    var value = 2;

    //Act
    var result = my.validation.Utils.IsInArray(value, array);

    //Assert
    equal(result, true, 'Value ' + value + ' is contained in the given array and this function should return true');

});

test('IsInArray method returns false if the given array doesnt contain the given value', function () {
    expect(1);

    //Arrange
    var array = [0, 1, 3, 4, 5];
    var value = 2;

    //Act
    var result = my.validation.Utils.IsInArray(value, array);

    //Assert
    equal(result, false, 'Value ' + value + ' is not contained in the given array and this function should return false');

});

test('IsInArray method returns false for empty array', function () {
    expect(1);

    //Arrange
    var array = [];
    var value = 2;

    //Act
    var result = my.validation.Utils.IsInArray(value, array);

    //Assert
    equal(result, false, 'The given array is empty, function should return false');

});

test('IsInArray method returns false if array parameter is primitive value', function () {
    expect(1);

    //Arrange
    var array = 1;
    var value = 2;

    //Act
    var result = my.validation.Utils.IsInArray(value, array);

    //Assert
    equal(result, false, 'Variable array should be an array, but is a primitive');

});

test('IsInArray method returns false if array parameter is object', function () {
    expect(1);

    //Arrange
    var array = {};
    var value = 2;

    //Act
    var result = my.validation.Utils.IsInArray(value, array);

    //Assert
    equal(result, false, 'Variable array should be an array, but is an object');

});

test('IsProperAmount returns true if string is empty', function() {
    expect(1);

    //Arrange
    var text = '';

    //Act
    var result = my.validation.Utils.IsProperAmount(text);

    //Assert
    equal(result, true, 'Text can be empty (i.e. if user deleted previous input and wants to enter new value');

});

test('IsProperAmount returns true if string is number without decimal', function () {
    expect(1);

    //Arrange
    var text = '203';

    //Act
    var result = my.validation.Utils.IsProperAmount(text);

    //Assert
    equal(result, true, 'Obvious. Text is a plain number');

});

test('IsProperAmount returns true if string is number with minus at the beginning', function () {
    expect(1);

    //Arrange
    var text = '-203';

    //Act
    var result = my.validation.Utils.IsProperAmount(text);

    //Assert
    equal(result, true, 'Function should accept negative values');

});

test('IsProperAmount returns true if string is number with dot at the end', function () {
    expect(1);

    //Arrange
    var text = '203.';

    //Act
    var result = my.validation.Utils.IsProperAmount(text);

    //Assert
    equal(result, true, 'Function should accept texts with the dot at the end (without decimal places yet) - if user is in the middle of entering value with decimal places');

});

test('IsProperAmount returns true if string is number with dot at the end and two decimal places', function () {
    expect(1);

    //Arrange
    var text = '203.21';

    //Act
    var result = my.validation.Utils.IsProperAmount(text);

    //Assert
    equal(result, true, 'Function should accept values with maximum two decimal places');

});

test('IsProperAmount returns true if string is number with minus and two decimal places', function () {
    expect(1);

    //Arrange
    var text = '-203.21';

    //Act
    var result = my.validation.Utils.IsProperAmount(text);

    //Assert
    equal(result, true, 'Function should accept negative values with maximum two decimal places');

});

test('IsProperAmount returns false if string is null', function () {
    expect(1);

    //Arrange
    var text = null;
    
    //Act
    var result = my.validation.Utils.IsProperAmount(text);

    //Assert
    equal(result, false, 'Text cannot be null');

});

test('IsProperAmount returns false if text variable is not a string', function() {
    expect(1);

    //Arrange
    var text = [];

    //Act
    var result = my.validation.Utils.IsProperAmount(text);

    //Assert
    equal(result, false, 'Text must be a string');

});

test('IsProperAmount returns false if string contains at least one character other than digit coma or minus', function () {
    expect(1);

    //Arrange
    var text = '-21a';

    //Act
    var result = my.validation.Utils.IsProperAmount(text);

    //Assert
    equal(result, false, 'Text cannot contain characters other than digits, minus and dot');

});

test('IsProperAmount returns false if string has more than two decimal places', function () {
    expect(1);

    //Arrange
    var text = '21.234';

    //Act
    var result = my.validation.Utils.IsProperAmount(text);

    //Assert
    equal(result, false, 'Text cannot be value with more than two decimal places');

});

test('IsProperAmount returns false if string has more than one minus', function () {
    expect(1);

    //Arrange
    var text = '-21-2';

    //Act
    var result = my.validation.Utils.IsProperAmount(text);

    //Assert
    equal(result, false, 'Text cannot contain more than one minus');

});

test('IsProperAmount returns false if string has minus prepended by any character', function () {
    expect(1);

    //Arrange
    var text = '2-2';

    //Act
    var result = my.validation.Utils.IsProperAmount(text);

    //Assert
    equal(result, false, 'Minus must be at the first position in the given text');

});

test('IsProperAmount returns false if string contains more than one dot', function () {
    expect(1);

    //Arrange
    var text = '22..';

    //Act
    var result = my.validation.Utils.IsProperAmount(text);

    //Assert
    equal(result, false, 'Text cannot contain more than one dot');

});

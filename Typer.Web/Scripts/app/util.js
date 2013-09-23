function placeholderIsSupported() {
    var test = document.createElement('input');
    return ('placeholder' in test);
}
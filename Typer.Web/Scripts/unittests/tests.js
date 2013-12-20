function A(x) {
    this.x = x;
}
A.prototype.method = function() {
    alert(this.x);
};

function B(x) {
    A.call(this, x);
}
extend(A, B);


$(function() {
    var variable = new B(2);
    alert(variable.x);
    alert(variable.method());
});
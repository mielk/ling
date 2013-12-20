function BaseClass(properties) {
    this.a = properties.a;
    this.b = properties.b;
}
BaseClass.prototype.funkcja = function () {
    return 'funkcja A';
};

//var animal = { eats: true }
//var rabbit = { jumps: true }
//rabbit.__proto__ = animal  // inherit
//alert(rabbit.eats) // true



function InheritedClass(properties) {
    
}
InheritedClass.prototype = BaseClass;
InheritedClass.prototype.funkcja = function () {
    return 'funkcja B';
};


$(function () {
    var a = new BaseClass({
        a: 1,
        b: 2
    });

    var b = new InheritedClass({
        a: 5,
        b: 6
    });

    alert(a.funkcja());
    alert(b.funkcja());

});
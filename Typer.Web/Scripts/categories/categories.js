my.categories = my.categories || {
    root : getRoot()
}

function getRoot(){
    var root;

    $.ajax({
        url: "/Categories/GetCategories",
        type: "GET",
        datatype: "json",
        async: false,
        success: function (result) {
            root = result;
        },
        error: function (msg) {
            alert(msg.status + " | " + msg.statusText);
        }
    });

    return root;

}

$(function () {
    alert(my.categories.root);
});
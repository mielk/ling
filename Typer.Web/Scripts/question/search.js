$(function () {

    var manager = new SearchManager();

});


function SearchManager() {
    var me = this;

    this.wordType = new WordType(this);


}

function WordType(manager) {
    var me = this;
    this.manager = manager;
    this.container = $('#word-type')[0];

    var dropdownData = [];
    for (var key in TYPE) {
        if (TYPE.hasOwnProperty(key)) {
            var type = TYPE[key];
            if (type.id) {
                var object = {
                    key: type.id,
                    name: type.name,
                    object: type
                };
                dropdownData.push(object);                
            }
        }
    }

    if (this.container) {
        this.dropdown = new DropDown({            
            container: me.container,
            data: dropdownData,
            slots: 4,
            caseSensitive: false,
            confirmWithFirstClick: true
        });
    }

}
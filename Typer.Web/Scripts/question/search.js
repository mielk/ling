$(function () {

    var manager = new SearchManager();

});


function SearchManager() {
    var me = this;

    this.wordType = new WordType(this);
    this.weight = new Weight(this);

}

function WordType(manager) {
    var me = this;
    this.manager = manager;
    this.container = $('#word-type')[0];
    this.value = null;

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

    this.dropdown.bind({
        select: function(e) {
            me.value = e.object;
        }
    });


}

function Weight(manager) {
    var me = this;
    this.minWeight = 1;
    this.maxWeight = 10;
    this.manager = manager;
    this.values = {
        from: 0,
        to: 0
    };
    this.fromWeight = $('#fromWeight')[0];
    this.toWeight = $('#toWeight')[0];

    $(this.fromWeight).bind({        
        click: function () {
            this.select();
            this.focus();
        },
        blur: function () {
            me.values.from = getProperValue($(this).val());
            $(this).val(me.values.from ? me.values.from : '');
        }
    });

    $(this.toWeight).bind({        
        click: function () {
            this.select();
            this.focus();
        },
        blur: function () {
            me.values.to = getProperValue($(this).val());
            $(this).val(me.values.to ? me.values.to : '');
        }
    });
    
    function getProperValue(value) {
        var $value = Number(value);
        if (!$.isNumeric($value) || $value === 0) return 0;
        return Math.max(Math.min(me.maxWeight, $value), me.minWeight);
    }

}
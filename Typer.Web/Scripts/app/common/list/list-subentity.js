
function Subentity(entity, params) {

    'use strict';

    var self = this;

    //Class signature.
    self.Subentity = true;

    //Instance properties.
    self.entity = entity;
    self.id = params.Id || params.id || 0;
    self.name = params.Name || params.name || params.Content || params.content || '';
    self.weight = params.Weight || params.weight || 1;
    self.language = params.Language || params.language || Ling.Languages.getLanguage(params.LanguageId) || Ling.Languages.getLanguage(params.languageId);
    self.isCompleted = params.IsCompleted || params.isCompleted || false;
    self.isActive = params.IsActive || params.isActive || true;
    self.creatorId = params.CreatorId || params.creatorId || 1;
    self.createDate = params.CreateDate || params.createDate || new Date().getDate;
    self.isApproved = params.IsApproved || params.isApproved || false;
    self.positive = params.Positive || params.positive || 0;
    self.negative = params.Negative || params.negative || 0;
    self.new = params.new || false;

    //Services.
    self.service = null;
    self.eventHandler = mielk.eventHandler();

}
Subentity.prototype = {
    
    bind: function (e) {
        this.eventHandler.bind(e);
    }
    
    , trigger: function (e) {
        this.eventHandler.trigger(e);
    }
};




OptionEntity.prototype.getLanguageId = function () {
    return this.languageId;
};
OptionEntity.prototype.injectLanguageEntity = function (languageEntity) {
    this.language = languageEntity;
};
OptionEntity.prototype.delete = function () {
    if (this.language) {
        this.language.remove(this);
    }

    this.trigger({
        type: 'remove'
    });

};
OptionEntity.prototype.edit = function (properties) {

    //Load properties and details of this entity.
    if (!this.properties) this.loadProperties();
    if (!this.details) this.loadDetails();

    //Create edit object bound to this entity and display edit form.
    var editItem = this.editItem();
    var editPanel = this.editOptionPanel(editItem, properties);
    editPanel.display();

};
OptionEntity.prototype.loadProperties = function () {
    alert('Must be defined in implementing class');
};
OptionEntity.prototype.loadDetails = function () {
    alert('Must be defined in implementing class');
};
OptionEntity.prototype.editOptionPanel = function () {
    alert('Must be defined in implementing class');
};
OptionEntity.prototype.checkName = function (name) {

    if (!name) return MessageBundle.get(dict.NameCannotBeEmpty);

    var language = this.language;
    var items = language ? language.items : [];
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var itemName = item.name;
        if (itemName === name && item !== this) {
            return MessageBundle.get(dict.NameAlreadyExists);
        }
    }
    return true;
};
OptionEntity.prototype.update = function (params, properties, details, complete) {
    if (!params.OptionEditEntity) {
        alert('Illegal argument passed to function Metaword.update');
        return;
    }

    var self = this;
    var completed = (this.isCompleted === complete ? undefined : complete);
    var name = (this.name === params.name ? undefined : params.name);
    var weight = (this.weight === params.weight ? undefined : params.weight);

    //Check if there are any changes.
    if (completed !== undefined || name || weight) {
        this.isCompleted = complete;
        this.name = (name === undefined ? this.name : name);
        this.weight = (weight === undefined ? this.weight : weight);


        if (this.new) {

            this.parent.addLog({
                event: 'add',
                item: self
            });

            this.trigger({
                type: 'add',
                item: self
            });

        } else {
            this.parent.addLog({
                event: 'edit',
                item: self
            });

            this.trigger({
                type: 'update',
                name: self.name,
                weight: self.weight,
                complete: self.isCompleted
            });


        }

    }


    //Update properties and details.
    this.updateProperties(properties);
    this.updateDetails(details);

};
OptionEntity.prototype.updateProperties = function () {
    alert('Must be defined in implementing class');
};
OptionEntity.prototype.updateDetails = function () {
    alert('Must be defined in implementing class');
};


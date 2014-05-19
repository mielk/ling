/*
 * Word
 *
 * Date: 2014-05-19 11:38
 *
 */
function Word(metaword, params) {

    'use strict';

    var self = this;

    //Class signature.
    self.Word = true;

    //Instance properties.
    self.metaword = metaword;
    self.id = params.Id || params.id;
    self.name = params.Name || params.name;
    self.weight = params.Weight || params.weight;
    self.language = Ling.Languages.getLanguage(params.LanguageId);
    self.isCompleted = params.IsCompleted || params.isCompleted || false;

    //Services.
    self.eventHandler = mielk.eventHandler();
    self.service = Ling.Words;
    
}
Word.prototype = {
    
    bind: function(e) {
        this.eventHandler.bind(e);
    }
    
    , trigger: function(e) {
        this.eventHandler.trigger(e);
    }
    
    , remove: function () {
        this.metaword.removeItem(this);
        this.trigger({ type: 'remove' });
    }
    
    , clone: function () {
        var self = this;

        //Create a copy instance of Metaword with all primitive
        //properties given as initialize parameters.
        var obj = new Word(self.metaword, {
              id: self.id
            , name: self.name
            , weight: self.weight
            , LanguageId: self.language.id
            , isCompleted: self.isCompleted
        });

        return obj;

    }
    
};
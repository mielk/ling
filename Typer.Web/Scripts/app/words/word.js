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
    self.isCompleted = params.IsCompleted || false;

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
    
};
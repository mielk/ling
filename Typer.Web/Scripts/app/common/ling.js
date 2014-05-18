var my;
if (my === undefined) {
    my = [];
}

/*
 * Ling main JavaScript module
 *
 * Date: 2014-05-13 16:26
 *
 */
(function (window) {

    'use strict';

    var config = {        
          applicationName: 'ling'
        , applicationVersion: '0.0.1'
        , entities: {
                  minWeight: 1
                , maxWeight: 10
            }
    };

    var ling = {
        Config: config
    };


    // Expose ling to the global object
    window.Ling = ling;


})(window);
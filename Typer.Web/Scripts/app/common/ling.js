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
        applicationName: 'ling',
        applicationVersion: '0.0.1'
    };

    var ling = {
        config: config
    };


    // Expose ling to the global object
    window.LING = ling;


})(window);
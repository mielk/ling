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
            , pageSize: 15
        }
        , colors: {
              correctBackground: '#69FF65'
            , correctBorder: '#024D00'
            , correctFont: '#024D00'
            , wrongBackground: '#FF6565'
            , wrongBorder: '#570000'
            , wrongFont: '#570000'
        }
    };

    var ling = {
        Config: config
    };


    // Expose ling to the global object
    window.Ling = ling;


})(window);
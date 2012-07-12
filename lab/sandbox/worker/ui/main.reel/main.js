/**
    @module "ui/main.reel"
    @requires montage
    @requires montage/ui/component
*/
var Montage = require("montage").Montage;
var Component = require("montage/ui/component").Component;
var Worker = require("montage/require/worker").Worker;

/**
    Description TODO
    @class module:"ui/main.reel".Main
    @extends module:ui/component.Component
*/
exports.Main = Montage.create(Component, /** @lends module:"ui/main.reel".Main# */ {

    thing: {
        get: function () {
//            debugger
            return "World!";
        }
    },

    /**

     */
    didCreate:{
        value: function () {

            var worker = new Worker(require.config.location, "worker/model");
            worker.onmessage = function (event) {
                console.log(event.data);
            };
            worker.postMessage("Hello, World!");
        }
    }

});

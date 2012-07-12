/* <copyright>
 This file contains proprietary software owned by Motorola Mobility, Inc.<br/>
 No rights, expressed or implied, whatsoever to this software are provided by Motorola Mobility, Inc. hereunder.<br/>
 (c) Copyright 2011 Motorola Mobility, Inc.  All Rights Reserved.
 </copyright> */
var Montage = require("montage").Montage;
require("montage/core/event/binding");

var Person = exports.Person = Montage.create(Montage, {

});

var WebDeveloper = exports.WebDeveloper = Montage.create(Person, {



});

var HTML5Framework = exports.HTML5Framework = Montage.create(Montage, {

});

var StandardsBody = exports.StandardsBody = Montage.create(Montage, {

    didCreate: {
        value: function() {
            this.specs = [];
        }
    },

    name: {
        value: null
    },

    specs: {
        value: null
    }

});

var Spec = exports.Spec = Montage.create(Montage, {

});

var Browser = exports.Browser = Montage.create(Montage, {

    _specs: {
        value: null
    },

    specs: {
        get:function () {
            return this._specs;
        },
        set:function (value) {
            if (value) {
                postMessage({type:"forward",data: "spec: " + value.length});
            }
            this._specs = value;
        }
    },

    implementedSpecs: {
        value: null
    }

});

//var alphabet = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];


//var standardsBodies = [];
//var std = 0;
//while (std < 3) {
//    var aStandardsBody = StandardsBody.create();
//    aStandardsBody.name = "w" + alphabet[Math.ceil(Math.random() * 26)] + alphabet[Math.ceil(Math.random() * 26)];
//    standardsBodies.push(aStandardsBody);
//    std++;
//    var s = 0;
//    while (s < Math.ceil(Math.random() * 50)) {
//        var aSpec = Spec.create();
//        aSpec.name = "w" + alphabet[Math.ceil(Math.random() * 26)] + alphabet[Math.ceil(Math.random() * 26)];
//        standardsBodies.specs.push(aSpec);
//        s++;
//    }
//    var s = 0;
//    while (s < 50) {
//        var aSpec = Spec.create();
//        aSpec.name = "w" + alphabet[Math.ceil(Math.random() * 26)] + alphabet[Math.ceil(Math.random() * 26)];
//        standardsBodies.specs.push(aSpec);
//        s++;
//    }
//}



var w3c = StandardsBody.create();

var chrome = Browser.create();
var firefox = Browser.create();

Object.defineBinding(chrome, "specs", {boundObject: w3c, boundObjectPropertyPath: "specs", oneway: true});
w3c.specs = [Spec.create()];


var alfred = WebDeveloper.create();

setTimeout(function() {
    postMessage({type:"forward",data:"Hi!"});
}, 50);




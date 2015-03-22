"use strict";

function toJson(obj) {
    if (isUndefined(obj)) {
        return undefined;
    }

    return JSON.stringify(obj);
}

function fromJson(str) {
    return isString(str) ? JSON.parse(str) : str;
}

function isString(value) {
    return (value instanceof String || "string" == typeof value);
}

function isUndefined(value) {
    return value === void 0;
}

// RFC4122 version 4 compliant
function generateUUID() {
    // http://stackoverflow.com/a/8809472
    var now = Date.now();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(character) {
        // jshint bitwise: false
        var random = (now + Math.random()*16)%16 | 0;
        now = Math.floor(now/16);
        // jshint bitwise: false
        return (character=='x' ? random : (random&0x3|0x8)).toString(16);
    });

    return uuid;
}

function extend(Child, Parent) {
    var F = function() { };
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Child;
}

module.exports = {
    toJson: toJson,
    fromJson: fromJson,
    isString: isString,
    isUndefined: isUndefined,
    generateUUID: generateUUID,
    extend: extend
};
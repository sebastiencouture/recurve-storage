"use strict";

var Storage = require("./storage");
var utils = require("./utils");

function LocalStorage(options) {
    options = options || {};
    options.provider = options.provider || window.localStorage;
    Storage.apply(this, arguments);
}
LocalStorage.prototype = {};
utils.extend(LocalStorage, Storage);

module.exports = LocalStorage;
"use strict";

var Storage = require("./storage");
var utils = require("./utils");

function SessionStorage(options) {
    options = options || {};
    options.provider = options.provider || window.sessionStorage;
    Storage.apply(this, arguments);
}
SessionStorage.prototype = {};
utils.extend(SessionStorage, Storage);

module.exports = SessionStorage;



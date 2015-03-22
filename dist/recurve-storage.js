/*!
recurve-storage.js - v0.1.2
Created by Sebastien Couture on 2015-03-22.

git://github.com/sebastiencouture/recurve-storage.git

The MIT License (MIT)

Copyright (c) 2015 Sebastien Couture

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 
*/

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Storage = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"./storage":4,"./utils":5}],2:[function(require,module,exports){
"use strict";

module.exports.Session = require("./session-storage");
module.exports.Local = require("./local-storage");
},{"./local-storage":1,"./session-storage":3}],3:[function(require,module,exports){
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



},{"./storage":4,"./utils":5}],4:[function(require,module,exports){
"use strict";

var utils = require("./utils");

module.exports = Storage;

/**
 * Local and session storage wrapper library for the browser. Support for object serialization and caching. Graceful degradation
 * with caching for older browsers and private browsing mode in Safari with no storage.
 *
 * @example
 * var myLocalStorage = new Storage.Local({
 *      createCache: function(isSupported) {
 *          return isSupported ? null : new Cache();
 *      }
 * });
 *
 * @example
 * var mockedLocalStorage = new Storage.Local({
 *      provider: {
 *          getItem: function() {...},
 *          removeItem: function() {...},
 *          clear: function() {...}
 *     }
 * });
 *
 * @param options options.provider (localStorage, sessionStorage, mock), options.createCache method
 * to create a cache instance.
 * @constructor
 */
function Storage(options) {
    if (!options) {
       throw new Error("expected options to be defined");
    }

    var supported = isSupported(options.provider);
    if (supported) {
        this._provider = options.provider;
    }
    else {
        this._provider = null;
    }

    if (options.createCache) {
        this._cache = options.createCache(supported);
    }
}

Storage.prototype = {
    /**
     * Retrieve a value from storage
     *
     * @param key
     * @returns {*}
     */
    get: function(key) {
        var value = null;
        if (this._cache) {
            value = this._cache.get(key);
            value = parse(value);
        }
        if (!value && this._provider) {
            value = this._provider.getItem(key);
            value = parse(value);

            if (this._cache) {
                this._cache.set(key, value);
            }
        }

        return value;
    },

    /**
     * Save a value to storage
     *
     * @param key
     * @param value
     */
    set: function(key, value) {
        if (this._provider) {
            var serialized = serialize(value);
            this._provider.setItem(key, serialized);
        }
        if (this._cache) {
            this._cache.set(key, value);
        }
    },

    /**
     * Remove a value from storage
     *
     * @param key
     * @returns {boolean} true if a value was removed, false otherwise
     */
    remove: function(key) {
        var existed = this.exists(key);
        if (this._cache) {
            this._cache.remove(key);
        }
        if (this._provider) {
            this._provider.removeItem(key);
        }

        return existed;
    },

    /**
     * Check if an item exists in storage
     *
     * @param key
     * @returns {boolean} true if a value exists for the key, false otherwise
     */
    exists: function(key) {
        var found = false;
        if (this._cache) {
            found = this._cache.exists(key);
        }
        else if (this._provider) {
            found = !!this._provider.getItem(key);
        }
        else {
            throw new Error("either cache or storage provider should exist");
        }

        return found;
    },

    /**
     * Clear all values in storage
     */
    clear: function() {
        if (this._cache) {
            this._cache.clear();
        }
        if (this._provider) {
            this._provider.clear();
        }
    },

    /**
     * Iterate through all values in storage
     *
     * @param iterator callback method. (value, key) are passed as parameters for each value in storage
     * @param context of the iterator
     */
    forEach: function(iterator, context) {
        if (this._cache) {
            this._cache.forEach(iterator, context);
        }
        else if (this._provider) {
            for (var key in this._provider) {
                var value = this.get(key);
                iterator.call(context, value, key);
            }
        }
        else {
            throw new Error("either cache or storage provider should exist");
        }
    }
};


function serialize(value) {
    return utils.toJson(value);
}

function parse(value) {
    try {
        return utils.fromJson(value);
    }
    catch(e) {
        return value;
    }
}

function isSupported(provider) {
    if (!provider) {
        return false;
    }

    // When Safari is in private browsing mode, storage will appear to still be available
    // but it will throw an error when trying to set an item
    var key = "_recurve" + utils.generateUUID();
    try {
        provider.setItem(key, "");
        provider.removeItem(key);
    }
    catch (e) {
        return false;
    }

    return true;
}
},{"./utils":5}],5:[function(require,module,exports){
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
},{}]},{},[2])(2)
});
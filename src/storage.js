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
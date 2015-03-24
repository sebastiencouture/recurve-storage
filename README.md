recurve-storage [![Build Status](https://secure.travis-ci.org/sebastiencouture/recurve-storage.png?branch=master)](https://travis-ci.org/sebastiencouture/recurve-storage)
===

Local and session storage wrapper Javascript library for the browser. Support for object serialization and caching. Graceful degradation
with caching for no storage support due to older browsers and private browsing mode in Safari.

## Usage

### Example

Local storage

```javascript
var local = new Storage(window.localStorage);

local.set("a", {something: 1});
local.get("a"); // returns the object

// iterate all values
local.forEach(function(value, key) {
}, this);

local.remove("a");
local.exits("a"); // false
local.clear(); // clear everything in local storage
```

Session storage

```javascript
var session = new Storage(window.sessionStorage);
```

Mocked storage

```javascript
var mocked = new Storage({
    getItem: function() {...},
    removeItem: function() {...},
    clear: function() {...}
});

Enable caching by providing a factory method that returns a cache instance. The code
below enables caching regardless if there is support (private browsing mode in Safari). Always caching can also be useful
if you run into performance bottlenecks due to factors such as numerous repeated calls to storage.

The cache object needs to implement two methods: `get` and `set`. [recurve-cache](http://github.com/sebastiencouture/recurve-cache) is a compatible cache.
```javascript
var Cache = require("recurve-cache");
new Storage(window.localStorage, function() {
    return new Cache();
});
```

The method is also called with an `isSupported` parameter so you can optionally only include caching if there is
no support for storage. This can be useful for graceful degradation with older browsers and private browsing mode in Safari.
```javascript
var Cache = require("recurve-cache");
new Storage(window.localStorage, function(isSupported) {
    return isSupported ? null : new Cache();
});
```

Need to mock local and session storage for unit tests? Pass in a mock `provider`. The `provider`
needs to implement three methods: `getItem`, `setItem`, and `clear`
```javascript
new Storage({
     getItem: function() {...},
     setItem: function() {...},
     clear: function() {...}
});
```

Passing null for `getItem`, and `setItem` can be useful for testing no storage/private browsing mode in Safari.

For more examples, take a look at the [unit tests](test/storage.spec.js)

## Running the Tests

```
grunt test
```

## Installation

The library is UMD compliant. Registers on `window.Storage` for global.

```
npm install recurve-storage
```
```
bower install recurve-storage
```

## Browser Support

IE8+

IE6+ with JSON polyfill such as [json3](https://bestiejs.github.io/json3/)

## License

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
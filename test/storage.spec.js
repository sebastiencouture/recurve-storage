describe("storage", function() {
    "use strict";

    var Cache = require("recurve-cache");

    var Storage = require("../src/recurve-storage");
    var utils = require("../src/utils");

    describe("localStorage", spec(window.localStorage));
    describe("localStorage with cache", spec(window.localStorage, true));
    describe("localStorage with native not supported", spec(window.localStorage, false, true));

    describe("sessionStorage", spec(window.sessionStorage));
    describe("sessionStorage with cache", spec(window.sessionStorage, true));
    describe("sessionStorage with native not supported", spec(window.sessionStorage, false, true));

    function spec(provider, cache, disableNative) {
        return function() {
            var storage;

            beforeEach(function() {
                if (disableNative) {
                    provider = {
                        setItem: null,
                        removeItem: null
                    };
                }

                function createCache(isSupported) {
                    return !isSupported || cache ? new Cache() : null;
                }

                storage = new Storage(provider, createCache);
                storage.clear();
            });

            describe("get", function() {
                it("should return for existing key", function() {
                    if (disableNative) {
                        storage.set("a", "b");
                    }
                    else {
                        provider.setItem("a", "b");
                    }

                    expect(storage.get("a")).toEqual("b");
                });

                it("should return null for unknown key", function() {
                    expect(storage.get("a")).toEqual(null);
                });

                it("should return null for null key", function() {
                    expect(storage.get(null)).toEqual(null);
                });

                it("should return null for undefined key", function() {
                    expect(storage.get()).toEqual(null);
                });

                it("should return empty value", function() {
                    if (disableNative) {
                        storage.set("a", "");
                    }
                    else {
                        provider.setItem("a", "");
                    }

                    expect(storage.get("a")).toEqual("");
                });

                it("should parse json", function() {
                    if (disableNative) {
                        storage.set("a", utils.toJson({b:"c"}));
                    }
                    else {
                        provider.setItem("a", utils.toJson({b:"c"}));
                    }

                    expect(storage.get("a")).toEqual({b: "c"});
                });

                it("should return raw for malformed json", function() {
                    if (disableNative) {
                        storage.set("a", "{b:");
                    }
                    else {
                        provider.setItem("a", "{b:");
                    }

                    expect(storage.get("a")).toEqual("{b:");
                });

                it("should preserve leading and trailing spaces", function() {
                    if (disableNative) {
                        storage.set("a", " b ");
                    }
                    else {
                        provider.setItem("a", " b ");
                    }

                    expect(storage.get("a")).toEqual(" b ");
                });
            });

            describe("set", function() {
                it("should save", function() {
                    storage.set("a", "b");
                    expect(storage.get("a")).toEqual("b");
                });

                it("should save number", function() {
                    storage.set("a", 1);
                    expect(storage.get("a")).toEqual(1);
                });

                it("should save quoted string", function() {
                    storage.set("a", 'b\"');
                    expect(storage.get("a")).toEqual('b"');
                });

                it("should save object", function() {
                    storage.set("a", {b: "c"});
                    expect(storage.get("a")).toEqual({b: "c"});
                });

                it("should save special characters", function() {
                    storage.set("a", "$");
                    expect(storage.get("a")).toEqual("$");
                });

                it("should save empty value", function() {
                    storage.set("a", "");
                    expect(storage.get("a")).toEqual("");
                });

                it("should save null", function() {
                    storage.set("a", null);
                    expect(storage.get("a")).toEqual(null);
                });

                it("should save leading and trailing spaces", function() {
                    storage.set(" a ", " b ");
                    expect(storage.get(" a ")).toEqual(" b ");
                });
            });

            describe("remove", function() {
                it("should remove", function() {
                    storage.set("a", "b");
                    storage.remove("a");

                    if (disableNative) {
                        expect(storage.get("a")).toEqual(null);
                    }
                    else {
                        expect(provider.getItem("a")).toEqual(null);
                    }
                });

                it("should return true if exists", function() {
                    storage.set("a", "b");
                    expect(storage.remove("a")).toEqual(true);
                });

                it("should return false if doesn't exist", function() {
                    expect(storage.remove("a")).toEqual(false);
                });

                it("should not throw error for null key", function(){
                    storage.remove(null);
                });

                it("should not throw error for undefined key", function(){
                    storage.remove(undefined);
                });
            });

            describe("exists", function() {
                it("should return true if exists", function() {
                    storage.set("a", "b");
                    expect(storage.exists("a")).toEqual(true);
                });

                it("should return false if doesn't exist", function() {
                    expect(storage.exists("a")).toEqual(false);
                });

                it("should return false for null key", function() {
                    expect(storage.exists(null)).toEqual(false);
                });

                it("should return false for undefined key", function() {
                    expect(storage.exists(undefined)).toEqual(false);
                });
            });

            it("should clear all items", function() {
                storage.set("a", 1);
                storage.set("b", 2);
                storage.set("c", 3);

                storage.clear();

                if (disableNative) {
                    var callback = jasmine.createSpy("callback");
                    storage.forEach(callback);

                    expect(callback).not.toHaveBeenCalled();
                }
                else {
                    expect(provider.length).toEqual(0);
                }
            });

            describe("forEach", function() {
                it("should iterate all items", function() {
                    storage.set("a", 1);
                    storage.set("b", 2);

                    var expected = [["a", 1], ["b", 2]];

                    storage.forEach(function(value, name) {
                        var match = false;
                        for (var index = 0; index < expected.length; index++) {
                            var item = expected[index];
                            if (item[0] === name && item[1] === value) {
                                match = true;
                                break;
                            }
                        }

                        expect(match).toEqual(true);
                    });
                });

                it("should call iterator with context", function() {
                    storage.set("a", 1);

                    var context = null;
                    storage.forEach(function() {
                        context = this;
                    }, this);

                    expect(context).toBe(this);
                });
            });
        };
    }
});
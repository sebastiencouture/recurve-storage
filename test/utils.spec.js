describe("utils", function() {
    "use strict";

    var utils = require("../src/utils");

    describe("toJson", function(){
        it("should stringify objects", function(){
            var obj = {a: 1, b: 2};
            var json = utils.toJson(obj);

            expect(json).toEqual('{"a":1,"b":2}');
        });

        it("should stringify numbers", function(){
            expect(utils.toJson(1)).toEqual("1");
        });
    });

    describe("fromJson", function(){
        it("should parse string", function(){
            var str = '{"a":1,"b":2}';
            var obj = utils.fromJson(str);

            expect(obj).toEqual({a:1, b:2});
        });

        it("should return same value for number", function(){
            expect(utils.fromJson(1)).toEqual(1);
        });

        it("should return same value for array", function(){
            expect(utils.fromJson([1, 2])).toEqual([1, 2]);
        });

        it("should return same value for object", function(){
            expect(utils.fromJson({a:1, b:2})).toEqual({a:1, b:2});
        });

        it("should return null for null", function(){
            expect(utils.fromJson(null)).toEqual(null);
        });

        it("should return undefined for undefined", function(){
            expect(utils.fromJson(undefined)).toEqual(undefined);
        });

        it("should throw error for invalid string", function(){
            var str = "{a:b";
            expect(function(){
                utils.fromJson(str);
            }).toThrow(); // jshint ignore:line
        });
    });

    describe("isUndefined", function() {
        it("should detect undefined", function() {
            expect(utils.isUndefined(undefined)).toEqual(true);
        });

        it("should detect undefined as no argument", function() {
            expect(utils.isUndefined()).toEqual(true);
        });

        it("should not detect number", function() {
            expect(utils.isUndefined(0)).toEqual(false);
        });

        it("should not detect boolean", function() {
            expect(utils.isUndefined(false)).toEqual(false);

        });

        it("should not detect NaN", function() {
            expect(utils.isUndefined(NaN)).toEqual(false);
        });
    });

    describe("isString", function() {
        var string;

        it("should detect empty string", function() {
            string = "";
            expect(utils.isString(string)).toEqual(true);
        });

        it("should detect string", function() {
            string = "test string";
            expect(utils.isString(string)).toEqual(true);
        });

        it("should detect new String()", function() {
            string = new String("test string"); // jshint ignore:line
            expect(utils.isString(string)).toEqual(true);
        });

        it("should not detect numbers", function() {
            expect(utils.isString(123)).toEqual(false);
        });
    });

    describe("generateUUID", function(){
        it("should have form 'xxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx'", function(){
            expect(utils.generateUUID()).toMatch(/[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}/);
        });

        // Not much of a test :)
        it("should not produce identical UUIDs", function(){
            var a = utils.generateUUID();
            var b = utils.generateUUID();

            expect(a).not.toEqual(b);
        });
    });
});
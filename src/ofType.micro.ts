import {ofType} from "./ofType";
import {match} from "./match";

describe("ofType:", () => {
    describe("isUndefined", () => {
        it("is so", () => {
            expect(ofType.isUndefined(undefined), true);
        });
        it("is not so", () => {
            expect(ofType.isUndefined(null), false);
            expect(ofType.isUndefined(1), false);
            expect(ofType.isUndefined(true), false);
            expect(ofType.isUndefined("a"), false);
            expect(ofType.isUndefined(/a/), false);
            expect(ofType.isUndefined(Symbol()), false);
            expect(ofType.isUndefined({}), false);
            expect(ofType.isUndefined([]), false);
            expect(ofType.isUndefined(() => 4), false);
        });
    });

    describe("isDefined", () => {
        it("is not so", () => {
            expect(ofType.isDefined(undefined), false);
        });
        it("is so", () => {
            expect(ofType.isDefined(null), true);
            expect(ofType.isDefined(1), true);
            expect(ofType.isDefined(true), true);
            expect(ofType.isDefined("a"), true);
            expect(ofType.isDefined(/a/), true);
            expect(ofType.isDefined(Symbol()), true);
            expect(ofType.isDefined({}), true);
            expect(ofType.isDefined([]), true);
            expect(ofType.isDefined(() => 4), true);
        });
    });

    describe("isNull", () => {
        it("is so", () => {
            expect(ofType.isNull(null), true);
        });
        it("is not so", () => {
            expect(ofType.isNull(undefined), false);
            expect(ofType.isNull(1), false);
            expect(ofType.isNull(true), false);
            expect(ofType.isNull("a"), false);
            expect(ofType.isNull(/a/), false);
            expect(ofType.isNull(Symbol()), false);
            expect(ofType.isNull({}), false);
            expect(ofType.isNull([]), false);
            expect(ofType.isUndefined(() => 4), false);
        });
    });

    describe("isObject", () => {
        it("is so", () => {
            expect(ofType.isObject({}), true);
            expect(ofType.isObject({f: 3}), true);
        });
        it("is not so", () => {
            expect(ofType.isObject(undefined), false);
            expect(ofType.isObject(1), false);
            expect(ofType.isObject(true), false);
            expect(ofType.isObject("a"), false);
            expect(ofType.isObject(/a/), false);
            expect(ofType.isObject(Symbol()), false);
            expect(ofType.isObject(null), false);
            expect(ofType.isObject([]), false);
            expect(ofType.isUndefined(() => 4), false);
        });
    });

    describe("isArray", () => {
        it("is so", () => {
            expect(ofType.isArray([]), true);
            expect(ofType.isArray([1, 2]), true);
        });
        it("is not so", () => {
            expect(ofType.isArray(undefined), false);
            expect(ofType.isArray(1), false);
            expect(ofType.isArray(true), false);
            expect(ofType.isArray("a"), false);
            expect(ofType.isArray(/a/), false);
            expect(ofType.isArray(Symbol()), false);
            expect(ofType.isArray(null), false);
            expect(ofType.isArray({}), false);
            expect(ofType.isArray(() => 4), false);
        });
    });

    describe("isFunction", () => {
        it("is so", () => {
            expect(ofType.isFunction(() => 4), true);
            expect(ofType.isFunction((i, j) => 1), true);
        });
        it("is not so", () => {
            expect(ofType.isFunction(undefined), false);
            expect(ofType.isFunction(1), false);
            expect(ofType.isFunction(true), false);
            expect(ofType.isFunction("a"), false);
            expect(ofType.isFunction(/a/), false);
            expect(ofType.isFunction(Symbol()), false);
            expect(ofType.isFunction(null), false);
            expect(ofType.isFunction({}), false);
            expect(ofType.isFunction([1, 2]), false);
        });
    });

    describe("isString", () => {
        it("is so", () => {
            expect(ofType.isString(""), true);
            expect(ofType.isString("a"), true);
        });
        it("is not so", () => {
            expect(ofType.isString(undefined), false);
            expect(ofType.isString(1), false);
            expect(ofType.isString(true), false);
            expect(ofType.isString(Symbol()), false);
            expect(ofType.isString(null), false);
            expect(ofType.isString({}), false);
            expect(ofType.isString([1, 2]), false);
            expect(ofType.isString(/a/), false);
        });
    });

    describe("isNumber", () => {
        it("is so", () => {
            expect(ofType.isNumber(1), true);
            expect(ofType.isNumber(6.4159), true);
            expect(ofType.isNumber(NaN), true);
        });
        it("is not so", () => {
            expect(ofType.isNumber(undefined), false);
            expect(ofType.isNumber("a"), false);
            expect(ofType.isNumber(/a/), false);
            expect(ofType.isNumber(true), false);
            expect(ofType.isNumber(Symbol()), false);
            expect(ofType.isNumber(null), false);
            expect(ofType.isNumber({}), false);
            expect(ofType.isNumber([1, 2]), false);
        });
    });

    describe("isNaN", () => {
        it("is so", () => {
            expect(ofType.isNaN(NaN), true);
        });
        it("is not so", () => {
            expect(ofType.isNaN(0), false);
            expect(ofType.isNaN(0.0), false);
            expect(ofType.isNaN(undefined), false);
            expect(ofType.isNaN("a"), false);
            expect(ofType.isNaN(/a/), false);
            expect(ofType.isNaN(true), false);
            expect(ofType.isNaN(Symbol()), false);
            expect(ofType.isNaN(null), false);
            expect(ofType.isNaN({}), false);
            expect(ofType.isNaN([1, 2]), false);
        });
    });

    describe("isBoolean", () => {
        it("is so", () => {
            expect(ofType.isBoolean(true), true);
            expect(ofType.isBoolean(false), true);
        });
        it("is not so", () => {
            expect(ofType.isBoolean(undefined), false);
            expect(ofType.isBoolean("a"), false);
            expect(ofType.isBoolean(/a/), false);
            expect(ofType.isBoolean(12), false);
            expect(ofType.isBoolean(Symbol()), false);
            expect(ofType.isBoolean(null), false);
            expect(ofType.isBoolean({}), false);
            expect(ofType.isBoolean([1, 2]), false);
        });
    });

    describe("isRegExp", () => {
        it("is so", () => {
            expect(ofType.isRegExp(/a/), true);
            expect(ofType.isRegExp(/b/), true);
        });
        it("is not so", () => {
            expect(ofType.isRegExp(undefined), false);
            expect(ofType.isRegExp("a"), false);
            expect(ofType.isRegExp(true), false);
            expect(ofType.isRegExp(12), false);
            expect(ofType.isRegExp(Symbol()), false);
            expect(ofType.isRegExp(null), false);
            expect(ofType.isRegExp({}), false);
            expect(ofType.isRegExp([1, 2]), false);
        });
    });

    describe("isSymbol", () => {
        it("is so", () => {
            expect(ofType.isSymbol(Symbol()), true);
            expect(ofType.isSymbol(Symbol("a")), true);
        });
        it("is not so", () => {
            expect(ofType.isSymbol(undefined), false);
            expect(ofType.isSymbol("a"), false);
            expect(ofType.isSymbol(true), false);
            expect(ofType.isSymbol(12), false);
            expect(ofType.isSymbol(/a/), false);
            expect(ofType.isSymbol(null), false);
            expect(ofType.isSymbol({}), false);
            expect(ofType.isSymbol([1, 2]), false);
        });
    });

    describe("isMatcher", () => {
        it("is so", () => {
            expect(ofType.isMatcher(match.isEquals(1)), true);
            expect(ofType.isMatcher(match.obj.match({f: 3})), true);
        });
        it("is not so", () => {
            expect(ofType.isMatcher(undefined), false);
            expect(ofType.isMatcher("a"), false);
            expect(ofType.isMatcher(true), false);
            expect(ofType.isMatcher(12), false);
            expect(ofType.isMatcher(/a/), false);
            expect(ofType.isMatcher(null), false);
            expect(ofType.isMatcher({}), false);
            expect(ofType.isMatcher([1, 2]), false);
            expect(ofType.isMatcher(Symbol()), false);
        });
    });
});

function expect(actual, expected) {
    if (actual !== expected) {
        throw new Error(`Actual: ${actual} Expected: ${expected}`);
    }
}

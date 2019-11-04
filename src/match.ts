import {IsEqualsMatcher} from "./matcher/IsEqualsMatcher";
import {ArrayContainsMatcher, ArrayEveryMatcher, ArrayLengthMatcher, ArrayMatcher} from "./matcher/ArrayMatchers";
import {ObjectMatcher, ObjectSomeMatcher} from "./matcher/ObjectMatchers";
import {RegExpMatcher} from "./matcher/RegExpMatcher";
import {AnyOfMatcher} from "./matcher/AnyOfMatcher";
import {AllOfMatcher} from "./matcher/AllOfMatcher";
import {OptionalMatcher} from "./matcher/OptionalMatcher";
import {NotMatcher} from "./matcher/NotMatcher";
import {AnyMatcher} from "./matcher/AnyMatcher";
import {PredicateMatcher} from "./matcher/PredicateMatcher";
import {stringMatcher} from "./matcher/StringMatcher";
import {ofType} from "./ofType";
import {numberMatcher} from "./matcher/NumberMatcher";
import {instanceOfMatcher} from "./matcher/instanceOfMatcher";
import {ItMatcher} from "./matcher/ItMatcher";

export const match = {
    isEquals: IsEqualsMatcher.make,
    it: ItMatcher.make,
    array: {
        match: ArrayMatcher.make,
        contains: ArrayContainsMatcher.make,
        every: ArrayEveryMatcher.make,
        length: ArrayLengthMatcher.make
    },
    obj: {
        match: ObjectMatcher.make,
        has: ObjectSomeMatcher.make
    },
    string: {
        match: stringMatcher.match,
        startsWith: stringMatcher.startsWith,
        endsWith: stringMatcher.endsWith,
        includes: stringMatcher.includes
    },
    number: {
        nan: numberMatcher.nan,
        less: numberMatcher.less,
        lessEqual: numberMatcher.lessEqual,
        greater: numberMatcher.greater,
        greaterEqual: numberMatcher.greaterEqual
    },
    regEx: {
        match: RegExpMatcher.make
    },
    any: AnyMatcher.make,
    anyOf: AnyOfMatcher.make,
    allOf: AllOfMatcher.make,
    optional: OptionalMatcher.make,
    not: NotMatcher.make,
    instanceOf: instanceOfMatcher.instanceOf,
    ofType: {
        array: () => PredicateMatcher.make(ofType.isArray, "ofType.array"),
        function: () => PredicateMatcher.make(ofType.isFunction, "ofType.function"),
        string: () => PredicateMatcher.make(ofType.isString, "ofType.string"),
        number: () => PredicateMatcher.make(ofType.isNumber, "ofType.number"),
        boolean: () => PredicateMatcher.make(ofType.isBoolean, "ofType.boolean"),
        regExp: () => PredicateMatcher.make(ofType.isRegExp, "ofType.regExp"),
        symbol: () => PredicateMatcher.make(ofType.isSymbol, "ofType.symbol")
    },
    predicate: PredicateMatcher.make
};

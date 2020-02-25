import {IsEqualsMatcher} from "./matcher/IsEqualsMatcher";
import {ArrayMatcher} from "./matcher/ArrayMatcher";
import {ObjectMatcher} from "./matcher/ObjectMatcher";
import {RegExpMatcher} from "./matcher/RegExpMatcher";
import {AnyOfMatcher} from "./matcher/AnyOfMatcher";
import {AllOfMatcher} from "./matcher/AllOfMatcher";
import {OptionalMatcher} from "./matcher/OptionalMatcher";
import {NotMatcher} from "./matcher/NotMatcher";
import {AnyMatcher} from "./matcher/AnyMatcher";
import {PredicateMatcher} from "./matcher/PredicateMatcher";
import {StringMatcher, stringMatcher} from "./matcher/StringMatcher";
import {ofType} from "./ofType";
import {numberMatcher} from "./matcher/NumberMatcher";
import {instanceOfMatcher} from "./matcher/instanceOfMatcher";
import {ItIsMatcher} from "./matcher/ItIsMatcher";
import {MappedMatcher} from "./matcher/MappedMatcher";
import {DiffMatcher} from "./matcher/DiffMatcher";
import {ObjectSomeMatcher} from "./matcher/ObjectSomeMatcher";
import {ArrayContainsMatcher} from "./matcher/ArrayContainsMatcher";
import {ArrayEveryMatcher} from "./matcher/ArrayEveryMatcher";
import {ArrayLengthMatcher} from "./matcher/ArrayLengthMatcher";
import {PrettyPrinter} from "./prettyPrint/PrettyPrinter";

export const match = {
    isEquals: (expected: any) => IsEqualsMatcher.make(expected),
    itIs: (expected: any) => ItIsMatcher.make(expected),
    array: {
        match: (expected: Array<DiffMatcher<any> | any>) => ArrayMatcher.make(expected),
        contains: (expected: DiffMatcher<any> | any) => ArrayContainsMatcher.make(expected),
        every: (expected: DiffMatcher<any> | any) => ArrayEveryMatcher.make(expected),
        length: (expected: number) => ArrayLengthMatcher.make(expected)
    },
    obj: {
        match: (obj: object) => ObjectMatcher.make(obj),
        has: (expected: Array<DiffMatcher<any>> | object) => ObjectSomeMatcher.make(expected),
    },
    string: {
        match: (expected: string) => StringMatcher.make(expected),
        startsWith: (expected: string) => stringMatcher.startsWith(expected),
        endsWith: (expected: string) => stringMatcher.endsWith(expected),
        includes: (expected: string) => stringMatcher.includes(expected)
    },
    number: {
        nan: () => numberMatcher.nan(),
        less: (expected: number) => numberMatcher.less(expected),
        lessEqual: (expected: number) => numberMatcher.lessEqual(expected),
        greater: (expected: number) => numberMatcher.greater(expected),
        greaterEqual: (expected: number) => numberMatcher.greaterEqual(expected)
    },
    regEx: {
        match: (expected: RegExp) => RegExpMatcher.make(expected)
    },
    any: () => AnyMatcher.make(),
    anyOf: (matchers: Array<DiffMatcher<any> | any>) => AnyOfMatcher.make(matchers),
    allOf: (matchers: Array<DiffMatcher<any> | any>) => AllOfMatcher.make(matchers),
    optional: (matcher: DiffMatcher<any> | any) => OptionalMatcher.make(matcher),
    not: (matcher: DiffMatcher<any> | any) => NotMatcher.make(matcher),
    instanceOf: (expected: Function) => instanceOfMatcher.instanceOf(expected),
    ofType: {
        object: () => PredicateMatcher.make(ofType.isObject, "ofType.object"),
        array: () => PredicateMatcher.make(ofType.isArray, "ofType.array"),
        function: () => PredicateMatcher.make(ofType.isFunction, "ofType.function"),
        string: () => PredicateMatcher.make(ofType.isString, "ofType.string"),
        number: () => PredicateMatcher.make(ofType.isNumber, "ofType.number"),
        boolean: () => PredicateMatcher.make(ofType.isBoolean, "ofType.boolean"),
        regExp: () => PredicateMatcher.make(ofType.isRegExp, "ofType.regExp"),
        symbol: () => PredicateMatcher.make(ofType.isSymbol, "ofType.symbol")
    },
    predicate: (predicate: (v: any) => boolean,
                description: any = {predicateFailed:PrettyPrinter.functionDetails(predicate)}) =>
        PredicateMatcher.make(predicate, description),
    mapped: (map: (t: any) => any, matcher: DiffMatcher<any> | any, description: any) =>
        MappedMatcher.make(map, matcher, description)
};

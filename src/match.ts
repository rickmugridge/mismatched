import {IsEqualsMatcher} from "./matcher/IsEqualsMatcher";
import {ObjectMatcher} from "./matcher/ObjectMatcher";
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
import {ItIsMatcher} from "./matcher/ItIsMatcher";
import {MappedMatcher} from "./matcher/MappedMatcher";
import {ObjectSomeMatcher} from "./matcher/ObjectSomeMatcher";
import {ArrayContainsMatcher} from "./matcher/ArrayContainsMatcher";
import {ArrayEveryMatcher} from "./matcher/ArrayEveryMatcher";
import {ArrayLengthMatcher} from "./matcher/ArrayLengthMatcher";
import {PrettyPrinter} from "./prettyPrint/PrettyPrinter";
import {DiffMatcher} from "./matcher/DiffMatcher";
import {OptionalNullMatcher} from "./matcher/OptionalNullMatcher";
import {SetMatcher} from "./matcher/SetMatcher";
import {BindMatcher} from "./matcher/BindMatcher";
import {DescribeMatcher} from "./matcher/DescribeMatcher";
import {DescribeContextMatcher} from "./matcher/DescribeContextMatcher";
import {UnorderedArrayMatcher} from "./matcher/UnorderedArrayMatcher";
import {identifySources} from "./identifySources/identifySources";
import {ObjectKeyMatcher} from "./matcher/ObjectKeyMatcher";
import {dateMatcher} from "./matcher/DateMatcher";
import {enumFixer} from "./identifySources/enumFixer";
import {SelectMatcher} from "./matcher/SelectMatch";
import {ExactlyOneOfMatcher} from "./matcher/ExactlyOneOfMatcher"
import {ArrayMatcher} from "./matcher/ArrayMatcher"
import {OptionalRecursiveMatcher} from "./matcher/OptionalRecursiveMatcher"
import {ArrayEveryRecursiveMatcher, recursiveDelay} from "./matcher/ArrayEveryRecursiveMatcher"
import {PreviewMatcher} from "./matcher/PreviewMatcher"

export const match = {
    isEquals: (expected: any) => IsEqualsMatcher.make(expected),
    itIs: (expected: any) => ItIsMatcher.make(expected),
    array: {
        match: (expected: Array<DiffMatcher<any> | any>) => ArrayMatcher.make(expected),
        contains: (expected: DiffMatcher<any> | any) => ArrayContainsMatcher.make(expected),
        every: (expected: DiffMatcher<any> | any) => ArrayEveryMatcher.make(expected),
        everyRecursive: (expected: () => DiffMatcher<any> | any) => ArrayEveryRecursiveMatcher.make(expected),
        length: (expected: number) => ArrayLengthMatcher.make(expected),
        unordered: (expected: Array<DiffMatcher<any> | any>) => UnorderedArrayMatcher.make(expected),
        unorderedContains: (expected: Array<DiffMatcher<any> | any>) => UnorderedArrayMatcher.make(expected, true),
    },
    aSet: {
        match: (expected: Set<DiffMatcher<any>> | Set<any> | Array<any> | Map<any, any>) => SetMatcher.make(expected),
        subset: (expected: Set<DiffMatcher<any>> | Set<any> | Array<any> | Map<any, any>) => SetMatcher.make(expected, true),
    },
    obj: {
        match: (expected: object) => ObjectMatcher.make(expected),
        has: (expected: object) => ObjectSomeMatcher.make(expected),
        key: (expected: any) => ObjectKeyMatcher.make(expected)
    },
    string: {
        match: (expected: string | RegExp) => stringMatcher.match(expected),
        startsWith: (expected: string) => stringMatcher.startsWith(expected),
        endsWith: (expected: string) => stringMatcher.endsWith(expected),
        includes: (expected: string) => stringMatcher.includes(expected),
        asDate: (matcher: Date | any) => stringMatcher.asDate(matcher),
        nonEmpty: () => stringMatcher.nonEmpty(),
        asSplit: (separator: string, expected: string[] | any) => stringMatcher.asSplit(separator, expected),
        asNumber: (expected: number = AnyMatcher.make()) => stringMatcher.asNumber(expected),
        asDecimal: (places: number, expected: number = AnyMatcher.make()) => stringMatcher.asDecimal(places, expected),
        fromJson: (expected: any = AnyMatcher.make()) => stringMatcher.fromJson(expected),
    },
    uuid: () => stringMatcher.uuid(),
    number: {
        nan: () => numberMatcher.nan(),
        less: (expected: number) => numberMatcher.less(expected),
        lessEqual: (expected: number) => numberMatcher.lessEqual(expected),
        greater: (expected: number) => numberMatcher.greater(expected),
        greaterEqual: (expected: number) => numberMatcher.greaterEqual(expected),
        withinDelta: (expected: number, delta: number) => numberMatcher.withinDelta(expected, delta),
        inRange: (lower: number, upper: number) => numberMatcher.inRange(lower, upper),
    },
    regEx: {
        match: (expected: RegExp) => RegExpMatcher.make(expected)
    },
    date: {
        before: (expected: Date) => dateMatcher.before(expected),
        after: (expected: Date) => dateMatcher.after(expected),
    },
    any: () => AnyMatcher.make(),
    anyOf: (matchers: Array<DiffMatcher<any> | any>) => AnyOfMatcher.make(matchers),
    exactlyOneOf: (matchers: Array<DiffMatcher<any> | any>) => ExactlyOneOfMatcher.make(matchers),
    allOf: (matchers: Array<DiffMatcher<any> | any>) => AllOfMatcher.make(matchers),
    optional: (matcher: DiffMatcher<any> | any) => OptionalMatcher.make(matcher),
    optionalRecursive: (matcher: () => DiffMatcher<any> | any) => OptionalRecursiveMatcher.make(matcher),
    optionalNull: (matcher: DiffMatcher<any> | any) => OptionalNullMatcher.make(matcher),
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
        symbol: () => PredicateMatcher.make(ofType.isSymbol, "ofType.symbol"),
        date: () => PredicateMatcher.make(ofType.isDate, "ofType.date"),
        enum: (enumeration: any, enumName: string = 'enum') => match.predicate(v =>
            !!enumFixer.valuesOf(enumeration).find(e => e === v), enumName)
    },
    predicate: (predicate: (v: any) => boolean,
                description: any = {predicateFailed: PrettyPrinter.functionDetails(predicate)}) =>
        PredicateMatcher.make(predicate, description),
    mapped: <T, U>(map: (t: T) => U, matcher: DiffMatcher<U> | any, description: any) =>
        MappedMatcher.make(map, matcher, description),
    bind: (matcher?: DiffMatcher<any> | any) => BindMatcher.make(matcher),
    describeContext: (describeContext: (outerContext: string, actual: any) => string, matcher: DiffMatcher<any> | any) =>
        DescribeContextMatcher.make(describeContext, matcher),
    describe: (matcher: DiffMatcher<any> | any, description: (actual: any, context: string) => string) =>
        DescribeMatcher.make(matcher, description),
    identifySources: (actual: any, contributors: object, enums: object = {}): any =>
        identifySources(actual, contributors, enums),
    selectMatch: <T>(selector: (t: T) => T): T => SelectMatcher.make(selector),
    delay: <T>(fn: () => T): () => T => recursiveDelay(fn),
    preview: <T>(matcher: T): T => PreviewMatcher.make(matcher),
}

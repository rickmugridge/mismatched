import {DiffMatcher} from "../matcher/DiffMatcher";
import {ObjectMatcher} from "../matcher/ObjectMatcher";
import {ofType} from "../ofType";
import {IsEqualsMatcher} from "../matcher/IsEqualsMatcher";
import {ArrayMatcher} from "../matcher/ArrayMatcher";
import {RegExpMatcher} from "../matcher/RegExpMatcher";
import {StringMatcher} from "../matcher/StringMatcher";
import {numberMatcher} from "../matcher/NumberMatcher";
import {ErrorMatcher} from "../matcher/ErrorMatcher";
import {PrettyPrinter} from "../prettyPrint/PrettyPrinter";
import {AnyMatcher} from "../matcher/AnyMatcher";
import {CustomiseMismatcher} from "./CustomiseMismatcher";
import {SetMatcher} from "../matcher/SetMatcher";

export function matchMaker(expected: DiffMatcher<any> | any): DiffMatcher<any> {
    if (ofType.isMatcher(expected)) {
        return expected;
    }
    if (ofType.isString(expected)) {
        return StringMatcher.make(expected);
    }
    if (ofType.isNaN(expected)) { // Need to check before isNumber()
        return numberMatcher.nan();
    }
    if (ofType.isUndefined(expected) || ofType.isNull(expected) || ofType.isNumber(expected) ||
        ofType.isBoolean(expected) || ofType.isSymbol(expected)) {
        return IsEqualsMatcher.make(expected);
    }
    if (ofType.isArray(expected)) {
        return ArrayMatcher.make(expected.map(matchMaker))
    }
    if (PrettyPrinter.isMock(expected)) {
        return IsEqualsMatcher.make(expected);
    }
    if (ofType.isFunction(expected)) {
        return AnyMatcher.make();
    }
    if (ofType.isError(expected)) {
        return ErrorMatcher.make(IsEqualsMatcher.make(expected.message));
    }
    if (ofType.isSet(expected)) {
        return SetMatcher.make(expected);
    }
    if (ofType.isMap(expected)) {
        return SetMatcher.make(expected);
    }
    if (ofType.isObject(expected)) {
        const matcher = CustomiseMismatcher.customMatcherWhenToUses
            .find(matcher => matcher.matches(expected).passed());
        if (matcher) {
            return CustomiseMismatcher.customMatchers.get(matcher)!(expected);
        }
        return ObjectMatcher.make(expected);
    }
    if (ofType.isRegExp(expected)) {
        return RegExpMatcher.make(expected);
    }
    return IsEqualsMatcher.make(expected);
}

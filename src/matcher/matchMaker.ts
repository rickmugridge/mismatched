import {DiffMatcher} from "./DiffMatcher";
import {ObjectMatcher} from "./ObjectMatcher";
import {ofType} from "../ofType";
import {IsEqualsMatcher} from "./IsEqualsMatcher";
import {ArrayMatcher} from "./ArrayMatcher";
import {RegExpMatcher} from "./RegExpMatcher";
import {StringMatcher} from "./StringMatcher";
import {numberMatcher} from "./NumberMatcher";
import {ErrorMatcher} from "./ErrorMatcher";
import {PrettyPrinter} from "../prettyPrint/PrettyPrinter";
import {AnyMatcher} from "./AnyMatcher";

export function matchMaker(v: DiffMatcher<any> | any): DiffMatcher<any> {
    if (ofType.isMatcher(v)) {
        return v;
    }
    if (ofType.isString(v)) {
        return StringMatcher.make(v);
    }
    if (ofType.isNaN(v)) { // Need to check before isNumber()
        return numberMatcher.nan();
    }
    if (ofType.isUndefined(v) || ofType.isNull(v) || ofType.isNumber(v) ||
        ofType.isBoolean(v) || ofType.isSymbol(v)) {
        return IsEqualsMatcher.make(v);
    }
    if (ofType.isArray(v)) {
        return ArrayMatcher.make(v.map(matchMaker))
    }
    if (PrettyPrinter.isMock(v)) {
        return IsEqualsMatcher.make(v);
    }
    if (ofType.isFunction(v)) {
        return AnyMatcher.make();
    }
    if (ofType.isError(v)) {
        return ErrorMatcher.make(IsEqualsMatcher.make(v.message));
    }
    if (ofType.isObject(v)) {
        return ObjectMatcher.make(v);
    }
    if (ofType.isRegExp(v)) {
        return RegExpMatcher.make(v);
    }
    return IsEqualsMatcher.make(v);
}


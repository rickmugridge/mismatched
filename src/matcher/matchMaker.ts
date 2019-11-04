import {DiffMatcher} from "./DiffMatcher";
import {DiffFieldMatcher, ObjectMatcher} from "./ObjectMatchers";
import {ofType} from "../ofType";
import {IsEqualsMatcher} from "./IsEqualsMatcher";
import {ArrayMatcher} from "./ArrayMatchers";
import {RegExpMatcher} from "./RegExpMatcher";
import {StringMatcher} from "./StringMatcher";
import {PredicateMatcher} from "./PredicateMatcher";
import {numberMatcher} from "./NumberMatcher";

export function matchMaker(v: DiffMatcher<any> | any): DiffMatcher<any> {
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
    if (ofType.isMatcher(v)) {
        return v;
    }
    if (ofType.isArray(v)) {
        return ArrayMatcher.make(v.map(matchMaker))
    }
    if (ofType.isFunction(v)) {
        let predicateDescription = v.name === "" ? "a Function" : v.name + "()";
        return PredicateMatcher.make(v, predicateDescription)
    }
    if (ofType.isObject(v)) {
        return makeObjectMatcher(v);
    }
    if (ofType.isRegExp(v)) {
        return RegExpMatcher.make(v);
    }
    return IsEqualsMatcher.make(v);
}

function makeObjectMatcher(obj: object): DiffMatcher<any> {
    const fieldMatchers = Object.keys(obj).map(key => new DiffFieldMatcher(key, matchMaker(obj[key])));
    return ObjectMatcher.make(fieldMatchers);
}

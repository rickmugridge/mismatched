import {ContextOfValidationError, DiffMatcher} from "../matcher/DiffMatcher";
import {ObjectMatcher} from "../matcher/ObjectMatcher";
import {ofType} from "../ofType";
import {IsEqualsMatcher} from "../matcher/IsEqualsMatcher";
import {RegExpMatcher} from "../matcher/RegExpMatcher";
import {StringMatcher} from "../matcher/StringMatcher";
import {numberMatcher} from "../matcher/NumberMatcher";
import {ErrorMatcher} from "../matcher/ErrorMatcher";
import {PrettyPrinter} from "../prettyPrint/PrettyPrinter";
import {AnyMatcher} from "../matcher/AnyMatcher";
import {CustomiseMismatcher} from "./CustomiseMismatcher";
import {SetMatcher} from "../matcher/SetMatcher";
import {Mismatched} from "../matcher/Mismatched";
import {MatchResult} from "../MatchResult";
import {DateMatcher} from "../matcher/DateMatcher";
import {ToBeUnquotedMatcher} from "../matcher/ToBeUnquotedMatcher";
import {ItIsMatcher} from "../matcher/ItIsMatcher"
import {ArrayMatcher} from "../matcher/ArrayMatcher"

let level = 0
const references: Set<any> = new Set()
const selfReferences: Map<any, SelfReferenceMatcher<any>> = new Map()

export function matchMaker(expected: DiffMatcher<any> | any): DiffMatcher<any> {
    const existingSelfRef = selfReferences.get(expected);
    if (existingSelfRef) {
        return existingSelfRef
    }
    if (references.has(expected)) {
        const selfReferenceMatcher = SelfReferenceMatcher.make();
        selfReferences.set(expected, selfReferenceMatcher)
        return selfReferenceMatcher
    }
    level += 1
    try {
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
            references.add(expected)
            try {
                const arrayMatcher = ArrayMatcher.make(expected.map(matchMaker));
                const selfRef = selfReferences.get(expected)
                if (selfRef) {
                    selfRef.matcher = arrayMatcher
                    return selfRef
                }
                return arrayMatcher
            } finally {
                references.delete(expected)
            }
        }
        if (PrettyPrinter.isMock(expected)) {
            return ItIsMatcher.make(expected);
        }
        if (ofType.isFunction(expected)) {
            if (level === 1) {
                throw new Error(`Unable to match against function "${expected.name}()" at the top level (functions are otherwise ignored in matching objects)`)
            }
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
        if (ofType.isDate(expected)) {
            return DateMatcher.make(expected);
        }
        if (ofType.isObject(expected)) {
            if (ofType.isString(expected[PrettyPrinter.symbolForPseudoCall])) {
                return ToBeUnquotedMatcher.make(expected[PrettyPrinter.symbolForPseudoCall])
            }
            const matcher = CustomiseMismatcher.customMatcherWhenToUses
                .find(matcher => matcher.matches(expected).passed());
            if (matcher) {
                return CustomiseMismatcher.customMatchers.get(matcher)!(expected);
            }
            references.add(expected)
            try {
                const objectMatcher = ObjectMatcher.make(expected);
                const selfRef = selfReferences.get(expected)
                if (selfRef) {
                    selfRef.matcher = objectMatcher
                    return selfRef
                }
                return objectMatcher;
            } finally {
                references.delete(expected)
            }
        }
        if (ofType.isRegExp(expected)) {
            return RegExpMatcher.make(expected);
        }
        return IsEqualsMatcher.make(expected);
    } finally {
        level -= 1
        if (level === 0) {
            references.clear()
            selfReferences.clear()
        }
    }
}

class SelfReferenceMatcher<T> extends DiffMatcher<T> {
    boundValue: T | undefined = undefined
    matcher: DiffMatcher<T>

    private constructor() {
        super();
        this.specificity = 1000 // Want if high so that we apply it as early as possible
    }

    static make<T>(): any {
        return new SelfReferenceMatcher()
    }

    mismatches(context: ContextOfValidationError, mismatched: string[], actual: T): MatchResult {
        if (this.boundValue === undefined) {
            this.boundValue = actual
            const matchResult = this.matcher.matches(actual);
            if (matchResult.passed()) {
                return MatchResult.good(1);
            }
            mismatched.push(Mismatched.makeExpectedMessage(context, actual, this.describe()));
            return MatchResult.wasExpected(actual, this.describe(), 1, 0);
        } else {
            if (this.boundValue === actual) {
                return MatchResult.good(1);
            } else {
                mismatched.push(Mismatched.makeExpectedMessage(context, actual, this.describe()));
                return MatchResult.wasExpected(actual, this.describe(), 1, 0);
            }
        }
    }

    describe(): any {
        if (this.boundValue) {
            return {selfRefTo: this.boundValue};
        }
        return {selfRefTo: undefined};
    }

}


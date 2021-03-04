import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {MatchResult} from "../MatchResult";
import {ofType} from "../ofType";
import {PredicateMatcher} from "./PredicateMatcher";
import {Mismatched} from "./Mismatched";
import {RegExpMatcher} from "./RegExpMatcher";
import {stringDiff} from "../diff/StringDiff";

const minimum = 10

export class StringMatcher extends DiffMatcher<string> {
    private constructor(private expected: string) {
        super();
    }

    static make(expected: string): any {
        return new StringMatcher(expected);
    }

    mismatches(context: ContextOfValidationError, mismatched: Array<Mismatched>, actual: any): MatchResult {
        if (ofType.isString(actual)) {
            if (actual == this.expected) {
                return MatchResult.good(1);
            }
        }
        mismatched.push(Mismatched.make(context, actual, this.describe()));
        const matchResult = MatchResult.wasExpected(actual, this.describe(), 1, 0);
        if (ofType.isString(actual)) {
            if (actual.length > 0 && this.expected.length > 0 &&
                (actual.length > minimum || this.expected.length > minimum)) {
                matchResult.differ(stringDiff(this.expected, actual))
            }
        }
        return matchResult;
    }

    describe(): any {
        return this.expected;
    }
}

export const stringMatcher = {
    match: (expected: string | RegExp) =>
        ofType.isString(expected) ? StringMatcher.make(expected as string) : RegExpMatcher.make(expected as RegExp),
    startsWith: (expected: string) => PredicateMatcher.make(value =>
        ofType.isString(value) && value.startsWith(expected),
        {"string.startsWith": expected}),
    endsWith: (expected: string) => PredicateMatcher.make(value =>
        ofType.isString(value) && value.endsWith(expected),
        {"string.endsWith": expected}),
    includes: (expected: string) => PredicateMatcher.make(value =>
        ofType.isString(value) && value.includes(expected),
        {"string.includes": expected}),

};
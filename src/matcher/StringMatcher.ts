import {DiffMatcher, ContextOfValidationError} from "./DiffMatcher";
import {MatchResult} from "../MatchResult";
import {ofType} from "../ofType";
import {PredicateMatcher} from "./PredicateMatcher";
import {Mismatched} from "./Mismatched";
import {isString} from "util";

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
            // todo a diff using StringDiff
        }
        mismatched.push(Mismatched.make(context, actual, this.describe()));
        return MatchResult.wasExpected(actual, this.describe(), 1, 0);
    }

    describe(): any {
        return this.expected;
    }
}

export const stringMatcher = {
    match: (expected: string) => StringMatcher.make(expected),
    startsWith: (expected: string) => PredicateMatcher.make(value =>
        isString(value) && value.startsWith(expected),
        {"string.startsWith": expected}),
    endsWith: (expected: string) => PredicateMatcher.make(value =>
        isString(value) && value.endsWith(expected),
        {"string.endsWith": expected}),
    includes: (expected: string) => PredicateMatcher.make(value =>
        isString(value) && value.includes(expected),
        {"string.includes": expected}),

};
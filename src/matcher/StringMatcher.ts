import {DiffMatcher} from "./DiffMatcher";
import {MatchResult} from "../MatchResult";
import {ofType} from "../ofType";
import {PredicateMatcher} from "./PredicateMatcher";
import {Mismatch} from "./Mismatch";

export class StringMatcher extends DiffMatcher<string> {
    private constructor(private expected: string) {
        super();
    }

    mismatches(context: string, mismatched: Array<Mismatch>, actual: any): MatchResult {
        if (ofType.isString(actual)) {
            if (actual == this.expected) {
                return MatchResult.good(1);
            }
            // todo a diff using StringDiff
        }
        mismatched.push(Mismatch.make(context, actual, this.describe()));
        return MatchResult.wasExpected(actual, this.describe(), 1, 0);
    }

    describe(): any {
        return this.expected;
    }

    static make(expected: string): any {
        return new StringMatcher(expected);
    }
}

export const stringMatcher = {
    match: (expected: string) => StringMatcher.make(expected),
    startsWith: (expected: string) => PredicateMatcher.make(value => value.startsWith(expected),
        {"string.startsWith": expected}),
    endsWith: (expected: string) => PredicateMatcher.make(value => value.endsWith(expected),
        {"string.endsWith": expected}),
    includes: (expected: string) => PredicateMatcher.make(value => value.includes(expected),
        {"string.includes": expected}),

};
import {DiffMatcher} from "./DiffMatcher";
import {MatchResult} from "../MatchResult";
import {ofType} from "../ofType";
import {PredicateMatcher} from "./PredicateMatcher";

export class StringMatcher implements DiffMatcher<string> {
    constructor(private expected: string) {
    }

    matches(actual: any): MatchResult {
        if (ofType.isString(actual)) {
            if (actual == this.expected) {
                return MatchResult.good(1);
            }
            // todo a diff using StringDiff
        }
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
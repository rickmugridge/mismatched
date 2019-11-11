import {DiffMatcher} from "./DiffMatcher";
import {ofType} from "../ofType";
import {MatchResult} from "../MatchResult";

export class RegExpMatcher implements DiffMatcher<any> {
    constructor(private expected: RegExp) {
    }

    matches(actual: any): MatchResult {
        if (ofType.isRegExp(actual) && actual.toString() === this.expected.toString()) {
            return MatchResult.good(1);
        }
        if (ofType.isString(actual) && actual.match(this.expected)) {
            return MatchResult.good(1);
        }
        return MatchResult.wasExpected(actual, this.describe(), 1, 0);
    }

    describe(): any {
        return MatchResult.describe(this.expected.toString());
    }

    static make(expected: RegExp): any {
        return new RegExpMatcher(expected);
    }
}
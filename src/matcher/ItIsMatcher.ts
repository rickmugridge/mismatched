import {DiffMatcher} from "./DiffMatcher";
import {MatchResult} from "../MatchResult";

export class ItIsMatcher implements DiffMatcher<any> {
    constructor(private expected: any) {
    }

    matches(actual: any): MatchResult {
        if (actual === this.expected) {
            return MatchResult.good(1);
        }
        return MatchResult.wasExpected(actual, this.describe(), 1, 0);
    }

    describe(): any {
        return {itIsTheSameObjectAs: MatchResult.describe(this.expected)};
    }

    static make(expected: any) {
        return new ItIsMatcher(expected);
    }
}

import {DiffMatcher} from "./DiffMatcher";
import {MatchResult} from "../MatchResult";

export class IsEqualsMatcher extends DiffMatcher<any> {
    constructor(private expected: any) {
        super();
    }

    matches(actual: any): MatchResult {
        if (actual === this.expected) {
            return MatchResult.good(1);
        }
        return MatchResult.wasExpected(actual, this.describe(), 1, 0);
    }

    describe(): any {
        return MatchResult.describe(this.expected);
    }

    static make(expected: any): any {
        return new IsEqualsMatcher(expected);
    }
}

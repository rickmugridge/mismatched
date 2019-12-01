import {DiffMatcher} from "./DiffMatcher";
import {MatchResult} from "../MatchResult";
import {Mismatch} from "./Mismatch";

export class IsEqualsMatcher extends DiffMatcher<any> {
    private constructor(private expected: any) {
        super();
    }

    mismatches(context: string, mismatched: Array<Mismatch>,actual: any): MatchResult {
        if (actual === this.expected) {
            return MatchResult.good(1);
        }
        mismatched.push(Mismatch.make(context, actual, this.describe()));
        return MatchResult.wasExpected(actual, this.describe(), 1, 0);
    }

    describe(): any {
        return MatchResult.describe(this.expected);
    }

    static make(expected: any): any {
        return new IsEqualsMatcher(expected);
    }
}

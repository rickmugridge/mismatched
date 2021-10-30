import {DiffMatcher, ContextOfValidationError} from "./DiffMatcher";
import {MatchResult} from "../MatchResult";
import {Mismatched} from "./Mismatched";

export class IsEqualsMatcher extends DiffMatcher<any> {
    private constructor(private expected: any) {
        super();
    }

    mismatches(context: ContextOfValidationError, mismatched: Array<Mismatched>, actual: any): MatchResult {
        if (actual === this.expected) {
            return MatchResult.good(1);
        }
        mismatched.push(Mismatched.makeExpectedMessage(context, actual, this.describe()));
        return MatchResult.wasExpected(actual, this.describe(), 1, 0);
    }

    describe(): any {
        return MatchResult.describe(this.expected);
    }

    static make(expected: any): any {
        return new IsEqualsMatcher(expected);
    }
}

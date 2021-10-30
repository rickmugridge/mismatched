import {DiffMatcher, ContextOfValidationError} from "./DiffMatcher";
import {ofType} from "../ofType";
import {MatchResult} from "../MatchResult";
import {Mismatched} from "./Mismatched";

export class RegExpMatcher extends DiffMatcher<any> {
    private constructor(private expected: RegExp) {
        super();
    }

    mismatches(context: ContextOfValidationError, mismatched: Array<Mismatched>, actual: any): MatchResult {
        if (ofType.isRegExp(actual) && actual.toString() === this.expected.toString()) {
            return MatchResult.good(1);
        }
        if (ofType.isString(actual) && actual.match(this.expected)) {
            return MatchResult.good(1);
        }
        mismatched.push(Mismatched.makeExpectedMessage(context, actual, this.describe()));
        return MatchResult.wasExpected(actual, this.describe(), 1, 0);
    }

    describe(): any {
        return MatchResult.describe(this.expected.toString());
    }

    static make(expected: RegExp): any {
        return new RegExpMatcher(expected);
    }
}
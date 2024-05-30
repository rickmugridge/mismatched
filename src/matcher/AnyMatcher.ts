import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {MatchResult} from "../MatchResult";

export class AnyMatcher<T> extends DiffMatcher<T> {
    specificity = 0

    static make<T>(): any {
        return new AnyMatcher();
    }

    mismatches(context: ContextOfValidationError, mismatched: Array<string>, actual: T): MatchResult {
        return MatchResult.wasExpected(actual, this.describe(), 1, 1);
    }

    describe(): any {
        return "any";
    }
}

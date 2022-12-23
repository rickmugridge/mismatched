import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {MatchResult} from "../MatchResult";
import {Mismatched} from "./Mismatched";

export class AnyMatcher<T> extends DiffMatcher<T> {
    specificity = 0

    static make<T>(): any {
        return new AnyMatcher();
    }

    mismatches(context: ContextOfValidationError, mismatched: Array<Mismatched>, actual: T): MatchResult {
        return MatchResult.wasExpected(actual, this.describe(), 1, 1);
    }

    describe(): any {
        return "any";
    }
}

import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {matchMaker} from "../matchMaker/matchMaker";
import {Mismatched} from "./Mismatched";
import {MatchResult} from "../MatchResult";

export class ObjectKeyMatcher<T> extends DiffMatcher<T> {
    private constructor(private readonly expectedKey: DiffMatcher<T>) {
        super();
        this.specificity = expectedKey.specificity + 5 // Encourage this
    }

    static make(expected: any): any {
        return new ObjectKeyMatcher<any>(matchMaker(expected));
    }

    describe(): any {
        return this.expectedKey.describe();
    }

    mismatches(context: ContextOfValidationError, mismatched: Array<Mismatched>, actual: T): MatchResult {
        return this.expectedKey.mismatches(context, mismatched, actual);
    }
}
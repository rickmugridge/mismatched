import {DiffMatcher} from "./DiffMatcher";
import {MatchResult} from "../MatchResult";
import {Mismatch} from "./Mismatch";

export class AnyMatcher<T> extends DiffMatcher<T> {
    mismatches(context: string, mismatched: Array<Mismatch>, actual: T): MatchResult {
        return MatchResult.wasExpected(actual, this.describe(), 1, 1);
    }

    describe(): any {
        return "any";
    }

    static make<T>(): any {
        return new AnyMatcher();
    }
}

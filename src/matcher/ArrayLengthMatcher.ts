import {DiffMatcher} from "./DiffMatcher";
import {Mismatched} from "./Mismatched";
import {MatchResult} from "../MatchResult";

export class ArrayLengthMatcher<T> extends DiffMatcher<Array<T>> {
    private constructor(private expected: number) {
        super();
    }

    mismatches(context: string, mismatched: Array<Mismatched>, actual: Array<T>): MatchResult {
        if (actual.length === this.expected) {
            return MatchResult.good(1);
        }
        mismatched.push(Mismatched.make(context, actual, this.describe()));
        return MatchResult.wasExpected(actual.length, this.describe(), 1, 0);
    }

    describe(): any {
        return {"array.length": this.expected};
    }

    static make<T>(expected: number): any {
        return new ArrayLengthMatcher<T>(expected);
    }
}

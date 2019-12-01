import {DiffMatcher} from "./DiffMatcher";
import {Mismatch} from "./Mismatch";
import {MatchResult} from "../MatchResult";
import {isArray} from "util";
import {matchMaker} from "./matchMaker";

export class ArrayContainsMatcher<T> extends DiffMatcher<Array<T>> {
    private constructor(private expected: DiffMatcher<T>) {
        super();
    }

    mismatches(context: string, mismatched: Array<Mismatch>, actual: Array<T>): MatchResult {
        if (isArray(actual)) {
            let compares = 0;
            let matches = 0;
            let i = 0;
            for (let a of actual) {
                const result = this.expected.matches(a);
                if (result.passed()) {
                    return MatchResult.good(result.compares);
                }
                compares += result.compares;
                matches += result.matches;
                i += 1;
            }
            mismatched.push(Mismatch.make(context, actual, this.describe()));
            return MatchResult.wasExpected(actual, this.describe(), compares, matches);
        }
        mismatched.push(Mismatch.make(context, actual, "array expected"));
        return MatchResult.wasExpected(actual, this.describe(), 1, 0);
    }

    describe(): any {
        return {"array.contains": this.expected.describe()};
    }

    static make<T>(expected: DiffMatcher<T> | any): any {
        return new ArrayContainsMatcher<T>(matchMaker(expected));
    }
}

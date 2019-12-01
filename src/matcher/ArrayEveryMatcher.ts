import {DiffMatcher} from "./DiffMatcher";
import {Mismatch} from "./Mismatch";
import {MatchResult} from "../MatchResult";
import {isArray} from "util";
import {matchMaker} from "./matchMaker";

export class ArrayEveryMatcher<T> extends DiffMatcher<Array<T>> {
    private constructor(private expected: DiffMatcher<T>) {
        super();
    }

    mismatches(context: string, mismatched: Array<Mismatch>, actual: Array<T>): MatchResult {
        if (isArray(actual)) {
            let corrects = 0;
            let compares = 0;
            let matches = 0;
            let i = 0;
            for (let a of actual) {
                const result = this.expected.mismatches(context + "[" + i + "]", mismatched, a);
                if (result.passed()) {
                    corrects += 1;
                }
                compares += result.compares;
                matches += result.matches;
                i += 1;
            }
            if (corrects === actual.length) {
                return MatchResult.good(compares);
            }
            return MatchResult.wasExpected(actual, this.describe(), compares, matches);
        }
        mismatched.push(Mismatch.make(context, actual, "array expected"));
        return MatchResult.wasExpected(actual, this.describe(), 1, 0);
    }

    describe(): any {
        return {"array.every": this.expected.describe()};
    }

    static make<T>(expected: DiffMatcher<T> | any): any {
        return new ArrayEveryMatcher<T>(matchMaker(expected));
    }
}

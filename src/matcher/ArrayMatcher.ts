import {matchMaker} from "./matchMaker";
import {MatchResult} from "../MatchResult";
import {isArray} from "util";
import {DiffMatcher} from "./DiffMatcher";
import {IsEqualsMatcher} from "./IsEqualsMatcher";
import {Mismatch} from "./Mismatch";

export class ArrayMatcher<T> extends DiffMatcher<Array<T>> {
    private constructor(private expected: Array<DiffMatcher<T>>) {
        super();
    }

    mismatches(context: string, mismatched: Array<Mismatch>, actual: Array<T>): MatchResult {
        if (!isArray(actual) || actual.length !== this.expected.length) {
            mismatched.push(Mismatch.make(context, actual, isArray(actual) ?
                {length: this.expected.length}
                : "array expected"));
            return MatchResult.wasExpected(actual, this.describe(), 1, 0);
        }
        const results: Array<any> = [];
        let errors = 0;
        let compares = 0;
        let matches = 0;
        for (let i = 0; i < actual.length; i++) {
            const act = actual[i];
            const result = this.expected[i].mismatches(context + "[" + i + "]", mismatched, act);
            if (result.passed()) {
                results.push(act);
            } else {
                results.push(result.diff);
                errors += 1;
            }
            compares += result.compares;
            matches += result.matches;
        }
        if (errors === 0) {
            return MatchResult.good(compares);
        }
        return new MatchResult(results, compares, matches);
    }

    describe(): any {
        return this.expected.map(e => e.describe());
    }

    static make<T>(expected: Array<DiffMatcher<T> | any>): any {
        return new ArrayMatcher<T>(expected.map(e => matchMaker(e)));
    }
}

export function arrayLiteralMatchers<T>(values: Array<T>): Array<DiffMatcher<T>> {
    return values.map(v => IsEqualsMatcher.make(v))
}
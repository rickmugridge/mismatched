import {matchMaker} from "../matchMaker/matchMaker";
import {MatchResult} from "../MatchResult";
import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {Mismatched} from "./Mismatched";
import {arrayDiff} from "../diff/arrayDiff";
import {ofType} from "../ofType";

export class ArrayMatcher<T> extends DiffMatcher<Array<T>> {
    private constructor(private expected: Array<DiffMatcher<T>>) {
        super();
    }

    static make<T>(expected: Array<DiffMatcher<T> | any>): any {
        return new ArrayMatcher<T>(expected.map(e => matchMaker(e)));
    }

    mismatches(context: ContextOfValidationError, mismatched: Array<Mismatched>, actual: Array<T>): MatchResult {
        if (!ofType.isArray(actual)) {
            mismatched.push(Mismatched.make(context, actual, "array expected"));
            return MatchResult.wasExpected(actual, this.describe(), 1, 0);
        }
        if (actual.length !== this.expected.length) {
            mismatched.push(Mismatched.make(context, actual, {length: this.expected.length}));
            const diff = arrayDiff(this.expected, actual)
            return new MatchResult(diff, Math.max(this.expected.length, actual.length), 0);
        }
        const results: Array<any> = [];
        let errors = 0;
        let compares = 0;
        let matches = 0;
        for (let i = 0; i < actual.length; i++) {
            const act = actual[i];
            const result = this.expected[i].mismatches(context.add("[" + i + "]"), mismatched, act);
            if (result.passed()) {
                results.push(act);
            } else {
                results.push(result.diff);
                errors += 1;
            }
            compares += result.compares;
            matches += result.matchRate * result.compares;
        }
        return new MatchResult(results, compares, matches);
    }

    describe(): any {
        return this.expected.map(e => e.describe());
    }
}

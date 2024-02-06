import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {Mismatched} from "./Mismatched";
import {MatchResult} from "../MatchResult";
import {matchMaker} from "../matchMaker/matchMaker";
import {ofType} from "../ofType";

export class ArrayEveryMatcher<T> extends DiffMatcher<Array<T>> {
    private constructor(private expected: DiffMatcher<T>) {
        super()
        this.specificity = expected.specificity
    }

    mismatches(context: ContextOfValidationError, mismatched: string[], actual: Array<T>): MatchResult {
        if (ofType.isArray(actual)) {
            if (actual.length === 0) {
                return new MatchResult(undefined, 1, 1)
            }
            let compares = 0
            let matches = 0
            let i = 0
            const results: any[] = []
            for (const a of actual) {
                const result = this.expected.mismatches(context.add("[" + i + "]"), mismatched, a)
                if (result.passed()) {
                    results.push(a)
                } else {
                    results.push(result.diff)
                }
                compares += result.compares
                matches += result.matches
                i += 1
            }
            return new MatchResult(results, compares, matches)
        }
        mismatched.push(Mismatched.makeExpectedMessage(context, actual, "array expected"))
        return MatchResult.wasExpected(actual, this.describe(), 1, 0)
    }

    describe(): any {
        return {"array.every": this.expected.describe()}
    }

    static make<T>(expected: DiffMatcher<T> | any): any {
        return new ArrayEveryMatcher<T>(matchMaker(expected))
    }
}

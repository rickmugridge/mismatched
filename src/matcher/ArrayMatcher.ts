import {matchMaker} from "../matchMaker/matchMaker";
import {MatchResult} from "../MatchResult";
import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {Mismatched} from "./Mismatched";
import {ArrayDiff} from "../diff/arrayDiff";
import {ofType} from "../ofType";
import {Option} from "prelude-ts"

export class ArrayMatcher<T> extends DiffMatcher<Array<T>> {
    private constructor(private elementMatchers: Array<DiffMatcher<T>>) {
        super();
        this.specificity = DiffMatcher.andSpecificity(elementMatchers)
    }

    static make<T>(expected: Array<DiffMatcher<T> | any>): any {
        return new ArrayMatcher<T>(expected.map(e => matchMaker(e)));
    }

    mismatches(context: ContextOfValidationError, mismatched: string[], actual: Array<T>): MatchResult {
        if (!ofType.isArray(actual)) {
            mismatched.push(Mismatched.makeExpectedMessage(context, actual, "array expected"));
            return MatchResult.wasExpected(actual, this.describe(), 1, 0);
        }
        if (actual.length === this.elementMatchers.length) {
            if (actual.length === 0) {
                return MatchResult.good(1)
            }
            // Try assuming that the match is one-for-one and mostly correct. If that fails, use the expensive approach with array diff
            const match = this.quickMatch(context, mismatched, actual)
            if (match.isSome()) {
                return match.get()
            }
        }
        return ArrayDiff.matchResulting(context, actual, this.elementMatchers, mismatched)
    }

    describe(): any {
        return this.elementMatchers.map(e => e.describe());
    }

    quickMatch(context: ContextOfValidationError, mismatched: string[], actual: Array<T>): Option<MatchResult> {
        const tempMismatched: string[] = []
        let compares = 0
        let matches = 0
        const resultingArray: any[] = []
        for (let i = 0; i < actual.length; i++) {
            const result = this.elementMatchers[i].mismatches(context.add(`[${i}]`), tempMismatched, actual[i])
            if (result.matchRate < 0.9) {
                return Option.none()
            }
            compares += result.compares
            matches += result.matches
            if (result.passed()) {
                resultingArray.push(actual[i])
            } else {
                resultingArray.push(result.diff)
            }
        }
        tempMismatched.forEach(m => mismatched.push(m))
        return Option.of(new MatchResult(resultingArray, compares, matches))
    }
}



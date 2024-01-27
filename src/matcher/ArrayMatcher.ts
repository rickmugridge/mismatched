import {matchMaker} from "../matchMaker/matchMaker";
import {MatchResult} from "../MatchResult";
import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {Mismatched} from "./Mismatched";
import {arrayDiff22, PossibleMatch} from "../diff/arrayDiff";
import {ofType} from "../ofType";

export class ArrayMatcher<T> extends DiffMatcher<Array<T>> {
    private constructor(private elementMatchers: Array<DiffMatcher<T>>) {
        super();
        this.specificity = DiffMatcher.andSpecificity(elementMatchers)
    }

    static make<T>(expected: Array<DiffMatcher<T> | any>): any {
        return new ArrayMatcher<T>(expected.map(e => matchMaker(e)));
    }

    mismatches(context: ContextOfValidationError, mismatched: Array<Mismatched>, actual: Array<T>): MatchResult {
        if (!ofType.isArray(actual)) {
            mismatched.push(Mismatched.makeExpectedMessage(context, actual, "array expected"));
            return MatchResult.wasExpected(actual, this.describe(), 1, 0);
        }
        if (actual.length === 0 && this.elementMatchers.length === 0) {
            return MatchResult.good(1)
        }
        const pairs: PossibleMatch<T>[] = arrayDiff22(this.elementMatchers, actual)
        /* Each pair consists of
               o actual element + best matcher (where matching worked), ir passed or partially matched
               o actual element                (element wasn't matched), ie unexpected
               o no element + matcher          (matcher matched no elements), ie expected
         */

        let compares = 0
        let matches = 0
        const diffResults = pairs.map((pair) => {
            if (pair.matcher.isSome() && pair.actual.isNone()) { // expected
                compares += 1
                mismatched.push(Mismatched.makeMissing(context, actual, pair.matcher.get().describe()))
                return {[MatchResult.expected]: pair.matcher.get().describe()}
            }
            if (pair.matcher.isNone() && pair.actual.isSome()) { // unexpected
                compares += 1
                mismatched.push(Mismatched.makeUnexpectedMessage(context, actual, pair.actual.get()))
                return {[MatchResult.unexpected]: pair.actual.get()}
            }
            if (pair.matcher.isSome() && pair.actual.isSome()) { // (partial) match
                // Rerun the match with the right context, and to update mismatched array
                const matcher: DiffMatcher<any> = pair.matcher.get()
                const actualElement: any = pair.actual.get()
                const elementContext: ContextOfValidationError = context.add("[" + pair.actualIndex! + "]")
                const result = matcher.mismatches(elementContext, mismatched, actualElement)
                compares += result.compares
                matches += result.matches
                if (result.passed()) {
                    return actualElement
                }
                return result.diff
            }
        })
        if (matches == 0) {
            matches += 0.1
            compares += 1
        }
        return new MatchResult(diffResults, compares, matches)
    }

    describe(): any {
        return this.elementMatchers.map(e => e.describe());
    }
}

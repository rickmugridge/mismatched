import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {Mismatched} from "./Mismatched";
import {MatchResult} from "../MatchResult";
import {matchMaker} from "../matchMaker/matchMaker";
import {matchBestOf} from "../matchBestOf"
import {ofType} from "../ofType"

export class ArrayContainsMatcher<T> extends DiffMatcher<Array<T>> {
    private constructor(private matcher: DiffMatcher<T>) {
        super()
        this.specificity = matcher.specificity
    }

    mismatches(context: ContextOfValidationError, mismatched: Array<Mismatched>, actual: Array<T>): MatchResult {
        const matcher = this.matcher

        function* anyOfGenerator(): Generator<[ContextOfValidationError, MatchResult, Array<Mismatched>]> {
            for (const a of actual) {
                const nestedMismatched: Array<Mismatched> = []
                const matchResult = matcher.mismatches(context, nestedMismatched, a)
                yield [context, matchResult, nestedMismatched]
            }
        }

        if (ofType.isArray(actual)) {
            return matchBestOf(context, mismatched, actual, this, anyOfGenerator())
        }
        mismatched.push(Mismatched.makeExpectedMessage(context, actual, "array expected"))
        return MatchResult.wasExpected(actual, this.describe(), 1, 0)
    }

    describe(): any {
        return {"array.contains": this.matcher.describe()};
    }

    static make<T>(expected: DiffMatcher<T> | any): any {
        return new ArrayContainsMatcher<T>(matchMaker(expected));
    }
}

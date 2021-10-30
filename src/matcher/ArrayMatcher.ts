import {matchMaker} from "../matchMaker/matchMaker";
import {MatchResult} from "../MatchResult";
import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {Mismatched} from "./Mismatched";
import {arrayDiff} from "../diff/arrayDiff";
import {ofType} from "../ofType";

export class ArrayMatcher<T> extends DiffMatcher<Array<T>> {
    private constructor(private matchers: Array<DiffMatcher<T>>) {
        super();
        this.complexity = DiffMatcher.andComplexity(matchers)
    }

    static make<T>(expected: Array<DiffMatcher<T> | any>): any {
        return new ArrayMatcher<T>(expected.map(e => matchMaker(e)));
    }

    mismatches(context: ContextOfValidationError, mismatched: Array<Mismatched>, actual: Array<T>): MatchResult {
        if (!ofType.isArray(actual)) {
            mismatched.push(Mismatched.makeExpectedMessage(context, actual, "array expected"));
            return MatchResult.wasExpected(actual, this.describe(), 1, 0);
        }
        const pairs = arrayDiff(this.matchers, actual)
        let compares = 0;
        let matches = 0;
        const results = pairs.map((pair, i) => {
            if (pair.matcher.isSome() && pair.actual.isNone()) {
                compares += 1
                mismatched.push(Mismatched.makeExpectedMessage(context, actual, pair.matcher.get().describe()))
                return {[MatchResult.expected]: pair.matcher.get().describe()}
            }
            if (pair.matcher.isNone() && pair.actual.isSome()) {
                compares += 1
                mismatched.push(Mismatched.makeUnexpectedMessage(context.add("[" + pair.index + "]"), actual, pair.actual.get()))
                return {[MatchResult.unexpected]: pair.actual.get()}
            }
            if (pair.matcher.isSome() && pair.actual.isSome()) {
                const result = pair.matcher.get().mismatches(context.add("[" + pair.index + "]"), mismatched, pair.actual.get())
                compares += result.compares;
                matches += result.matchRate * result.compares;
                if (result.passed()) {
                    return pair.actual.get();
                } else {
                    return result.diff;
                }
            }
        })
        return new MatchResult(results, compares, matches);
    }

    describe(): any {
        return this.matchers.map(e => e.describe());
    }
}

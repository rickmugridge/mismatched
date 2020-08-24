import {DiffMatcher, ContextOfValidationError} from "./DiffMatcher";
import {matchMaker} from "..";
import {MatchResult} from "../MatchResult";
import {Mismatched} from "./Mismatched";

export class AnyOfMatcher<T> extends DiffMatcher<T> {
    private constructor(private matchers: Array<DiffMatcher<T>>) {
        super();
    }

    static make<T>(matchers: Array<DiffMatcher<T> | any>): any {
        if (matchers.length === 1) {
            return matchMaker(matchers[0]);
        }
        return new AnyOfMatcher(matchers.map(m => matchMaker(m)));
    }

    mismatches(context: ContextOfValidationError, mismatched: Array<Mismatched>, actual: T): MatchResult {
        let compares = 1;
        let matches = 0;
        const nonZeroMatchers: Array<DiffMatcher<T>> = [];
        const nonZeroMatcherResults: Array<MatchResult> = [];
        for (let m of this.matchers) {
            let matchResult = m.matches(actual); // Don't register any mismatches
            if (matchResult.passed()) {
                return MatchResult.good(matchResult.compares);
            }
            if (matchResult.matches > 0) {
                nonZeroMatchers.push(m)
                nonZeroMatcherResults.push(matchResult)
            }
            compares += matchResult.compares;
            matches += matchResult.matches;
        }
        if (nonZeroMatchers.length === 1) {
            const nonZeroMatcher = nonZeroMatchers[0];
            const nonZeroMatcherResult = nonZeroMatcherResults[0];
            mismatched.push(Mismatched.make(context, actual, nonZeroMatcher.describe()));
            return MatchResult.wasExpected(actual, nonZeroMatcher.describe(), nonZeroMatcherResult.compares,
                nonZeroMatcherResult.matches);
        }
        mismatched.push(Mismatched.make(context, actual, this.describe()));
        return MatchResult.wasExpected(actual, this.describe(), compares, matches);
    }

    describe(): any {
        return {anyOf: this.matchers.map(m => m.describe())}
    }
}

/*
   Use the compares and matches of the best matcher to compute the overall matchRate when good.
   But use all the sub-results of the match is bad.
 */

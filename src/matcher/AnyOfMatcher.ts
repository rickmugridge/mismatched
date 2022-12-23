import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {matchMaker} from "..";
import {MatchResult} from "../MatchResult";
import {Mismatched} from "./Mismatched";

export class AnyOfMatcher<T> extends DiffMatcher<T> {
    private constructor(private matchers: Array<DiffMatcher<T>>) {
        super();
        this.specificity = DiffMatcher.orSpecificity(matchers)
    }

    static make<T>(matchers: Array<DiffMatcher<T> | any>): any {
        if (matchers.length === 1) {
            return matchMaker(matchers[0]);
        }
        return new AnyOfMatcher(matchers.map(m => matchMaker(m)));
    }

    mismatches(context: ContextOfValidationError, mismatched: Array<Mismatched>, actual: T): MatchResult {
        const keyPartialMatchers: DiffMatcher<T>[] = []
        const keyPartialMatchResults: Array<MatchResult> = [];
        const keyPartialMismatched: Array<Mismatched> = [];
        const nonZeroMatchers: Array<DiffMatcher<T>> = [];
        const nonZeroMatcherResults: Array<MatchResult> = [];
        const nonZeroMismatched: Array<Mismatched> = [];
        let compares = 1;
        let matches = 0;
        for (let m of this.matchers) {
            const nestedMismatched: Array<Mismatched> = []
            let matchResult = m.mismatches(context, nestedMismatched, actual); // Don't register any mismatches
            if (matchResult.passed()) {
                return MatchResult.good(matchResult.compares);
            }
            if (matchResult.matchedObjectKey) {
                keyPartialMatchers.push(m)
                keyPartialMatchResults.push(matchResult)
                keyPartialMismatched.push(nestedMismatched)
            }
            if (matchResult.matches > 0) {
                nonZeroMatchers.push(m)
                nonZeroMatcherResults.push(matchResult)
                nonZeroMismatched.push(nestedMismatched)
            }
            compares += matchResult.compares;
            matches += matchResult.matchRate * matchResult.compares;
        }
        if (keyPartialMatchers.length === 1) {
            const keyPartialMatcher = keyPartialMatchers[0];
            const keyPartialMatchResult = keyPartialMatchResults[0];
            mismatched.push(keyPartialMismatched[0]);
            return MatchResult.wasExpected(actual, keyPartialMatcher.describe(), keyPartialMatchResult.compares,
                keyPartialMatchResult.matches);
        }
        if (nonZeroMatchers.length === 1) {
            const nonZeroMatcher = nonZeroMatchers[0];
            const nonZeroMatcherResult = nonZeroMatcherResults[0];
            mismatched.push(nonZeroMismatched[0]);
            return MatchResult.wasExpected(actual, nonZeroMatcher.describe(), nonZeroMatcherResult.compares,
                nonZeroMatcherResult.matches);
        }
        mismatched.push(Mismatched.makeExpectedMessage(context, actual, this.describe()));
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

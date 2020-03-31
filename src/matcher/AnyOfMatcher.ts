import {DiffMatcher} from "./DiffMatcher";
import {matchMaker} from "../matchMaker/matchMaker";
import {MatchResult} from "../MatchResult";
import {Mismatched} from "./Mismatched";

export class AnyOfMatcher<T> extends DiffMatcher<T> {
    private constructor(private matchers: Array<DiffMatcher<T>>) {
        super();
    }

    mismatches(context: string, mismatched: Array<Mismatched>, actual: T): MatchResult {
        let compares = 0;
        let matches = 0;
        let bestMatchRate = 0.0;
        for (let m of this.matchers) {
            let matchResult = m.matches(actual); // Don't register any mismatches
            if (matchResult.passed()) {
                return MatchResult.good(matchResult.compares);
            }
            if (matchResult.matchRate > bestMatchRate) {
                bestMatchRate = matchResult.matchRate;
                compares = matchResult.compares;
                matches = matchResult.matches;
            }
        }
        mismatched.push(Mismatched.make(context, actual, this.describe()));
        return MatchResult.wasExpected(actual, this.describe(), compares, matches);
    }

    describe(): any {
        return {anyOf: this.matchers.map(m => m.describe())}
    }

    static make<T>(matchers: Array<DiffMatcher<T> | any>): any {
        return new AnyOfMatcher(matchers.map(m => matchMaker(m)));
    }
}

/*
   Use the compares and matches of the best matcher to compute the overall matchRate when good.
   But use all the sub-results of the match is bad.
 */

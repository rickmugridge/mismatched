import {DiffMatcher} from "./DiffMatcher";
import {matchMaker} from "./matchMaker";
import {MatchResult} from "../MatchResult";

export class AllOfMatcher<T> implements DiffMatcher<T> {
    constructor(private matchers: Array<DiffMatcher<T>>) {
    }

    matches(actual: T): MatchResult {
        let corrects = 0;
        let compares = 0;
        let matches = 0;
        this.matchers.forEach(m => {
            let matchResult = m.matches(actual);
            if (matchResult.passed()) {
                corrects += 1;
            }
            compares += matchResult.compares;
            matches += matchResult.matches;
        });
        if (corrects === this.matchers.length) {
            return MatchResult.good(compares);
        }
        return MatchResult.wasExpected(actual, this.describe(), compares, matches);
    }

    describe(): any {
        return {allOf: this.matchers.map(m => m.describe())}
    }

    static make<T>(matchers: Array<DiffMatcher<T> | any>) {
        return new AllOfMatcher(matchers.map(m => matchMaker(m)));
    }
}

/*
   Accumulate the compares and matches of all of the matchers to compute the overall matchRate
 */

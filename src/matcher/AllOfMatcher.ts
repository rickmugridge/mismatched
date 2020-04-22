import {DiffMatcher} from "./DiffMatcher";
import {matchMaker} from "../matchMaker/matchMaker";
import {MatchResult} from "../MatchResult";
import {Mismatched} from "./Mismatched";
import {AnyMatcher} from "./AnyMatcher";

export class AllOfMatcher<T> extends DiffMatcher<T> {
    private constructor(private matchers: Array<DiffMatcher<T>>) {
        super();
    }

    mismatches(context: string, mismatched: Array<Mismatched>, actual: T): MatchResult {
        let corrects = 0;
        let compares = 0;
        let matches = 0;
        this.matchers.forEach(m => {
            let matchResult = m.mismatches(context, mismatched, actual);
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

    static make<T>(matchers: Array<DiffMatcher<T> | any>): any {
        const subMatchers = matchers.map(m => matchMaker(m)).filter(m => !(m instanceof AnyMatcher));
        switch (subMatchers.length) {
            case 0:
                return new AnyMatcher();
            case 1 :
                return subMatchers[0];
            default:
                return new AllOfMatcher(subMatchers);
        }
    }
}

/*
   Accumulate the compares and matches of all of the matchers to compute the overall matchRate
 */

import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {matchMaker} from "../matchMaker/matchMaker";
import {MatchResult} from "../MatchResult";
import {Mismatched} from "./Mismatched";
import {AnyMatcher} from "./AnyMatcher";

export class AllOfMatcher<T> extends DiffMatcher<T> {
    private constructor(private matchers: Array<DiffMatcher<T>>) {
        super();
        this.specificity = DiffMatcher.andSpecificity(matchers)
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

    mismatches(context: ContextOfValidationError, mismatched: Array<Mismatched>, actual: T): MatchResult {
        const incorrectMatchers: Array<DiffMatcher<T>> = [];
        let compares = 0;
        let matches = 0;
        const localMismatched: Array<Mismatched> = []
        this.matchers.forEach(m => {
            let matchResult = m.mismatches(context, localMismatched, actual);
            if (!matchResult.passed()) {
                incorrectMatchers.push(m);
            }
            compares += matchResult.compares;
            matches += matchResult.matchRate * matchResult.compares;
        });
        if (incorrectMatchers.length === 0) {
            return MatchResult.good(compares);
        }
        mismatched.push(...localMismatched);
        if (incorrectMatchers.length === 1) {
            // Just describe that specific one as an error
            const incorrect = incorrectMatchers[0];
            return MatchResult.wasExpected(actual, incorrect.describe(), compares, matches);
        }
        return MatchResult.wasExpected(actual, this.describe(), compares, matches);
    }

    describe(): any {
        return {allOf: this.matchers.map(m => m.describe())}
    }
}

/*
   Accumulate the compares and matches of all of the matchers to compute the overall matchRate
 */

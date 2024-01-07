import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {matchMaker} from "..";
import {MatchResult} from "../MatchResult";
import {Mismatched} from "./Mismatched";
import {matchBestOf} from "../matchBestOf"

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
        const matchers = this.matchers

        function* anyOfGenerator(): Generator<[ContextOfValidationError, MatchResult, Array<Mismatched>]> {
            for (const matcher of matchers) {
                const nestedMismatched: Array<Mismatched> = []
                const matchResult = matcher.mismatches(context, nestedMismatched, actual)
                yield [context, matchResult, nestedMismatched]
            }
        }

        return matchBestOf(context, mismatched, actual, this, anyOfGenerator())
    }

    describe(): any {
        return {anyOf: this.matchers.map(m => m.describe())}
    }
}

/*
   Use the compares and matches of the best matcher to compute the overall matchRate when good.
   But use all the sub-results of the match is bad.
 */

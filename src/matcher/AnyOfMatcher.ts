import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {matchMaker} from "..";
import {bestMatchResultIndex, MatchResult} from "../MatchResult";
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
        const keyPartialMatchResults: Array<MatchResult> = [];
        const keyPartialMismatched: Array<Mismatched> = [];
        const partialMatchResults: Array<MatchResult> = [];
        const partialMismatched: Array<Mismatched> = [];
        let compares = 1;
        let matches = 0;
        for (let m of this.matchers) {
            const nestedMismatched: Array<Mismatched> = []
            let matchResult = m.mismatches(context, nestedMismatched, actual); // Don't register any mismatches
            if (matchResult.passed()) {
                return MatchResult.good(matchResult.compares);
            }
            if (matchResult.matches > 0) {
                if (matchResult.matchedObjectKey) {
                    keyPartialMatchResults.push(matchResult)
                    keyPartialMismatched.push(nestedMismatched)
                } else {
                    partialMatchResults.push(matchResult)
                    partialMismatched.push(nestedMismatched)
                }
            }
            compares += matchResult.compares
            matches += matchResult.matches
        }
        if (keyPartialMatchResults.length > 0) {
            const index: number = bestMatchResultIndex(keyPartialMatchResults)
            mismatched.push(keyPartialMismatched[index])
            return keyPartialMatchResults[index]
        }
        if (partialMatchResults.length > 0) {
            const index: number = bestMatchResultIndex(partialMatchResults)
            mismatched.push(partialMismatched[index])
            return partialMatchResults[index]
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

import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher"
import {matchMaker} from "../matchMaker/matchMaker"
import {Mismatched} from "./Mismatched"
import {MatchResult} from "../MatchResult"

export class ExactlyOneOfMatcher<T> extends DiffMatcher<T> {
    private constructor(private matchers: Array<DiffMatcher<T>>) {
        super()
        this.specificity = DiffMatcher.orSpecificity(matchers)
    }

    static make<T>(matchers: Array<DiffMatcher<T> | any>): any {
        return new ExactlyOneOfMatcher(matchers.map(m => matchMaker(m)))
    }

    mismatches(context: ContextOfValidationError, mismatched: Array<Mismatched>, actual: T): MatchResult {
        let compares = 0
        let matches = 0
        let countOfMatchersThatMatched = 0
        let localMismatched: Array<Mismatched> = []
        let bestMisMatchRate: number = 0
        let bestMismatchResult: MatchResult | undefined
        let bestMismatched: Mismatched[] | undefined
        this.matchers.forEach(m => {
            const localMismatched: Array<Mismatched> = []
            const matchResult = m.mismatches(context, localMismatched, actual)
            if (matchResult.passed()) {
                countOfMatchersThatMatched += 1
            } else {
                if (matchResult.matchRate > bestMisMatchRate) {
                    bestMisMatchRate = matchResult.matchRate
                    bestMismatchResult = matchResult
                    bestMismatched = localMismatched
                }
            }
            compares += matchResult.compares
            matches += matchResult.matches
        })
        if (countOfMatchersThatMatched == 1) {
            mismatched.push(...localMismatched)
            return MatchResult.good(matches) // Ignore compares of failing ones
        }
        if (bestMisMatchRate > 0.05) {
            mismatched.push(...bestMismatched!)
            return bestMismatchResult!
        }
        // Either 0, or too many, or too poor a match
        mismatched.push(Mismatched.makeExpectedMessage(context, actual, "exactly one expected"))
        return MatchResult.wasExpected(actual, this.describe(), this.matchers.length, 0)
    }

    describe(): any {
        return {exactlyOneOf: this.matchers.map(m => m.describe())}
    }
}
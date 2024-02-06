import {ContextOfValidationError, DiffMatcher} from "./matcher/DiffMatcher"
import {bestMatchResultIndex, MatchResult} from "./MatchResult"
import {Mismatched} from "./matcher/Mismatched"

export const matchBestOf = <T>(topLevelContext: ContextOfValidationError,
                               mismatched: string[],
                               actual: T,
                               topLevelMatcher: DiffMatcher<T>,
                               matchGenerator: Generator<[ContextOfValidationError, MatchResult, string[]]>): MatchResult => {
    const keyPartialMatchResults: Array<MatchResult> = []
    const keyPartialMismatched: string[] = []
    const partialMatchResults: Array<MatchResult> = []
    const partialMismatched: string[] = []
    let compares = 1;
    let matches = 0;
    while (true) {
        const nextMatchResultPair = matchGenerator.next()
        if (nextMatchResultPair.done)
            break
        const [context, matchResult, nestedMismatched] = nextMatchResultPair.value
        if (matchResult.passed()) {
            return MatchResult.good(matchResult.compares)
        }
        if (matchResult.matches > 0) {
            if (matchResult.matchedObjectKey) {
                keyPartialMatchResults.push(matchResult)
                keyPartialMismatched.push(...nestedMismatched)
            } else {
                partialMatchResults.push(matchResult)
                partialMismatched.push(...nestedMismatched)
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
    mismatched.push(Mismatched.makeExpectedMessage(topLevelContext, actual, topLevelMatcher.describe()))
    return MatchResult.wasExpected(actual, topLevelMatcher.describe(), compares, matches)
}

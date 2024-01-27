import {Mismatched} from "../matcher/Mismatched"
import {MatchResult} from "../MatchResult"
import {ContextOfValidationError, DiffMatcher} from "../matcher/DiffMatcher"

export const newArrayResultAccumulator = <T>(context: ContextOfValidationError,
                                             mismatched: Mismatched[],
                                             actualElements: any[],
                                             matchers: DiffMatcher<T>[],) => {
    let results: any[] = []
    let compares = 1
    let matches = 1 // Count that we have 2 array as a match

    const wasExpected = (matchResult: MatchResult, index: number) => {
        matches += matchResult.matches
        compares += matchResult.compares
        if (matchResult.passed()) {
            results.push(actualElements[index]) // todo Is this right?
        } else {
            results.push(matchResult.diff)
            mismatched.push(Mismatched.wasExpected(context, actualElements[index], matchers[index]))
        }
    }

    const extraActual = (actualIndex: number) => {
        compares += 1
        results.push(MatchResult.extraActual(actualElements[actualIndex])) // unexpected
        mismatched.push(Mismatched.extraActual(context, actualElements[actualIndex]))

    }

    const extraMatcher = (matcherIndex: number) => {
        compares += 1
        results.push(MatchResult.extraMatcher(matchers[matcherIndex])) // expected
        mismatched.push(Mismatched.extraMatcher(context, matchers[matcherIndex]))
    }

    const outOfOrder = (actualIndex: number) => {
        compares += 1
        results.push(MatchResult.outOfOrder(actualElements[actualIndex])) // unexpected
        mismatched.push(Mismatched.outOfOrder(context, actualElements[actualIndex]))

    }

    const getMatchResult = () => new MatchResult(results, compares, matches)

    return {wasExpected, extraActual, extraMatcher, outOfOrder, getMatchResult}
}
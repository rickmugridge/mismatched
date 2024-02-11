import {ArrayDiff} from "./diff/arrayDiff"
import {matchMaker} from "./matchMaker/matchMaker"
import {assertThat} from "./assertThat"
import {ContextOfValidationError} from "./matcher/DiffMatcher"
import {handleSymbol, MatchResult} from "./MatchResult"

export module testing {
    const context = new ContextOfValidationError("test")

    export const passes = (actualElements: any[], matchers: any[], matches: number) => {
        const mismatched: string[] = []
        const result = ArrayDiff.matchResulting(context,
            actualElements, matchers.map(matchMaker), mismatched)
        assertThat(result.matches).is(matches)
        assertThat(mismatched).is([])
    }

    export const fails = (actualElements: any[], matchers: any[], diffExpected: any,
                          matchesExpected: number, comparesExpected: number, mismatchedExpected: string[]) => {
        const mismatched: string[] = []
        const result = ArrayDiff.matchResulting(context, actualElements,
            matchers.map(matchMaker), mismatched)
        assertThat({
            mismatched,
            diff: result.diff,
            matches: result.matches,
            compares: result.compares
        })
            .is({
                mismatched: mismatchedExpected,
                diff: diffExpected,
                matches: matchesExpected,
                compares: comparesExpected
            })
    }
    export const wasExpected = (was: any, expected: any) => ({
        [MatchResult.was]: handleSymbol(was),
        [MatchResult.expected]: handleSymbol(expected)
    })
    export const expected = (value: any): any => ({[MatchResult.expected]: handleSymbol(value)})
    export const unexpected = (value: any): any => ({[MatchResult.unexpected]: handleSymbol(value)})
    export const wrongOrder = (value: any): any => ({[MatchResult.wrongOrder]: handleSymbol(value)})
}
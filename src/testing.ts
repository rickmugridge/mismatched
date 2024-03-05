import {ArrayDiff} from "./diff/arrayDiff"
import {matchMaker} from "./matchMaker/matchMaker"
import {assertThat} from "./assertThat"
import {ContextOfValidationError} from "./matcher/DiffMatcher"
import {handleSymbol, MatchResult} from "./MatchResult"
import {match} from "./match"

export module testing {
    const context = new ContextOfValidationError("test")

    export const pass = (actual: any, matcher: any, matches: number) => {
        const mismatched: string[] = []
        const matchResult = matchMaker(matcher).mismatches(context, mismatched, actual)
        assertThat(matchResult.matches).is(matches)
        assertThat(mismatched).is([])
    }

    export const fail = (actual: any, matcher: any,
                         mismatchedExpected: string[],
                         matchesExpected: number,
                         comparesExpected: number,
                         diffExpected: any = match.any()) => {
        const mismatched: string[] = []
        const matchResult = matchMaker(matcher).mismatches(context, mismatched, actual)
        assertThat({
            mismatched,
            matches: matchResult.matches,
            compares: matchResult.compares,
            diff: matchResult.diff
        })
            .is({
                mismatched: mismatchedExpected,
                matches: matchesExpected,
                compares: comparesExpected,
                diff: diffExpected
            })
    }

    export const passes = (actualElements: any[], matchers: any[], matches: number) => {
        const mismatched: string[] = []
        const matchResult = ArrayDiff.matchResulting(context,
            actualElements, matchers.map(matchMaker), mismatched)
        assertThat(matchResult.matches).is(matches)
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
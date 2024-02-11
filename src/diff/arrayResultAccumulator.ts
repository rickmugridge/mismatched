import {Mismatched} from "../matcher/Mismatched"
import {MatchResult} from "../MatchResult"
import {ContextOfValidationError, DiffMatcher} from "../matcher/DiffMatcher"
import {Assignment} from "./BestMatcherAssignments"
import {ofType} from "../ofType"

export type ArrayResultAccumulator = {
    wasExpected(assignment: Assignment<any>, index: number): void
    extraActual(actualIndex: number): void
    extraMatcher(matcherIndex: number): void
    outOfOrder(actualIndex: number): void
    outOfOrderWithPartialMatch(actualIndex: number, matchResult: MatchResult): void
    getMatchResult(): MatchResult
}

export const newArrayResultAccumulator = <T>(context: ContextOfValidationError,
                                             actualElements: any[],
                                             matchers: DiffMatcher<T>[],
                                             mismatched: string[],) => {
    let diff: any[] = []
    let compares = 1
    let matches = 1 // Count that we have 2 array as a match

    const addPass = (i: number, passCompares: number) => {
        compares += passCompares
        matches += passCompares
        diff.push(actualElements[i])
    }

    const addMatchResult = (matchResult: MatchResult, mismatches: string[]) => {
        compares += matchResult.compares
        matches += matchResult.matches
        diff.push(matchResult.diff)
        mismatched.push(...mismatches)
    }

    const wasExpected = (assignment: Assignment<any>, index: number) => {
        const matchResult = assignment.matchResult
        matches += matchResult.matches
        compares += matchResult.compares
        if (matchResult.passed()) {
            diff.push(actualElements[index])
        } else {
            if (ofType.isArray(matchResult.diff)) {
                diff.push(...matchResult.diff)
            } else {
                diff.push(matchResult.diff)
            }
            mismatched.push(...assignment.mismatches)
        }
    }

    const extraActual = (actualIndex: number) => {
        compares += 1
        diff.push(MatchResult.extraActual(actualElements[actualIndex])) // unexpected
        mismatched.push(Mismatched.extraActual(context.add(`[${actualIndex}]`), actualElements[actualIndex]))
    }

    const extraMatcher = (matcherIndex: number) => {
        compares += 1
        diff.push(MatchResult.extraMatcher(matchers[matcherIndex])) // expected
        mismatched.push(Mismatched.extraMatcher(context.add(`[]`), matchers[matcherIndex]))
    }

    const outOfOrder = (actualIndex: number) => {
        compares += 1
        diff.push(MatchResult.outOfOrder(actualElements[actualIndex])) // unexpected
        mismatched.push(Mismatched.outOfOrder(context.add(`[]`), actualElements[actualIndex]))

    }

    const outOfOrderWithPartialMatch = (actualIndex: number, matchResult: MatchResult) => {
        compares += matchResult.compares
        matches += matchResult.matches
        diff.push(MatchResult.outOfOrderWithPartialMatch(matchResult.diff)) // unexpected
        mismatched.push(Mismatched.outOfOrder(context.add(`[]`), actualElements[actualIndex]))

    }

    const getMatchResult = () => new MatchResult(diff, compares, matches)

    return {
        addPass, addMatchResult,
        wasExpected, extraActual,
        extraMatcher, outOfOrder, outOfOrderWithPartialMatch,
        getMatchResult,
    }
}
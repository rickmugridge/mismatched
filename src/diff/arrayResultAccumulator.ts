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
    getMatchResult(): MatchResult
}

export const newArrayResultAccumulator = <T>(context: ContextOfValidationError,
                                             actualElements: any[],
                                             matchers: DiffMatcher<T>[],
                                             mismatched: Mismatched[],) => {
    let results: any[] = []
    let compares = 1
    let matches = 1 // Count that we have 2 array as a match

    const addPass = (i: number, passCompares: number) => {
        compares += passCompares
        matches += passCompares
        results.push(actualElements[i])
    }

    const addMatchResult = (matchResult: MatchResult, mismatches: Mismatched[]) => {
        compares += matchResult.compares
        matches += matchResult.matches
        results.push(matchResult)
        mismatched.push(...mismatches)
    }

    const wasExpected = (assignment: Assignment<any>, index: number) => {
        const matchResult = assignment.matchResult
        matches += matchResult.matches
        compares += matchResult.compares
        if (matchResult.passed()) {
            results.push(actualElements[index])
        } else {
            if (ofType.isArray(matchResult.diff)) {
                results.push(...matchResult.diff)
            } else {
                results.push(matchResult.diff)
            }
            mismatched.push(...assignment.mismatches)
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

    return {
        addPass, addMatchResult,
        wasExpected, extraActual,
        extraMatcher, outOfOrder,
        getMatchResult,
    }
}
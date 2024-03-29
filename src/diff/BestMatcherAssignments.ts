import {ContextOfValidationError, DiffMatcher} from "../matcher/DiffMatcher"
import {MatchResult} from "../MatchResult"
import {ofType} from "../ofType"
import {AnyMatcher} from "../matcher/AnyMatcher"

export module BestMatcherAssignments {
    /*
            Determine the best assignment of matchers to actual elements.
            This is based on a specificity heuristic. The steps are as follows:
            Given a set of matchers, and an array of actualElements:
              + Sort the matchers by specificity, with more specific earlier
                 + Retain the original position with those reordered matchers
              + Go through the matchers in that order, looking for full matches. For each one:
                 + Try the matcher against all the actualElements that have not been assigned to a matcher yet
                 + If there is a full match, assign that matcher to that element, and mark the element and
                   matcher as no longer available.
              + Go through the matchers in that order, looking for partial matches. For each one:
                 + Try the matcher against all the actualElements that have not been assigned to a matcher yet
                 + Track which element it matches against best (including completely)
                     + And hold the MatchResult and mismatches resulting from that match
                     + Give priority to a matcher that is in the same indexed position as an actual element.
                 + Assignment the best matching element to that matcher, if any, and mark the element and
                   matcher as no longer available.
               + return:
                  + The assignments of elements and matchers
                  + Any elements or matchers that are unassigned at the end
     */
    export const determine = <T>(context: ContextOfValidationError,
                                 actualElements: T[],
                                 matchers: DiffMatcher<T>[]): Assignations<T> => {
        const assignments: Assignment<T>[] = []
        const orderedMatchers: [DiffMatcher<T>, number][] = [...matchers]
            .map((m, i) => [m, i])
        orderedMatchers.sort((m1: [DiffMatcher<T>, number], m2: [DiffMatcher<T>, number]) =>
            m2[0].specificity - m1[0].specificity)

        const unassignedMatchers: Set<number> = new Set([...Array(orderedMatchers.length).keys()])
        const unassignedActualElements: Set<number> = new Set([...Array(actualElements.length).keys()])
        // Try for full match first, excluding match.any()
        for (let matcherIndex = 0; matcherIndex < orderedMatchers.length; matcherIndex++) {
            const [matcher, originalMatcherIndex] = orderedMatchers[matcherIndex]
            if (!(matcher instanceof AnyMatcher)) {
                findBestMatchForMatcher(context, matcher, originalMatcherIndex, actualElements,
                    unassignedActualElements, unassignedMatchers, assignments)
            }
        }
        // Try for partial matches with the rest
        for (let matcherIndex = 0; matcherIndex < orderedMatchers.length; matcherIndex++) {
            const [matcher, originalMatcherIndex] = orderedMatchers[matcherIndex]
            if (unassignedMatchers.has(originalMatcherIndex)) {
                findBestPartialMatchForMatcher(context, matcher, originalMatcherIndex, actualElements,
                    unassignedActualElements, unassignedMatchers, assignments)
            }
        }
        return {
            assignments,
            unassignedActualElements: Array.from(unassignedActualElements),
            unassignedMatchers: Array.from(unassignedMatchers)
        }
    }

    // See doc above for the details of this
    const findBestMatchForMatcher = <T>(context: ContextOfValidationError,
                                        matcher: DiffMatcher<T>,
                                        originalMatcherIndex: number,
                                        actualElements: T[],
                                        unassignedActualElements: Set<number>,
                                        unassignedMatchers: Set<number>,
                                        assignments: Assignment<T>[]) => {
        let bestAssignedActualIndex = -1
        let bestMatchResult: MatchResult | undefined = undefined
        let bestMismatches: string[] = []
        // ideally want indexes: [OMI, ..., last,  0, ...OMI-1
        for (let actualIndex = 0; actualIndex < actualElements.length; actualIndex++) {
            const actualElement = actualElements[actualIndex]
            if (unassignedActualElements.has(actualIndex)) {
                const mismatches: string[] = []
                const matchResult = matcher.mismatches(context.add(`[${actualIndex}]`),
                    mismatches, actualElement)
                if (matchResult.passed()) {
                    const allowanceForSameIndex = actualIndex === originalMatcherIndex ? 0.1 : 0.0
                    const acceptMatch = ofType.isUndefined(bestMatchResult) ||
                        matchResult.matchRate + allowanceForSameIndex > bestMatchResult.matchRate
                    if (acceptMatch) {
                        bestMatchResult = matchResult
                        bestAssignedActualIndex = actualIndex
                        bestMismatches = mismatches
                    }
                }
            }
        }
        if (ofType.isDefined(bestMatchResult)) {
            unassignedMatchers.delete(originalMatcherIndex)
            unassignedActualElements.delete(bestAssignedActualIndex)
            assignments.push({
                actualElementIndex: bestAssignedActualIndex,
                matcherIndex: originalMatcherIndex,
                matchResult: bestMatchResult,
                mismatches: bestMismatches
            })
        }
    }

    // See doc above for the details of this
    const findBestPartialMatchForMatcher = <T>(context: ContextOfValidationError,
                                               matcher: DiffMatcher<T>,
                                               originalMatcherIndex: number,
                                               actualElements: T[],
                                               unassignedActualElements: Set<number>,
                                               unassignedMatchers: Set<number>,
                                               assignments: Assignment<T>[]) => {
        let bestAssignedActualIndex = -1
        let bestMatchResult: MatchResult | undefined = undefined
        let bestMismatches: string[] = []
        for (let actualIndex = 0; actualIndex < actualElements.length; actualIndex++) {
            const actualElement = actualElements[actualIndex]
            if (unassignedActualElements.has(actualIndex)) {
                const mismatches: string[] = []
                const matchResult = matcher.mismatches(context.add(`[${actualIndex}]`),
                    mismatches, actualElement)
                if (matchResult.matchRate > 0.0) {
                    const allowanceForSameIndex = actualIndex === originalMatcherIndex ? 0.1 : 0.0
                    const acceptMatch = ofType.isUndefined(bestMatchResult) ||
                        matchResult.matchRate + allowanceForSameIndex > bestMatchResult.matchRate
                    if (acceptMatch) {
                        bestMatchResult = matchResult
                        bestAssignedActualIndex = actualIndex
                        bestMismatches = mismatches
                    }
                }
            }
        }
        if (ofType.isDefined(bestMatchResult)) {
            unassignedMatchers.delete(originalMatcherIndex)
            unassignedActualElements.delete(bestAssignedActualIndex)
            assignments.push({
                actualElementIndex: bestAssignedActualIndex,
                matcherIndex: originalMatcherIndex,
                matchResult: bestMatchResult,
                mismatches: bestMismatches
            })
        }
    }

    export const emptyAssignment: Assignations<any> = {
        assignments: [],
        unassignedActualElements: [],
        unassignedMatchers: []
    }
}

export type Assignment<T> = {
    actualElementIndex: number
    matcherIndex: number
    matchResult: MatchResult
    mismatches: string[]
}

export type Assignations<T> = {
    assignments: Assignment<T>[]
    unassignedActualElements: number[]
    unassignedMatchers: number[]
}


/*
    // Assumes we don't share Matchers:
    export const determineMatches = <T>(context: ContextOfValidationError,
                                        matchers: DiffMatcher<T>[],
                                        actualElements: T[]): [Map<T, ExtendedMatchResult[]>, Map<DiffMatcher<T>, T[]>] => {
        const objectToMatches: Map<T, ExtendedMatchResult[]> = new Map() // todo Consider array instead
        // objectToMatches = new Array(actualElements.length); objectToMatches.fill([])
        const matcherToActualElements: Map<DiffMatcher<T>, T[]> = new Map() // todo Consider array instead
        for (let actual of actualElements) {
            for (let matcher of matchers) {
                const mismatches: Mismatched[] = []
                const matchResult = matcher.mismatches(context, mismatches, actual)
                if (matchResult.matches > 0.01) {
                    MapToArray.set(objectToMatches, actual, {matcher, matchResult, mismatches})
                    MapToArray.set(matcherToActualElements, matcher, actual)
                }
            }
        }
        return [objectToMatches, matcherToActualElements]
    }

    //
             First order the matchers so that the most specific are handled first.
             For each matcher:
                 o Find objects that partially matched with it
                 o For each of those objects:
                     o Get the partial matches that were made on them
                     o Find the best of those that involves our matcher of interest, across all objects
                 0 assign that matcher to that best object
         //
    export const determineBestMatches = <T>(matchers: DiffMatcher<T>[],
                                            objectToMatches: Map<T, ExtendedMatchResult[]>,
                                            matcherToActualElements: Map<DiffMatcher<T>, T[]>): Map<T, ExtendedMatchResult> => {
        const orderedMatchers = [...matchers].sort(
            (m1, m2) => m1.specificity - m2.specificity) // todo check ordering here
        const objectToBestMatch: Map<T, ExtendedMatchResult> = new Map() // todo Consider array instead
        const assignedActualElement: Set<T> = new Set() // Used to exclude from consideration if already assigned
        for (let matcher of orderedMatchers) {
            let matchedActualElements = matcherToActualElements.get(matcher)
            if (ofType.isDefined(matchedActualElements) && matchedActualElements.length > 0) {
                determineBestAssignmentOfMatcher(matcher, matchedActualElements,
                    assignedActualElement, objectToMatches, objectToBestMatch)
            }
        }
        return objectToBestMatch
    }

    // todo note that we do want a Map returned here because the compare() fn for diff gives us the value, not the index
    const determineBestAssignmentOfMatcher = <T>(matcher: DiffMatcher<T>,
                                                 matchedActualElements: T[],
                                                 assignedActualElement: Set<T>,
                                                 objectToMatches: Map<T, ExtendedMatchResult[]>,
                                                 objectToBestMatch: Map<T, ExtendedMatchResult>) => {
        let bestMatch: ExtendedMatchResult | undefined = undefined
        let bestActual: T = matchedActualElements[0]
        for (let actual of matchedActualElements) {
            if (!assignedActualElement.has(actual)) {
                const results = objectToMatches.get(actual)!
                if (results.length > 0) {
                    for (let result of results) {
                        if (result.matcher == matcher) {
                            if (ofType.isUndefined(bestMatch) || result.matchResult.matchRate > bestMatch.matchResult.matchRate) {
                                // W// todo Maybe do two passes - one to pick up passed ones, and then partials
                                if (result.matchResult.passed()) {
                                    assignedActualElement.add(actual)
                                    objectToBestMatch.set(actual, result)
                                    return
                                }
                                bestMatch = result
                                bestActual = actual
                            }
                        }
                    }
                }
            }
        }
        assignedActualElement.add(bestActual)
        if (ofType.isDefined(bestMatch)) {
            objectToBestMatch.set(bestActual, bestMatch)
        }
    }
}


export type ExtendedMatchResult = {
    matcher: DiffMatcher<any>,
    matchResult: MatchResult,
    mismatches: Mismatched[]
}

const determineBestMatches22222222 = <T>(actualElements: T[],
                                         matchers: DiffMatcher<T>[],
                                         objectToMatches: Map<T, ExtendedMatchResult[]>): Map<T, ExtendedMatchResult> => {
    const objectToBestMatch: Map<T, ExtendedMatchResult> = new Map()
    const assignedMatchers: Set<DiffMatcher<any>> = new Set()
    for (let actual of actualElements) {
        const results = objectToMatches.get(actual)
        if (ofType.isDefined(results)) {
            if (results.length > 0) {
                let bestMatch = results[0]
                for (let result of results) {
                    if (!assignedMatchers.has(result.matcher)) {
                        if (result.matchResult.passed()) {
                            bestMatch = result
                            break // out of inner loop
                        }
                        if (result.matchResult.matchRate > bestMatch.matchResult.matchRate) {
                            bestMatch = result
                        }
                    }
                }
                objectToBestMatch.set(actual, bestMatch)
                assignedMatchers.add(bestMatch.matcher)
            }
        }

    }
    return objectToBestMatch
}
*/
import {ContextOfValidationError, DiffMatcher} from "../matcher/DiffMatcher";
import * as diff from "fast-array-diff";
import {MatchResult} from "../MatchResult";
import {Assignations, Assignment, BestMatcherAssignments} from "./BestMatcherAssignments"
import {ofType} from "../ofType"
import {DeltaMapping, mapDeltas} from "./mapDeltas"
import {newArrayResultAccumulator} from "./arrayResultAccumulator"

/*
        Will replace the ArrayMatcher once all working... // todo

        Match the actual elements against the matchers.
        The diff algorithm is only set up for exact matches.
        So we need to fool it to do partial diffing for us.
        Steps:
          + Determine the best assignment of matchers and actual elements (heuristic based)
          + Run the diff algorithm: an element and a matcher are considered "equal" if they are assigned together.
          + Take the deltas that result from the diff, and map them into a useful form, based on the ordering of the
            actual elements and the matchers.
 */

type Triple<T> = [DeltaMapping[], Assignations<T>, Map<number, Assignment<T>>]

export module ArrayDiff {
    // exported for testing only
    export const determineMatchResultOrDeltaMappings = <T>(
        context: ContextOfValidationError,
        actualElements: any[],
        matchers: DiffMatcher<T>[]): Triple<T> => {
        // Allow for both empty:
        if (actualElements.length === 0 && matchers.length === 0) {
            return [[], BestMatcherAssignments.emptyAssignment, new Map()]
        }
        // 1. Find the best matcher/element assignments:
        const assignations: Assignations<T> = BestMatcherAssignments.determine(context, actualElements, matchers)
        const assignedActualElements: Map<number, Assignment<T>> = new Map() // By actualElements index
        assignations.assignments.forEach(assignment => {
            assignedActualElements.set(assignment.actualElementIndex, assignment)
        })

        // 2. Run the diff:
        const compare = (actualIndex: number, matcherIndex: number): boolean => {
            const assign = assignedActualElements.get(actualIndex)
            return ofType.isDefined(assign) && assign.matcherIndex === matcherIndex
        }

        const actualElementIndexes: number[] = Object.keys(actualElements).map(s => parseInt(s))
        const matcherIndexes: number[] = Object.keys(matchers).map(s => parseInt(s))

        // 3. Get patch deltas.
        const deltas = diff.getPatch(actualElementIndexes, matcherIndexes, compare)

        // 4. Map the deltas into a useful form for reporting the outcomes of the fuzzy diff:
        const mappedDeltas = mapDeltas(deltas, actualElements.length)
        return [mappedDeltas, assignations, assignedActualElements]
    }

    export const matchResulting = <T>(context: ContextOfValidationError,
                                      actualElements: any[],
                                      matchers: DiffMatcher<T>[],
                                      mismatched: string[]): MatchResult => {
        const [deltaMappings, assignations, assignedActualElements] =
            determineMatchResultOrDeltaMappings(context, actualElements, matchers)

        if (actualElements.length === 0 && matchers.length === 0) {
            return MatchResult.good(1)
        }

        const resultAccumulator = newArrayResultAccumulator(context, actualElements, matchers, mismatched)
        deltaMappings.forEach((mapping, i) => {
            if (ofType.isDefined(mapping["matched"])) {
                const assignment: Assignment<T> | undefined = assignedActualElements.get(i)
                if (ofType.isDefined(assignment)) {
                    if (assignment.matchResult.passed()) {
                        resultAccumulator.addPass(i, assignment.matchResult.matches)
                    } else {
                        resultAccumulator.addMatchResult(assignment.matchResult, assignment.mismatches)
                    }
                } else {
                    resultAccumulator.extraActual(i) // Not expected to happen
                }
            } else { // actualRemoved
                let possiblyOutOfOrder: Assignment<T> | undefined = assignedActualElements.get(i)
                if (ofType.isDefined(possiblyOutOfOrder) && possiblyOutOfOrder.matchResult.matches > 0.1) {
                    if (possiblyOutOfOrder.matchResult.passed()) {
                        resultAccumulator.outOfOrder(i)
                    } else {
                        resultAccumulator.outOfOrderWithPartialMatch(i, possiblyOutOfOrder.matchResult)
                    }
                } else {
                    resultAccumulator.extraActual(i)
                }
            }
        })
        // Include any matchers that were unassigned
        assignations.unassignedMatchers.forEach(i => {
            resultAccumulator.extraMatcher(i)
        })

        return resultAccumulator.getMatchResult()
    }
}

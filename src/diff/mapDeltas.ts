import {ContextOfValidationError, DiffMatcher} from "../matcher/DiffMatcher"
import {Assignations, Assignment, BestMatcherAssignments} from "./BestMatcherAssignments"
import {PrettyPrinter} from "../prettyPrint/PrettyPrinter"
import {ofType} from "../ofType"
import * as diff from "fast-array-diff"
import {MatchResult} from "../MatchResult"
import {PatchItem} from "fast-array-diff/dist/diff/patch"

export type DeltaMapping = { matched: number } | { actualRemoved: number }

/*
const es = diff.getPatch([1, 2, 3], [2, 3, 4]);
                          actuals    matchers
// Result is:
// [
//     { type: "remove", oldPos: 0, newPos: 0, items: [1] },  // removed from actual elements
//     { type: "add", oldPos: 3, newPos: 2, items: [4] }, // added from matchers
// ]

        diff.patch() returns deltas, "add" and "remove", as shown above
        Based on the actualElements array, use those deltas to determine, for each actual element:
          + The element was (partially) matched
              + If passed, the actual element is shown; otherwise
              + The diff of the MatchResult is shown
          + the element was not matched, so show "expected"

 */

export const mapDeltas = (deltas: PatchItem<any>[], actualElementsCount: number): DeltaMapping[] => {
    // PrettyPrinter.logToConsole({deltas, at: "mapDeltas.ts:30"}) // todo RM Remove

    let results: DeltaMapping[] = []
    let actualIndex = 0
    let addedCount = 0 // This tracks how many items (matchers) that diff has added
    deltas.forEach(delta => {
        // delta has oldPos: number, and items: any[]
        switch (delta.type) {
            case "add":
                // Matchers have been added. We ignore those now and put them at the end.
                // Add actual elements that were not mentioned up to that point, but did match
                const start = Math.min(delta.oldPos + addedCount, actualElementsCount)
                while (actualIndex < start) {
                    results.push({matched: actualIndex++})
                }
                // addedCount += delta.items.length - 1
                break
            case "remove":
                // Actual elements are missing, and so are "removed"
                // Add actual elements that were not mentioned up to that point
                const start2 = Math.min(delta.oldPos + addedCount, actualElementsCount)
                while (actualIndex < start2) {
                    results.push({matched: actualIndex++})
                }
                // Mark the actual elements as expected
                delta.items.forEach(() => {
                    results.push({actualRemoved: actualIndex++})
                })
                break
        }
    })
    // Handle any remaining actual elements
    for (let i = actualIndex; i < actualElementsCount; i++) {
        results.push({matched: i})
    }
    return results
}

export const differences = <T>(context: ContextOfValidationError,
                               actualElements: any[],
                               matchers: DiffMatcher<any>[]) => {
    const assignations: Assignations<T> = BestMatcherAssignments.determine(context, actualElements, matchers)
    const assignedActualElements: Map<T, Assignment<T>> = new Map()
    assignations.assignments.forEach(a => {
        assignedActualElements.set(actualElements[a.actualElementIndex], a)
    })

    const compare = (value: T, matcher: DiffMatcher<T>): boolean => {
        const assign = assignedActualElements.get(value)
        return ofType.isDefined(assign) && matchers[assign.matcherIndex] === matcher
    }


    PrettyPrinter.logToConsole({assignations, at: "arrayDiff.ts:29"}) // todo RM Remove
    const deltas = diff.getPatch(actualElements, matchers, compare)
    // Allow for everything matching, so no deltas
    if (deltas.length === 0) {
        return MatchResult.good(1)
    }
    return mapDeltas(deltas, actualElements.length)
}

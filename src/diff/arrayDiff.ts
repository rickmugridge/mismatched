import {ContextOfValidationError, DiffMatcher} from "../matcher/DiffMatcher";
import * as diff from "fast-array-diff";
import {DoubleMap} from "./DoubleMap";
import {MatchResult} from "../MatchResult";
import {Option, Some} from "prelude-ts";
import {Assignations, Assignment, bestMatcherAssignments} from "./bestMatcherAssignments"
import {ofType} from "../ofType"
import {PrettyPrinter} from "../prettyPrint/PrettyPrinter"
import {Mismatched} from "../matcher/Mismatched"
import {mapDeltas} from "./mapDeltas"
import {newArrayResultAccumulator} from "../utility/arrayResultAccumulator"

export const arrayDiff = <T>(context: ContextOfValidationError,
                             actualElements: any[],
                             matchers: DiffMatcher<T>[],
                             mismatched: Mismatched[]): MatchResult => {
    // Allow for both empty:
    if (actualElements.length === 0 && matchers.length === 0) {
        return MatchResult.good(1)
    }
    const assignations: Assignations<T> = bestMatcherAssignments.determine(context, matchers, actualElements)
    const assignedActualElements: Map<T, Assignment<T>> = new Map()
    assignations.assignments.forEach(a => {
        assignedActualElements.set(actualElements[a.actualElementIndex], a)
    })

    PrettyPrinter.logToConsole({assignations, at: "arrayDiff.ts:27"}) // todo RM Remove

    const compare = (value: T, matcher: DiffMatcher<T>): boolean => {
        const assign = assignedActualElements.get(value)
        return ofType.isDefined(assign) && matchers[assign.matcherIndex] === matcher
    }

    const deltas = diff.getPatch(actualElements, matchers, compare)
    // Allow for everything matching, where there are no deltas:
    if (deltas.length === 0) {
        return MatchResult.good(1)
    }
    PrettyPrinter.logToConsole({deltas, at: "arrayDiff.ts:39"}) // todo RM Remove

    const deltaMapping = mapDeltas(deltas, actualElements.length)
    PrettyPrinter.logToConsole({deltaMapping, at: "arrayDiff.ts:42"}) // todo RM Remove


    const resultAccumulator = newArrayResultAccumulator(context, mismatched, actualElements, matchers)
    deltaMapping.forEach((map, i) => {
        if (map["plus"]) { // todo change that to boolean, true when matched
            const assignment = assignedActualElements.get(actualElements[i])
            if (ofType.isDefined(assignment)) {
                resultAccumulator.wasExpected(assignment.matchResult, i)
            } else {
                resultAccumulator.extraActual(i) // Not expected to happen
            }
        } else {
            let possiblyOutOfOrder: Assignment<T> | undefined = assignedActualElements.get(actualElements[i])
            if (ofType.isDefined(possiblyOutOfOrder)) {
                resultAccumulator.outOfOrder(i)
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
export const arrayDiff11 = <T>(context: ContextOfValidationError,
                               actualElements: any[],
                               matchers: DiffMatcher<T>[],
                               mismatched: Mismatched[]): MatchResult => {
    const assignations: Assignations<T> = bestMatcherAssignments.determine(context, matchers, actualElements)
    const assignedActualElements: Map<T, Assignment<T>> = new Map()
    assignations.assignments.forEach(a => {
        assignedActualElements.set(actualElements[a.actualElementIndex], a)
    })

    PrettyPrinter.logToConsole({assignations, at: "arrayDiff.ts:29"}) // todo RM Remove


    const compare = (value: T, matcher: DiffMatcher<T>): boolean => {
        const assign = assignedActualElements.get(value)
        return ofType.isDefined(assign) && matchers[assign.matcherIndex] === matcher
    }

    const deltas = diff.getPatch(actualElements, matchers, compare)
    // Allow for everything matching, so no deltas
    if (deltas.length === 0) {
        return MatchResult.good(1)
    }

    /*
            So we know what partially matched and what didn't from bestMatcherAssignments.
            Now we deal with how diff actually managed with that data.
            It tells us just what was added and what removed. We have to fill in the blanks.
            It may have decided to not use an actual, event though it was assigned,
            because of the ordering constraint.
     */
    let results: any[] = []
    let expectedOffset = 0
    let actualOffset = 0
    let currentIndex = 0
    let compares = 0 // todo consider making this 1 so we count the fact that we have 2 arrays
    let matches = 0 // todo consider making this 1
    deltas.forEach(delta => {
        // delta has oldPos: number, and items: any[]
        const start = delta.oldPos + actualOffset
        switch (delta.type) {
            case "add": // unexpected
                // First add any actual elements that were OK before the first add
                for (let i = currentIndex; i < start; i++) {
                    results.push(actualElements[i])
                    expectedOffset += 1
                    compares += 1
                    currentIndex += 1
                }
                // // First add any matchers that were missed
                // for (let i = previousIndex; i < start; i++) {
                //     results.push(MatchResult.missingElement(matchers[i]))
                //     mismatched.push(Mismatched.missing(context, matchers[i]))
                //     expectedOffset += 1
                //     compares += 1
                // }
                actualOffset += delta.items.length
                currentIndex = delta.oldPos + actualOffset
                expectedOffset += delta.items.length
                break
            case "remove":
                // An extra matcher
                // First add in any actual elements that were missed
                for (let i = currentIndex; i < start; i++) {
                    let matchResult: MatchResult = assignations.assignments[expectedOffset].matchResult
                    matches += matchResult.matches
                    compares += matchResult.compares
                    if (matchResult.passed()) {
                        results.push(matchResult)
                    } else {
                        results.push(matchResult.diff)
                        mismatched.push(Mismatched.wasExpected(context, actualElements[i], matchers[i]))
                    }
                    expectedOffset += 1
                }
                delta.items.forEach(actual => {
                    compares += 1
                    results.push(MatchResult.extraActual(actual)) // unexpected
                    mismatched.push(Mismatched.extraActual(context, actual))
                    expectedOffset += 1
                })
                // Then advance over them
                currentIndex = start + delta.items.length
                break
        }
    })
    PrettyPrinter.logToConsole({previousIndex: currentIndex, at: "arrayDiff.ts:107"}) // todo RM Remove

    // Include any actual elements that have not be included yet
    while (currentIndex < actualElements.length) {
        results.push(actualElements[currentIndex])
        currentIndex++
    }
    // Include any matchers that were missed: ie, expected
    assignations.unassignedMatchers.forEach(i => {
        results.push(MatchResult.extraMatcher(matchers[i]))
        mismatched.push(Mismatched.extraMatcher(context, matchers[i]))
        compares += 1
    })

    return new MatchResult(results, compares, matches)
}
export const arrayDiff22 = <T>(matchers: DiffMatcher<T>[], actuals: any[]): PossibleMatch<T>[] => {
    // Assumes we don't share Matchers:
    const doubleMap = new DoubleMap<T, DiffMatcher<T>, MatchResult>()
    const compare = (value: T, matcher: DiffMatcher<T>) => {
        const matchResult = doubleMap.get(value, matcher);
        if (matchResult) {
            return matchResult.passed() || matchResult.matchedObjectKey;
        }
        const matchResult2 = matcher.trialMatches(value);
        doubleMap.set(value, matcher, matchResult2);
        return matchResult2.passed() || matchResult2.matchedObjectKey;
    }

    const includeMatcher = (pair: PossibleMatch<T>, matcher: DiffMatcher<T>) => {
        if (pair.actual.isSome()) {
            const result = doubleMap.get(pair.actual.getOrThrow(), matcher);
            if (result) {
                pair.matcher = Option.of(matcher)
            }
        }
    }

    const deltas = diff.getPatch(actuals, matchers, compare);
    const result: PossibleMatch<T>[] = actuals.map((actual, index) =>
        ({
            actual: new Some(actual), // as Option.of(undefined) === Option.none()
            actualIndex: index,
            matcher: Option.none()
        }))
    let expectedOffset = 0;
    let actualOffset = 0;
    let removes = 0;
    let previousIndex = 0;
    deltas.forEach(delta => {
        const start = delta.oldPos + actualOffset;
        switch (delta.type) {
            case "add": // expected
                for (let i = previousIndex; i < start; i++) {
                    includeMatcher(result[i], matchers[expectedOffset])
                    expectedOffset += 1
                }
                const insert: PossibleMatch<T>[] = (delta.items as DiffMatcher<T>[]).map(matcher =>
                    ({actual: Option.none(), matcher: Option.of(matcher)}))
                result.splice(start, 0, ...insert);
                actualOffset += delta.items.length;
                previousIndex = delta.oldPos + actualOffset;
                expectedOffset += delta.items.length;
                break;
            case "remove": // unexpected
                for (let i = previousIndex; i < delta.oldPos + actualOffset; i++) {
                    includeMatcher(result[i], matchers[expectedOffset])
                    expectedOffset += 1
                }
                const end = start + delta.items.length
                removes += delta.items.length
                previousIndex = end;
                break;
        }
    })
    for (let i = previousIndex; i < result.length; i++) {
        includeMatcher(result[i], matchers[expectedOffset])
        expectedOffset += 1
    }
    for (let j = 0; j < result.length - 1; j++) {
        if (unexpected(result[j]) && expected(result[j + 1])) {
            const matchResult = result[j + 1].matcher.getOrThrow().matches(result[j].actual.getOrThrow())
            if (matchResult.matchRate > 0) {
                // Combine them
                result[j].matcher = result[j + 1].matcher
                result.splice(j + 1, 1)
            }
        }
    }
    return result
}

export interface PossibleMatch<T> {
    actual: Option<T>
    matcher: Option<DiffMatcher<T>>
    actualIndex?: number // This is always set on return from arrayDiff()
}

const unexpected = <T>(possible: PossibleMatch<T>) => possible.actual.isSome() && possible.matcher.isNone()
const expected = <T>(possible: PossibleMatch<T>) => possible.actual.isNone() && possible.matcher.isSome()

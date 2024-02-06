import {ContextOfValidationError, DiffMatcher} from "../matcher/DiffMatcher";
import * as diff from "fast-array-diff";
import {DoubleMap} from "./DoubleMap";
import {MatchResult} from "../MatchResult";
import {Option, Some} from "prelude-ts";
import {Assignations, Assignment, BestMatcherAssignments} from "./BestMatcherAssignments"
import {ofType} from "../ofType"
import {Mismatched} from "../matcher/Mismatched"
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

type Triple<T> = [DeltaMapping[], Assignations<T>, Map<T, Assignment<T>>]

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
        const assignedActualElements: Map<T, Assignment<T>> = new Map()
        assignations.assignments.forEach(a => {
            assignedActualElements.set(actualElements[a.actualElementIndex], a)
        })

        // 2. Run the diff:
        const compare = (value: T, matcher: DiffMatcher<T>): boolean => {
            const assign = assignedActualElements.get(value)
            return ofType.isDefined(assign) && matchers[assign.matcherIndex] === matcher
        }

        // 3. Get patch deltas.
        const deltas = diff.getPatch(actualElements, matchers, compare)

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
                const assignment: Assignment<T> | undefined = assignedActualElements.get(actualElements[i])
                if (ofType.isDefined(assignment)) {
                    // const assignment = assignations.assignments[i]
                    if (assignment.matchResult.passed()) {
                        resultAccumulator.addPass(i, assignment.matchResult.matches)
                    } else {
                        resultAccumulator.addMatchResult(assignment.matchResult, assignment.mismatches)
                    }
                } else {
                    resultAccumulator.extraActual(i) // Not expected to happen
                }
            } else { // actualRemoved
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

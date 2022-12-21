import {DiffMatcher} from "../matcher/DiffMatcher";
import * as diff from "fast-array-diff";
import {DoubleMap} from "./DoubleMap";
import {MatchResult} from "../MatchResult";
import {Option, Some} from "prelude-ts";

export const arrayDiff = <T>(matchers: DiffMatcher<T>[], actuals: any[]): PossibleMatch<T>[] => {
    const doubleMap = new DoubleMap<T, DiffMatcher<T>, MatchResult>() // Assumes we don't share Matchers
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
    actualIndex?: number
}

const unexpected = <T>(possible: PossibleMatch<T>) => possible.actual.isSome() && possible.matcher.isNone()
const expected = <T>(possible: PossibleMatch<T>) => possible.actual.isNone() && possible.matcher.isSome()

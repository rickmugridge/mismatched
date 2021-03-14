import {DiffMatcher} from "../matcher/DiffMatcher";
import * as diff from "fast-array-diff";
import {MatchResult} from "../MatchResult";

export const arrayDiff = <T>(expected: DiffMatcher<T>[], actual: any[]): [any[],number] => {
    const map = new Map<T, Map<DiffMatcher<T>, MatchResult>>()
    const subMap = (value: T): Map<DiffMatcher<T>, MatchResult> => {
        const map2 = map.get(value)
        if (map2) return map2
        const map3 = new Map<DiffMatcher<T>, MatchResult>();
        map.set(value, map3)
        return map3
    }
    const compare = (value: T, matcher: DiffMatcher<T>) => {
        const map2 = subMap(value)
        const result = map2.get(matcher);
        if (result) {
            return result.passed();
        }
        const matchResult = matcher.matches(value);
        map2.set(matcher, matchResult);
        return matchResult.passed();
    };

    const deltas = diff.getPatch(actual, expected, compare);
    const result = Array.from(actual);
    let offset = 0;
    let removes = 0;
    deltas.forEach(delta => {
        switch (delta.type) {
            case "add":
                const insert = (delta.items as DiffMatcher<T>[]).map(matcher =>
                    ({[MatchResult.expected]: matcher.describe()}))
                result.splice(delta.oldPos + offset, 0, ...insert);
                offset += delta.items.length;
                break;
            case "remove":
                const start = delta.oldPos + offset;
                const end = start + delta.items.length
                for (let i = start; i < end; i++) {
                    result[i] = {[MatchResult.unexpected]: result[i]}
                }
                removes += delta.items.length
                break;
        }
    })
    return [result, actual.length - removes]
}
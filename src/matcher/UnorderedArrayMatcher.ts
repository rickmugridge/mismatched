import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {Mismatched} from "./Mismatched";
import {MatchResult} from "../MatchResult";
import {matchMaker} from "..";
import {ofType} from "../ofType";

/*
       We try each of the matchers in turn and find which element is best matched by that matcher.
       However, if an element is matched by a matcher, it is not considered by subsequent matchers.

       To ensure that matchers like `match.any()` don't match eagerly, we first order the matchers
       but their "specificity". That means that more complex matchers (ie, more deeply nested, etc) will
       be tried before simpler ones. This is a natural constraint or bin-packing heuristic:
       try the one that is harder to fit first.

       Once we have tried a matcher against all array elements, we then pick the best of those matches.
       The array element that is best matched and then not considered further with subsequent matchers.

       This can still mean that the best match-up overall may not be obtained.
       This could be done with a more complex algorithm, matching the matchers against the array elements.
       in all possible orders, and then pick the overall match which is best.
 */

export class UnorderedArrayMatcher<T> extends DiffMatcher<T[]> {
    constructor(private matchers: DiffMatcher<T>[], private subset: boolean) {
        super()
        this.specificity = DiffMatcher.andSpecificity(matchers)
        matchers.sort((a, b) => b.specificity - a.specificity)
    }

    mismatches(context: ContextOfValidationError,
               mismatched: Array<Mismatched>,
               actualArray: T[]): MatchResult {
        if (ofType.isArray(actualArray)) {
            if (actualArray.length === 0 && this.matchers.length === 0) {
                return MatchResult.good(1)
            }
            const matcherPerActual: { matcher?: DiffMatcher<T> } [] =
                actualArray.map(() => ({matcher: undefined}))
            const matchedActual: boolean[] = actualArray.map(() => false)
            const failingMatchers: DiffMatcher<T>[] = []
            this.matchers.forEach(matcher =>
                this.tryMatch(matcher, actualArray, matcherPerActual, matchedActual, failingMatchers))

            let compares = 0
            let matches = 0
            const results = matcherPerActual.map((matched, i) => {
                const actualElement = actualArray[i]
                if (matched.matcher) {
                    const elementContext = context.add("[" + i + "]")
                    const result = matched.matcher.mismatches(elementContext, mismatched, actualElement)
                    compares += result.compares
                    matches += result.matches
                    if (result.passed()) {
                        return actualElement
                    } else {
                        return result.diff
                    }
                } else {
                    if (this.subset) return actualElement
                    compares += 1
                    return {[MatchResult.unexpected]: actualArray[i]}
                }
            })
            compares += failingMatchers.length
            failingMatchers.forEach(matcher => {
                results.push({[MatchResult.expected]: matcher.describe()})
            })
            if (matches == 0 && (actualArray.length === 0 || this.matchers.length === 0)) {
                matches += 0.1
                compares += 1
            }
            return new MatchResult(results, compares, matches)
        }
        mismatched.push(Mismatched.makeExpectedMessage(context, actualArray,
            (this.subset ? "sub" : "") + "array expected"))
        return MatchResult.wasExpected(actualArray, this.describe(), 1, 0)
    }

    // We try each matcher against each element of the array.
    tryMatch(matcher: DiffMatcher<T>,
             actualArray: Array<T>,
             matcherPerActual: { matcher?: DiffMatcher<T> } [],
             matchedActual: boolean[],
             failingMatchers: DiffMatcher<T>[]) {
        let bestActualIndexForMatcher = -1 // track how ell each matcher does and save the best one over all array elements
        let bestMatchResult: MatchResult | undefined = undefined
        for (let i = 0; i < actualArray.length; i++) {
            if (!matchedActual[i]) {
                const actual = actualArray[i]
                const result = matcher.trialMatches(actual)
                if (result.passed() || result.matchedObjectKey) {
                    matchedActual[i] = true
                    matcherPerActual[i].matcher = matcher
                    return
                }
                if (!bestMatchResult || result.matchRate > bestMatchResult!.matchRate) {
                    bestMatchResult = result
                    bestActualIndexForMatcher = i
                }
            }
        }
        if (bestActualIndexForMatcher >= 0) {
            matchedActual[bestActualIndexForMatcher] = true
            matcherPerActual[bestActualIndexForMatcher].matcher = matcher
        } else {
            failingMatchers.push(matcher)
        }
    }

    describe(): any {
        const unorderedArray = Array.from(this.matchers).map(e => e.describe())
        return this.subset ? {subset: unorderedArray} : unorderedArray
    }

    static make<T>(expected: Set<DiffMatcher<T>> | Set<T> | Array<T> | Map<any, any>, subset = false): any {
        if (!expected.values || !ofType.isFunction(expected.values)) {
            throw new Error("UnorderedArrayMatcher needs an Array, Set or Map")
        }
        const elementMatchers = Array.from(expected.values()).map(e => matchMaker(e))
        return new UnorderedArrayMatcher<T>(elementMatchers, subset)
    }
}

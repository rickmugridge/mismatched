import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {Mismatched} from "./Mismatched";
import {MatchResult} from "../MatchResult";
import {matchMaker} from "..";
import {ofType} from "../ofType";

export class UnorderedArrayMatcher<T> extends DiffMatcher<T[]> {
    constructor(private matchers: DiffMatcher<T>[], private subset: boolean) {
        super();
        this.specificity = DiffMatcher.andSpecificity(matchers)
        matchers.sort((a, b) => b.specificity - a.specificity)
    }

    static make<T>(expected: Set<DiffMatcher<T>> | Set<T> | Array<T> | Map<any, any>, subset = false): any {
        if (!expected.values || !ofType.isFunction(expected.values)) {
            throw new Error("UnorderedArrayMatcher needs an Array, Set or Map")
        }
        const elementMatchers = Array.from(expected.values()).map(e => matchMaker(e))
        return new UnorderedArrayMatcher<T>(elementMatchers, subset);
    }

    mismatches(context: ContextOfValidationError,
               mismatched: Array<Mismatched>,
               actuals: T[]): MatchResult {
        if (ofType.isArray(actuals)) {
            if (actuals.length ===0 && this.matchers.length === 0) {
                return new MatchResult(undefined, 1, 1);
            }
            const matcherPerActual: { matcher?: DiffMatcher<T> } [] =
                actuals.map(() => ({matcher: undefined}))
            const matchedActual: boolean[] = actuals.map(() => false)
            const failingMatchers: DiffMatcher<T>[] = []
            this.matchers.forEach(matcher =>
                this.tryMatch(context, matcher, actuals, matcherPerActual, matchedActual, failingMatchers))

            let compares = 0;
            let matches = 0;
            const results = matcherPerActual.map((matched, i) => {
                const actual = actuals[i];
                if (matched.matcher) {
                    const result = matched.matcher.mismatches(context.add("[" + i + "]"), mismatched, actual)
                    compares += result.compares;
                    matches += result.matchRate * result.compares;
                    if (result.passed()) {
                        return actual;
                    } else {
                        return result.diff;
                    }
                } else {
                    if (this.subset) return actual
                    compares += 1
                    return {[MatchResult.unexpected]: actuals[i]}
                }
            })
            compares += failingMatchers.length
            failingMatchers.forEach(matcher => results.push({[MatchResult.expected]: matcher.describe()}))
            return new MatchResult(results, compares, matches);
        }
        mismatched.push(Mismatched.makeExpectedMessage(context, actuals, (this.subset ? "sub" : "") + "array expected"));
        return MatchResult.wasExpected(actuals, this.describe(), 1, 0);
    }

    tryMatch(context: ContextOfValidationError,
             matcher: DiffMatcher<T>,
             actuals: Array<T>,
             matcherPerActual: { matcher?: DiffMatcher<T> } [],
             matchedActual: boolean[],
             failingMatchers: DiffMatcher<T>[]) {
        let bestActualIndex = -1
        let bestMatchResult: MatchResult | undefined = undefined
        for (let i = 0; i < actuals.length; i++) {
            if (!matchedActual[i]) {
                const actual = actuals[i]
                const result = matcher.trialMatches(actual);
                if (result.passed() || result.matchedObjectKey) {
                    matchedActual[i] = true
                    matcherPerActual[i].matcher = matcher
                    return
                }
                if (!bestMatchResult || result.matchRate > bestMatchResult!.matchRate) {
                    bestMatchResult = result
                    bestActualIndex = i
                }
            }
        }
        if (bestActualIndex >= 0) {
            matchedActual[bestActualIndex] = true
            matcherPerActual[bestActualIndex].matcher = matcher
        } else {
            failingMatchers.push(matcher)
        }
    }

    describe(): any {
        const unorderedArray = Array.from(this.matchers).map(e => e.describe());
        return this.subset ? {subset: unorderedArray} : unorderedArray;
    }
}

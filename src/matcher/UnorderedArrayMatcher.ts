import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {Mismatched} from "./Mismatched";
import {MatchResult} from "../MatchResult";
import {matchMaker} from "..";
import {ofType} from "../ofType";

// Like SetMatcher except that we allow for duplicates and so track actuals by their index rather than their value
export class UnorderedArrayMatcher<T> extends DiffMatcher<T[]> {
    private constructor(private expected: DiffMatcher<T>[], private subset: boolean) {
        super();
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
               actuals: Array<T>): MatchResult {
        if (ofType.isArray(actuals)) {
            const remainingMatchers = new Set<DiffMatcher<T>>(this.expected)
            const nearMisses: Map<number, CrossMatch<T>[]> = new Map()
            const completeMisses: T[] = []
            let compares = 0;
            let matches = 0;
            for (let i = 0; i < actuals.length; i++) {
                const actual = actuals[i]
                const result = this.match(context.add(`[${i}]`), mismatched, actual, remainingMatchers);
                if (Array.isArray(result)) {
                    if (result.length === 0) {
                        completeMisses.push(actual)
                    } else {
                        nearMisses.set(i, result)
                    }
                    if (!this.subset)
                        compares += 1
                } else {
                    compares += result.compares;
                    matches += result.matches;
                }
            }
            if (remainingMatchers.size === 0 && nearMisses.size == 0 && (this.subset || completeMisses.length == 0)) {
                return MatchResult.wasExpected(actuals, this.describe(), compares, matches);
            }
            // mismatched.push(Mismatched.make(context, actuals, this.describe()));

            const matchResult = MatchResult.wasExpected(actuals, this.describe(), compares, 0);
            const wrongMatches = this.handleMismatches(actuals, nearMisses, remainingMatchers, completeMisses);

            if (wrongMatches.length > 0) {
                matchResult.diff[MatchResult.differ] = wrongMatches.map(w => w.diff)
            }
            if (!this.subset && completeMisses.length > 0) {
                matchResult.diff[MatchResult.unexpected] = completeMisses
            }
            if (remainingMatchers.size > 0) {
                matchResult.diff[MatchResult.missing] = Array.from(remainingMatchers).map(m => m.describe())
            }
            return matchResult;
        }
        mismatched.push(Mismatched.make(context, actuals, (this.subset ? "sub" : "") + "set expected"));
        return MatchResult.wasExpected(actuals, this.describe(), 1, 0);
    }

    describe(): any {
        const unorderedArray = Array.from(this.expected).map(e => e.describe());
        return this.subset ? {subset: unorderedArray} : unorderedArray;
    }

    // When we first find a match, we return the result. The matcher used is no longer remaining to be used.
    // Otherwise we track the cross matches that failed, so we can pick the best one later
    private match(context: ContextOfValidationError,
                  mismatched: Array<Mismatched>,
                  actual: T,
                  remainingMatchers: Set<DiffMatcher<T>>): MatchResult | CrossMatch<T>[] {
        const missed: CrossMatch<T>[] = []
        for (const matcher of remainingMatchers) {
            const result = matcher.mismatches(context, mismatched, actual);
            if (result.passed()) {
                remainingMatchers.delete(matcher)
                return result;
            }
            missed.push({matcher, result})
        }
        return missed
    }

    // Take the best matches before others, based on the MatchResult.matchRate
    private handleMismatches(actuals: Array<T>,
                             nearMisses: Map<number, CrossMatch<T>[]>,
                             remainingMatchers: Set<DiffMatcher<T>>,
                             completeMisses: T[]): MatchResult[] {
        let nearMissesArray = Array.from(nearMisses)
        nearMissesArray.forEach(e => e[1].sort(sortCrossMatch))
        nearMissesArray = nearMissesArray.sort(expectedMissingArraySort)
        const wrongMatches: MatchResult[] = []
        for (let i = 0; i < nearMissesArray.length; i++) {
            let [valueIndex, crossMatches] = nearMissesArray[i]
            crossMatches = crossMatches.filter(cm => remainingMatchers.has(cm.matcher)) // Some may have since been used
            if (crossMatches.length > 0) {
                const wrongMatch = crossMatches[0]
                wrongMatches.push(wrongMatch.result)
                remainingMatchers.delete(wrongMatch.matcher)
            } else {
                completeMisses.push(actuals[valueIndex])
            }
        }
        return wrongMatches
    }
}

interface CrossMatch<T> {
    matcher: DiffMatcher<T>
    result: MatchResult
}

const sortCrossMatch = <T>(a: CrossMatch<T>, b: CrossMatch<T>) => b.result.matchRate - a.result.matchRate

const expectedMissingArraySort = <T>(a: [number, CrossMatch<T>[]], b: [number, CrossMatch<T>[]]) =>
    b[1][0].result.matchRate - a[1][0].result.matchRate

import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {Mismatched} from "./Mismatched";
import {MatchResult} from "../MatchResult";
import {matchMaker} from "..";
import {ofType} from "../ofType";

export class SetMatcher<T> extends DiffMatcher<Set<T>> {
    private constructor(private expected: Set<DiffMatcher<T>>, private subset: boolean) {
        super();
    }

    static make<T>(expected: Set<DiffMatcher<T>> | Set<T> | Array<T> | Map<any, any>, subset = false): any {
        if (!expected.values || !ofType.isFunction(expected.values)) {
            throw new Error("SetMatcher needs a Set, Array or Map")
        }
        const elementMatchers = Array.from(expected.values()).map(e => matchMaker(e))
        return new SetMatcher<T>(new Set(elementMatchers), subset);
    }

    mismatches(context: ContextOfValidationError,
               mismatched: Array<Mismatched>,
               actual: Set<T> | Array<T> | Map<T, T>): MatchResult {
        if (ofType.isSet(actual) || ofType.isArray(actual) || ofType.isMap(actual)) {
            const remainingMatchers = new Set<DiffMatcher<T>>(this.expected)
            const actualValues = Array.from(actual.values());
            const nearMisses: Map<T, CrossMatch<T>[]> = new Map()
            const completeMisses: T[] = []
            let compares = 0;
            let matches = 0;
            for (const actual of actualValues) {
                const result = this.match(context, mismatched, actual, remainingMatchers);
                if (Array.isArray(result)) {
                    if (result.length === 0) {
                        completeMisses.push(actual)
                    } else {
                        nearMisses.set(actual, result)
                    }
                    if (!this.subset)
                        compares += 1
                } else {
                    compares += result.compares;
                    matches += result.matches;
                }
            }
            const matchResult = MatchResult.wasExpected(actual, this.describe(), compares, matches);
            if (remainingMatchers.size === 0 && nearMisses.size == 0 && (this.subset || completeMisses.length == 0)) {
                return matchResult;
            }
            mismatched.push(Mismatched.make(context, actual, this.describe()));

            const wrongMatches = this.handleMismatches(nearMisses, remainingMatchers, completeMisses);

            matchResult.differ(wrongMatches.map(w => w.diff));
            if (!this.subset) {
                matchResult.unexpected(completeMisses);
            }
            matchResult.missing(Array.from(remainingMatchers).map(m => m.describe()))
            return matchResult;
        }
        mismatched.push(Mismatched.make(context, actual, (this.subset ? "sub" : "") + "set expected"));
        return MatchResult.wasExpected(actual, this.describe(), 1, 0);
    }

    describe(): any {
        const set = new Set(Array.from(this.expected).map(e => e.describe()));
        return this.subset ? {subset: set} : set;
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
    private handleMismatches(nearMisses: Map<T, CrossMatch<T>[]>,
                             remainingMatchers: Set<DiffMatcher<T>>,
                             completeMisses: T[]): MatchResult[] {
        let nearMissesArray = Array.from(nearMisses)
        nearMissesArray.forEach(e => e[1].sort(sortCrossMatch))
        nearMissesArray = nearMissesArray.sort(expectedMissingArraySort)
        const wrongMatches: MatchResult[] = []
        for (let i = 0; i < nearMissesArray.length; i++) {
            let [value, crossMatches] = nearMissesArray[i]
            crossMatches = crossMatches.filter(cm => remainingMatchers.has(cm.matcher)) // Some may have since been used
            if (crossMatches.length > 0) {
                const wrongMatch = crossMatches[0]
                wrongMatches.push(wrongMatch.result)
                remainingMatchers.delete(wrongMatch.matcher)
            } else {
                completeMisses.push(value)
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

const expectedMissingArraySort = <T>(a: [T, CrossMatch<T>[]], b: [T, CrossMatch<T>[]]) =>
    b[1][0].result.matchRate - a[1][0].result.matchRate

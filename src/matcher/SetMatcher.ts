import {DiffMatcher} from "./DiffMatcher";
import {Mismatched} from "./Mismatched";
import {MatchResult} from "../MatchResult";
import {matchMaker} from "..";
import {ofType} from "../ofType";

export class SetMatcher<T> extends DiffMatcher<Set<T>> {
    private constructor(private expected: Set<DiffMatcher<T>>, private subset: boolean) {
        super();
    }

    static make<T>(expected: Set<DiffMatcher<T> | any>, subset = false): any {
        const elementMatchers = Array.from(expected.values()).map(e => matchMaker(e))
        return new SetMatcher<T>(new Set(elementMatchers), subset);
    }

    mismatches(context: string, mismatched: Array<Mismatched>, actual: Set<T>): MatchResult {
        if (ofType.isSet(actual)) {
            const expected = Array.from(this.expected)
            if (!this.subset && actual.size !== expected.length) {
                mismatched.push(Mismatched.make(context, actual, {length: expected.length}));
                return MatchResult.wasExpected(actual, {lengthExpected: expected.length}, 1, 0);
            }
            const copyActualSet = new Set(actual)
            let compares = 0;
            let matches = 0;
            for (const e of this.expected) {
                const result = this.match(e, copyActualSet);
                if (!result || !result.passed()) {
                    mismatched.push(Mismatched.make(context, actual, this.describe()));
                    return MatchResult.wasExpected(actual, this.describe(), 1, 0);
                }
                compares += result.compares;
                matches += result.matches;
            }
            return MatchResult.wasExpected(actual, this.describe(), compares, matches);
        }
        mismatched.push(Mismatched.make(context, actual, (this.subset ? "sub" : "") + "set expected"));
        return MatchResult.wasExpected(actual, this.describe(), 1, 0);
    }

    describe(): any {
        const set = new Set(Array.from(this.expected).map(e => e.describe()));
        return this.subset ? {subset: set} : set;
    }

    private match(expected: DiffMatcher<T>, copyActualSet: Set<T>): MatchResult | undefined {
        for (const a of copyActualSet) {
            const result = expected.matches(a);
            if (result.passed()) {
                copyActualSet.delete(a)
                return result;
            }
        }
        return undefined
    }
}

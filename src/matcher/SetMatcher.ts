import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {Mismatched} from "./Mismatched";
import {MatchResult} from "../MatchResult";
import {matchMaker} from "..";
import {ofType} from "../ofType";
import {UnorderedArrayMatcher} from "./UnorderedArrayMatcher";

export class SetMatcher<T> extends DiffMatcher<Set<T>> {
    unorderedArrayMatcher: UnorderedArrayMatcher<T>

    private constructor(private matchers: DiffMatcher<T>[], private subset: boolean) {
        super();
        this.unorderedArrayMatcher = new UnorderedArrayMatcher(matchers, subset)
        this.specificity = this.unorderedArrayMatcher.specificity
    }

    static make<T>(expected: Set<DiffMatcher<T>> | Set<T> | Array<T> | Map<any, any>, subset = false): any {
        if (!expected.values || !ofType.isFunction(expected.values)) {
            throw new Error("SetMatcher needs a Set, Array or Map")
        }
        const elementMatchers = Array.from(expected.values()).map(e => matchMaker(e))
        return new SetMatcher<T>(elementMatchers, subset);
    }

    mismatches(context: ContextOfValidationError,
               mismatched: Array<Mismatched>,
               actual: Set<T> | Array<T> | Map<T, T>): MatchResult {
        if (ofType.isSet(actual) || ofType.isArray(actual) || ofType.isMap(actual)) {
            const actualValues = Array.from(actual.values());
            return this.unorderedArrayMatcher.mismatches(context, mismatched, actualValues)
        }
        mismatched.push(Mismatched.makeExpectedMessage(context, actual, (this.subset ? "sub" : "") + "set expected"));
        return MatchResult.wasExpected(actual, this.describe(), 1, 0);
    }

    describe(): any {
        const set = this.matchers.map(e => e.describe());
        return this.subset ? {subset: set} : set;
    }
}
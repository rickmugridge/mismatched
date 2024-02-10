import {matchMaker} from "../matchMaker/matchMaker";
import {MatchResult} from "../MatchResult";
import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {Mismatched} from "./Mismatched";
import {ArrayDiff} from "../diff/arrayDiff";
import {ofType} from "../ofType";

export class ArrayMatcher<T> extends DiffMatcher<Array<T>> {
    private constructor(private elementMatchers: Array<DiffMatcher<T>>) {
        super();
        this.specificity = DiffMatcher.andSpecificity(elementMatchers)
    }

    static make<T>(expected: Array<DiffMatcher<T> | any>): any {
        return new ArrayMatcher<T>(expected.map(e => matchMaker(e)));
    }

    mismatches(context: ContextOfValidationError, mismatched: string[], actual: Array<T>): MatchResult {
        if (!ofType.isArray(actual)) {
            mismatched.push(Mismatched.makeExpectedMessage(context, actual, "array expected"));
            return MatchResult.wasExpected(actual, this.describe(), 1, 0);
        }
        return ArrayDiff.matchResulting(context, actual, this.elementMatchers, mismatched)
    }

    describe(): any {
        return this.elementMatchers.map(e => e.describe());
    }
}


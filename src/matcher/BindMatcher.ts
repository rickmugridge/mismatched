import {DiffMatcher} from "./DiffMatcher";
import {Mismatched} from "./Mismatched";
import {MatchResult} from "../MatchResult";
import {isUndefined} from "util";

export class BindMatcher<T> extends DiffMatcher<T> {
    boundValueExpected: T|undefined = undefined

    mismatches(context: string, mismatched: Array<Mismatched>, actual: T): MatchResult {
        if (isUndefined(this.boundValueExpected)) {
            this.boundValueExpected = actual;
            return MatchResult.good(1);
        }
        if (actual === this.boundValueExpected) {
            return MatchResult.good(1);
        }
        mismatched.push(Mismatched.make(context, actual, this.describe()));
        return MatchResult.wasExpected(actual, this.describe(), 1, 0);
    }

    describe(): any {
        return {boundExpected: this.boundValueExpected};
    }

    static make(): any {
        return new BindMatcher()
    }
}
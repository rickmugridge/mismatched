import {DiffMatcher} from "./DiffMatcher";
import {isUndefined} from "util";
import {MatchResult} from "../MatchResult";
import {matchMaker} from "./matchMaker";
import {Mismatch} from "./Mismatch";

export class OptionalMatcher<T> extends DiffMatcher<T> {
    private constructor(private matcher: DiffMatcher<T>) {
        super();
    }

    mismatches(context: string, mismatched: Array<Mismatch>, actual: T): MatchResult {
        if (isUndefined(actual)) {
            return MatchResult.good(1);
        }
        let matchResult = this.matcher.matches(actual);
        if (matchResult.passed()) {
            return MatchResult.good(matchResult.compares);
        }
        mismatched.push(Mismatch.make(context, actual, this.describe()));
        return MatchResult.wasExpected(actual, this.describe(), matchResult.compares, matchResult.matches);
    }

    describe(): any {
        return {optional: this.matcher.describe()};
    }

    static make<T>(matcher: DiffMatcher<T> | any): any {
        return new OptionalMatcher(matchMaker(matcher));
    }
}
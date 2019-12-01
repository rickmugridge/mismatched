import {DiffMatcher} from "./DiffMatcher";
import {MatchResult} from "../MatchResult";
import {matchMaker} from "./matchMaker";
import {Mismatch} from "./Mismatch";

export class NotMatcher<T> extends DiffMatcher<T> {
    private constructor(private matcher: DiffMatcher<T> | any) {
        super();
    }

    mismatches(context: string, mismatched: Array<Mismatch>, actual: T): MatchResult {
        const matchResult = this.matcher.matches(actual);
        if (matchResult.passed()) {
            mismatched.push(Mismatch.make(context, actual, this.describe()));
            return MatchResult.wasExpected(actual, this.describe(), 1, 0);
        }
        return MatchResult.good(1);
    }

    describe(): any {
        return {not: this.matcher.describe()};
    }

    static make<T>(matcher: DiffMatcher<T> | any): any {
        return new NotMatcher(matchMaker(matcher));
    }
}
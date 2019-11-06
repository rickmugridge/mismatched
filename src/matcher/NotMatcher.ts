import {DiffMatcher} from "./DiffMatcher";
import {MatchResult} from "../MatchResult";
import {matchMaker} from "./matchMaker";

export class NotMatcher<T> implements DiffMatcher<T> {
    constructor(private matcher: DiffMatcher<T> | any) {
    }

    matches(actual: T): MatchResult {
        let matchResult = this.matcher.matches(actual);
        if (matchResult.passed()) {
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
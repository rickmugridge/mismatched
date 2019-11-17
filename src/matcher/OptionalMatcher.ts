import {DiffMatcher} from "./DiffMatcher";
import {isUndefined} from "util";
import {MatchResult} from "../MatchResult";
import {matchMaker} from "./matchMaker";

export class OptionalMatcher<T> extends DiffMatcher<T> {
    constructor(private matcher: DiffMatcher<T>) {
        super();
    }

    matches(actual: T): MatchResult {
        if (isUndefined(actual)) {
            return MatchResult.good(1);
        }
        let matchResult = this.matcher.matches(actual);
        if (matchResult.passed()) {
            return MatchResult.good(matchResult.compares);
        }
        return MatchResult.wasExpected(actual, this.describe(), matchResult.compares, matchResult.matches);
    }

    describe(): any {
        return {optional: this.matcher.describe()};
    }

    static make<T>(matcher: DiffMatcher<T> | any): any {
        return new OptionalMatcher(matchMaker(matcher));
    }
}
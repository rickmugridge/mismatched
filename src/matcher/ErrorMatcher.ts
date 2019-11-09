import {DiffMatcher} from "./DiffMatcher";
import {MatchResult} from "../MatchResult";
import {matchMaker} from "./matchMaker";
import {instanceOfMatcher} from "./instanceOfMatcher";

export class ErrorMatcher<T> implements DiffMatcher<T> {
    constructor(private matcher: DiffMatcher<string> | any) {
    }

    matches(actual: T): MatchResult {
        const typeMatchResult = instanceOfMatcher.instanceOf(Error).matches(actual);
        if (!typeMatchResult.passed()) {
            return typeMatchResult;
        }
        const matchResult = this.matcher.matches((actual as any).message);
        if (matchResult.passed()) {
            return MatchResult.good(1);
        }
        return MatchResult.wasExpected(actual, this.describe(), 1, 0);
    }

    describe(): any {
        return {errorMessage: this.matcher.describe()};
    }

    static make<T>(matcher: DiffMatcher<T> | any): any {
        return new ErrorMatcher(matchMaker(matcher));
    }
}
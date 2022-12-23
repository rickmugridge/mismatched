import {DiffMatcher, ContextOfValidationError} from "./DiffMatcher";
import {MatchResult} from "../MatchResult";
import {matchMaker} from "../matchMaker/matchMaker";
import {Mismatched} from "./Mismatched";

export class NotMatcher<T> extends DiffMatcher<T> {
    private constructor(private matcher: DiffMatcher<T>) {
        super();
        this.specificity = matcher.specificity
    }

    mismatches(context: ContextOfValidationError, mismatched: Array<Mismatched>, actual: T): MatchResult {
        const matchResult = this.matcher.matches(actual);
        if (matchResult.passed()) {
            mismatched.push(Mismatched.makeExpectedMessage(context, actual, this.describe()));
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
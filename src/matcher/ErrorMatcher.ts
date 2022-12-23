import {DiffMatcher, ContextOfValidationError} from "./DiffMatcher";
import {MatchResult} from "../MatchResult";
import {matchMaker} from "../matchMaker/matchMaker";
import {instanceOfMatcher} from "./instanceOfMatcher";
import {Mismatched} from "./Mismatched";

export class ErrorMatcher<T> extends DiffMatcher<T> {
    private constructor(private matcher: DiffMatcher<string>) {
        super();
        this.specificity = matcher.specificity
    }

    mismatches(context: ContextOfValidationError, mismatched: Array<Mismatched>, actual: T): MatchResult {
        const typeMatchResult = instanceOfMatcher.instanceOf(Error).mismatches(context, mismatched, actual);
        if (!typeMatchResult.passed()) {
            return typeMatchResult;
        }
        const matchResult = this.matcher.mismatches(context, mismatched, (actual as any).message);
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
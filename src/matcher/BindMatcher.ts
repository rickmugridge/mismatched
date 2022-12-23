import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {Mismatched} from "./Mismatched";
import {MatchResult} from "../MatchResult";
import {matchMaker} from "../matchMaker/matchMaker";

export class BindMatcher<T> extends DiffMatcher<T> {
    boundValueMatcher: DiffMatcher<T> | undefined = undefined

    private constructor(private matcher?: DiffMatcher<T>) {
        super();
        this.specificity = -5 // Delay matching this, all else being equal
    }

    static make<T>(matcher?: DiffMatcher<T> | any): any {
        return new BindMatcher(matcher ? matchMaker(matcher) : undefined)
    }

    // Doesn't save the binding when we running a trial
    mismatches(context: ContextOfValidationError, mismatched: Array<Mismatched>, actual: T): MatchResult {
        if (this.boundValueMatcher === undefined) {
            if (this.matcher) {
                const result = this.matcher.mismatches(context, mismatched, actual)
                if (!context.trialMatch && result.passed()) {
                    this.boundValueMatcher = matchMaker(actual);
                }
                return result
            } else {
                if (!context.trialMatch) {
                    this.boundValueMatcher = matchMaker(actual);
                }
                return MatchResult.good(1);
            }
        }
        return this.boundValueMatcher.mismatches(context, mismatched, actual)
    }

    describe(): any {
        if (this.boundValueMatcher) {
            return {boundTo: this.boundValueMatcher.describe()};
        }
        if (this.matcher) {
            return {boundTo: this.matcher.describe()};
        }
        return {boundTo: undefined};
    }
}
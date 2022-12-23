import {DiffMatcher, ContextOfValidationError} from "./DiffMatcher";
import {isUndefined} from "util";
import {MatchResult} from "../MatchResult";
import {matchMaker} from "..";
import {Mismatched} from "./Mismatched";

export class OptionalMatcher<T> extends DiffMatcher<T> {
    private constructor(private matcher: DiffMatcher<T>) {
        super();
        this.specificity = matcher.specificity
    }

    mismatches(context: ContextOfValidationError, mismatched: Array<Mismatched>, actual: T): MatchResult {
        if (isUndefined(actual)) {
            return MatchResult.good(1);
        }
        return this.matcher.mismatches(context, mismatched, actual);
    }

    describe(): any {
        return {optional: this.matcher.describe()};
    }

    static make<T>(matcher: DiffMatcher<T> | any): any {
        return new OptionalMatcher(matchMaker(matcher));
    }
}
import {DiffMatcher, ContextOfValidationError} from "./DiffMatcher";
import {isNull, isUndefined} from "util";
import {MatchResult} from "../MatchResult";
import {matchMaker} from "..";
import {Mismatched} from "./Mismatched";

export class OptionalNullMatcher<T> extends DiffMatcher<T> {
    private constructor(private matcher: DiffMatcher<T>) {
        super();
    }

    mismatches(context: ContextOfValidationError, mismatched: Array<Mismatched>, actual: T): MatchResult {
        if (isUndefined(actual) || isNull(actual)) {
            return MatchResult.good(1);
        }
        return this.matcher.mismatches(context, mismatched, actual);
    }

    describe(): any {
        return {optionalNull: this.matcher.describe()};
    }

    static make<T>(matcher: DiffMatcher<T> | any): any {
        return new OptionalNullMatcher(matchMaker(matcher));
    }
}
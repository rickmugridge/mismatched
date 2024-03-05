import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {MatchResult} from "../MatchResult";
import {matchMaker} from "..";
import {ofType} from "../ofType";

export class OptionalRecursiveMatcher<T> extends DiffMatcher<T> {
    private constructor(private matcher: () => DiffMatcher<T>) {
        super()
        this.specificity = 1
    }

    mismatches(context: ContextOfValidationError, mismatched: string[], actual: T): MatchResult {
        if (ofType.isUndefined(actual)) {
            return MatchResult.good(1)
        }
        return this.matcher().mismatches(context, mismatched, actual)
    }

    describe(): any {
        return {optionalRecursive: this.matcher().describe()}
    }

    static make<T>(matcher: () => DiffMatcher<T> | any): any {
        return new OptionalRecursiveMatcher(()=> matchMaker(matcher()))
    }
}
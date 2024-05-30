import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {MatchResult} from "../MatchResult";
import {PrettyPrinter} from "../prettyPrint/PrettyPrinter"
import {matchMaker} from "../matchMaker/matchMaker"

export class SelectivelyAssertMatcher<T> extends DiffMatcher<T> {
    reported = false
    private constructor(private matcher: DiffMatcher<T>) {
        super()
        this.specificity = matcher.specificity
    }

    static make<T>(matcher: T): any {
        return new SelectivelyAssertMatcher(matchMaker(matcher));
    }

    mismatches(context: ContextOfValidationError, mismatched: Array<string>, actual: T): MatchResult {
        const matchResult = this.matcher.mismatches(context, mismatched, actual);
        if (!this.reported && !matchResult.passed()) {
            PrettyPrinter.make().logToConsole(
                {
                    "Selective assertion ": context.context,
                    actual,
                    diff: matchResult.diff
                })
            console.log('---------\n')
            this.reported = true
        }
        return matchResult
    }

    describe(): any {
        return this.matcher.describe()
    }
}

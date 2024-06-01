import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {MatchResult} from "../MatchResult";
import {matchMaker} from "../matchMaker/matchMaker"
import {PrettyPrinter} from "../prettyPrint/PrettyPrinter"

export class PreviewMatcher<T> extends DiffMatcher<T> {
    private constructor(private matcher: DiffMatcher<T>) {
        super()
        this.specificity = matcher.specificity
    }

    static make<T>(matcher: T): any {
        return new PreviewMatcher(matchMaker(matcher));
    }

    mismatches(context: ContextOfValidationError, mismatched: Array<string>, actual: T): MatchResult {
        const matchResult = this.matcher.mismatches(context, mismatched, actual);
        if (!matchResult.passed()) {
            matchResult.diff[PrettyPrinter.symbolForPreview] = context.context
        }
        return matchResult
    }

    describe(): any {
        return this.matcher.describe()
    }
}


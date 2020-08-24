import {DiffMatcher, ContextOfValidationError} from "./DiffMatcher";
import {Mismatched} from "./Mismatched";
import {MatchResult} from "../MatchResult";
import {matchMaker} from "..";

export class DescribeMatcher<T> extends DiffMatcher<T> {
    private constructor(private matcher: DiffMatcher<T>, private description: (actual: any, context:string) => any) {
        super();
    }

    static make<T>(matcher: DiffMatcher<T> | any, description: (actual: any, context:string) => any): any {
        return new DescribeMatcher(matchMaker(matcher), description)
    }

    mismatches(context: ContextOfValidationError, mismatched: Array<Mismatched>, actual: T): MatchResult {
        const matchResult = this.matcher.mismatches(context, [], actual);
        if (matchResult.passed()) {
            return MatchResult.good(matchResult.compares);
        }
        mismatched.push(this.description(actual, context.context));
        return matchResult; // Has no impact on assertThat() results
    }

    describe(): any {
        return "describe";
    }
}
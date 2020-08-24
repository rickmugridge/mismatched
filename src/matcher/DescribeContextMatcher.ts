import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {Mismatched} from "./Mismatched";
import {MatchResult} from "../MatchResult";
import {matchMaker} from "..";

export class DescribeContextMatcher<T> extends DiffMatcher<T> {
    private constructor(private describeContext: (outerContext: string, actual: any) => string, private matcher: DiffMatcher<T>) {
        super();
    }

    static make<T>(describeContext: (outerContext: string, actual: any) => string, matcher: DiffMatcher<T> | any): any {
        return new DescribeContextMatcher(describeContext, matchMaker(matcher))
    }

    mismatches(context: ContextOfValidationError, mismatched: Array<Mismatched>, actual: T): MatchResult {
        const newContext = new ContextOfValidationError(
            this.describeContext(context.outerContext(), actual), true)
        return this.matcher.mismatches(newContext, mismatched, actual);
    }

    describe(): any {
        return "describeContext";
    }
}
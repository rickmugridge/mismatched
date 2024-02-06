import {PredicateMatcher} from "./PredicateMatcher";
import {ofType} from "../ofType";
import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {Mismatched} from "./Mismatched";
import {MatchResult} from "../MatchResult";

export class DateMatcher extends DiffMatcher<Date> {
    private constructor(private expected: Date) {
        super()
    }

    mismatches(context: ContextOfValidationError, mismatched: string[], actual: Date): MatchResult {
        if (ofType.isDate(actual) && actual.getTime() === this.expected.getTime()) {
            return MatchResult.good(1);
        }
        mismatched.push(Mismatched.makeExpectedMessage(context, actual, this.describe()));
        return MatchResult.wasExpected(actual, this.describe(), 1, 0);
    }

    describe(): any {
        return MatchResult.describe(this.expected)
    }

    static make(expected: Date): any {
        return new DateMatcher(expected)
    }
}


export const dateMatcher = {
    before: (expected: Date) => PredicateMatcher.make(value => {
        const date = new Date(value)
        const dateTime = date.getTime()
        return ofType.isDate(date) && dateTime < expected.getTime()
    }, {"date.before": expected}),
    after: (expected: Date) => PredicateMatcher.make(value => {
        const date = new Date(value)
        const dateTime = date.getTime()
        return ofType.isDate(date) && dateTime > expected.getTime()
    }, {"date.after": expected}),
}
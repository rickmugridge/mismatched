import {DiffMatcher, ContextOfValidationError} from "./DiffMatcher";
import {MatchResult} from "../MatchResult";
import {Mismatched} from "./Mismatched";
import {ofType} from "../ofType";
import {PrettyPrinter} from "../prettyPrint/PrettyPrinter";

export class ToBeUnquotedMatcher extends DiffMatcher<any> {
    private constructor(private expected: string) {
        super();
    }

    mismatches(context: ContextOfValidationError, mismatched: Array<Mismatched>, actual: any): MatchResult {
        if (ofType.isObject(actual)) {
            if (actual[PrettyPrinter.symbolForPseudoCall] === this.expected) {
                return MatchResult.good(1);
            }
        }
        mismatched.push(Mismatched.makeExpectedMessage(context, actual, this.describe()));
        return MatchResult.wasExpected(actual, this.describe(), 1, 0);
    }

    describe(): any {
        return MatchResult.describe({toBeUnquoted: this.expected});
    }

    static make(expected: string): any {
        return new ToBeUnquotedMatcher(expected);
    }
}

import {matchMaker} from "../matchMaker/matchMaker";
import {MatchResult} from "../MatchResult";
import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {Mismatched} from "./Mismatched";
import {exceptionMessage} from "../prettyPrint/PrettyPrinter";
import {ofType} from "../ofType";

export class SelectMatcher<T> extends DiffMatcher<T> {
    private constructor(private selector: (t: T) => T) {
        super()
    }

    mismatches(context: ContextOfValidationError, mismatched: Array<Mismatched>, actual: T): MatchResult {
        try {
            const selected = this.selector(actual)
            if (ofType.isUndefinedOrNull(selected)) {
                mismatched.push(Mismatched.makeExpectedMessage(context, actual, this.describe()));
                return MatchResult.wasExpected(actual, this.describe(), 1, 0);
            }
            const matcher = matchMaker(selected)
            return matcher.mismatches(context, mismatched, actual)
        } catch (e) {
            const actualAndException = {actual, exception: exceptionMessage(e)};
            mismatched.push(Mismatched.makeExpectedMessage(context, actualAndException, this.describe()));
            return MatchResult.wasExpected(actualAndException, this.describe(), 1, 0);
        }
    }

    describe(): any {
        return "selectMatch selector to return some value or matcher"
    }

    static make<T>(selector: (t: T) => T): any {
        return new SelectMatcher(selector);
    }
}
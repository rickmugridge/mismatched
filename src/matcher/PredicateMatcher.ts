import {DiffMatcher, ContextOfValidationError} from "./DiffMatcher";
import {MatchResult} from "../MatchResult";
import {isFunction} from "util";
import {PrettyPrinter} from "..";
import {Mismatched} from "./Mismatched";
import {exceptionMessage} from "../prettyPrint/PrettyPrinter";

export class PredicateMatcher extends DiffMatcher<any> {
    private constructor(private expected: (value: any) => boolean, private description: any) {
        super();
        this.specificity = 2
    }

    mismatches(context: ContextOfValidationError, mismatched: Array<Mismatched>, actual: any): MatchResult {
        try {
            if (this.expected(actual)) {
                return MatchResult.good(1);
            }
        } catch (e: any) {
            const actualAndException = {actual, exception: exceptionMessage(e)};
            mismatched.push(Mismatched.makeExpectedMessage(context, actualAndException, this.describe()));
            return MatchResult.wasExpected(actualAndException, this.describe(), 1, 0);
        }
        mismatched.push(Mismatched.makeExpectedMessage(context, actual, this.describe()));
        return MatchResult.wasExpected(actual, this.describe(), 1, 0);
    }

    describe(): any {
        return this.description;
    }

    static make<T>(predicate: (v: any) => boolean,
                   description: any = PrettyPrinter.functionDetails(predicate)): any {
        if (!isFunction(predicate)) {
            throw new Error("Predicate supplied must be a function");
        }
        return new PredicateMatcher(predicate, description);
    }
}
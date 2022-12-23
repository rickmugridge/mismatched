import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {Mismatched} from "./Mismatched";
import {MatchResult} from "../MatchResult";
import {matchMaker} from "../matchMaker/matchMaker";
import {ofType} from "../ofType";

export class ArrayContainsMatcher<T> extends DiffMatcher<Array<T>> {
    private constructor(private matcher: DiffMatcher<T>) {
        super();
        this.specificity = matcher.specificity
    }

    mismatches(context: ContextOfValidationError, mismatched: Array<Mismatched>, actual: Array<T>): MatchResult {
        if (ofType.isArray(actual)) {
            let compares = 0;
            let matches = 0;
            for (let a of actual) {
                const result = this.matcher.matches(a);
                if (result.passed()) {
                    return MatchResult.good(result.compares);
                }
                compares += result.compares;
                matches += result.matchRate * result.compares;
            }
            mismatched.push(Mismatched.makeExpectedMessage(context, actual, this.describe()));
            return MatchResult.wasExpected(actual, this.describe(), compares, matches);
        }
        mismatched.push(Mismatched.makeExpectedMessage(context, actual, "array expected"));
        return MatchResult.wasExpected(actual, this.describe(), 1, 0);
    }

    describe(): any {
        return {"array.contains": this.matcher.describe()};
    }

    static make<T>(expected: DiffMatcher<T> | any): any {
        return new ArrayContainsMatcher<T>(matchMaker(expected));
    }
}

import {DiffMatcher} from "./DiffMatcher";
import {MatchResult} from "../MatchResult";
import {isFunction} from "util";
import {PrettyPrinter} from "..";
import {Mismatch} from "./Mismatch";

export class PredicateMatcher extends DiffMatcher<any> {
    private constructor(private expected: (value: any) => boolean, private description: any) {
        super();
    }

    mismatches(context: string, mismatched: Array<Mismatch>, actual: any): MatchResult {
        if (this.expected(actual)) {
            return MatchResult.good(1);
        }
        mismatched.push(Mismatch.make(context, actual, this.describe()));
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
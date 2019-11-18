import {DiffMatcher} from "./DiffMatcher";
import {MatchResult} from "../MatchResult";
import {isFunction} from "util";
import {PrettyPrinter} from "..";

export class PredicateMatcher extends DiffMatcher<any> {
    constructor(private expected: (value: any) => boolean, private description: any) {
        super();
    }

    matches(actual: any): MatchResult {
        if (this.expected(actual)) {
            return MatchResult.good(1);
        }
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
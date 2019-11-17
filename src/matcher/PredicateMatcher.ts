import {DiffMatcher} from "./DiffMatcher";
import {MatchResult} from "../MatchResult";
import {isFunction} from "util";
import {ofType} from "../ofType";

export class PredicateMatcher implements DiffMatcher<any> {
    constructor(private expected: (value: any) => boolean, private description: any) {
    }

    matches(actual: any): MatchResult {
        const result = this.expected(actual);
        if (!ofType.isBoolean(result)) {
            return MatchResult.wasExpected(actual, "Function in 'is()' must return boolean value",
                1, 0);
        }
        if (result) {
            return MatchResult.good(1);
        }
        return MatchResult.wasExpected(actual, this.describe(), 1, 0);
    }

    describe(): any {
        return this.description;
    }

    static make<T>(predicate: (v: any) => boolean, description: any): any {
        if (!isFunction(predicate)) {
            throw new Error("Predicate in 'is()' must be a function");
        }
        return new PredicateMatcher(predicate, description);
    }
}
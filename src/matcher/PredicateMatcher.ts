import {DiffMatcher} from "./DiffMatcher";
import {MatchResult} from "../MatchResult";
import {ofType} from "../ofType";

export class PredicateMatcher implements DiffMatcher<any> {
    constructor(private expected: (value: any) => boolean, private description: any) {
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

    static make<T>(predicate: (v: any) => boolean, description: any) {
        return new PredicateMatcher(predicate, description);
    }
}
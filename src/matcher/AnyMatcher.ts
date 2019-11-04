import {DiffMatcher} from "./DiffMatcher";
import {matchMaker} from "./matchMaker";
import {MatchResult} from "../MatchResult";

export class AnyMatcher<T> implements DiffMatcher<T> {
    matches(actual: T): MatchResult {
        return MatchResult.wasExpected(actual, this.describe(), 1, 1);
    }

    describe(): any {
        return {any: ""}
    }

    static make<T>() {
        return new AnyMatcher();
    }
}

import {MatchResult} from "../MatchResult";
import {Mismatched} from "./Mismatched";

export abstract class DiffMatcher<T> {
    matches(actual: T): MatchResult {
        return this.mismatches("actual", [], actual);
    }

    abstract mismatches(context: string, mismatched: Array<Mismatched>, actual: T): MatchResult;

    abstract describe(): any;
}

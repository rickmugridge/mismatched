import {MatchResult} from "../MatchResult";
import {Mismatch} from "./Mismatch";

export abstract class DiffMatcher<T> {
    matches(actual: T): MatchResult {
        return this.mismatches("actual", [], actual);
    }

    abstract mismatches(context: string, mismatched: Array<Mismatch>, actual: T): MatchResult;

    abstract describe(): any;
}
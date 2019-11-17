import {MatchResult} from "../MatchResult";

export abstract class DiffMatcher<T> {
    abstract matches(actual: T): MatchResult;

    abstract describe(): any;
}
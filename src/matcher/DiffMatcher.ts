import {MatchResult} from "../MatchResult";

export interface DiffMatcher<T> {
    matches(actual: T): MatchResult;

    describe(): any;
}
import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {ErrorMatcher} from "./ErrorMatcher";
import {Mismatched} from "./Mismatched";
import {DiffMatcher, ContextOfValidationError} from "./DiffMatcher";

describe("ErrorMatcher()", () => {
    it("matches", () => {
        assertThat(new Error("abc")).is(ErrorMatcher.make("abc"));
        assertThat(new Error("abc")).is(new Error("abc"));
    });

    it("mismatches", () => {
        const error = new Error("A");
        assertThat(error).failsWith(ErrorMatcher.make("abc"),
            {
                [MatchResult.was]: match.predicate(v => v === error),
                [MatchResult.expected]: {errorMessage: "abc"}
            });
        assertThat(33).failsWith(ErrorMatcher.make("abc"),
            {[MatchResult.was]: 33, [MatchResult.expected]: {instanceOf: "Error"}});
    });

    it("mismatches: errors", () => {
        const mismatched: Array<Mismatched> = [];
        const matcher = ErrorMatcher.make("abc");
        (matcher as DiffMatcher<any>).mismatches(new ContextOfValidationError(), mismatched, new Error("A"));
        assertThat(mismatched).is([
            {actual: "A", expected: "abc"}
        ]);
    });
});
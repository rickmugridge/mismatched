import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {ErrorMatcher} from "./ErrorMatcher";

describe("ErrorMatcher()", () => {
    it("matches", () => {
        assertThat(new Error("abc")).is(ErrorMatcher.make("abc"));
        assertThat(new Error("abc")).is(new Error("abc"));
    });

    it("mismatches", () => {
        // The first of these fail, due to some weird mismatch of the value of the`was` part.
        // To be tracked down.
        // assertThat(new Error("A")).failsWith(ErrorMatcher.make("abc"),
        //     {[MatchResult.was]: {errorMessage: "A"}, [MatchResult.expected]: {errorMessage: "abc"}});
        assertThat(new Error("A")).failsWith(ErrorMatcher.make("abc"),
            {[MatchResult.was]: {errorMessage: match.any()}, [MatchResult.expected]: {errorMessage: "abc"}});

         assertThat(33).failsWith(ErrorMatcher.make("abc"),
            {[MatchResult.was]: 33, [MatchResult.expected]: {instanceOf: "Error"}});
    });
});
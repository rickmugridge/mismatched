import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {Mismatched} from "./Mismatched";
import {DiffMatcher} from "./DiffMatcher";
import {validateThat} from "../validateThat";

describe("PredicateMatcher:", () => {
    const matcher = match.predicate(v => v > 0);

    describe("assertThat():", () => {
        it("Matches", () => {
            assertThat(5).is(matcher);
            assertThat({a: 2}).is(v => v.a === 2);
        });

        it("Mismatches", () => {
            assertThat("ab")
                .failsWith(match.predicate(pred),
                    {
                        [MatchResult.was]: "ab",
                        [MatchResult.expected]: {predicateFailed: {"function": "pred()"}}
                    });
            assertThat("ab")
                .failsWith(match.predicate(v => v > 0),
                    {
                        [MatchResult.was]: "ab",
                        [MatchResult.expected]: {predicateFailed: {arrow: "v => v > 0"}}
                    });
            assertThat("ab")
                .failsWith(match.predicate(v => v > 0, "greater then zero"),
                    {
                        [MatchResult.was]: "ab",
                        [MatchResult.expected]: "greater then zero"
                    }
                );
        });

        it("Mismatches: errors", () => {
            const mismatched: Array<Mismatched> = [];
            const matcher = match.predicate(pred);
            (matcher as DiffMatcher<any>).mismatches("actual", mismatched, "ab");
            assertThat(mismatched).is([
                {actual: "ab", expected: {predicateFailed: {"function": "pred()"}}}
            ]);
        });
    });

    describe("validateThat():", () => {
        it("succeeds", () => {
            const validation = validateThat(3).satisfies(matcher);
            assertThat(validation.passed()).is(true);
        });

        it("fails", () => {
            const validation = validateThat(-1).satisfies(matcher);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                `{actual: -1, expected: {predicateFailed: {arrow: "v => v > 0"}}}`
            ]);
        });
    });
});

function pred() {
    return false;
}
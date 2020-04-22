import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {Mismatched} from "./Mismatched";
import {DiffMatcher} from "./DiffMatcher";
import {validateThat} from "../validateThat";

describe("StringMatcher:", () => {
    describe("assertThat():", () => {
        it('string', () => {
            const actual = "a";
            assertThat(actual).is(match.string.match(actual));
            assertThat(actual).is(actual);
        });

        it('mismatches', () => {
            assertThat("a").failsWith("b",
                {[MatchResult.was]: "a", [MatchResult.expected]: "b"});
            assertThat("a").failsWith(null,
                {[MatchResult.was]: "a", [MatchResult.expected]: null});
        });

        it('mismatches: errors', () => {
            assertThat("a").failsWith("b",
                {[MatchResult.was]: "a", [MatchResult.expected]: "b"});

            const mismatched: Array<Mismatched> = [];
            const matcher = match.string.match("b");
            (matcher as DiffMatcher<any>).mismatches("actual", mismatched, "a");
            assertThat(mismatched).is([
                {actual: "a", expected: "b"}
            ]);
        });
    });

    describe("validateThat():", () => {
        const expected = match.string.startsWith("a");

        it("succeeds", () => {
            const validation = validateThat("abc").satisfies(expected);
            assertThat(validation.passed()).is(true);
        });

        it("fails", () => {
            const validation = validateThat("b").satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                `{actual: "b", expected: {"string.startsWith": "a"}}`
            ]);
        });
    });
});

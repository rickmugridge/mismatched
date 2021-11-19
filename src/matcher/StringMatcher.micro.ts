import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {Mismatched} from "./Mismatched";
import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {validateThat} from "../validateThat";
import {stringDiff} from "../diff/StringDiff";

describe("StringMatcher:", () => {
    describe("assertThat():", () => {
        it('string', () => {
            const actual = "a";
            assertThat(actual).is(match.string.match(actual));
            assertThat(actual).is(actual);
        });

        it('regular expression', () => {
            assertThat("abc").is(match.string.match(/a.c/));
        });

        it("uuid", () => {
            assertThat('b28a0a82-a721-11e9-9037-077495dd0010').is(match.uuid())
            assertThat('077495dd00').isNot(match.uuid())
        });

        it('not a string', () => {
            assertThat(1 as any).failsWith("a",
                {[MatchResult.was]: 1, [MatchResult.expected]: "a"});
        });

        it('mismatches', () => {
            assertThat("a").failsWith("b",
                {[MatchResult.was]: "a", [MatchResult.expected]: "b"});
            assertThat("a").failsWith(null,
                {[MatchResult.was]: "a", [MatchResult.expected]: null});
        });

        it('mismatches long strings', () => {
            const actual = "abcd-e-fghijk";
            const expected = "abcd+E+fghijk";
            assertThat(actual).failsWith(expected,
                {
                    [MatchResult.was]: actual,
                    [MatchResult.expected]: expected,
                    [MatchResult.differ]: `abcd${stringDiff.missingColour("-e-")}${stringDiff.extraColour("+E+")}fghijk`
                });
        });

        it('mismatches: errors', () => {
            assertThat("a").failsWith("b",
                {[MatchResult.was]: "a", [MatchResult.expected]: "b"});

            const mismatched: Array<Mismatched> = [];
            const matcher = match.string.match("b");
            (matcher as DiffMatcher<any>).mismatches(new ContextOfValidationError(), mismatched, "a");
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

        it("fails string match", () => {
            const expected = "c";
            const validation = validateThat("b").satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                `{actual: "b", expected: "c"}`
            ]);
        });

        it("fails with 'starts with'", () => {
            const validation = validateThat("b").satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                `{actual: "b", expected: {"string.startsWith": "a"}}`
            ]);
        });
    });
});

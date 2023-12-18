import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {Mismatched} from "./Mismatched";
import {DiffMatcher, ContextOfValidationError} from "./DiffMatcher";
import {validateThat} from "../validateThat";

describe("RegExpMatcher:", () => {
    describe("assertThat():", () => {
        it("Matches", () => {
            assertThat("ab").is(match.regEx.match(/a./));
            assertThat("ab").is(/a./ as any);
            assertThat("ab").is(match.regEx.match(/ab/));
            assertThat("AB").is(match.regEx.match(/ab/ig));
            assertThat("AB").is(match.regEx.match(/ab/i));
            assertThat(/[ap]\.?m?\.?/i).is(/[ap]\.?m?\.?/i);
        });

        it("Mismatches", () => {
            assertThat("ab").failsWith(match.regEx.match(/c/),
                {[MatchResult.was]: "ab", [MatchResult.expected]: "/c/"});
        });

        it("Mismatches: errors", () => {
            const mismatched: Array<Mismatched> = [];
            const matcher = match.regEx.match(/c/);
            (matcher as DiffMatcher<any>).mismatches(new ContextOfValidationError(), mismatched, "ab");
            assertThat(mismatched).is([
                {actual: "ab", expected: "/c/"}
            ]);
        });
    });

    describe("validateThat():", () => {
        const expected = match.regEx.match(/a./);

        it("succeeds", () => {
            const validation = validateThat("ab").satisfies(expected);
            assertThat(validation.passed()).is(true);
        });

        it("fails", () => {
            const validation = validateThat("Ab").satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                `{actual: "Ab", expected: "/a./"}`
            ]);
        });
    });
});
import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {Mismatched} from "./Mismatched";
import {DiffMatcher} from "./DiffMatcher";
import {validateThat} from "../validateThat";

describe("DescribeMatcher()", () => {
    const expected = match.describe(() => "four", 4);

    describe("assertThat():", () => {
        it("matches", () => {
            assertThat(4).is(expected);
        });

        it("mismatches", () => {
            assertThat(2).failsWith(expected,
                {[MatchResult.was]: 2, [MatchResult.expected]: "four"});
        });

        it("mismatches: errors", () => {
            const mismatched: Array<Mismatched> = [];
            (expected as DiffMatcher<any>).mismatches("actual", mismatched, 2);
            assertThat(mismatched).is(["four"]);
        });
    });

    describe("validateThat():", () => {
        it("succeeds", () => {
            const validation = validateThat(4).satisfies(expected);
            assertThat(validation.passed()).is(true);
        });

        it("fails", () => {
            const validation = validateThat(3).satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                "four"
            ]);
        });
    });

    it("describe example", () => {
        const results = validateThat({f: "a"})
            .satisfies({
                f: match.describe(actual => `four, not ${actual}`, match.ofType.number())
            })
        assertThat(results.errors).is(["four, not a"])
    });
});
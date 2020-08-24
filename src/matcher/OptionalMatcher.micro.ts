import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {Mismatched} from "./Mismatched";
import {DiffMatcher, ContextOfValidationError} from "./DiffMatcher";
import {validateThat} from "../validateThat";

describe("OptionalMatcher:", () => {
    describe("assertThat():", () => {
        it("Matches", () => {
            assertThat(3).is(match.optional(3));
            assertThat(undefined).is(match.optional(3));
        });

        it("Mismatches", () => {
            assertThat(4).failsWith(match.optional(3),
                {[MatchResult.was]: 4, [MatchResult.expected]: 3});
        });

        it("Mismatches: errors", () => {
            const mismatched: Array<Mismatched> = [];
            const matcher = match.optional(3);
            (matcher as DiffMatcher<any>).mismatches(new ContextOfValidationError(), mismatched, 4);
            assertThat(mismatched).is([
                {actual: 4, expected: 3}
            ]);
        });
    });

    describe("validateThat():", () => {
        const expected = {f: match.optional(match.ofType.number())};

        it("succeeds", () => {
            const validation = validateThat({f: 3}).satisfies(expected);
            assertThat(validation.passed()).is(true);
        });

        it("succeeds when missing", () => {
            const validation = validateThat({}).satisfies(expected);
            assertThat(validation.passed()).is(true);
        });

        it("fails with wrong type", () => {
            const validation = validateThat({f: "wrong"}).satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                `{"actual.f": "wrong", expected: "ofType.number"}`
            ]);
        });
    });
});
import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {Mismatched} from "./Mismatched";
import {DiffMatcher, ContextOfValidationError} from "./DiffMatcher";
import {validateThat} from "../validateThat";

describe("InstanceOfMatcher:", () => {
    describe("assertThat():", () => {
        it("Matches", () => {
            assertThat(new Date()).is(match.instanceOf(Date));
            assertThat({a: 2}).is(match.instanceOf(Object));
        });

        it("Mismatches", () => {
            assertThat("ab")
                .failsWith(match.instanceOf(Date),
                    {[MatchResult.was]: "ab", [MatchResult.expected]: {instanceOf: "Date"}});
            assertThat(null)
                .failsWith(match.instanceOf(Date),
                    {[MatchResult.was]: null, [MatchResult.expected]: {instanceOf: "Date"}});
            assertThat(undefined)
                .failsWith(match.instanceOf(Date),
                    {[MatchResult.expected]: {instanceOf: "Date"}});
        });

        it("Mismatches:errors", () => {
            const mismatched: Array<Mismatched> = [];
            const matcher = match.instanceOf(Date);
            (matcher as DiffMatcher<any>).mismatches(new ContextOfValidationError(), mismatched, "ab");
            assertThat(mismatched).is([
                {actual: "ab", expected: {instanceOf: "Date"}}
            ]);
        });
    });

    describe("validateThat():", () => {
        const expected = match.instanceOf(Object);

        it("succeeds", () => {
            const validation = validateThat({a: 3}).satisfies(expected);
            assertThat(validation.passed()).is(true);
        });

        it("fails", () => {
            const validation = validateThat(false).satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                `{actual: false, expected: {instanceOf: "Object"}}`
            ]);
        });
    });
});
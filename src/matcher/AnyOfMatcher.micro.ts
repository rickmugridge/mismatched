import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {Mismatched} from "./Mismatched";
import {DiffMatcher} from "./DiffMatcher";
import {validateThat} from "../validateThat";

describe("AnyOfMatcher:", () => {
    describe("assertThat():", () => {
        it("Matches", () => {
            assertThat(new Date()).isAnyOf([match.isEquals(3), match.instanceOf(Date)]);
            assertThat({a: 2}).isAnyOf([match.instanceOf(Object)]);
        });

        it("Mismatches", () => {
            assertThat("ab")
                .failsWith(match.anyOf([match.instanceOf(Date)]),
                    {[MatchResult.was]: "ab", [MatchResult.expected]: {instanceOf: "Date"}});
        });

        it("Mismatches: errors", () => {
            const mismatched: Array<Mismatched> = [];
            const matcher = match.anyOf([match.instanceOf(Date), match.instanceOf(Error)]);
            (matcher as DiffMatcher<any>).mismatches("actual", mismatched, "ab");
            assertThat(mismatched).is([
                {actual: "ab", expected: {anyOf: [{instanceOf: "Date"}, {instanceOf: "Error"}]}}
            ]);
        });

        it("Optimise away with a single matcher inside", () => {
            const whatever = match.ofType.array();
            assertThat(match.anyOf([whatever])).is(match.itIs(whatever))
        });
    });

    describe("validateThat():", () => {
        const expected = match.anyOf([
            match.instanceOf(Date),
            match.ofType.number()]);

        it("succeeds", () => {
            const validation = validateThat(3).satisfies(expected);
            assertThat(validation.passed()).is(true);
        });

        it("fails", () => {
            const validation = validateThat(false).satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                `{actual: false, expected: {anyOf: [{instanceOf: "Date"}, "ofType.number"]}}`
            ]);
        });
    });
});
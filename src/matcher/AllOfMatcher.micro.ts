import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {Mismatched} from "./Mismatched";
import {AllOfMatcher} from "./AllOfMatcher";
import {validateThat} from "../validateThat";
import {PrettyPrinter} from "..";

describe("AllOfMatcher:", () => {
    describe("assertThat():", () => {
        it("Matches", () => {
            assertThat({a: 2}).isAllOf([match.instanceOf(Object)]);
            assertThat(new Date()).isAllOf([match.instanceOf(Object), match.instanceOf(Date)]);
        });

        it("Mismatches", () => {
            assertThat(3)
                .failsWith(match.allOf([match.instanceOf(Date), 3]),
                    {[MatchResult.was]: 3, [MatchResult.expected]: {allOf: [{instanceOf: "Date"}, 3]}});
        });

        it("Mismatches: errors", () => {
            const mismatched: Array<Mismatched> = [];
            const matcher = AllOfMatcher.make([match.instanceOf(Date), 3]);
            matcher.mismatches("actual", mismatched, 4);
            assertThat(mismatched).is([
                {actual: 4, expected: {instanceOf: "Date"}},
                {actual: 4, expected: 3}
            ])
        });
    });

    describe("validateThat():", () => {
        it("succeeds", () => {
            const expected = [match.ofType.number()];
            const validation = validateThat(3).satisfies(match.allOf(expected));
            assertThat(validation.passed()).is(true);
        });

        it("fails", () => {
            const expected = match.allOf([match.instanceOf(Date), match.ofType.number()]);
            const validation = validateThat(3).satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.mismatched).is([
                {actual: 3, expected: {instanceOf: "Date"}}
            ])
        });
    });
});
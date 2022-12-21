import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {Mismatched} from "./Mismatched";
import {AllOfMatcher} from "./AllOfMatcher";
import {validateThat} from "../validateThat";
import {ContextOfValidationError} from "./DiffMatcher";

describe("AllOfMatcher:", () => {
    describe("assertThat():", () => {
        it("Matches", () => {
            assertThat({a: 2}).isAllOf([]);
            assertThat({a: 2}).isAllOf([match.instanceOf(Object)]);
            assertThat(new Date()).isAllOf([match.instanceOf(Object), match.instanceOf(Date)]);
        });

        it("Mismatches", () => {
            assertThat(3)
                .failsWith(match.allOf([match.instanceOf(Date), 3]),
                    {[MatchResult.was]: 3, [MatchResult.expected]: {instanceOf: "Date"}});
        });

        it("Mismatches: errors", () => {
            const mismatched: Array<Mismatched> = [];
            const matcher = AllOfMatcher.make([match.instanceOf(Date), 3]);
            matcher.mismatches(new ContextOfValidationError(), mismatched, 4);
            assertThat(mismatched).is([
                {actual: 4, expected: {instanceOf: "Date"}},
                {actual: 4, expected: 3}
            ])
        });

        it("Optimise with 1", () => {
            const whatever = match.ofType.array();
            assertThat(match.allOf([whatever])).is(match.itIs(whatever))
        });

        it("Optimise with 1 left after removing match.any()s", () => {
            const whatever = match.ofType.array();
            assertThat(match.allOf([match.any(), whatever, match.any()])).is(match.itIs(whatever))
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
            assertThat(validation.errors).is([
                `{actual: 3, expected: {instanceOf: "Date"}}`
            ])
        });
    });
});
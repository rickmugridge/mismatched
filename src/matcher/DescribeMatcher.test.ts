import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {Mismatched} from "./Mismatched";
import {DiffMatcher, ContextOfValidationError} from "./DiffMatcher";
import {validateThat} from "../validateThat";

describe("DescribeMatcher()", () => {
    const expected = match.describe(4, (actual, context) => context + ": four");

    describe("assertThat():", () => {
        it("matches", () => {
            assertThat(4).is(expected);
        });

        it("mismatches", () => {
            assertThat(2).failsWith(expected,
                {[MatchResult.was]: 2, [MatchResult.expected]: 4});
        });

        it("mismatches: errors", () => {
            const mismatched: Array<Mismatched> = [];
            (expected as DiffMatcher<any>).mismatches(new ContextOfValidationError(), mismatched, 2);
            assertThat(mismatched).is(["actual: four"]);
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
                "actual: four"
            ]);
        });

        it("fails with specified context", () => {
            const description = (actual, context) => `f of person ${context} should be four`;
            const expected = match.describeContext((_,a) => a.id,
                {id: 1, f: match.describe(4, description)});
            const validation = validateThat({id: 1, f: 3}).satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                "f of person 1 should be four"
            ]);
        });

        it("Provides tailored validation error messages", () => {
            const nameDescription = (actual, context) => `The name of person #${context} should be a string`;
            const ageDescription = (actual, context) => `The current age of person #${context} should be a positive number`;
            const expected = match.describeContext((_, a) => a.personId,
                {
                    personId: match.ofType.number(),
                    name: match.describe(match.ofType.string(), nameDescription),
                    age: match.describe(match.number.greaterEqual(0), ageDescription)
                });
            const validation = validateThat({personId: 11, name: 3, age: -1}).satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                "The name of person #11 should be a string",
                "The current age of person #11 should be a positive number"
            ]);
        });

        it("Provides tailored validation error messages with array", () => {
            const nameDescription = (actual, context) => `The name of person #${context} should be a string`;
            const ageDescription = (actual, context) => `The current age of person #${context} should be a positive number`;
            const expected = match.array.every(
                match.describeContext((_,person) => person.personId || 'unknown',
                    {
                        personId: match.any(),
                        name: match.describe(match.ofType.string(), nameDescription),
                        age: match.describe(match.number.greaterEqual(0), ageDescription)
                    })
            );
            const actual = [
                {personId: 11, name: 3, age: 5},
                {personId: 12, name: 'orange', age: -1},
                {personId: undefined, name: 'pear', age: -1}
            ];
            const validation = validateThat(actual).satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                "The name of person #11 should be a string",
                "The current age of person #12 should be a positive number",
                "The current age of person #unknown should be a positive number"
            ]);
        });
    });

    it("describe example", () => {
        const results = validateThat({f: "a"})
            .satisfies({
                f: match.describe(match.ofType.number(), actual => `four, not ${actual}`)
            })
        assertThat(results.errors).is(["four, not a"])
    });
});
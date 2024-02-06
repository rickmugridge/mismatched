import {assertThat} from "../assertThat";
import {match} from "../match";
import {wasExpected} from "./Mismatched";
import {validateThat} from "../validateThat";

describe("array.contains:", () => {
    describe("assertThat():", () => {
        it('number', () => {
            const actual = [1, 2, 3];
            assertThat(actual).is(match.array.contains(2));
        });

        it('string', () => {
            const actual = ["a", "b"];
            assertThat(actual).is(match.array.contains("b"));
        });

        it('does not match', () => {
            const actual = ["a", "b"];
            assertThat(actual).failsWith(match.array.contains("c"),
                wasExpected(actual, {"array.contains": "c"}))
        });

        it('partially matched', () => {
            const actual = [{a:1, c: "e"}, "b"];
            assertThat(actual).failsWith(match.array.contains({a:1, c: "f"}),
                 {a:1, c: wasExpected("e","f")})
        });

        it('does not match with empty array', () => {
            assertThat([]).failsWith(match.array.contains("c"),
                wasExpected([], {"array.contains": "c"}));
        });
    });

    describe("validateThat():", () => {
        const expected = match.array.contains(match.ofType.number());

        it("succeeds", () => {
            const validation = validateThat([1, 2, 3]).satisfies(expected);
            assertThat(validation.passed()).is(true);
        });

        it("fails in an element of the array", () => {
            const validation = validateThat(["1", "2", "3"]).satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                `actual: ["1", "2", "3"], expected: {"array.contains": "ofType.number"}`
            ])
        });

        it("fails as not an array", () => {
            const validation = validateThat(4).satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                `actual: 4, expected: "array expected"`
            ])
        });
    });
});

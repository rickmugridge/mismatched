import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {Mismatched} from "./Mismatched";
import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {validateThat} from "../validateThat";
import {ArrayMatcher} from "./ArrayMatcher";

describe("array.match:", () => {
    describe("assertThat():", () => {
        it('matches', () => {
            const actual = [2, 2, 2];
            assertThat(actual).is([2, 2, 2]);
        });

        it('matches literally', () => {
            const actual = [2, 2, 2];
            assertThat(actual).is([2, 2, 2]);
        });

        it('Length difference: Removal', () => {
            const actual = ["a", "b", "c", "d"];
            const expected = ["a", "c"];
            assertThat(actual).failsWith(expected,
                [
                    "a",
                    {[MatchResult.unexpected]: "b"},
                    "c",
                    {[MatchResult.unexpected]: "d"}
                ]);
            const matcher: ArrayMatcher<string> = ArrayMatcher.make(expected)
            const result = matcher.matches(actual)
            assertThat(result.matchRate).is(0.5)
        });

        it('Length difference: Addition', () => {
            const actual = ["c", "d"];
            const expected = ["a", "b", "c", "d"];
            assertThat(actual).failsWith(expected as any,
                [{[MatchResult.expected]: "a"}, {[MatchResult.expected]: "b"}, "c", "d"]);
            const matcher: ArrayMatcher<string> = ArrayMatcher.make(expected)
            const result = matcher.matches(actual)
            assertThat(result.matchRate).is(0.5)
        });

        it('Length difference: Removal and Addition', () => {
            const actual = ["b", "x", "y"];
            const expected = ["a", "b", "c", "x"];
            assertThat(actual).failsWith(expected as any,
                [
                    {[MatchResult.expected]: "a"}, "b", {[MatchResult.expected]: "c"}, "x",
                    {[MatchResult.unexpected]: "y"}
                ]);
            const matcher: ArrayMatcher<string> = ArrayMatcher.make(expected)
            const result = matcher.matches(actual)
            assertThat(result.matchRate).is(0.5)
        });

        it('Length difference: Removal and Addition with objects', () => {
            assertThat([{b: "b"}, ["x"], "y"]).failsWith([{a: "a"}, {b: "b"}, "c", ["x"]] as any,
                [{[MatchResult.expected]: {a: "a"}}, {b: "b"}, {[MatchResult.expected]: "c"}, ["x"],
                    {[MatchResult.unexpected]: "y"}]);
        });

        it('does not match: length difference: errors', () => {
            const mismatched: Array<Mismatched> = [];
            const matcher = match.array.match(["a", "b", "c"]);
            (matcher as DiffMatcher<any>).mismatches(new ContextOfValidationError(), mismatched, ["a", "b"]);
            assertThat(mismatched).is([
                {actual: ["a", "b"], expected: {length: 3}}
            ]);
        });

        it('does not match: values mismatch', () => {
            const actual = ["a", "b"];
            assertThat(actual).failsWith(["a", "c"],
                ["a", {[MatchResult.was]: "b", [MatchResult.expected]: "c"}]);
        });

        it('does not match: values mismatch: errors', () => {
            const mismatched: Array<Mismatched> = [];
            const matcher = match.array.match(["a", "c"]);
            (matcher as DiffMatcher<any>).mismatches(new ContextOfValidationError(), mismatched, ["a", "b"]);
            assertThat(mismatched).is([
                {"actual[1]": "b", expected: "c"}
            ]);
        });

        it('matches literally nested', () => {
            const actual = [2, 2, [3, [4]]];
            assertThat(actual).is([2, 2, [3, [4]]]);
        });

        it('does not match literally nested', () => {
            const actual = [1, 2, [3, [5]]];
            assertThat(actual).failsWith([2, 2, [3, [4, 6]]],
                [{[MatchResult.was]: 1, [MatchResult.expected]: 2}, 2,
                    [3, [{[MatchResult.unexpected]: 5}, {[MatchResult.expected]: 4}, {[MatchResult.expected]: 6}]]]);
            assertThat(actual).failsWith([1, 2, [3, [6]]],
                [1, 2, [3, [{[MatchResult.was]: 5, [MatchResult.expected]: 6}]]]);
        });

        it('does not match literally nested: errors', () => {
            const mismatched: Array<Mismatched> = [];
            const matcher = match.array.match([2, 2, [3, [4, 6]]]);
            (matcher as DiffMatcher<any>).mismatches(new ContextOfValidationError(), mismatched, [1, 2, [3, [5]]]);
            assertThat(mismatched).is([
                {"actual[0]": 1, expected: 2},
                {"actual[2][1]": [5], expected: {length: 2}}
            ]);
        });

        it('does not match literally nested - wrong type', () => {
            const actual = [1, 2, [3, [5]]];
            let expected = [1, 2, [3, "a"]];
            assertThat(actual).failsWith(expected,
                [1, 2, [3, {[MatchResult.was]: [5], [MatchResult.expected]: "a"}]]);
            assertThat(expected).failsWith(actual,
                [1, 2, [3, {[MatchResult.was]: "a", [MatchResult.expected]: [5]}]]);
        });
    });

    describe("validateThat():", () => {
        const isNumber = match.ofType.number();
        const expected = [isNumber, isNumber, [isNumber, [isNumber]]];

        it("succeeds", () => {
            const validation = validateThat([1, 2, [3, [4]]]).satisfies(expected);
            assertThat(validation.passed()).is(true);
        });

        it("fails as incorrect array", () => {
            const validation = validateThat([1, 2, [3, ["s"]]]).satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                `{"actual[2][1][0]": "s", expected: "ofType.number"}`
            ]);
        });

        it("fails as not an array", () => {
            const validation = validateThat(false).satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                `{actual: false, expected: "array expected"}`
            ])
        });
    });
});

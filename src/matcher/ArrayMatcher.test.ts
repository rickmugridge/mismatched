import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {Mismatched} from "./Mismatched";
import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {validateThat} from "../validateThat";
import {ArrayMatcher} from "./ArrayMatcher";

describe("array.match:", () => {
    describe("assertThat():", () => {
        it('matches with undefined and null', () => {
            const actual = [2, undefined, null];
            assertThat(actual).is([2, undefined, null]);
        });
        it('matches with an empty array', () => {
            assertThat([]).is([]);
        });
        describe("Primitive values only", () => {
            it('matches', () => {
                const actual = [2, 2, 2];
                assertThat(actual).is([2, 2, 2]);
            });

            it('Actual longer: unexpected', () => {
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

            it('Expected longer: expected', () => {
                const actual = ["c", "d"];
                const expected = ["a", "b", "c", "d"];
                assertThat(actual).failsWith(expected as any,
                    [{[MatchResult.expected]: "a"}, {[MatchResult.expected]: "b"}, "c", "d"]);
                const matcher: ArrayMatcher<string> = ArrayMatcher.make(expected)
                const result = matcher.matches(actual)
                assertThat(result.matchRate).is(0.5)
            });

            it('Various differences, including in order: unexpected and expected', () => {
                const actual = ["b", "x", "y"];
                const expected = ["a", "b", "c", "x"];
                assertThat(actual).failsWith(expected as any,
                    [
                        {[MatchResult.expected]: "a"}, "b", {[MatchResult.expected]: "c"}, "x",
                        {[MatchResult.unexpected]: "y"}
                    ]);
                const matcher: ArrayMatcher<string> = ArrayMatcher.make(expected)
                const result = matcher.matches(actual)
                assertThat(result.matchRate).is(0.4)
            });

            it('does not match: length difference: errors', () => {
                const mismatched: Array<Mismatched> = [];
                const matcher = match.array.match(["a", "b", "c"]);
                (matcher as DiffMatcher<any>).mismatches(new ContextOfValidationError(), mismatched, ["a", "b"]);
                assertThat(mismatched).is([
                    {actual: ["a", "b"], missing: "c"}
                ]);
            });
        });

        it('Other differences', () => {
            assertThat([{b: "b"}, ["x"], "y"]).failsWith([{a: "a"}, {b: "b"}, "c", ["x"]] as any,
                [{[MatchResult.expected]: {a: "a"}}, {b: "b"}, {[MatchResult.expected]: "c"}, ["x"],
                    {[MatchResult.unexpected]: "y"}]);
        });

        it('matches the best first (sub)', () => {
            assertThat([{a: 11, b: [0]}]).failsWith([{a: 11, b: [1]}],
                [{a: 11, b: [{[MatchResult.unexpected]: 0}, {[MatchResult.expected]: 1}]}]);
        });


        it('does not match: values mismatch', () => {
            const actual = ["a", "b"];
            const expected = ["a", "c"];
            assertThat(actual).failsWith(expected,
                ["a", {[MatchResult.unexpected]: "b"}, {[MatchResult.expected]: "c"}]);
        });

        it('does not match: values mismatch: errors', () => {
            const mismatched: Array<Mismatched> = [];
            const matcher = match.array.match(["a", "c"]);
            (matcher as DiffMatcher<any>).mismatches(new ContextOfValidationError(), mismatched,
                ["a", "b"]);
            assertThat(mismatched).is([
                {actual: ["a", "b"], unexpected: "b"},
                {actual: ["a", "b"], missing: "c"}
            ]);
        });

        it('matches literally nested', () => {
            const actual = [2, 2, [3, [4]]];
            assertThat(actual).is([2, 2, [3, [4]]]);
        });

        it('does not match literally nested', () => {
            const actual = [1, 2, [3, [5]]];
            assertThat(actual).failsWith([2, 2, [3, [4, 6]]],
                [
                    {[MatchResult.unexpected]: 1},
                    {[MatchResult.expected]: 2},
                    2,
                    [3, {[MatchResult.unexpected]: [5]}, {[MatchResult.expected]: [4, 6]}]
                ]);
            assertThat(actual).failsWith([1, 2, [3, [6]]],
                [1, 2, [3, {[MatchResult.unexpected]: [5]}, {[MatchResult.expected]: [6]}]]);
        });

        it('does not match literally nested: errors', () => {
            const mismatched: Array<Mismatched> = [];
            const matcher = match.array.match([2, 2, [3, [5, 6]]]);
            (matcher as DiffMatcher<any>).mismatches(new ContextOfValidationError(), mismatched,
                [1, 2, [3, [5]]]);
            assertThat(mismatched).is([
                {actual: [1, 2, [3, [5]]], unexpected: 1},
                {actual: [1, 2, [3, [5]]], missing: 2},
                {"actual[2][1]": [5], missing: 6}
            ]);
        });

        it('does not match literally nested - wrong type', () => {
            const actual = [1, 2, [3, [5]]];
            let expected = [1, 2, [3, "a"]];
            assertThat(actual).failsWith(expected,
                [1, 2, [3, {[MatchResult.unexpected]: [5]}, {[MatchResult.expected]: "a"}]]);
            assertThat(expected).failsWith(actual,
                [1, 2, [3, {[MatchResult.unexpected]: "a"}, {[MatchResult.expected]: [5]}]]);
        });

        it("uses match.bind() to check for two values the same", () => {
            const value = {
                colours: [
                    {id: "615fa1d3-2c79-4f46-a06a-0d04cdc9c0eb", type: "Red"},
                    {id: "615fa1d3-2c79-4f46-a06a-0d04cdc9c0eb", type: "Red"},
                ]
            };
            const bindColour = match.bind(match.ofType.object())
            assertThat(value).is({
                colours: [
                    bindColour,
                    bindColour
                ]
            })
        });
    });

    describe("validateThat():", () => {
        const isNumber = match.ofType.number();
        const expected = [isNumber, isNumber, [isNumber, [isNumber]]];

        it("succeeds with an empty array", () => {
            const validation = validateThat([]).satisfies([]);
            assertThat(validation.passed()).is(true);
        });

        it("succeeds", () => {
            const validation = validateThat([1, 2, [3, [4]]]).satisfies(expected);
            assertThat(validation.passed()).is(true);
        });

        it("fails as element missing", () => {
            const expected = [isNumber];
            const validation = validateThat([]).satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                '{actual: [], missing: "ofType.number"}'
            ]);
        });

        it("fails as element unexpectedly present", () => {
            const expected = [];
            const validation = validateThat([1]).satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                '{actual: [1], unexpected: 1}'
            ]);
        });

        it("fails as incorrect array, simple", () => {
            const expected = [isNumber];
            const validation = validateThat(["s"]).satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                '{actual: ["s"], unexpected: "s"}',
                '{actual: ["s"], missing: "ofType.number"}'
            ]);
        });

        it("fails as incorrect array, less simple", () => {
            const validation = validateThat([1, 2, [3, ["s"]]]).satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                '{"actual[2]": [3, ["s"]], unexpected: ["s"]}',
                '{"actual[2]": [3, ["s"]], missing: ["ofType.number"]}'
            ]);
        });

        it("fails as incorrect array with nested arrays", () => {
            const validation = validateThat([undefined, 2, [3, ["s"]]]).satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                '{actual: [undefined, 2, [3, ["s"]]], unexpected: undefined}',
                '{actual: [undefined, 2, [3, ["s"]]], missing: "ofType.number"}',
                '{"actual[2]": [3, ["s"]], unexpected: ["s"]}',
                '{"actual[2]": [3, ["s"]], missing: ["ofType.number"]}'
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

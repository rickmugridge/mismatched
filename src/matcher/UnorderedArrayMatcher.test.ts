import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {validateThat} from "../validateThat";

describe("unorderedArray:", () => {
    describe("match.array.unordered:", () => {
        describe("assertThat():", () => {
            it('matches when both empty', () => {
                assertThat([]).is(match.array.unordered([]));
            });

            it('matches', () => {
                assertThat([1, 2, 3]).is(match.array.unordered([1, 2, 3]));
                assertThat([1, 2, 3]).is(match.array.unordered([2, 1, 3]));
                assertThat([1, 2, 3]).is(match.array.unordered([3, 2, 1]));
                assertThat([1, 1, 1]).is(match.array.unordered([1, 1, 1]));
                assertThat([[1, 1], [2, 2], [3, 3]]).is(
                    match.array.unordered([[1, 1], [2, 2], [3, 3]]));
                assertThat([[3, 3], [1, 1], [2, 2], [1, 1]]).is(
                    match.array.unordered([[1, 1], [1, 1], [2, 2], [3, 3]]));
            });

            it('matches match.any() last as lowest complexity', () => {
                assertThat([1, 2, 3]).is(match.array.unordered([1, 2, match.any()]));
                assertThat([1, 2, 3]).is(match.array.unordered([1, match.any(), 2]));
                assertThat([1, 2, 3]).is(match.array.unordered([match.any(), 1, 2]));
                assertThat([1, 2, 3]).is(match.array.unordered([2, 1, match.any()]));
                assertThat([[1, 1], [2, 2], [3, 3]])
                    .is(match.array.unordered([[2, 2], [1, 1], match.ofType.array()]));
            });

            it('does not match: too many', () => {
                const actual = [1, 2, 3];
                assertThat(actual).failsWith(match.array.unordered([1, 2]),
                    [1, 2, {[MatchResult.unexpected]: 3}]);
            });

            it('does not match: too few', () => {
                const actual = [1, 2];
                assertThat(actual).failsWith(match.array.unordered([1, 2, 3]),
                    [1, 2, {[MatchResult.expected]: 3}]);
            });

            it('does not match: values mismatch', () => {
                const actual = [1, 2, 3];
                const expected = [1, 2, 4];
                assertThat(actual).failsWith(match.array.unordered(expected),
                    [1, 2, {[MatchResult.was]: 3, [MatchResult.expected]: 4}]);
            });

            it("does not match: no duplicated values", () => {
                assertThat([1, 1, 1]).failsWith(match.array.unordered([1]),
                    [1, {[MatchResult.unexpected]: 1}, {[MatchResult.unexpected]: 1}]);
            });

            it('matches the best first', () => {
                const actual = [{a: 1, b: [0]}, {a: 11, b: [0]}];
                const expected = [{a: 11, b: [1]}];
                assertThat(actual).failsWith(match.array.unordered(expected), [
                    {[MatchResult.unexpected]: {a: 1, b: [0]}},
                    {a: 11, b: [{[MatchResult.unexpected]: 0}, {[MatchResult.expected]: 1}]}
                ]);
            });

            it('matches the best first deeply nested', () => {
                const actual = [{a: 1, b: {c: [1]}}, {a: 11, b: {c: [2]}}];
                const expected = [{a: 11, b: {c: [3]}}];
                assertThat(actual).failsWith(match.array.unordered(expected), [
                    {[MatchResult.unexpected]: {a: 1, b: {c: [1]}}},
                    {a: 11, b: {c: [{[MatchResult.unexpected]: 2}, {[MatchResult.expected]: 3}]}}
                ]);
            });
        });

        describe("validateThat():", () => {
            const isNumber = match.ofType.number();
            const expected = [isNumber, [isNumber]];

            it("succeeds", () => {
                const actual = [1, [4]];
                const validation = validateThat(actual).satisfies(match.array.unordered(expected));
                assertThat(validation.errors).is([]);
                assertThat(validation.passed()).is(true);
            });

            it("succeeds with general matcher", () => {
                const actual = [1, 2];
                const validation = validateThat(actual).satisfies(match.array.unordered([1, match.any()]));
                assertThat(validation.errors).is([]);
                assertThat(validation.passed()).is(true);
            });

            it("fails as incorrect set", () => {
                const actual = [1, ["s"]];
                const validation = validateThat(actual).satisfies(match.array.unordered(expected));
                assertThat(validation.passed()).is(false);
                assertThat(validation.errors).is([
                    '{"actual[1]": ["s"], unexpected: "s"}',
                    '{"actual[1]": ["s"], missing: "ofType.number"}'
                ]);
            });

            it("fails as not an array", () => {
                const validation = validateThat(false).satisfies(match.array.unordered(expected));
                assertThat(validation.passed()).is(false);
                assertThat(validation.errors).is([
                    `{actual: false, expected: "array expected"}`
                ])
            });
        });
    });

    describe("match.array.unorderedContains:", () => {
        describe("assertThat():", () => {
            it('contains', () => {
                const actual = [1, 2, 3];
                assertThat(actual).is(match.array.unorderedContains([1, 2, 3]));
                assertThat(actual).is(match.array.unorderedContains([1, 2]));
            });

            it('does not match: values differ', () => {
                const actual = [1, 2, 3];
                assertThat(actual).failsWith(match.array.unorderedContains([1, 4]),
                    [1, {[MatchResult.was]: 2, [MatchResult.expected]: 4}, 3]);
            });

            it('does not match: too many values expected', () => {
                const actual = [1, 2, 3];
                const expected = [1, 2, 3, 4];
                assertThat(actual).failsWith(match.array.unorderedContains(expected),
                    [1, 2, 3, {[MatchResult.expected]: 4}]);
            });
        });

        describe("validateThat():", () => {
            const isNumber = match.ofType.number();
            const expected = [isNumber, [isNumber]];

            it("succeeds", () => {
                const actual = [1, [4]];
                const validation = validateThat(actual).satisfies(match.array.unorderedContains(expected));
                assertThat(validation.errors).is([]);
                assertThat(validation.passed()).is(true);
            });

            it("fails as incorrect set", () => {
                const actual = [1, ["s"]];
                const validation = validateThat(actual).satisfies(match.array.unorderedContains(expected));
                assertThat(validation.passed()).is(false);
                assertThat(validation.errors).is([
                    '{"actual[1]": ["s"], unexpected: "s"}',
                    '{"actual[1]": ["s"], missing: "ofType.number"}'
                ]);
            });
        });
    });
});

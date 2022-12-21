import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {validateThat} from "../validateThat";

describe("set:", () => {
    describe("set.match:", () => {
        describe("assertThat():", () => {
            it('matches when both empty', () => {
                assertThat(new Set()).is(match.aSet.match(new Set()));
                assertThat([]).is(match.aSet.match([]));
                assertThat(new Set([])).is(match.aSet.match([]));
            });

            it('matches', () => {
                assertThat(new Set([1, 2, 3])).is(match.aSet.match(new Set([1, 2, 3])));
                assertThat([1, 2, 3]).is(match.aSet.match([2, 1, 3]));
                assertThat(new Set([1, 2, 3])).is(match.aSet.match([3, 2, 1]));
                assertThat([[1, 1], [2, 2], [3, 3]]).is(match.aSet.match([[1, 1], [2, 2], [3, 3]]));
            });

            it('matches right', () => {
                assertThat(new Set([1, 2, 3])).is(match.aSet.match(new Set([1, 2, match.any()])));
                assertThat([1, 2, 3]).is(match.aSet.match([2, 1, match.any()]));
                assertThat([[1, 1], [2, 2], [3, 3]])
                    .is(match.aSet.match([[1, 1], [2, 2], match.ofType.array()]));
            });

            it('matches with nested has', () => {
                assertThat([{s: true, extra: 'junk'}, {s: undefined, extra: 'extra'}]).is(match.aSet.match([
                    match.obj.has({s: true}),
                    match.obj.has({s: undefined})
                ]));
            });

            it('does not match: too many', () => {
                const actual = new Set([1, 2, 3]);
                assertThat(actual).failsWith(match.aSet.match(new Set([1, 2])),
                    [1, 2, {[MatchResult.unexpected]: 3}]);
            });

            it('does not match: too few', () => {
                const actual = new Set([1, 2]);
                assertThat(actual).failsWith(match.aSet.match(new Set([1, 2, 3])),
                    [1, 2, {[MatchResult.expected]: 3}]);
            });

            it('does not match: values mismatch', () => {
                const actual = new Set([1, 2, 3]);
                const expected = new Set([1, 2, 4]);
                assertThat(actual).failsWith(match.aSet.match(expected),
                    [1, 2, {[MatchResult.was]: 3, [MatchResult.expected]: 4}
                    ]);
            });

            it('matches literally nested', () => {
                const actual = new Set([1, 2, new Set([3, [5]])]);
                assertThat(actual).is(new Set([1, 2, new Set([3, [5]])]));
            });

            it('does not match literally nested', () => {
                const actual = new Set([1, 2, new Set([3, [5]])]);
                const expected = new Set([1, 2, new Set([44, [5]])]);
                assertThat(actual).failsWith(expected,
                    [1, 2, [{[MatchResult.was]: 3, [MatchResult.expected]: 44}, [5]]]);
            });

            it('matches the best first', () => {
                const actual = new Set([{a: 1, b: [0]}, {a: 11, b: [0]}]);
                const expected = new Set([{a: 11, b: [1]}]);
                assertThat(actual).failsWith(expected, [
                    {[MatchResult.unexpected]: {a: 1, b: [0]}},
                    {a: 11, b: [{[MatchResult.unexpected]: 0}, {[MatchResult.expected]: 1}]}
                ]);
            });

            it('matches the best first deeply nested', () => {
                const actual = new Set([{a: 1, b: {c: [1]}}, {a: 11, b: {c: [2]}}]);
                const expected = new Set([{a: 11, b: {c: [3]}}]);
                assertThat(actual).failsWith(expected, [
                    {[MatchResult.unexpected]: {a: 1, b: {c: [1]}}},
                    {a: 11, b: {c: [{[MatchResult.unexpected]: 2}, {[MatchResult.expected]: 3}]}}
                ]);
            });

            it('matches with a key', () => {
                const actual = new Set([{a: 1, b: 1}, {a: 2, b: 2}]);
                const expected = new Set([
                    {a: match.obj.key(1), b: 2},
                    {a: match.obj.key(2), b: 0}]);
                assertThat(actual).failsWith(expected, [
                    {a: 1, b: {[MatchResult.was]: 1, [MatchResult.expected]: 2}},
                    {a: 2, b: {[MatchResult.was]: 2, [MatchResult.expected]: 0}},
                ]);
            });

            it('matches with bind, but only once elements in the actual and expected sets have been matched', () => {
                const actual = new Set([{a: 11, b: {c: [2]}}, {a: 1, b: {c: [1, 1]}, d: 1}]);
                const bind = match.bind(match.ofType.number())
                const expected = new Set([{a: bind, b: {c: [1, 1]}, d: bind}, {a: 11, b: {c: [2]}}]);
                assertThat(actual).is(expected);
            });
        });

        describe("validateThat():", () => {
            const isNumber = match.ofType.number();
            const expected = new Set([isNumber, new Set([isNumber])]);

            it("succeeds", () => {
                const actual = new Set([1, new Set([4])]);
                const validation = validateThat(actual).satisfies(expected);
                assertThat(validation.errors).is([]);
                assertThat(validation.passed()).is(true);
            });

            it("succeeds with general matcher", () => {
                const actual = new Set([1, 2]);
                const validation = validateThat(actual).satisfies(new Set([1, match.any()]));
                assertThat(validation.errors).is([]);
                assertThat(validation.passed()).is(true);
            });

            it("fails as incorrect set", () => {
                const actual = new Set([1, new Set(["s"])]);
                const validation = validateThat(actual).satisfies(expected);
                assertThat(validation.passed()).is(false);
                assertThat(validation.errors).is([
                    '{"actual[1][0]": "s", expected: "ofType.number"}']);
            });

            it("fails as not an array", () => {
                const validation = validateThat(false).satisfies(expected);
                assertThat(validation.passed()).is(false);
                assertThat(validation.errors).is([
                    `{actual: false, expected: "set expected"}`
                ])
            });
        });
    });

    describe("set.subset:", () => {
        describe("assertThat():", () => {
            it('subset', () => {
                const actual = new Set([1, 2, 3]);
                assertThat(actual).is(match.aSet.subset(new Set([1, 2, 3])));
                assertThat(actual).is(match.aSet.subset(new Set([1, 2])));
            });

            it('does not match: values differ', () => {
                const actual = new Set([1, 2, 3]);
                assertThat(actual).failsWith(match.aSet.subset(new Set([1, 4])),
                    [1, {[MatchResult.was]: 2, [MatchResult.expected]: 4}, 3]);
            });

            it('does not match: too many values expected', () => {
                const actual = new Set([1, 2, 3]);
                const expected = new Set([1, 2, 3, 4]);
                assertThat(actual).failsWith(match.aSet.subset(expected),
                    [1, 2, 3, {[MatchResult.expected]: 4}]);
            });
        });

        describe("validateThat():", () => {
            const isNumber = match.ofType.number();
            const expected = new Set([isNumber, new Set([isNumber])]);

            it("succeeds", () => {
                const actual = new Set([1, new Set([4])]);
                const validation = validateThat(actual).satisfies(match.aSet.subset(expected));
                assertThat(validation.errors).is([]);
                assertThat(validation.passed()).is(true);
            });

            it("fails as incorrect set", () => {
                const actual = new Set([1, new Set(["s"])]);
                const validation = validateThat(actual).satisfies(match.aSet.subset(expected));
                assertThat(validation.passed()).is(false);
                assertThat(validation.errors).is([
                    '{"actual[1][0]": "s", expected: "ofType.number"}']);
            });
        });
    });
});

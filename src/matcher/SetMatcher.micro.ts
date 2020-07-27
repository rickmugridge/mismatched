import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {validateThat} from "../validateThat";

describe("set:", () => {
    describe("set.match:", () => {
        describe("assertThat():", () => {
            it('matches', () => {
                assertThat(new Set([1, 2, 3])).is(match.aSet.match(new Set([1, 2, 3])));
                assertThat([1, 2, 3]).is(match.aSet.match([2, 1, 3]));
                assertThat(new Set([1, 2, 3])).is(match.aSet.match([3, 2, 1]));
                assertThat([[1, 1], [2, 2], [3, 3]]).is(match.aSet.match([[1, 1], [2, 2], [3, 3]]));
            });

            it('matches right', () => {
                assertThat(new Set([1, 2, 3])).is(match.aSet.match(new Set([1, 2, match.any()])));
                assertThat([1, 2, 3]).is(match.aSet.match([2, 1, match.any()]));
                assertThat([[1, 1], [2, 2], [3, 3]]).is(match.aSet.match([[1, 1], [2, 2], match.ofType.array()]));
            });

            it('does not match: length difference', () => {
                const actual = new Set([1, 2, 3]);
                assertThat(actual).failsWith(match.aSet.match(new Set([1, 2])),
                    {[MatchResult.was]: actual, [MatchResult.expected]: {lengthExpected: 2}});
            });

            it('does not match: values mismatch', () => {
                const actual = new Set([1, 2, 3]);
                const expected = new Set([1, 2, 4]);
                assertThat(actual).failsWith(match.aSet.match(expected),
                    {[MatchResult.was]: actual, [MatchResult.expected]: expected});
            });

            it('matches literally nested', () => {
                const actual = new Set([1, 2, new Set([3, [5]])]);
                assertThat(actual).is(new Set([1, 2, new Set([3, [5]])]));
            });

            it('does not match literally nested', () => {
                const actual = new Set([1, 2, new Set([3, [5]])]);
                const expected = new Set([1, 2, new Set([44, [5]])]);
                assertThat(actual).failsWith(expected,
                    {
                        [MatchResult.was]: actual,
                        [MatchResult.expected]: expected
                    });
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
                    '{actual: new Set([1, new Set(["s"])]), expected: new Set(["ofType.number", new Set(["ofType.number"])])}'
                ]);
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
                    {[MatchResult.was]: actual, [MatchResult.expected]: {subset: new Set([1, 4])}});
            });

            it('does not match: too many values expected', () => {
                const actual = new Set([1, 2, 3]);
                const expected = new Set([1, 2, 3, 4]);
                assertThat(actual).failsWith(match.aSet.subset(expected),
                    {[MatchResult.was]: actual, [MatchResult.expected]: {subset: expected}});
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
                    '{actual: new Set([1, new Set(["s"])]), expected: {subset: new Set(["ofType.number", new Set(["ofType.number"])])}}'
                ]);
            });
        });
    });
});

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
                assertThat([[1, 1], [2, 2], [3, 3]])
                .is(match.aSet.match([[1, 1], [2, 2], match.ofType.array()]));
            });

            it('does not match: too many', () => {
                const actual = new Set([1, 2, 3]);
                assertThat(actual).failsWith(match.aSet.match(new Set([1, 2])),
                    {
                        [MatchResult.was]: actual,
                        [MatchResult.expected]: new Set([1, 2]),
                        [MatchResult.unexpected]: [3]
                    });
            });

            it('does not match: too few', () => {
                const actual = new Set([1, 2]);
                assertThat(actual).failsWith(match.aSet.match(new Set([1, 2, 3])),
                    {
                        [MatchResult.was]: actual,
                        [MatchResult.expected]: new Set([1, 2, 3]),
                        [MatchResult.missing]: [3]
                    });
            });

            it('does not match: values mismatch', () => {
                const actual = new Set([1, 2, 3]);
                const expected = new Set([1, 2, 4]);
                assertThat(actual).failsWith(match.aSet.match(expected),
                    {
                        [MatchResult.was]: actual, [MatchResult.expected]: expected,
                        [MatchResult.differ]: [{[MatchResult.was]: 3, [MatchResult.expected]: 4}]
                    });
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
                        [MatchResult.expected]: expected,
                        [MatchResult.differ]: [
                            {
                                [MatchResult.was]: new Set([3, [5]]),
                                [MatchResult.expected]: new Set([44, [5]]),
                                [MatchResult.differ]: [{[MatchResult.was]: 3, [MatchResult.expected]: 44}]
                            }
                        ]
                    });
            });

            it('matches the best first', () => {
                const actual = new Set([{a: 1, b: [0]}, {a: 11, b: [0]}]);
                const expected = new Set([{a: 11, b: [1]}]);
                assertThat(actual).failsWith(expected, {
                    [MatchResult.was]: actual,
                    [MatchResult.expected]: expected,
                    [MatchResult.differ]: [
                        {a: 11, b: [{[MatchResult.was]: 0, [MatchResult.expected]: 1}]}
                    ],
                    [MatchResult.unexpected]: [{a: 1, b: [0]}],
                });
            });

            it('matches the best first deeply nested', () => {
                const actual = new Set([{a: 1, b: {c: [1]}}, {a: 11, b: {c: [2]}}]);
                const expected = new Set([{a: 11, b: {c: [3]}}]);
                assertThat(actual).failsWith(expected, {
                    [MatchResult.was]: actual,
                    [MatchResult.expected]: expected,
                    [MatchResult.differ]: [
                        {a: 11, b: {c: [{[MatchResult.was]: 2, [MatchResult.expected]: 3}]}}
                    ],
                    [MatchResult.unexpected]: [{a: 1, b: {c: [1]}}],
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
                    '{actual: "s", expected: "ofType.number"}',
                    '{actual: new Set(["s"]), expected: new Set(["ofType.number"])}',
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
                    {
                        [MatchResult.was]: actual,
                        [MatchResult.expected]: {subset: new Set([1, 4])},
                        [MatchResult.differ]: [{[MatchResult.was]: 2, [MatchResult.expected]: 4}]
                    });
            });

            it('does not match: too many values expected', () => {
                const actual = new Set([1, 2, 3]);
                const expected = new Set([1, 2, 3, 4]);
                assertThat(actual).failsWith(match.aSet.subset(expected),
                    {
                        [MatchResult.was]: actual,
                        [MatchResult.expected]: {subset: expected},
                        [MatchResult.missing]: [4]
                    });
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
                    '{actual: "s", expected: "ofType.number"}',
                    '{actual: new Set(["s"]), expected: new Set(["ofType.number"])}',
                    '{actual: new Set([1, new Set(["s"])]), expected: {subset: new Set(["ofType.number", new Set(["ofType.number"])])}}'
                ]);
            });
        });
    });
});

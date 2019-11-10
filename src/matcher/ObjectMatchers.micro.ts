import {assertThat} from "../assertThat";
import {match} from "../match";
import {DiffFieldMatcher} from "./ObjectMatchers";
import {MatchResult} from "../MatchResult";

describe("obj:", () => {
    describe("obj.match:", () => {
        describe('matches', () => {
            it('with explicit field matchers', () => {
                const actual = {f: 2, g: 3};
                let fieldMatcher1 = DiffFieldMatcher.make("f", 2);
                let fieldMatcher2 = DiffFieldMatcher.make("g", 3);
                assertThat(actual).is(match.obj.match([fieldMatcher1, fieldMatcher2]));
            });

            it('explicit matcher object', () => {
                const actual = {f: 2, g: 3};
                assertThat(actual).is(match.obj.match({f: 2, g: 3}));
            });

            it('literal object', () => {
                const actual = {f: 2, g: 3};
                assertThat(actual).is(actual);
                assertThat({f: 3, g: {expected: 4}}).is({f: 3, g: {expected: 4}});
            });

            it('literal object with a field that is undefined', () => {
                assertThat({f: undefined}).is({f: undefined});
                assertThat({f: undefined}).is({});
            });
        });

        describe('does not match actual as:', () => {
            describe('different:', () => {
                it('different field value', () => {
                    const actual = {f: 3};
                    assertThat(actual).failsWith({f: 2},
                        {f: {[MatchResult.was]: 3, [MatchResult.expected]: 2}});
                });

                it('different sub-field value', () => {
                    const actual = {f: 2, g: {h: 3}};
                    assertThat(actual).failsWith({f: 2, g: {h: 2}},
                        {f: 2, g: {h: {[MatchResult.was]: 3, [MatchResult.expected]: 2}}});
                });

                it('different sub-field value #2', () => {
                    const actual = {g: {h: 3, i: 4}};
                    assertThat(actual).failsWith({g: {h: 2, i: 5}},
                        {
                            g: {
                                h: {[MatchResult.was]: 3, [MatchResult.expected]: 2},
                                i: {[MatchResult.was]: 4, [MatchResult.expected]: 5}
                            }
                        });
                });
            });

            describe('missing:', () => {
                it('1. missing field', () => {
                    const actual = {f: 3};
                    assertThat(actual).failsWith({f: 3, g: 4},
                        {f: 3, g: {[MatchResult.expected]: 4}});
                });

                it('2. missing field, when no actual fields', () => {
                    const actual = {};
                    assertThat(actual).failsWith({g: 3},
                        {g: {[MatchResult.expected]: 3}});
                });

                it('3. missing sub-field', () => {
                    const actual = {f: 2, g: {h: 3, i: 7}};
                    assertThat(actual).failsWith({f: 3, g: {h: 3, i: 7, j: 4}},
                        {
                            f: {[MatchResult.was]: 2, [MatchResult.expected]: 3},
                            g: {h: 3, i: 7, j: {[MatchResult.expected]: 4}}
                        });
                });

                it('4. missing sub-field, with no data inside it', () => {
                    const actual = {g: {}};
                    assertThat(actual).failsWith({g: {i: 7}},
                        {g: {i: {[MatchResult.expected]: 7}}});
                });
            });

            describe('extra:', () => {
                it('extra field', () => {
                    const actual = {f: 2, g: 3};
                    assertThat(actual).failsWith({f: 2},
                        {f: 2, [MatchResult.unexpected]: {g: 3}});
                });

                it('extra field when expecting no fields', () => {
                    const actual = {f: 2, g: 3};
                    assertThat(actual).failsWith({},
                        {[MatchResult.unexpected]: {f: 2, g: 3}});
                });
            });

            it("Needs an actual object", () => {
                assertThat(undefined).failsWith({f: 2},
                    {[MatchResult.expected]: {f: 2}});
                assertThat(2).failsWith({f: 2},
                    {[MatchResult.was]: 2, [MatchResult.expected]: {f: 2}});
            });
        });
    });

    describe("obj.some:", () => {
        describe('matches', () => {
            it('with explicit field matchers', () => {
                const actual = {f: 2, g: 3, h: 4};
                let fieldMatcher1 = DiffFieldMatcher.make("f", 2);
                let fieldMatcher2 = DiffFieldMatcher.make("g", 3);
                assertThat(actual).is(match.obj.has([fieldMatcher1, fieldMatcher2]));
            });

            it('literal object', () => {
                const actual = {f: 2, g: 3, h: 4};
                const expected = match.obj.has({f: 2, g: 3});
                assertThat(actual).is(expected);
            });
        });

        describe('does not match actual that is:', () => {
            it('an object', () => {
                const actual = {f: 2, g: 3};
                const expected = match.obj.has({f: 3});
                assertThat(actual).failsWith(expected,
                    {f: {[MatchResult.was]: 2, [MatchResult.expected]: 3}});
            });

            it('not an object', () => {
                const actual = 3;
                const expected = match.obj.has({f: 3});
                assertThat(actual).failsWith(expected,
                    {[MatchResult.was]: 3, [MatchResult.expected]: {"obj.some": {f: 3}}});
            });

            it('undefined', () => {
                const actual = undefined;
                const expected = match.obj.has({f: 3});
                assertThat(actual).failsWith(expected,
                    {[MatchResult.expected]: {"obj.some": {f: 3}}});
            });
        });
    });
});

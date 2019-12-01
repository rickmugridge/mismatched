import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {Mismatch} from "./Mismatch";
import {ObjectMatcher} from "./ObjectMatcher";
import {DiffMatcher} from "./DiffMatcher";

describe("obj.match:", () => {
    describe('matches', () => {
        it('with explicit field matchers', () => {
            const actual = {f: 2, g: 3};
            assertThat(actual).is(match.obj.match({f: 2, g: 3}));
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

        it('with no explicit field matchers but same object', () => {
            const actual = {f: 2, g: 3};
            assertThat(actual).is(match.obj.match(actual));
        });

    });

    describe('does not match actual as:', () => {
        describe('different:', () => {
            it('different field value', () => {
                const actual = {f: 3};
                assertThat(actual).failsWith({f: 2},
                    {f: {[MatchResult.was]: 3, [MatchResult.expected]: 2}});
            });

            it('different field value: errors', () => {
                const mismatched: Array<Mismatch> = [];
                const matcher = ObjectMatcher.make({f: 2});
                (matcher as DiffMatcher<any>).mismatches("actual", mismatched, {f: 3});
                assertThat(mismatched).is([
                    {"actual.f": 3, expected: 2}
                ]);
            });

            it('different sub-field value', () => {
                const actual = {f: 2, g: {h: 3}};
                assertThat(actual).failsWith({f: 2, g: {h: 2}},
                    {f: 2, g: {h: {[MatchResult.was]: 3, [MatchResult.expected]: 2}}});
            });

            it('different sub-field value: errors', () => {
                const mismatched: Array<Mismatch> = [];
                const matcher = ObjectMatcher.make({f: 2, g: {h: 2}});
                (matcher as DiffMatcher<any>).mismatches("actual", mismatched, {f: 2, g: {h: 3}});
                assertThat(mismatched).is([
                    {"actual.g.h": 3, expected: 2}
                ]);
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

            it('1. missing field: errors', () => {
                 const mismatched: Array<Mismatch> = [];
                const matcher = ObjectMatcher.make({f: 3, g: 4});
                (matcher as DiffMatcher<any>).mismatches("actual", mismatched, {f: 3});
                assertThat(mismatched).is([
                    {"actual.g": undefined, expected: 4}
                ]);
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

            it('extra field: errors', () => {
                const mismatched: Array<Mismatch> = [];
                const matcher = ObjectMatcher.make({f: 2});
                (matcher as DiffMatcher<any>).mismatches("actual", mismatched, {f: 2, g: 3});
                assertThat(mismatched).is([
                    {actual: {f: 2, g: 3}, unexpected: {g: 3}}
                ]);
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

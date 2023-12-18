import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {Mismatched} from "./Mismatched";
import {ObjectMatcher} from "./ObjectMatcher";
import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {validateThat} from "../validateThat";
import {PrettyPrinter} from "..";
import {PredicateMatcher} from "./PredicateMatcher";
import {CustomiseMismatcher} from "../matchMaker/CustomiseMismatcher";

describe("obj.match:", () => {
    it("hasProperty", () => {
        const actual = {f: undefined}
        assertThat(actual.hasOwnProperty('f')).is(true)
        assertThat(actual.hasOwnProperty('g')).is(false)
    });

    describe("assertThat():", () => {
        describe('matches', () => {
            it('with implicit matchers', () => {
                const actual = {f: 2, g: 3};
                assertThat(actual).is({f: 2, g: 3});
            });

            it('explicit matcher object', () => {
                const actual = {f: 2, g: 3};
                assertThat(actual).is(match.obj.match({f: 2, g: 3}));
            });

            it('literal object', () => {
                const actual = {f: 2, g: 3};
                assertThat(actual).is(actual);
                assertThat({f: 3, g: {e: 4}}).is({f: 3, g: {e: 4}});
            });

            it('literal object with a field that is undefined', () => {
                assertThat({f: undefined}).is({f: undefined});
                assertThat({f: undefined}).is({} as any);
                assertThat({}).is({f: undefined});
            });

            it('with embedded matchers', () => {
                assertThat({f: 2, g: 3})
                    .is(match.obj.match({f: match.number.lessEqual(3), g: match.ofType.number()}));
            });

            it('with a key', () => {
                assertThat({f: 2, g: 3})
                    .is(match.obj.match({f: match.obj.key(2), g: 3}));
            });

            it('with symbols', () => {
                const expected = {[Symbol()]: Symbol()};
                assertThat(expected).is(expected);
                assertThat(expected).isNot({});
                assertThat({}).isNot(expected);
            });

            it('mixed with symbols', () => {
                const expected = {[Symbol()]: Symbol(), f:2};
                assertThat(expected).is(expected);
                assertThat(expected).isNot({});
                assertThat({}).isNot(expected);
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
                    const mismatched: Array<Mismatched> = [];
                    const matcher = ObjectMatcher.make({f: 2});
                    (matcher as DiffMatcher<any>).mismatches(new ContextOfValidationError(), mismatched, {f: 3});
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
                    const mismatched: Array<Mismatched> = [];
                    const matcher = ObjectMatcher.make({f: 2, g: {h: 2}});
                    (matcher as DiffMatcher<any>).mismatches(new ContextOfValidationError(), mismatched, {
                        f: 2,
                        g: {h: 3}
                    });
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

                it('different field value, involving a customer renderer and matcher', () => {
                    class Hide {
                        constructor(public f: number, public g: number, public h: number) {
                        }

                        equals(other: Hide) {
                            return this.f === other.f;
                        }
                    }

                    PrettyPrinter.addCustomPrettyPrinter(match.instanceOf(Hide),
                        (hide: Hide) => 'Hide(' + hide.f + ')');
                    const matcher = (expected: Hide) => PredicateMatcher.make(value => expected.equals(value),
                        expected);
                    CustomiseMismatcher.addCustomMatcher(match.instanceOf(Hide), matcher);

                    const actual = {d: new Hide(12, 4444, 5555)};
                    const expect = {d: new Hide(0, 0, 0)};
                    assertThat(actual).failsWithRendering(expect,
                        `{d: {${MatchResult.was}: Hide(12), ${MatchResult.expected}: Hide(0)}}`);
                });
            });

            describe('missing:', () => {
                it('1. missing field', () => {
                    const actual = {f: 3};
                    assertThat(actual).failsWith({f: 3, g: 4},
                        {f: 3, g: {[MatchResult.expected]: 4}});
                });

                it('1. missing field: errors', () => {
                    const mismatched: Array<Mismatched> = [];
                    const matcher = ObjectMatcher.make({f: 3, g: 4});
                    (matcher as DiffMatcher<any>).mismatches(new ContextOfValidationError(), mismatched, {f: 3});
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
                    const mismatched: Array<Mismatched> = [];
                    const matcher = ObjectMatcher.make({f: 2});
                    (matcher as DiffMatcher<any>).mismatches(new ContextOfValidationError(), mismatched, {f: 2, g: 3});
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

            it("has a missing key", () => {
                const actual = {f: 3, g: 4};
                assertThat(actual).failsWith({f: match.obj.key(2), g: 5},
                    {
                        f: {[MatchResult.was]: 3, [MatchResult.expected]: 2},
                        g: {[MatchResult.was]: 4, [MatchResult.expected]: 5}
                    });
            });

            it("has two missing keys", () => {
                const actual = {f: 3, g: 4};
                const expected = {f: match.obj.key(2), g: match.obj.key(5)};
                assertThat(actual).failsWith(expected,
                    {
                        f: {[MatchResult.was]: 3, [MatchResult.expected]: 2},
                        g: {[MatchResult.was]: 4, [MatchResult.expected]: 5}
                    });
            });

            it("has one missing key of two keys", () => {
                const actual = {f: 3, g: 4};
                const expected = {f: match.obj.key(2), g: match.obj.key(4)};
                assertThat(actual).failsWith(expected,
                    {
                        f: {[MatchResult.was]: 3, [MatchResult.expected]: 2}, g: 4
                    });
            });
        });
    });

    describe("validateThat():", () => {
        it("succeeds", () => {
            const expected = {f: match.ofType.number(), g: match.ofType.boolean()};
            const validationResult = validateThat({f: 2, g: true}).satisfies(expected);
            assertThat(validationResult.passed()).is(true);
        });

        it("fails on one field", () => {
            const expected = {f: match.ofType.number(), g: match.ofType.boolean()};
            const validationResult = validateThat({f: "2", g: true}).satisfies(expected);
            assertThat(validationResult.passed()).is(false);
            assertThat(validationResult.errors).is([
                `{"actual.f": "2", expected: "ofType.number"}`
            ]);
        });

        it("fails", () => {
            const expected = {f: match.ofType.number(), g: match.ofType.boolean()};
            const validationResult = validateThat({f: "2", g: 3}).satisfies(expected);
            assertThat(validationResult.passed()).is(false);
            assertThat(validationResult.errors).is([
                `{"actual.f": "2", expected: "ofType.number"}`,
                `{"actual.g": 3, expected: "ofType.boolean"}`
            ]);
        });

        it("fails on one field with optionalNull()", () => {
            const expected = {
                f: {
                    h: match.optionalNull({j: match.ofType.number()}),
                    i: 4
                },
                g: match.ofType.boolean()
            };
            const validationResult = validateThat({f: {h: {j: "2"}, i: 4}, g: true}).satisfies(expected);
            assertThat(validationResult.passed()).is(false);
            assertThat(validationResult.errors).is([
                `{"actual.f.h.j": "2", expected: "ofType.number"}`
            ]);
        });

        it("has a missing key", () => {
            const validationResult = validateThat({f: "2", g: 3}).satisfies({
                f: match.obj.key(match.ofType.number()),
                g: 3
            });
            assertThat(validationResult.errors).is([
                `{"actual.f": "2", expected: "ofType.number"}`
            ]);
        });
    });
});

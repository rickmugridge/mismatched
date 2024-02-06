import {assertThat} from "../assertThat";
import {match} from "../match";
import {failsWith, matchingSame, MatchResult} from "../MatchResult";
import {validateThat} from "../validateThat";
import {PrettyPrinter} from "..";
import {PredicateMatcher} from "./PredicateMatcher";
import {CustomiseMismatcher} from "../matchMaker/CustomiseMismatcher";
import {ofType} from "../ofType"

describe("match.obj.match:", () => {
    describe("assertThat", () => {
        it("hasProperty", () => {
            const actual = {f: undefined}
            assertThat(actual.hasOwnProperty('f')).is(true)
            assertThat(actual.hasOwnProperty('g')).is(false)
        })

        describe("Matches", () => {
            it('matched by same', () => {
                matchingSame({})
                matchingSame({f: 2, g: 3})
                matchingSame({f: 3, g: {e: 4}})
                matchingSame({f: undefined})
            })

            it('with embedded matchers', () => {
                assertThat({f: 2, g: 3})
                    .is(match.obj.match({
                        f: match.number.lessEqual(3),
                        g: match.ofType.number()
                    }))
            })

            it('with a key', () => {
                assertThat({f: 2, g: 3})
                    .is(match.obj.match({f: match.obj.key(2), g: 3}))
            })

            it('with symbols', () => {
                const expected = {[Symbol()]: Symbol()}
                assertThat(expected).is(expected)
                assertThat(expected).isNot({})
                assertThat({}).isNot(expected)
            })

            it("Allow for mocks", () => {
                const v = {[PrettyPrinter.symbolForMockName]: true, a: 1}
                const w = {[PrettyPrinter.symbolForMockName]: true, a: 2}
                assertThat(ofType.isObject(v)).is(true)
                assertThat(ofType.isObject(w)).is(true)
                assertThat(ofType.isDefined(v[PrettyPrinter.symbolForMockName])).is(true)
                assertThat(ofType.isDefined(v[PrettyPrinter.symbolForMockName])).is(true)
                assertThat(v).is(v)
            })
        })

        describe('Fails to match as:', () => {
            describe('different:', () => {
                it('different field value', () => {
                    failsWith({f: 3}, {f: 2},
                        {f: {[MatchResult.was]: 3, [MatchResult.expected]: 2}},
                        ['actual.f: 3, expected: 2'])
                })

                it('different sub-field value', () => {
                    failsWith({f: 2, g: {h: 3}}, {f: 2, g: {h: 2}},
                        {f: 2, g: {h: {[MatchResult.was]: 3, [MatchResult.expected]: 2}}},
                        ['actual.g.h: 3, expected: 2'])
                })

                it('different sub-field value #2', () => {
                    failsWith(
                        {g: {h: 3, i: 4}},
                        {g: {h: 2, i: 5}},
                        {
                            g: {
                                h: {[MatchResult.was]: 3, [MatchResult.expected]: 2},
                                i: {[MatchResult.was]: 4, [MatchResult.expected]: 5}
                            }
                        },
                        [
                            'actual.g.h: 3, expected: 2',
                            'actual.g.i: 4, expected: 5'
                        ]) // todo not correct
                })

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
                })
            })

            describe('missing:', () => {
                it('1. missing field', () => {
                    failsWith({f: 3}, {f: 3, g: 4},
                        {f: 3, g: {[MatchResult.expected]: 4}},
                        ['actual.g: undefined, expected: 4'])
                })

                it('2. missing field, when no actual fields', () => {
                    failsWith({}, {g: 3},
                        {g: {[MatchResult.expected]: 3}},
                        ['actual.g: undefined, expected: 3'])
                });

                it('3. missing sub-field', () => {
                    failsWith({f: 2, g: {h: 3, i: 7}}, {f: 3, g: {h: 3, i: 7, j: 4}},
                        {
                            f: {[MatchResult.was]: 2, [MatchResult.expected]: 3},
                            g: {
                                h: 3,
                                i: 7,
                                j: {[MatchResult.was]: undefined, [MatchResult.expected]: 4}
                            }
                        },
                        ['actual.f: 2, expected: 3',
                            'actual.g.j: undefined, expected: 4'])
                })

                it('4. missing sub-field, with no data inside it', () => {
                    failsWith({g: {}}, {g: {i: 7}},
                        {g: {i: {[MatchResult.expected]: 7}}},
                        ['actual.g.i: undefined, expected: 7'])// todo not correct
                })
            })

            describe('extra:', () => {
                it('extra field', () => {
                    failsWith({f: 2, g: 3}, {f: 2},
                        {f: 2, [MatchResult.unexpected]: {g: 3}},
                        ["actual: {f: 2, g: 3}, unexpected: {g: 3}"])
                })

                it('extra field when expecting no fields', () => {
                    failsWith({f: 2, g: 3}, {},
                        {[MatchResult.unexpected]: {f: 2, g: 3}},
                        ["actual: {f: 2, g: 3}, unexpected: {f: 2, g: 3}"])
                })
            })

            it("Needs an actual object", () => {
                failsWith(undefined, {f: 2},
                    {[MatchResult.expected]: {f: 2}},
                    ['actual: undefined, expected: "object expected"'])
                failsWith(2, {f: 2},
                    {[MatchResult.was]: 2, [MatchResult.expected]: {f: 2}},
                    ['actual: 2, expected: "object expected"'])
            })

            it("has a missing key", () => {
                failsWith({f: 3, g: 4}, {f: match.obj.key(2), g: 5},
                    {
                        f: {[MatchResult.was]: 3, [MatchResult.expected]: 2},
                        g: {[MatchResult.was]: 4, [MatchResult.expected]: 5}
                    },
                    ['actual.f: 3, expected: 2', 'actual.g: 4, expected: 5'])
            })

            it("has two missing keys", () => {
                failsWith({f: 3, g: 4},
                    {f: match.obj.key(2), g: match.obj.key(5)},
                    {
                        f: {[MatchResult.was]: 3, [MatchResult.expected]: 2},
                        g: {[MatchResult.was]: 4, [MatchResult.expected]: 5}
                    },
                    ['actual.f: 3, expected: 2', 'actual.g: 4, expected: 5'])
            })

            it("has one missing key of two keys", () => {
                failsWith({f: 3, g: 4},
                    {f: match.obj.key(2), g: match.obj.key(4)},
                    {
                        f: {[MatchResult.was]: 3, [MatchResult.expected]: 2}, g: 4
                    },
                    ['actual.f: 3, expected: 2'])
            })
        })
    })


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
                `actual.f: "2", expected: "ofType.number"`
            ]);
        });

        it("fails", () => {
            const expected = {f: match.ofType.number(), g: match.ofType.boolean()};
            const validationResult = validateThat({f: "2", g: 3}).satisfies(expected);
            assertThat(validationResult.passed()).is(false);
            assertThat(validationResult.errors).is([
                `actual.f: "2", expected: "ofType.number"`,
                `actual.g: 3, expected: "ofType.boolean"`
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
            const validationResult = validateThat({
                f: {h: {j: "2"}, i: 4},
                g: true
            }).satisfies(expected);
            assertThat(validationResult.passed()).is(false);
            assertThat(validationResult.errors).is([
                `actual.f.h.j: "2", expected: "ofType.number"`
            ]);
        });

        it("has a missing key", () => {
            const validationResult = validateThat({f: "2", g: 3}).satisfies({
                f: match.obj.key(match.ofType.number()),
                g: 3
            });
            assertThat(validationResult.errors).is([
                `actual.f: "2", expected: "ofType.number"`
            ]);
        });
    });
});

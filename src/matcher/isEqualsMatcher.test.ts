import {match} from "../match";
import {assertThat} from "../assertThat";
import {MatchResult} from "../MatchResult";
import {Mismatched} from "./Mismatched";
import {DiffMatcher, ContextOfValidationError} from "./DiffMatcher";
import {validateThat} from "../validateThat";

describe("IsEqualsMatcher:", () => {
    describe("assertThat():", () => {
        describe('matches exact same value:', () => {
            it('number', () => {
                const actual = 3.4;
                assertThat(actual).is(match.isEquals(actual));
                assertThat(actual).is(actual);
            });

            it('boolean', () => {
                const actual = false;
                assertThat(actual).is(match.isEquals(actual));
                assertThat(actual).is(actual);
                assertThat(true).is(true);
            });

            it('Symbol', () => {
                const actual = Symbol('test');
                assertThat(actual).is(match.isEquals(actual));
                assertThat(actual).is(actual);
            });

            it('undefined', () => {
                const actual = undefined;
                assertThat(actual).is(match.isEquals(actual));
                assertThat(actual).is(actual);
            });

            it('null', () => {
                const actual = null;
                assertThat(actual).is(match.isEquals(actual));
                assertThat(actual).is(actual);
            });

            it('object itself', () => {
                const actual = {a: "b"};
                assertThat(actual).is(match.isEquals(actual));
                assertThat(actual).isNot(match.isEquals({a: "b"}));
            });

            it('array itself', () => {
                const actual = [1, 2, 3];
                assertThat(actual).is(match.isEquals(actual));
                assertThat(actual).isNot(match.isEquals([1, 2, 3]));
            });

            it('NaN is odd, as it is not equal to itself', () => {
                const actual = NaN;
                assertThat(actual).isNot(match.isEquals(actual));
            });
        });

        describe('mismatches different values:', () => {
            it('number', () => {
                assertThat(3.4).failsWith(3.5,
                    {[MatchResult.was]: 3.4, [MatchResult.expected]: 3.5});
                assertThat(3.4).failsWith(null,
                    {[MatchResult.was]: 3.4, [MatchResult.expected]: null});
                assertThat(null).failsWith(3,
                    {[MatchResult.was]: null, [MatchResult.expected]: 3});
            });

            it('number: errors', () => {
                const mismatched: Array<Mismatched> = [];
                const matcher = match.isEquals(3.5);
                (matcher as DiffMatcher<any>).mismatches(new ContextOfValidationError(), mismatched, 3.4);
                assertThat(mismatched).is([
                    {actual: 3.4, expected: 3.5}
                ]);
            });

            it('boolean', () => {
                assertThat(true).failsWith(false,
                    {[MatchResult.was]: true, [MatchResult.expected]: false});
            });

            it('Symbol', () => {
                assertThat(Symbol("a"))
                    .failsWith(Symbol("b"),
                        {[MatchResult.was]: "Symbol(a)", [MatchResult.expected]: "Symbol(b)"});
            });

            it('undefined', () => {
                assertThat(undefined).failsWith(2,
                    {[MatchResult.was]: undefined, [MatchResult.expected]: 2});
            });

            it('null', () => {
                assertThat(null).failsWith(2,
                    {[MatchResult.was]: null, [MatchResult.expected]: 2});
            });

            it('various', () => {
                assertThat(3).failsWith("2",
                    {[MatchResult.was]: 3, [MatchResult.expected]: "2"});
            });
        });
    });

    describe("validateThat():", () => {
        const expectedValue = {a: 3};
        const expected = match.isEquals(expectedValue);

        it("succeeds", () => {
            const validation = validateThat(expectedValue).satisfies(expected);
            assertThat(validation.passed()).is(true);
        });

        it("fails", () => {
            const validation = validateThat(false).satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                `{actual: false, expected: {a: 3}}`
            ]);
        });
    });
});




import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {DiffFieldMatcher} from "./DiffFieldMatcher";
import {Mismatched} from "./Mismatched";
import {DiffMatcher} from "./DiffMatcher";
import {validateThat} from "../validateThat";

describe("obj.some:", () => {
    describe("assertThat():", () => {
        describe('matches', () => {
            it('with explicit field matchers', () => {
                const actual = {f: 2, g: 3, h: 4};
                let fieldMatcher1 = DiffFieldMatcher.make("f", 2);
                let fieldMatcher2 = DiffFieldMatcher.make("g", 3);
                assertThat(actual).is(match.obj.has({f: 2, g: 3}));
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

            it('an object: errors', () => {
                const mismatched: Array<Mismatched> = [];
                const matcher = match.obj.has({f: 3});
                (matcher as DiffMatcher<any>).mismatches("actual", mismatched, {f: 2, g: 3});
                assertThat(mismatched).is([
                    {"actual.f": 2, expected: 3}
                ]);
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

    describe("validateThat():", () => {
        const expected = match.obj.has({f: match.ofType.number(), g: match.ofType.boolean()});

        it("succeeds", () => {
            const validation = validateThat({f: 2, g: true, h: 45}).satisfies(expected);
            assertThat(validation.passed()).is(true);
        });

        it("fails", () => {
            const validation = validateThat({f: "2", g: 3, h: 45}).satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.mismatched).is([
                {"actual.f": "2", expected: "ofType.number"},
                {"actual.g": 3, expected: "ofType.boolean"}
            ]);
        });
    });
});

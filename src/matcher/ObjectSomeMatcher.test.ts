import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {internalAssertThat} from "../utility/internalAssertThat"
import {testing} from "../testing"
import wasExpected = testing.wasExpected

describe("obj.some:", () => {
    describe('matches', () => {
        it('matches subsets', () => {
            const actual = {f: 2, g: 3, h: 4};
            internalAssertThat(actual).is(match.obj.has({f: 2, g: 3}));
            internalAssertThat(actual).is(match.obj.has({f: 2, h: 4}));
            internalAssertThat(actual).is(match.obj.has({f: 2}));
            internalAssertThat(actual).is(match.obj.has({g: 3, h: 4}));
            internalAssertThat(actual).is(match.obj.has({g: 3}));
            internalAssertThat(actual).is(match.obj.has({h: 4}));
        });

        it('empty object', () => {
            const actual = {f: 2, g: 3, h: 4};
            internalAssertThat(actual).is(match.obj.has({}));
            internalAssertThat({}).is(match.obj.has({}));
        });

        it("fails as field is not a Date", () => {
            internalAssertThat({f: "2024-05-26T22:58:44.714Z"})
                .is({f: match.string.asDate(match.ofType.date())})
        });
    });

    describe('does not match:', () => {
        it('not an object', () => {
            const expected = match.obj.has({f: 3});
            internalAssertThat(3)
                .failsWith(expected)
                .wasDiff(
                    {[MatchResult.was]: 3, [MatchResult.expected]: {"obj.has": {f: 3}}},
                    ['actual: 3, expected: "object expected"']);
        });

        it('undefined', () => {
            const expected = match.obj.has({f: 3});
            internalAssertThat(undefined).failsWith(expected).wasDiff(
                {[MatchResult.expected]: {"obj.has": {f: 3}}},
                ['actual: undefined, expected: "object expected"']);
        });

        it('one field is incorrect', () => {
            const actual = {f: 2, g: 3};
            const expected = match.obj.has({f: 3});
            internalAssertThat(actual)
                .failsWith(expected)
                .wasDiff(
                    {f: {[MatchResult.was]: 2, [MatchResult.expected]: 3}},
                    ["actual.f: 2, expected: 3"]);
        });

        it("fails due to wrong types", () => {
            const expected = match.obj.has({f: match.ofType.number(), g: match.ofType.boolean()});
            internalAssertThat({
                f: "2",
                g: 3,
                h: 45
            }).failsWith(expected)
                .wasDiff({
                        f: wasExpected("2", "ofType.number"),
                        g: wasExpected(3, "ofType.boolean")
                    },
                    [
                        `actual.f: "2", expected: "ofType.number"`,
                        `actual.g: 3, expected: "ofType.boolean"`
                    ]);
        });

        it("expected field is missing", () => {
            internalAssertThat({f: "2"})
                .failsWith(match.obj.has({g: 3}))
                .wasDiff({g: wasExpected(undefined, 3)},
                    ['actual.g: undefined, expected: 3']);
        });

        it("fails to match as expected field is wrong type and another field is missing", () => {
            internalAssertThat({f: "2", g: 4})
                .failsWith(match.obj.has({g: 3, h: true}))
                .wasDiff({
                        g: wasExpected(4, 3),
                        h: wasExpected(undefined, true)
                    },
                    [
                        "actual.g: 4, expected: 3",
                        "actual.h: undefined, expected: true"
                    ]);
        });

        it("fails as field is not a Date", () => {
            internalAssertThat({f: "wrong"})
                .failsWith({f: match.string.asDate(match.ofType.date())})
                .wasDiff({f: wasExpected(match.any(), "ofType.date")},
                    ['mapped(actual.f): new Date(null), expected: "ofType.date"'])
        });
    });
});

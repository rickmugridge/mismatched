import {match} from "../match";
import {wasExpected} from "./Mismatched";
import {internalAssertThat} from "../utility/internalAssertThat"

describe("AnyOfMatcher:", () => {
    describe("Matches:", () => {
        it("Matches", () => {
            internalAssertThat(new Date()).is(match.anyOf([match.isEquals(3), match.instanceOf(Date)]));
            internalAssertThat({a: 2}).is(match.anyOf([match.instanceOf(Object)]));
            internalAssertThat({a: 2}).is(match.anyOf([match.instanceOf(Object)]));
        });

        it("Matches not as none match", () => {
            internalAssertThat({a: 2}).is(match.not(match.anyOf([])));
            internalAssertThat({a: 2}).is(match.not(match.anyOf([3])));
        });

        it("Optimise away with a single matcher inside", () => {
            const whatever = match.ofType.array();
            internalAssertThat(match.anyOf([whatever]), true).is(match.itIs(whatever))
        });
    });

    describe("Mismatches:", () => {
        it("Mismatches", () => {
            internalAssertThat("ab")
                .failsWith(match.anyOf([match.instanceOf(Date)]))
                .wasExpected("ab", {instanceOf: "Date"},
                    ['actual: "ab", expected: {instanceOf: "Date"}'])
        });

        it("Mismatches with multiple anyOf() with at least one partially matching", () => {
            let matcher: any = match.anyOf([match.instanceOf(Date), {f: "a", g: 3}])
            internalAssertThat({f: "ab", g: 3})
                .failsWith(matcher)
                .wasDiff(
                    {f: wasExpected("ab", "a"), g: 3},
                    ['actual.f: "ab", expected: "a"'])
        });

        it("Mismatches: as no matches at all", () => {
            const matcher = match.anyOf([match.instanceOf(Date), match.instanceOf(Error)])
            internalAssertThat("ab")
                .failsWith(matcher)
                .wasExpected(
                    "ab",
                    {anyOf: [{instanceOf: "Date"}, {instanceOf: "Error"}]},
                    ['actual: "ab", expected: {anyOf: [{instanceOf: "Date"}, {instanceOf: "Error"}]}'])
        })

        it("Just mentions the failures to match within the single key match", () => {
            const matchTypeA = {type: match.obj.key('a'), f: match.ofType.string()};
            const matchTypeB = {type: match.obj.key('b'), f: match.ofType.number()};
            const actual = {type: 'a', f: 4};

            internalAssertThat(actual)
                .failsWith(match.anyOf([matchTypeA, matchTypeB]))
                .wasDiff({"type": "a", f: wasExpected(4, "ofType.string")},
                    ['actual.f: 4, expected: "ofType.string"']);
        });

        it("Just mentions the failures to match within the single key match with some", () => {
            const matchTypeA = match.obj.has({
                type: match.obj.key('a'),
                f: match.ofType.string()
            });
            const matchTypeB = match.obj.has({
                type: match.obj.key('b'),
                f: match.ofType.number()
            });
            const actual = {type: 'a', f: 4};

            internalAssertThat(actual).failsWith(match.anyOf([matchTypeA, matchTypeB])).wasDiff({
                "type": "a",
                f: wasExpected(4, "ofType.string")
            }, [
                'actual.f: 4, expected: "ofType.string"'
            ])
        });

        it("Just mentions the failures to match within the single key match nested", () => {
            const extra = {id: match.any()}
            const matchTypeA = {...extra, type: match.obj.key('a'), f: match.ofType.string()};
            const matchTypeB = {...extra, type: match.obj.key('b'), f: match.ofType.number()};
            const actual = {x: true, b: {a: {id: 3, type: 'a', f: 4}}};

            internalAssertThat(actual)
                .failsWith({
                    x: match.any(),
                    b: {a: match.anyOf([matchTypeA, matchTypeB])}
                })
                .wasDiff({
                    x: true,
                    b: {a: {id: 3, type: 'a', f: wasExpected(4, "ofType.string")}}
                }, [
                    'actual.b.a.f: 4, expected: "ofType.string"'
                ])
        });

        it("fails with 2 failed matches with the same matchRate of 0.5, so choose the earliest", () => {
            const expected = match.anyOf([
                {type: 'a', f: 3},
                {type: 'b', f: 4}]);
            internalAssertThat({type: 'a', f: 4})
                .failsWith(expected)
                .wasDiff({type: 'a', f: wasExpected(4, 3)}, ['actual.f: 4, expected: 3'])
        })
    })
})
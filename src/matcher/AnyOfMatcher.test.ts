import {assertThat} from "../assertThat";
import {match} from "../match";
import {wasExpected} from "./Mismatched";
import {validateThat} from "../validateThat";

describe("AnyOfMatcher:", () => {
    describe("assertThat():", () => {
        it("Matches", () => {
            assertThat(new Date()).isAnyOf([match.isEquals(3), match.instanceOf(Date)]);
            assertThat({a: 2}).isAnyOf([match.instanceOf(Object)]);
            assertThat({a: 2}).isAnyOf([match.instanceOf(Object)]);
        });

        it("Mismatches", () => {
            assertThat("ab")
                .failsWith(match.anyOf([match.instanceOf(Date)]),
                    wasExpected("ab", {instanceOf: "Date"}))
        });

        it("Mismatches as none match", () => {
            assertThat({a: 2}).isNot(match.anyOf([]));
            assertThat({a: 2}).isNot(match.anyOf([3]));
        });

        it("Mismatches with multiple anyOf() with at least one partially matching", () => {
            let matcher: any = match.anyOf([match.instanceOf(Date), {f: "a", g: 3}])
            assertThat({f: "ab", g: 3})
                .failsWith(matcher,
                    {f: wasExpected("ab", "a"), g: 3})
        });

        it("Mismatches: as no matches at all", () => {
            const matcher = match.anyOf([match.instanceOf(Date), match.instanceOf(Error)])
            assertThat("ab")
                .failsWith(matcher,
                    wasExpected(
                        "ab",
                        {anyOf: [{instanceOf: "Date"}, {instanceOf: "Error"}]}
                    ))
        })

        it("Optimise away with a single matcher inside", () => {
            const whatever = match.ofType.array();
            assertThat(match.anyOf([whatever])).is(match.itIs(whatever))
        });
    });

    describe("validateThat():", () => {
        const expected = match.anyOf([
            match.instanceOf(Date),
            match.ofType.number()
        ])

        it("succeeds", () => {
            const validation = validateThat(3).satisfies(expected);
            assertThat(validation.passed()).is(true);
        })

        it("fails", () => {
            const validation = validateThat(false).satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                `actual: false, expected: {anyOf: [{instanceOf: "Date"}, "ofType.number"]}`
            ])
        })

        it("fails and just mentions the single match that was close", () => {
            const expected = match.anyOf([
                match.instanceOf(Date),
                {f: 3, g: 4}]);
            const validation = validateThat({f: 3}).satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                'actual.g: undefined, expected: 4'
            ]);
        });

        it("Just mentions the failures to match within the single key match", () => {
            const matchTypeA = {type: match.obj.key('a'), f: match.ofType.string()};
            const matchTypeB = {type: match.obj.key('b'), f: match.ofType.number()};
            const actual = {type: 'a', f: 4};

            const validation = validateThat(actual).satisfies(match.anyOf([matchTypeA, matchTypeB]));
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                'actual.f: 4, expected: "ofType.string"'
            ]);
        });

        it("Just mentions the failures to match within the single key match with some", () => {
            const matchTypeA = match.obj.has({type: match.obj.key('a'), f: match.ofType.string()});
            const matchTypeB = match.obj.has({type: match.obj.key('b'), f: match.ofType.number()});
            const actual = {type: 'a', f: 4};

            const validation = validateThat(actual).satisfies(match.anyOf([matchTypeA, matchTypeB]));
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                'actual.f: 4, expected: "ofType.string"'
            ]);
        });

        it("Just mentions the failures to match within the single key match nested", () => {
            const extra = {id: match.any()}
            const matchTypeA = {...extra, type: match.obj.key('a'), f: match.ofType.string()};
            const matchTypeB = {...extra, type: match.obj.key('b'), f: match.ofType.number()};
            const actual = {x: true, b: {a: {id: 3, type: 'a', f: 4}}};

            const validation = validateThat(actual).satisfies({
                x: match.any(),
                b: {a: match.anyOf([matchTypeA, matchTypeB])}
            });
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                'actual.b.a.f: 4, expected: "ofType.string"'
            ]);
        });

        it("fails with 2 failed matches with the same matchRate of 0.5, so choose the earliest", () => {
            const expected = match.anyOf([
                {type: 'a', f: 3},
                {type: 'b', f: 4}]);
            const validation = validateThat({type: 'a', f: 4}).satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                'actual.f: 4, expected: 3'
            ])
        })

    })
})
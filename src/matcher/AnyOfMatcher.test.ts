import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {Mismatched} from "./Mismatched";
import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {validateThat} from "../validateThat";

describe("AnyOfMatcher:", () => {
    describe("assertThat():", () => {
        it("Matches", () => {
            assertThat(new Date()).isAnyOf([match.isEquals(3), match.instanceOf(Date)]);
            assertThat({a: 2}).isAnyOf([match.instanceOf(Object)]);
            assertThat({a: 2}).isAnyOf([match.instanceOf(Object)]);
        });

        it("Mismatches", () => {
            assertThat({a: 2}).isNot(match.anyOf([])); // Base case of nothing matching
            assertThat("ab")
                .failsWith(match.anyOf([match.instanceOf(Date)]),
                    {[MatchResult.was]: "ab", [MatchResult.expected]: {instanceOf: "Date"}});
        });

        it("Mismatches with multiple anyOf", () => {
            assertThat("ab").failsWith(
                match.anyOf([match.instanceOf(Date), match.instanceOf(Date)]), match.any())
            assertThat({f: "ab", g: 3})
                .failsWith(match.anyOf([match.instanceOf(Date), {f: "a", g: 3}]),
                    {[MatchResult.was]: {f: "ab", g: 3}, [MatchResult.expected]: {f: "a", g: 3}})
        });

        it("Mismatches: errors", () => {
            const mismatched: Array<Mismatched> = [];
            const matcher = match.anyOf([match.instanceOf(Date), match.instanceOf(Error)]);
            (matcher as DiffMatcher<any>).mismatches(new ContextOfValidationError(), mismatched, "ab");
            assertThat(mismatched).is([
                {actual: "ab", expected: {anyOf: [{instanceOf: "Date"}, {instanceOf: "Error"}]}}
            ]);
        });

        it("Optimise away with a single matcher inside", () => {
            const whatever = match.ofType.array();
            assertThat(match.anyOf([whatever])).is(match.itIs(whatever))
        });
    });

    describe("validateThat():", () => {
        const expected = match.anyOf([
            match.instanceOf(Date),
            match.ofType.number()]);

        it("succeeds", () => {
            const validation = validateThat(3).satisfies(expected);
            assertThat(validation.passed()).is(true);
        });

        it("fails", () => {
            const validation = validateThat(false).satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                `{actual: false, expected: {anyOf: [{instanceOf: "Date"}, "ofType.number"]}}`
            ]);
        });

        it("fails and just mentions the single match that was close", () => {
            const expected = match.anyOf([
                match.instanceOf(Date),
                {f: 3, g: 4}]);
            const validation = validateThat({f: 3}).satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                '[{"actual.g": undefined, expected: 4}]'
            ]);
        });

        it("Just mentions the failures to match within the single key match", () => {
            const matchTypeA = {type: match.obj.key('a'), f: match.ofType.string()};
            const matchTypeB = {type: match.obj.key('b'), f: match.ofType.number()};
            const actual = {type: 'a', f: 4};

            const validation = validateThat(actual).satisfies(match.anyOf([matchTypeA, matchTypeB]));
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                '[{"actual.f": 4, expected: "ofType.string"}]'
            ]);
        });

        it("Just mentions the failures to match within the single key match with some", () => {
            const matchTypeA = match.obj.has({type: match.obj.key('a'), f: match.ofType.string()});
            const matchTypeB = match.obj.has({type: match.obj.key('b'), f: match.ofType.number()});
            const actual = {type: 'a', f: 4};

            const validation = validateThat(actual).satisfies(match.anyOf([matchTypeA, matchTypeB]));
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                '[{"actual.f": 4, expected: "ofType.string"}]'
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
                '[{"actual.b.a.f": 4, expected: "ofType.string"}]'
            ]);
        });

        it("fails with no key", () => {
            const expected = match.anyOf([
                {type: 'a', f: 3},
                {type: 'b', f: 4}]);
            const validation = validateThat({type: 'a', f: 4}).satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                '{actual: {type: "a", f: 4}, expected: {anyOf: [{type: "a", f: 3}, {type: "b", f: 4}]}}'
            ]);
        });

    });
});
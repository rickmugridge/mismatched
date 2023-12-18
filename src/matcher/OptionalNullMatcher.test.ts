import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {Mismatched} from "./Mismatched";
import {DiffMatcher, ContextOfValidationError} from "./DiffMatcher";
import {validateThat} from "../validateThat";

describe("OptionalNullMatcher:", () => {
    describe("assertThat():", () => {
        it("Matches", () => {
            assertThat(3).is(match.optionalNull(3));
            assertThat(undefined).is(match.optionalNull(3));
            assertThat(null).is(match.optionalNull(3));
        });

        it("Mismatches", () => {
            assertThat(4).failsWith(match.optionalNull(3),
                {[MatchResult.was]: 4, [MatchResult.expected]: 3});
        });

        it("Mismatches: errors", () => {
            const mismatched: Array<Mismatched> = [];
            const matcher = match.optionalNull(3);
            (matcher as DiffMatcher<any>).mismatches(new ContextOfValidationError(), mismatched, 4);
            assertThat(mismatched).is([
                {actual: 4, expected: 3}
            ]);
        });
    });

    describe("validateThat():", () => {
        const expected = {f: match.optionalNull(match.ofType.number())};

        it("succeeds", () => {
            const validation = validateThat({f: 3}).satisfies(expected);
            assertThat(validation.passed()).is(true);
        });

        it("succeeds when missing", () => {
            const validation = validateThat({}).satisfies(expected);
            assertThat(validation.passed()).is(true);
        });

        it("succeeds when null", () => {
            const validation = validateThat({f: null}).satisfies(expected);
            assertThat(validation.passed()).is(true);
        });

        it("fails with wrong type", () => {
            const validation = validateThat({f: "wrong"}).satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                `{"actual.f": "wrong", expected: "ofType.number"}`
            ]);
        });

        it("Fails with lower-level diff", () => {
            const validation = validateThat({name: {title: 4}}).satisfies({
                name: match.optionalNull(match.obj.match({title: 's'}))
            });
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                '{"actual.name.title": 4, expected: "s"}'
            ]);
         });
    });
});
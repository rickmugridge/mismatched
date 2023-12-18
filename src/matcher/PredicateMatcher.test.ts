import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {Mismatched} from "./Mismatched";
import {DiffMatcher, ContextOfValidationError} from "./DiffMatcher";
import {validateThat} from "../validateThat";

describe("PredicateMatcher:", () => {
    const matcher = match.predicate(v => v > 0);

    describe("assertThat():", () => {
        it("Matches", () => {
            assertThat(5).is(matcher);
            assertThat({a: 2}).is(match.predicate(v => v.a === 2));
        });

        it("Mismatches", () => {
            assertThat("ab")
                .failsWith(match.predicate(pred),
                    {
                        [MatchResult.was]: "ab",
                        [MatchResult.expected]: {predicateFailed: {"function": "pred()"}}
                    });
            assertThat("ab")
                .failsWith(match.predicate(v => v > 0),
                    {
                        [MatchResult.was]: "ab",
                        [MatchResult.expected]: {predicateFailed: {arrow: "v => v > 0"}}
                    });
            assertThat("ab")
                .failsWith(match.predicate(v => v > 0, "greater then zero"),
                    {
                        [MatchResult.was]: "ab",
                        [MatchResult.expected]: "greater then zero"
                    }
                );
        });

        it("Mismatches: errors", () => {
            const mismatched: Array<Mismatched> = [];
            const matcher = match.predicate(pred, 'failed');
            (matcher as DiffMatcher<any>).mismatches(new ContextOfValidationError(), mismatched, "ab");
            assertThat(mismatched).is([
                {actual: "ab", expected: "failed"}
            ]);
        });

        it("Mismatches: exception", () => {
            const mismatched: Array<Mismatched> = [];
            const matcher = match.predicate(() => {
                throw new Error('bad');
            });
            (matcher as DiffMatcher<any>).mismatches(new ContextOfValidationError(), mismatched, "ab");
            assertThat(mismatched).is([
                {actual: {exception: "bad", actual: "ab"}, expected: {predicateFailed: {arrow: "()"}}}
            ]);
        });

        it("Mismatches: exception with an object instead of an Error", () => {
            const mismatched: Array<Mismatched> = [];
            const matcher = match.predicate(() => {
                throw {error: 'error'};
            });
            (matcher as DiffMatcher<any>).mismatches(new ContextOfValidationError(), mismatched, "ab");
            assertThat(mismatched).is([
                {actual: { actual: "ab", exception: '{"error":"error"}'}, expected: {predicateFailed: {arrow: "()"}}}
            ]);
        });

        it("Mismatches: exception with a null instead of an Error", () => {
            const mismatched: Array<Mismatched> = [];
            const matcher = match.predicate(() => {
                throw null;
            });
            (matcher as DiffMatcher<any>).mismatches(new ContextOfValidationError(), mismatched, "ab");
            assertThat(mismatched).is([
                {actual: { actual: "ab", exception: 'null'}, expected: {predicateFailed: {arrow: "()"}}}
            ]);
        });
    });

    describe("validateThat():", () => {
        it("succeeds", () => {
            const validation = validateThat(3).satisfies(matcher);
            assertThat(validation.passed()).is(true);
        });

        it("fails", () => {
            const validation = validateThat(-1).satisfies(matcher);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                `{actual: -1, expected: {predicateFailed: {arrow: "v => v > 0"}}}`
            ]);
        });
    });
});

function pred() {
    return false;
}
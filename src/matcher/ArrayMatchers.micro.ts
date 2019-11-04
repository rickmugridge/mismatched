import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";

describe("array:", () => {
    describe("array.contains:", () => {
        it('number', () => {
            const actual = [1, 2, 3];
            assertThat(actual).is(match.array.contains(2));
        });

        it('string', () => {
            const actual = ["a", "b"];
            assertThat(actual).is(match.array.contains("b"));
        });

        it('does not match', () => {
            const actual = ["a", "b"];
            assertThat(actual).failsWith(match.array.contains("c"),
                {[MatchResult.was]: ["a", "b"], [MatchResult.expected]: {"array.contains": "c"}});
        });
    });

    describe("array.every:", () => {
        it('number', () => {
            const actual = [2, 2, 2];
            assertThat(actual).is(match.array.every(2));
        });

        it('string', () => {
            const actual = ["b", "b"];
            assertThat(actual).is(match.array.every("b"));
        });

        it('does not match', () => {
            const actual = ["a", "b"];
            assertThat(actual).failsWith(match.array.every("b"),
                {[MatchResult.was]: ["a", "b"], [MatchResult.expected]: {"array.every": "b"}});
        });
    });

    describe("array.match:", () => {
        it('matches', () => {
            const actual = [2, 2, 2];
            assertThat(actual).is(match.array.match([2, 2, 2]));
        });

        it('matches literally', () => {
            const actual = [2, 2, 2];
            assertThat(actual).is([2, 2, 2]);
        });

        it('does not match: length difference', () => {
            const actual = ["a", "b"];
            assertThat(actual).failsWith(match.array.match([2, 2, 2]),
                {[MatchResult.was]: ["a", "b"], [MatchResult.expected]: [2, 2, 2]});
        });

        it('does not match: values mismatch', () => {
            const actual = ["a", "b"];
            assertThat(actual).failsWith(match.array.match(["a", "c"]),
                ["a", {[MatchResult.was]: "b", [MatchResult.expected]: "c"}]);
        });

        it('matches literally nested', () => {
            const actual = [2, 2, [3, [4]]];
            assertThat(actual).is([2, 2, [3, [4]]]);
        });

        it('does not match literally nested', () => {
            const actual = [1, 2, [3, [5]]];
            assertThat(actual).failsWith([2, 2, [3, [4, 6]]],
                [{[MatchResult.was]: 1, [MatchResult.expected]: 2}, 2,
                    [3, {[MatchResult.was]: [5], [MatchResult.expected]: [4, 6]}]]);
            assertThat(actual).failsWith([1, 2, [3, [6]]],
                [1, 2, [3, [{[MatchResult.was]: 5, [MatchResult.expected]: 6}]]]);
        });

        it('does not match literally nested - wrong type', () => {
            const actual = [1, 2, [3, [5]]];
            let expected = [1, 2, [3, "a"]];
            assertThat(actual).failsWith(expected,
                [1, 2, [3, {[MatchResult.was]: [5], [MatchResult.expected]: "a"}]]);
            assertThat(expected).failsWith(actual,
                [1, 2, [3, {[MatchResult.was]: "a", [MatchResult.expected]: [5]}]]);
        });
    });

    describe("array.length:", () => {
        it('matches', () => {
            const actual = ["b", "b"];
            assertThat(actual).is(match.array.length(2));
        });

        it('does not match', () => {
            const actual = ["a", "b"];
            assertThat(actual).failsWith(match.array.length(1),
                {[MatchResult.was]: 2, [MatchResult.expected]: {"array.length": 1}});
        });
    });
});

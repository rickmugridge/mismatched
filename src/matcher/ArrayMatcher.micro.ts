import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {Mismatch} from "./Mismatch";
import {DiffMatcher} from "./DiffMatcher";

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

    it('does not match: length difference: errors', () => {
        const mismatched: Array<Mismatch> = [];
        const matcher = match.array.match([2,2,2]);
        (matcher as DiffMatcher<any>).mismatches("actual", mismatched, ["a", "b"]);
        assertThat(mismatched).is([
            {actual: ["a", "b"], expected: {length: 3}}
        ]);
    });

    it('does not match: values mismatch', () => {
        const actual = ["a", "b"];
        assertThat(actual).failsWith(match.array.match(["a", "c"]),
            ["a", {[MatchResult.was]: "b", [MatchResult.expected]: "c"}]);
    });

    it('does not match: values mismatch: errors', () => {
        const mismatched: Array<Mismatch> = [];
        const matcher = match.array.match(["a", "c"]);
        (matcher as DiffMatcher<any>).mismatches("actual", mismatched, ["a", "b"]);
        assertThat(mismatched).is([
            {"actual[1]": "b", expected: "c"}
        ]);
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

    it('does not match literally nested: errors', () => {
        const mismatched: Array<Mismatch> = [];
        const matcher = match.array.match([2, 2, [3, [4, 6]]]);
        (matcher as DiffMatcher<any>).mismatches("actual", mismatched, [1, 2, [3, [5]]]);
        assertThat(mismatched).is([
            {"actual[0]": 1, expected: 2},
            {"actual[2][1]": [5], expected: {length: 2}}
        ]);
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

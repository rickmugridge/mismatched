import {match} from "../match";
import {assertThat} from "../assertThat";
import {Mismatch} from "./Mismatch";
import {DiffMatcher} from "./DiffMatcher";

describe("match.itIs():", () => {
    it('object itself', () => {
        const actual = {a: "b"};
        assertThat(actual).is(match.itIs(actual));
        assertThat(actual).isNot(match.itIs({a: "b"}));
    });

    it('array itself', () => {
        const actual = [1, 2, 3];
        assertThat(actual).is(match.itIs(actual));
        assertThat(actual).isNot(match.itIs([1, 2, 3]));
    });

    it('array itself mismatches: errors', () => {
        const mismatched: Array<Mismatch> = [];
        const matcher = match.itIs([1, 2, 3]);
        (matcher as DiffMatcher<any>).mismatches("actual", mismatched, [1, 2, 3]);
        assertThat(mismatched).is([
            {actual: [1, 2, 3], expected: {itIsTheSameObjectAs: [1, 2, 3]}}
        ]);
    });
});

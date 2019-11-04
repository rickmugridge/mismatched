import {match} from "../match";
import {assertThat} from "../assertThat";
import {MatchResult} from "../MatchResult";

describe("match.it():", () => {
    it('object itself', () => {
        const actual = {a: "b"};
        assertThat(actual).is(match.it(actual));
        assertThat(actual).isNot(match.it({a: "b"}));
    });

    it('array itself', () => {
        const actual = [1, 2, 3];
        assertThat(actual).is(match.it(actual));
        assertThat(actual).isNot(match.it([1, 2, 3]));
    });
});

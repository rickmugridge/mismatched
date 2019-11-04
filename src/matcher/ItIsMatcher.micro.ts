import {match} from "../match";
import {assertThat} from "../assertThat";
import {MatchResult} from "../MatchResult";

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
});

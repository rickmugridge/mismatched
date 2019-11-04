import {assertThat} from "../assertThat";
import {match} from "../match";

describe("AnyMatcher:", () => {
    it("Matches", () => {
        assertThat(new Date()).is(match.any);
        assertThat({a: 2}).is(match.any);
        assertThat(false).is(match.any);
    });
});
import {match} from "../match";
import {internalAssertThat} from "../utility/internalAssertThat"

describe("AnyMatcher:", () => {
    it("assertThat()", () => {
        internalAssertThat(new Date()).is(match.any());
        internalAssertThat({a: 2}).is(match.any());
        internalAssertThat(false).is(match.any());
    });
});
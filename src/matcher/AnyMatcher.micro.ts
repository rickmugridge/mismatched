import {assertThat} from "../assertThat";
import {match} from "../match";
import {validateThat} from "../validateThat";

describe("AnyMatcher:", () => {
    it("assertThat()", () => {
        assertThat(new Date()).is(match.any());
        assertThat({a: 2}).is(match.any());
        assertThat(false).is(match.any());
    });

    it("validateThat()", () => {
        validateThat(new Date()).satisfies(match.any()).passed();
        validateThat({a: 2}).satisfies(match.any()).passed();
        validateThat(false).satisfies(match.any()).passed();
    });
});
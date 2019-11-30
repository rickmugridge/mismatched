import {assertThat} from "../assertThat";
import {match} from "../match";

describe("string:", () => {
    const actual = "abcdefghijkl";

    it("string.match:", () => {
        assertThat(actual).is(match.string.match(actual));
        assertThat(actual).is(actual);
    });

    it("string.startsWith:", () => {
        assertThat(actual).is(match.string.startsWith("abc"));
    });

    it("string.endsWith:", () => {
        assertThat(actual).is(match.string.endsWith("jkl"));
    });

    it("string.includes:", () => {
        assertThat(actual).is(match.string.includes("abc"));
        assertThat(actual).is(match.string.includes("cde"));
    });
});

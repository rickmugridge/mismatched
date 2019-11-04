import {StringDiff} from "./StringDiff";
import {assertThat} from "../assertThat";

describe("StringDiff", () => {
    it("Actual has one or more extra characters", () => {
        assertThat(StringDiff.expectedDiff("", "b")).is("[b]");
        assertThat(StringDiff.expectedDiff("", "bc")).is("[bc]");
        assertThat(StringDiff.expectedDiff("a", "ab")).is("a[b]");
        assertThat(StringDiff.expectedDiff("a", "abcd")).is("a[bcd]");
        assertThat(StringDiff.expectedDiff("ac", "abc")).is("a[b]c");
        assertThat(StringDiff.expectedDiff("ac", "abbbc")).is("a[bbb]c");
    });

    it("Actual has one or more missing characters", () => {
        assertThat(StringDiff.expectedDiff("b", "")).is("(b)");
        assertThat(StringDiff.expectedDiff("bcde", "")).is("(bcde)");
        assertThat(StringDiff.expectedDiff("abcde", "a")).is("a(bcde)");
        assertThat(StringDiff.expectedDiff("abc", "ac")).is("a(b)c");
        assertThat(StringDiff.expectedDiff("abbbbc", "ac")).is("a(bbbb)c");
    });

    it("Actual has some extra and some missing characters", () => {
        assertThat(StringDiff.expectedDiff("a", "b")).is("(a[b])");
        assertThat(StringDiff.expectedDiff("ab", "bc")).is("(a)[c]b");
        assertThat(StringDiff.expectedDiff("azbb", "bcde")).is("(az)b[cde](b)");
    });
});
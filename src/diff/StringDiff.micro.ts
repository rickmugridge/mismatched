import {assertThat} from "../assertThat";
import {diffColourExtra, diffColourMissing, stringDiff} from "./StringDiff";

describe("StringDiff", () => {
    it("Actual has one or more extra characters", () => {
        assertThat(stringDiff("", "b", true)).is("[b]");
        assertThat(stringDiff("", "bc", true)).is("[bc]");
        assertThat(stringDiff("a", "ab", true)).is("a[b]");
        assertThat(stringDiff("a", "abcd", true)).is("a[bcd]");
        assertThat(stringDiff("ac", "abc", true)).is("a[b]c");
        assertThat(stringDiff("ac", "abbbc", true)).is("a[bbb]c");
    });

    it("Actual has one or more missing characters", () => {
        assertThat(stringDiff("b", "", true)).is("(b)");
        assertThat(stringDiff("bcde", "", true)).is("(bcde)");
        assertThat(stringDiff("abcde", "a", true)).is("a(bcde)");
        assertThat(stringDiff("abc", "ac", true)).is("a(b)c");
        assertThat(stringDiff("abbbbc", "ac", true)).is("a(bbbb)c");
    });

    it("Actual has some extra and some missing characters", () => {
        assertThat(stringDiff("ab", "bc", true)).is("(a)b[c]");
        assertThat(stringDiff("aaab", "bccc", true)).is("(aaa)b[ccc]");
        assertThat(stringDiff("azbb", "bcde", true)).is("(azb)b[cde]");
        assertThat(stringDiff("Zbfg", "bCfXg", true)).is("(Z)b[C]f[X]g");
        assertThat(stringDiff("ZZbfg", "bCCfXXgYY", true)).is("(ZZ)b[CC]f[XX]g[YY]");
    });

    it("With colours", () => {
        assertThat(stringDiff("azbb", "bcde"))
            .is(`${diffColourExtra("azb")}b${diffColourMissing("cde")}`);
    });
});
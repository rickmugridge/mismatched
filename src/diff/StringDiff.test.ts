import {assertThat} from "../assertThat";
import {stringDiff} from "./StringDiff";

describe("StringDiff", () => {
    it("Actual has one or more extra characters", () => {
        assertThat(stringDiff.patchDiffer("", "b", true)).is("[b]");
        assertThat(stringDiff.patchDiffer("", "bc", true)).is("[bc]");
        assertThat(stringDiff.patchDiffer("a", "ab", true)).is("a[b]");
        assertThat(stringDiff.patchDiffer("a", "abcd", true)).is("a[bcd]");
        assertThat(stringDiff.patchDiffer("ac", "abc", true)).is("a[b]c");
        assertThat(stringDiff.patchDiffer("ac", "abbbc", true)).is("a[bbb]c");
    });

    it("Actual has one or more missing characters", () => {
        assertThat(stringDiff.patchDiffer("b", "", true)).is("(b)");
        assertThat(stringDiff.patchDiffer("bcde", "", true)).is("(bcde)");
        assertThat(stringDiff.patchDiffer("abcde", "a", true)).is("a(bcde)");
        assertThat(stringDiff.patchDiffer("abc", "ac", true)).is("a(b)c");
        assertThat(stringDiff.patchDiffer("abbbbc", "ac", true)).is("a(bbbb)c");
    });

    it("Actual has some extra and some missing characters", () => {
        assertThat(stringDiff.patchDiffer("ab", "bc", true)).is("(a)b[c]");
        assertThat(stringDiff.patchDiffer("aaab", "bccc", true)).is("(aaa)b[ccc]");
        assertThat(stringDiff.patchDiffer("azbb", "bcde", true)).is("(azb)b[cde]");
        assertThat(stringDiff.patchDiffer("Zbfg", "bCfXg", true)).is("(Z)b[C]f[X]g");
        assertThat(stringDiff.patchDiffer("ZZbfg", "bCCfXXgYY", true)).is("(ZZ)b[CC]f[XX]g[YY]");
    });

    it("With colours", () => {
        assertThat(stringDiff.patchDiffer("azbb", "bcde"))
            .is(`${stringDiff.extraColour("azb")}b${stringDiff.missingColour("cde")}`);
    });
});

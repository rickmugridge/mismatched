import {assertThat} from "../assertThat";
import {match} from "../match";

describe("OfTypeMatcher:", () => {
    it("ofType.array", () => {
        assertThat([]).is(match.ofType.array());
        assertThat([1, 3]).is(match.ofType.array());
        assertThat(2).is(match.not(match.ofType.array()));
    });

    it("ofType.function", () => {
        assertThat(() => 1).is(match.ofType.function());
        assertThat((a, b) => a + b).is(match.ofType.function());
        assertThat(2).is(match.not(match.ofType.function()));
    });

    it("ofType.string", () => {
        assertThat("").is(match.ofType.string());
        assertThat("aa").is(match.ofType.string());
        assertThat(2).is(match.not(match.ofType.string()));
    });

    it("ofType.number", () => {
        assertThat(1).is(match.ofType.number());
        assertThat(2.3).is(match.ofType.number());
        assertThat(true).is(match.not(match.ofType.number()));
    });

    it("ofType.boolean", () => {
        assertThat(true).is(match.ofType.boolean());
        assertThat(false).is(match.ofType.boolean());
        assertThat(1).is(match.not(match.ofType.boolean()));
    });

    it("ofType.boolean", () => {
        assertThat(true).is(match.ofType.boolean());
        assertThat(false).is(match.ofType.boolean());
        assertThat(1).is(match.not(match.ofType.boolean()));
    });

    it("ofType.regExp", () => {
        assertThat(/a/).is(match.ofType.regExp());
        assertThat(/a.*/).is(match.ofType.regExp());
        assertThat(1).is(match.not(match.ofType.regExp()));
    });

    it("ofType.symbol", () => {
        assertThat(Symbol("")).is(match.ofType.symbol());
        assertThat(Symbol()).is(match.ofType.symbol());
        assertThat(1).is(match.not(match.ofType.symbol()));
    });
});
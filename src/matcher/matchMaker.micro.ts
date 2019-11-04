import {assertThat} from "../assertThat";
import {IsEqualsMatcher} from "./IsEqualsMatcher";
import {match} from "../match";
import {ObjectMatcher} from "./ObjectMatchers";
import {RegExpMatcher} from "./RegExpMatcher";
import {matchMaker} from "./matchMaker";
import {StringMatcher} from "./StringMatcher";
import {PredicateMatcher} from "./PredicateMatcher";

describe("makeMatcher():", () => {
    const isEqualsMatcher = match.instanceOf(IsEqualsMatcher);

    it("undefined", () => {
        assertThat(matchMaker(undefined)).is(isEqualsMatcher);
    });

    it("null", () => {
        assertThat(matchMaker(null)).is(isEqualsMatcher);
    });

    it("string", () => {
        assertThat(matchMaker("a")).is(match.instanceOf(StringMatcher));
    });

    it("number", () => {
        assertThat(matchMaker(2)).is(isEqualsMatcher);
    });

    it("boolean", () => {
        assertThat(matchMaker(true)).is(isEqualsMatcher);
    });

    it("symbol", () => {
        assertThat(matchMaker(Symbol())).is(isEqualsMatcher);
    });

    it("matcher", () => {
        const matcher = match.isEquals(3);
        assertThat(matchMaker(matcher)).is(isEqualsMatcher);
    });

    it("lambda", () => {
        assertThat(matchMaker((a, b) => 3)).is(match.instanceOf(PredicateMatcher));
    });

    describe("object", () => {
        it("anonymous class", () => {
            assertThat(matchMaker({a: 3})).is(match.instanceOf(ObjectMatcher));
        });

        it("known class", () => {
            assertThat(matchMaker(new Date())).is(match.instanceOf(ObjectMatcher));
        });
    });

    it("regExp", () => {
        assertThat(matchMaker(/ab/)).is(match.instanceOf(RegExpMatcher));
    });
});
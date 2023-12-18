import {arrayDiff} from "./arrayDiff";
import {assertThat} from "../assertThat";
import {match} from "../match";
import {Option, Some} from "prelude-ts";
import {DiffMatcher} from "../matcher/DiffMatcher";

const isMatcher =(matcher:DiffMatcher<any>) =>  Option.of(match.itIs(matcher))

describe("arrayDiff", () => {
    it("is empty", () => {
        const result = arrayDiff([], [])
        assertThat([]).is([])
        assertThat(result).is([])
    });

    it("is same", () => {
        const matcher = match.isEquals(1);
        const actual = 1;
        const result = arrayDiff([matcher], [actual])
        assertThat(result).is([{actual: Option.of(actual), actualIndex: 0, matcher: isMatcher(matcher)}])
    });

    it("is same with undefined", () => {
        assertThat(new Some(undefined).getOrThrow()).is(undefined)
        const matcher = match.isEquals(undefined);
        const actual = undefined;
        const result = arrayDiff([matcher], [actual])
        assertThat(result).is([{actual: new Some(actual), actualIndex: 0, matcher: isMatcher(matcher)}])
    });

    it("is same with null", () => {
        assertThat(new Some(null).getOrThrow()).is(null)
        const matcher = match.isEquals(null);
        const actual = null;
        const result = arrayDiff([matcher], [actual])
        assertThat(result).is([{actual: new Some(actual), actualIndex: 0, matcher: isMatcher(matcher)}])
    });

    it("expected 1 but there were none", () => {
        const matcher = match.isEquals(1);
        const result = arrayDiff([matcher], [])
        assertThat(result).is([{actual: Option.none(), matcher: isMatcher(matcher)}])
    });

    it("expected none but there was one", () => {
        const actual = 1;
        const result = arrayDiff([], [actual])
        assertThat(result).is([{actual: Option.of(actual), actualIndex: 0, matcher: Option.none()}])
    });

    it("expected a 1 but there was a 2", () => {
        const matcher = match.isEquals(1);
        const actual = 2;
        const result = arrayDiff([matcher], [actual])
        assertThat(result).is([
            {actual: Option.of(actual), actualIndex: 0, matcher: Option.none()},
            {actual: Option.none(), matcher: isMatcher(matcher)}])
    });

    it("expected a 1 but there was an undefined", () => {
        const matcher = match.isEquals(1);
        const actual = undefined;
        const result = arrayDiff([matcher], [actual])
        assertThat(result).is([{actual: new Some(actual), actualIndex: 0, matcher: Option.none()},
            {actual: Option.none(), matcher: isMatcher(matcher)}])
    });

    it("expected an undefined but there was a 1", () => {
        const matcher = match.isEquals(undefined);
        const actual = 1;
        const result = arrayDiff([matcher], [actual])
        assertThat(result).is([{actual: Option.of(actual), actualIndex: 0, matcher: Option.none()},
            {actual: Option.none(), matcher: isMatcher(matcher)}])
    });

    it("expected 1, 2 but there was a 1", () => {
        const matcher1 = match.isEquals(1);
        const matcher2 = match.isEquals(2);
        const actual = 1;
        const result = arrayDiff([matcher1, matcher2], [actual])
        assertThat(result).is([
            {actual: Option.of(actual), actualIndex: 0, matcher: isMatcher(matcher1)},
            {actual: Option.none(), matcher: isMatcher(matcher2)}
        ])
    });

    it("expected 1, 2 but there was a 2", () => {
        const matcher1 = match.isEquals(1);
        const matcher2 = match.isEquals(2);
        const actual = 2;
        const result = arrayDiff([matcher1, matcher2], [actual])
        assertThat(result).is([
            {actual: Option.none(), matcher: isMatcher(matcher1)},
            {actual: Option.of(actual), actualIndex: 0, matcher: isMatcher(matcher2)}
        ])
    });

    it("expected 1, 2 but there was a 1, 3", () => {
        const matcher1 = match.isEquals(1);
        const matcher2 = match.isEquals(2);
        const actual1 = 1;
        const actual2 = 3;
        const result = arrayDiff([matcher1, matcher2], [actual1, actual2])
        assertThat(result).is([
            {actual: Option.of(actual1), actualIndex: 0, matcher: isMatcher(matcher1)},
            {actual: Option.of(actual2), actualIndex: 1, matcher: Option.none()},
            {actual: Option.none(), matcher: isMatcher(matcher2)}
        ])
    });

    it("expected 1, 2 but there was a 1, undefined", () => {
        const matcher1 = match.isEquals(1);
        const matcher2 = match.isEquals(2);
        const actual1 = 1;
        const actual2 = undefined;
        const result = arrayDiff([matcher1, matcher2], [actual1, actual2])
        assertThat(result).is([
            {actual: Option.of(actual1), actualIndex: 0, matcher: isMatcher(matcher1)},
            {actual: Option.of(actual2), actualIndex: 1, matcher: Option.none()},
            {actual: Option.none(), matcher: isMatcher(matcher2)}
        ])
    });

    it("expected 2, undefined but there was a 1, undefined", () => {
        const matcher1 = match.isEquals(2);
        const matcher2 = match.isEquals(undefined);
        const actual1 = 1;
        const actual2 = undefined;
        const result = arrayDiff([matcher1, matcher2], [actual1, actual2])
        assertThat(result).is([
            {actual: Option.of(actual1), actualIndex: 0, matcher: Option.none()},
            {actual: Option.none(), matcher: isMatcher(matcher1)},
            {actual: Option.of(actual2), actualIndex: 1, matcher: isMatcher(matcher2)}
        ])
    });

    it("expected a {f:1} but there was a {f:2}", () => {
        const matcher = match.obj.match({f: 1});
        const actual = {f: 2};
        const result = arrayDiff([matcher], [actual])
        assertThat(result).is([{actual: Option.of(actual), actualIndex: 0, matcher: Option.none()},
            {actual: Option.none(), matcher: isMatcher(matcher)}])
    });

    it("expected a [0] but there was a [2]", () => {
        const matcher = match.array.match([0]);
        const actual = [2];
        const result = arrayDiff([matcher], [actual])
        assertThat(result).is([{actual: Option.of(actual), actualIndex: 0, matcher: Option.none()},
            {actual: Option.none(), matcher: isMatcher(matcher)}])
    });

    it("expected a [0, 1] but there was a [0, 2]", () => {
        const matcher = match.array.match([0, 1]);
        const actual = [0, 2];
        const result = arrayDiff([matcher], actual)
        assertThat(result).is([{actual: Option.of(0), actualIndex: 0, matcher: Option.none()},
            {actual: Option.of(2), actualIndex: 1, matcher: Option.none()},
            {actual: Option.none(), matcher: match.any()}])
    });

    it("expected a single key match that otherwise fails", () => {
        const matcher = match.obj.match({id: match.obj.key(1), f: 1});
        const actual = {id: 1, f: 2};
        const result = arrayDiff(
            [matcher],
            [actual])
        assertThat(result).is([{actual: Option.of(actual), actualIndex: 0, matcher: isMatcher(matcher)}])
    });

    it("expected a single key match that otherwise fails, along with unexpected before and after", () => {
        const matcher = match.obj.match({id: match.obj.key(1), f: 1});
        const actual2 = {id: 1, f: 2};
        const result = arrayDiff(
            [matcher],
            [10, actual2, 20])
        assertThat(result).is([
            {actual: Option.of(10), actualIndex: 0, matcher: Option.none()},
            {actual: Option.of(actual2), actualIndex: 1, matcher: isMatcher(matcher)},
            {actual: Option.of(20), actualIndex: 2, matcher: Option.none()}])
    });

    it("expected a single key match that otherwise fails, along with expected before and after", () => {
        const matcher1 = match.isEquals(30);
        const matcher2 = match.obj.match({id: match.obj.key(1), f: 1});
        const matcher3 = match.isEquals(40);
        const actual = {id: 1, f: 2};
        const result = arrayDiff([matcher1, matcher2, matcher3], [actual])
        assertThat(result).is([
            {actual: Option.none(), matcher: isMatcher(matcher1)},
            {actual: Option.of(actual), actualIndex: 0, matcher: isMatcher(matcher2)},
            {actual: Option.none(), matcher: isMatcher(matcher3)}])
    });

    it("expected a single key match that otherwise fails, along with mix before and after", () => {
        const matcherA = match.isEquals('A')
        const matcher1 = match.isEquals(30);
        const matcherB = match.isEquals('B')
        const matcher2 = match.obj.match({id: match.obj.key(1), f: 1});
        const matcher3 = match.isEquals(40);
        const actual = {id: 1, f: 2};
        const result = arrayDiff([matcherA, matcher1, matcherB, matcher2, matcher3],
            [actual])
        assertThat(result).is([
            {actual: Option.none(), matcher: isMatcher(matcherA)},
            {actual: Option.none(), matcher: isMatcher(matcher1)},
            {actual: Option.none(), matcher: isMatcher(matcherB)},
            {actual: Option.of(actual), actualIndex: 0, matcher: isMatcher(matcher2)},
            {actual: Option.none(), matcher: isMatcher(matcher3)}])
    });
});

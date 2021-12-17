import {assertThat} from "../assertThat";
import {IsEqualsMatcher} from "../matcher/IsEqualsMatcher";
import {match} from "../match";
import {ObjectMatcher} from "../matcher/ObjectMatcher";
import {RegExpMatcher} from "../matcher/RegExpMatcher";
import {matchMaker} from "./matchMaker";
import {StringMatcher} from "../matcher/StringMatcher";
import {PrettyPrinter} from "../index";
import {AnyMatcher} from "../matcher/AnyMatcher";
import {PredicateMatcher} from "../matcher/PredicateMatcher";
import {CustomiseMismatcher} from "./CustomiseMismatcher";

describe("matchMaker():", () => {
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
        assertThat(matchMaker((a, b) => 3)).is(match.instanceOf((AnyMatcher)));
    });

    it("registered matcher", () => {
        class Hide {
            constructor(public f: number, public g: number, public h: number) {
            }

            equals(other: Hide) {
                return this.f === other.f;
            }
        }

        const matcher = (expected: Hide) => PredicateMatcher.make(value => expected.equals(value),
            {"Hide.equals": expected});
        CustomiseMismatcher.addCustomMatcher(match.instanceOf(Hide), matcher);
        assertThat(matchMaker(new Hide(1, 2, 3))).is(match.instanceOf(PredicateMatcher));
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

    it("mock", () => {
        const pseudoMockSymbol = Symbol("pseudoMock");
        PrettyPrinter.make(80, 10, 100, pseudoMockSymbol); // register it
        const mock = new Proxy(() => 3, {
            get: (target, propKey: symbol, receiver) => {
                if (propKey === PrettyPrinter.symbolForMockName) {
                    return () => ({mock: "mockName"});
                }
                return undefined;
            }
        });
        assertThat(matchMaker(mock)).is(match.instanceOf(IsEqualsMatcher));
        assertThat(mock).is(mock);
    });

    describe('self-reference', () => {
        it("self-reference to array at top level", () => {
            const a: any = [2]
            a[1] = a
            // [2, <a>}]
            const a2: any = [2]
            a2[1] = a2
            assertThat(a).is(a2)
        });

        it("self-references to array at top level", () => {
            const a: any = [2]
            a[1] = a
            a[2] = a
            // [2, <a>, <a>}]
            const a2: any = [2]
            a2[1] = a2
            a2[2] = a2
            assertThat(a).is(a2)
        });
        it("deeper self references", () => {
            const a: any = [[1]]
            a[1] = a[0]
            a[2] = a[0]
            // [[1], <a[0]>, <a[0]>]
            const a2: any = [[1]]
            a2[1] = a2[0]
            a2[2] = a2[0]
            assertThat(a).is(a2)
        });
        it("at top level", () => {
            const a: any = {b: 2}
            a.c = a
            // {b: 2, c: <a>}
            const a2: any = {b: 2}
            a2.c = a2
            assertThat(a).is(a2)
        });
        it("deeper level", () => {
            const a: any = {b: {c: 4}}
            a.b.d = a.b
            // {b: {c: 4, d: <a.b>}}
            assertThat(a).is(a)
        });
        it("deeper level, twice", () => {
            const a: any = {b: {c: 4}}
            a.b.d = a.b
            a.e = {b: a.b}
            // {b: {c: 4, d: <a.b>}, e: {b: <a.b>}}
            assertThat(a).is(a)
        });
        it("is ok as is, but could use the same self-reference technique", () => {
            const x = {f: 1}
            const a: any = {b: {c: 4, x}, x}
            assertThat(a).is(a)
        });
    })
});

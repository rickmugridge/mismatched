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
        assertThat(matchMaker(new Hide(1,2,3))).is(match.instanceOf(PredicateMatcher));
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
});

import {assertThat} from "../assertThat";
import {match} from "../match";
import {validateThat} from "../validateThat";

describe("OfTypeMatcher:", () => {
    describe("assertThat():", () => {
        it("ofType.array()", () => {
            assertThat([]).is(match.ofType.array());
            assertThat([1, 3]).is(match.ofType.array());
            assertThat(2).is(match.not(match.ofType.array()));
        });

        it("ofType.function()", () => {
            assertThat(() => 1).is(match.ofType.function());
            assertThat((a, b) => a + b).is(match.ofType.function());
            assertThat(2).is(match.not(match.ofType.function()));
        });

        it("ofType.string()", () => {
            assertThat("").is(match.ofType.string());
            assertThat("aa").is(match.ofType.string());
            assertThat(2).is(match.not(match.ofType.string()));
        });

        it("ofType.number()", () => {
            assertThat(1).is(match.ofType.number());
            assertThat(2.3).is(match.ofType.number());
            assertThat(true).is(match.not(match.ofType.number()));
        });

        it("ofType.boolean()", () => {
            assertThat(true).is(match.ofType.boolean());
            assertThat(false).is(match.ofType.boolean());
            assertThat(1).is(match.not(match.ofType.boolean()));
        });

        it("ofType.regExp()", () => {
            assertThat(/a/).is(match.ofType.regExp());
            assertThat(/a.*/).is(match.ofType.regExp());
            assertThat(1).is(match.not(match.ofType.regExp()));
        });

        it("ofType.symbol()", () => {
            assertThat(Symbol("")).is(match.ofType.symbol());
            assertThat(Symbol()).is(match.ofType.symbol());
            assertThat(1).is(match.not(match.ofType.symbol()));
        });

        it('ofType.enum()', () => {
            enum E {
                First='First',
                Second='Second'
            }
            assertThat(E.First).is(match.ofType.enum(E, "E"));
            assertThat(E.Second).is(match.ofType.enum(E, "E"));
            assertThat("junk").isNot(match.ofType.enum(E, "E"));
            assertThat(undefined).isNot(match.ofType.enum(E, "E"));
            assertThat(null).isNot(match.ofType.enum(E, "E"));
            assertThat(false).isNot(match.ofType.enum(E, "E"));
            assertThat(0).isNot(match.ofType.enum(E, "E"));
            assertThat([]).isNot(match.ofType.enum(E, "E"));
            assertThat({}).isNot(match.ofType.enum(E, "E"));
        });
    });

    describe("validateThat():", () => {
        const expected = match.ofType.number();

        it("succeeds", () => {
            const validation = validateThat(3).satisfies(expected);
            assertThat(validation.passed()).is(true);
        });

        it("fails", () => {
            const validation = validateThat(false).satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                `{actual: false, expected: "ofType.number"}`
            ]);
        });
    });
});
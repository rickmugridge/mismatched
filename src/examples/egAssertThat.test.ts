import {assertThat} from "../assertThat";
import {match} from "../match";

describe("assertThat():", () => {
    describe("is()", () => {
        it("Can take a literal value", () => {
            assertThat(44).is(44);
        });

        it("Can take a matcher value", () => {
            assertThat(44).is(match.number.lessEqual(45));
        });
    });

    describe("isNot() succeeds if the argument matcher/literal fails to match", () => {
        it("Can take a literal value", () => {
            assertThat(44).isNot(33);
            assertThat(44).is(match.not(33));
        });

        it("Can take a matcher value", () => {
            assertThat(44).isNot(match.number.greater(100));
            assertThat(44).is(match.not(match.number.greater(100)));
        });
    });

    it("isAnyOf() matches at least one of several possibilities", () => {
        assertThat(44).isAnyOf([33, match.number.greater(40)]);
        assertThat(44)
            .is(match.anyOf([33, match.number.greater(40)]));
    });

    it("isAllOf() matches on all matchers or literals", () => {
        assertThat(44).isAllOf([match.number.greater(40), match.number.less(50)]);
        assertThat(44)
            .is(match.allOf([match.number.greater(40), match.number.less(50)]));
    });
});
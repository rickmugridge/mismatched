import {assertThat} from "../assertThat";
import {match} from "../match";

describe("array", () => {
    describe("array.match", () => {
        it("literal", () => {
            assertThat([1, 2]).is([1, 2]);
            assertThat([1, 2]).is(match.array.match([1, 2])); // long-hand
        });

        it("Embedded matcher", () => {
            assertThat([1, 2]).is([1, match.number.greater(0)]);
            assertThat([1, 2]).is(match.array.match([1, match.number.greater(0)]));
        });
    });

    it("array.contains", () => {
        assertThat([-1, 2]).is(match.array.contains(match.number.greater(0)));
    });

    describe("array.every", () => {
        it("literal", () => {
            assertThat([1, 1]).is(match.array.every(1));
        });
        it("matcher", () => {
            assertThat([-1, 2]).is(match.array.every(match.number.greater(-5)));
        });
    });

    it("array.length", () => {
        assertThat([-1, 2]).is(match.array.length(2));
    });
});
import {assertThat} from "../assertThat";

describe("eg.custom:", () => {
    it("Provide an arrow. It is used for predicate matching", () => {
        assertThat(33).is(v => v >= 20 && v < 40);
    });

    it("Name the matcher so it can be used multiple times", () => {
        function fromUpTo(from: number, upto: number) {
            return v => v >= from && v < upto;
        }
        assertThat(33).is(fromUpTo(20, 40));
    });
});
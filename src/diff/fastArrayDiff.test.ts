import * as diff from "fast-array-diff";
import {assertThat} from "../assertThat";

describe("fast-array-diff", () => {
    it("try", () => {
        const es = diff.getPatch([1, 2, 2.5, 3, 5], [2, 3, 4], compare);
        assertThat(es).is([
            {type: 'remove', oldPos: 0, newPos: 0, items: [1]},
            {type: 'remove', oldPos: 2, newPos: 1, items: [2.5]},
            {type: 'remove', oldPos: 4, newPos: 2, items: [5]},
            {type: 'add', oldPos: 5, newPos: 2, items: [4]}
        ]);
    });

    it("string", () => {
        const actuals = Array.from("abcEFGij");
        const expecteds = Array.from("bcdefhi");
        const deltas = diff.getPatch(expecteds, actuals, compare);
        assertThat(deltas).is([
            {type: "add", oldPos: 0, newPos: 0, items: ["a"]},
            {type: "remove", oldPos: 2, newPos: 2, items: ["d", "e", "f", "h"]},
            {type: "add", oldPos: 6, newPos: 3, items: ["E", "F", "G"]},
            {type: "add", oldPos: 7, newPos: 7, items: ["j"]}
        ]);
        expecteds.splice(0, 0, "[a]"); // add
        expecteds.splice(2 + 1, 0, "<"); // remove start
        expecteds.splice(2 + 1 + 4 + 1, 0, ">"); // remove end
        expecteds.splice(2 + 1 + 4 + 1 + 1, 0, "[EFG]"); // add
        expecteds.splice(2 + 1 + 4 + 1 + 1 + 3, 0, "[j]"); // add
        const result = expecteds.join("");
        // Was                          "bcdefhi"
        assertThat(result).is("[a]bc<defh>[EFG]i[j]");
    });
});

function compare(a, b) {
    return a === b;
}

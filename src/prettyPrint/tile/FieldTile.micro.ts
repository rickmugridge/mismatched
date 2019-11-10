import {assertThat} from "../../assertThat";
import {FieldTile, SimpleTile} from "./Tile";
import {Appender} from "../Appender";

describe("FieldTile", () => {
    it("Simple", () => {
        const fieldTile = new FieldTile("a", new SimpleTile("hello"));
        assertThat(Appender.composeLength(fieldTile)).is(8);
        assertThat(fieldTile).is({
            key: "a", stringLength: 8, complexity: 2,
            value: {complexity: 1, s: "hello", stringLength: 5}
        });
    });

    it("One field", () => {
        const tile = new FieldTile("field", new SimpleTile(124));
        assertThat(Appender.composeLength(tile)).is(10);
        assertThat(tile).is({
            key: "field", stringLength: 10, complexity: 2,
            value: {complexity: 1, s: "124", stringLength: 3}
        });
    });
});

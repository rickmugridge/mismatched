import {assertThat} from "../../assertThat";
import {ArrayTile, FieldTile, ObjectTile, SimpleTile, Tile} from "./Tile";
import {Appender} from "../Appender";

describe("FieldTile", () => {
    it("Simple", () => {
        const fieldTile = new FieldTile("a", new SimpleTile("hello") );
        assertThat(Appender.composeLength(fieldTile)).is(8);
        assertThat(fieldTile).is({key:"a", stringLength: 8, complexity: 2});
    });

    it("One field", () => {
        const tile = new FieldTile("field", new SimpleTile(124));
        assertThat(Appender.composeLength(tile)).is(10);
        assertThat(tile).is({key:"field", stringLength: 10, complexity: 2});
    });
});

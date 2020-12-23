import {assertThat} from "../../assertThat";
import {Appender} from "../Appender";
import {FieldTile, ObjectTile} from "./ObjectTile";
import {SimpleTile} from "./SimpleTile";

describe("ObjectTile", () => {
    it("No fields", () => {
        const objectTile = new ObjectTile([]);
        assertThat(objectTile).is({elements: [], stringLength: 2, complexity: 2} as any);
        assertThat(Appender.composeLength(objectTile)).is(2);
    });

    it("One field", () => {
        const tile = new FieldTile("a", new SimpleTile("hello"));
        const objectTile = new ObjectTile([tile]);
        assertThat(Appender.composeLength(objectTile)).is(10);
        assertThat(objectTile).is({elements: [tile], stringLength: 10, complexity: 4} as any);
    });

    it("Three fields", () => {
        const tile1 = new FieldTile("a", new SimpleTile("hello"));
        const tile2 = new FieldTile("bb", new SimpleTile(12));
        const tile3 = new FieldTile("cccc", new SimpleTile(true));
        const objectTile = new ObjectTile([tile1, tile2, tile3]);
        assertThat(Appender.composeLength(objectTile)).is(30);
        assertThat(objectTile).is({elements: [tile1, tile2, tile3], stringLength: 30, complexity: 8} as any);
    });
});

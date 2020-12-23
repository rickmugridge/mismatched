import {assertThat} from "../../assertThat";
import {Appender} from "../Appender";
import {SimpleTile} from "./SimpleTile";
import {ArrayTile} from "./ArrayTile";

describe("ArrayTile", () => {
    it("Empty", () => {
        const arrayTile = new ArrayTile([]);
        assertThat(arrayTile).is({elements: [], stringLength: 2, complexity: 2} as any);
        assertThat(Appender.composeLength(arrayTile)).is(2);
    });

    it("One element", () => {
        const tile = new SimpleTile("hello");
        const arrayTile = new ArrayTile([tile]);
        assertThat(Appender.composeLength(arrayTile)).is(7);
        assertThat(arrayTile).is({elements: [tile], stringLength: 7, complexity: 3} as any);
    });

    it("Three elements", () => {
        const tile1 = new SimpleTile("hello");
        const tile2 = new SimpleTile("there");
        const tile3 = new SimpleTile("hi");
        const arrayTile = new ArrayTile([tile1, tile2, tile3]);
        assertThat(Appender.composeLength(arrayTile)).is(18);
        assertThat(arrayTile).is({elements: [tile1, tile2, tile3], stringLength: 18, complexity: 5} as any);
    });
});

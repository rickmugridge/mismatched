import {assertThat} from "../../assertThat";
import {ArrayTile, SimpleTile} from "./Tile";
import {Appender} from "../Appender";

describe("ArrayTile", () => {
    it("Empty", () => {
        const arrayTile = new ArrayTile([]);
        assertThat(arrayTile).is({elements: [], stringLength: 2, complexity: 2});
        assertThat(Appender.composeLength(arrayTile)).is(2);
    });

    it("One element", () => {
        const tile = new SimpleTile("hello");
        const arrayTile = new ArrayTile([tile]);
        assertThat(Appender.composeLength(arrayTile)).is(7);
        assertThat(arrayTile).is({elements: [tile], stringLength: 7, complexity: 3});
    });

    it("Three elements", () => {
        const tile1 = new SimpleTile("hello");
        const tile2 = new SimpleTile("there");
        const tile3 = new SimpleTile("hi");
        const arrayTile = new ArrayTile([tile1, tile2, tile3]);
        assertThat(Appender.composeLength(arrayTile)).is(18);
        assertThat(arrayTile).is({elements: [tile1, tile2, tile3], stringLength: 18, complexity: 5});
    });
});

import {assertThat} from "../../assertThat";
import {Appender} from "../Appender";
import {SimpleTile} from "./SimpleTile";
import {PseudoCallTile} from "./PseudoCallTile";

describe("PseudoCallTile", () => {
    it("Undefined arguments", () => {
        const arrayTile = new PseudoCallTile("target.meth", undefined);
        assertThat(arrayTile).is(
            {callName: "target.meth", stringLength: 3, complexity: 1, withSquareBrackets: false} as any);
        assertThat(Appender.composeTile(arrayTile)).is("target.meth");
    });

    it("No arguments", () => {
        const arrayTile = new PseudoCallTile("target.meth", []);
        assertThat(arrayTile).is(
            {callName: "target.meth", args: [], stringLength: 11, complexity: 3, withSquareBrackets: false} as any);
        assertThat(Appender.composeTile(arrayTile)).is("target.meth()");
    });

    it("One argument", () => {
        const tile = new SimpleTile([1, 2, 3]);
        const arrayTile = new PseudoCallTile("fn", [tile]);
        assertThat(arrayTile).is(
            {callName: "fn", args: [tile], stringLength: 9, complexity: 4, withSquareBrackets: false} as any);
        assertThat(Appender.composeTile(arrayTile)).is('fn(1,2,3)');
    });

    it("Three arguments", () => {
        const tile1 = new SimpleTile([1, 2, 3]);
        const tile2 = new SimpleTile(4);
        const tile3 = new SimpleTile(true);
        const arrayTile = new PseudoCallTile("dateTime.plusDays", [tile1, tile2, tile3]);
        assertThat(arrayTile).is({
            callName: "dateTime.plusDays",
            args: [tile1, tile2, tile3],
            stringLength: 33,
            complexity: 6,
            withSquareBrackets: false
        } as any);
        assertThat(Appender.composeTile(arrayTile)).is("dateTime.plusDays(1,2,3, 4, true)");
    });

    it("Three arguments with square brackets", () => {
        const tile1 = new SimpleTile([1, 2, 3]);
        const tile2 = new SimpleTile(4);
        const tile3 = new SimpleTile(true);
        const arrayTile = new PseudoCallTile("dateTime.plusDays", [tile1, tile2, tile3], true);
        assertThat(arrayTile).is({
            callName: "dateTime.plusDays",
            args: [tile1, tile2, tile3],
            stringLength: 33,
            complexity: 6,
            withSquareBrackets: true
        } as any);
        assertThat(Appender.composeTile(arrayTile)).is("dateTime.plusDays([1,2,3, 4, true])");
    });
});

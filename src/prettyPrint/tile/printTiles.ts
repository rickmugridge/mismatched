import {FieldTile} from "./ObjectTile";
import {Appender} from "../Appender";
import {Tile} from "./Tile";

export function printTiles(tiles: Array<Tile | FieldTile>,
                           startToken: string, tokenEnd: string,
                           stringLength: number,
                           appender: Appender,
                           complexity: number) {
    const length1 = tiles.length;
    appender.add(startToken);
    const indented = stringLength > appender.remaininglineWidth || appender.tooComplex(complexity);
    if (indented) {
        appender.newLine();
        appender.tabRight();
    }
    for (let i = 0; i < length1; i++) {
        const tile = tiles[i];
        if (i > 0 && tile.stringLength > appender.remaininglineWidth || appender.tooComplex(tile.complexity)) {
            appender.newLine();
        }
        tile.render(appender);
        if (i < length1 - 1) {
            appender.add(", ")
        }
    }
    if (indented) {
        appender.newLine();
        appender.tabLeft();
    }
    appender.add(tokenEnd);
}

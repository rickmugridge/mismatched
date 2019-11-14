import {Appender} from "../Appender";
import {Tile} from "./Tile";
import {printTiles} from "./printTiles";

export class ArrayTile implements Tile {
    stringLength: number;
    complexity: number;

    constructor(private elements: Array<Tile>) {
        this.stringLength = Math.max(2, elements.reduceRight((accumulator, current) =>
            accumulator + current.stringLength + 2, 0));
        this.complexity = elements.reduceRight((accumulator, current) =>
            accumulator + current.complexity, 2);
    }

    render(appender: Appender) {
        printTiles(this.elements, "[", "]", this.stringLength, appender, this.complexity);
    }
}

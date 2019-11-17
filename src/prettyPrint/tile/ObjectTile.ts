import {Appender} from "../Appender";
import {Tile} from "./Tile";
import {printSequenceOfTiles} from "./printSequenceOfTiles";

export class ObjectTile implements Tile {
    stringLength: number;
    complexity: number;

    constructor(private elements: Array<FieldTile>) {
        this.stringLength = Math.max(2, elements.reduceRight((accumulator, current) =>
            accumulator + current.stringLength + 2, 0));
        this.complexity = elements.reduceRight((accumulator, current) =>
            accumulator + current.complexity, 2);
    }

    render(appender: Appender) {
        printSequenceOfTiles(this.elements, "{", "}", this.stringLength, appender, this.complexity);
    }
}

export class FieldTile {
    stringLength: number;
    complexity: number;

    constructor(private key: string, private value: Tile) {
        this.stringLength = key.length + 2 + value.stringLength;
        this.complexity = 1 + value.complexity;
    }

    render(appender: Appender) {
        appender.adds([this.key, ": "]);
        this.value.render(appender);
    }
}

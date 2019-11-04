import {Appender} from "../Appender";

export interface Tile {
    stringLength: number;
    complexity: number;

    render(appender: Appender);
}

export class SimpleTile implements Tile {
    s: string;
    stringLength: number;
    complexity = 1;

    constructor(value: any) {
        this.s = "" + value;
        this.stringLength = this.s.length;
        this.complexity += Math.floor(this.stringLength / 20);
    }

    render(appender: Appender) {
        appender.add("" + this.s);
    }
}

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

export class ObjectTile implements Tile {
    stringLength: number;
    complexity: number; // todo Also use complexity to decide on layout

    constructor(private elements: Array<FieldTile>) {
        this.stringLength =  Math.max(2, elements.reduceRight((accumulator, current) =>
            accumulator + current.stringLength+2, 0));
        this.complexity = elements.reduceRight((accumulator, current) =>
            accumulator + current.complexity, 2);
    }

    render(appender: Appender) {
        printTiles(this.elements, "{", "}", this.stringLength, appender, this.complexity);
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


function printTiles(tiles: Array<Tile | FieldTile>,
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

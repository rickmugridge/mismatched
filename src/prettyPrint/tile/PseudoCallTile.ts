import {Tile} from "./Tile";
import {Appender} from "../Appender";
import {printTiles} from "./printTiles";

export class PseudoCallTile implements Tile {
    stringLength: number;
    complexity: number;

    constructor(private callName: string, private args: Array<Tile>) {
        this.stringLength = Math.max(3, args.reduceRight((accumulator, current) =>
            accumulator + current.stringLength + 2, callName.length));
        this.complexity = args.reduceRight((accumulator, current) =>
            accumulator + current.complexity, 3);
    }

    render(appender: Appender) {
        appender.add(this.callName);
        printTiles(this.args, "(", ")", this.stringLength, appender, this.complexity);
    }
}

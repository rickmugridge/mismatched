import {Tile} from "./Tile";
import {Appender} from "../Appender";
import {printTiles} from "./printTiles";

export class PseudoCallTile implements Tile {
    stringLength: number;
    complexity: number;

    constructor(private callName: string, private args: Array<Tile> | undefined) {
        let argsStringLength = args ? args.reduceRight((accumulator, current) =>
            accumulator + current.stringLength + 2, callName.length) : 0;
        this.stringLength = Math.max(3, argsStringLength);
        this.complexity = args ? args.reduceRight((accumulator, current) =>
            accumulator + current.complexity, 3) : 1;
    }

    render(appender: Appender) {
        appender.add(this.callName);
        if (this.args) {
            printTiles(this.args, "(", ")", this.stringLength, appender, this.complexity);
        }
    }
}

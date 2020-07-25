import {Tile} from "./Tile";
import {Appender} from "../Appender";
import {printTiles} from "./printSequenceOfTiles";

export class PseudoCallTile implements Tile {
    stringLength: number;
    complexity: number;

    constructor(private callName: string, private args: Array<Tile> | undefined, private withSquareBrackets=false) {
        let argsStringLength = args ? args.reduceRight((accumulator, current) =>
            accumulator + current.stringLength + 2, callName.length) : 0;
        this.stringLength = Math.max(3, argsStringLength);
        this.complexity = args ? args.reduceRight((accumulator, current) =>
            accumulator + current.complexity, 3) : 1;
    }

    render(appender: Appender) {
        const newLine = this.stringLength > appender.remaininglineWidth || appender.tooComplex(this.complexity);
        if (newLine) {
            appender.newLine();
        }
        appender.add(this.callName);
        if (this.args) {
            appender.add(this.withSquareBrackets ? "([" :"(");
            printTiles(this.args, appender);
            appender.add(this.withSquareBrackets ? "])" :")");
        }
    }
}

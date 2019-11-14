import {Appender} from "../Appender";
import {Tile} from "./Tile";

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
import {Tile} from "./tile/Tile";
import {FieldTile} from "./tile/ObjectTile";
import {defaultLineWidth, defaultMaxComplexity} from "./PrettyPrinter";

export class Appender {
    offset = "";
    lines: Array<string> = [];
    currentLineParts: Array<string> = [];
    public remaininglineWidth = this.lineWidth;
    public currentLineComplexity = 0;

    constructor(private lineWidth = defaultLineWidth, public maxComplexity = defaultMaxComplexity) {
    }

    add(s: string, complexity = 0) {
        this.currentLineParts.push(s);
        this.remaininglineWidth -= s.length;
        this.currentLineComplexity += complexity;
    }

    adds(ss: Array<string>, complexity = 0) {
        ss.forEach(s => this.add(s));
        this.currentLineComplexity += complexity;
    }

    addsNewLine(ss: Array<string>, complexity = 0) {
        this.adds(ss, complexity);
        this.newLine();
    }

    newLine() {
        if (this.currentLineParts.length > 0) {
            this.currentLineParts.unshift(this.offset);
            this.lines.push(this.currentLineParts.join(""));
            this.currentLineParts = [];
            this.remaininglineWidth = this.lineWidth - this.offset.length;
            this.currentLineComplexity = 0;
            // Leave offset where it was
        }
    }

    tabRight() {
        this.offset += "  ";
        this.remaininglineWidth -= 2;
    }

    tabLeft() {
        this.offset = this.offset.slice(2);
        this.remaininglineWidth += 2;
    }

    compose() {
        this.addsNewLine([]);
        return this.lines.join("\n");
    }

    composeLength() {
        return this.compose().length;
    }

    tooComplex(extraComplexity: number): boolean {
        return this.currentLineComplexity + extraComplexity > this.maxComplexity;
    }

    static composeTile(tile: Tile | FieldTile) {
        const appender = new Appender();
        tile.render(appender);
        return appender.compose();
    }

    static composeLength(tile: Tile | FieldTile) {
        const appender = new Appender();
        tile.render(appender);
        const result = appender.compose();
        return result.length;
    }
}

/*

  This manages the addition of strings onto the current line.
  When a line is completed, it's added to the list of lines.
  All the lines are joined together at the end.
  This avoids multiple string allocations as strings are added.

  It also tracks how many characters remain on the current line,
  as well as the "complexity" of additions to that line so far.
  This can be used to do suitable layout.
 */
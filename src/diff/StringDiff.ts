import * as diff from "fast-array-diff";
import {Colour} from "../Colour";
import {PrettyPrinter} from "../prettyPrint/PrettyPrinter";

export class StringDiff {
    static expectedDiff(expected: string, actual: string): string {
        const expecteds = Array.from(expected);
        const deltas = diff.getPatch(expecteds, Array.from(actual), compare);
        let offset = 0;
        PrettyPrinter.make().logToConsole(deltas);
        deltas.forEach(delta => {
            switch (delta.type) {
                case "add":
                    const insert = "[" + delta.items.join("") + "]";
                    expecteds.splice(delta.newPos + offset, 0, insert);
                    offset += 1;
                    break;
                case "remove":
                    const start = delta.newPos + offset;
                    expecteds.splice(start, 0, "(");
                    expecteds.splice(start + 1 + delta.items.length, 0, ")");
                    offset += 2;
                    break;
            }
        });
        return expecteds.join("");
    }

    static colourExtra(s: string) { // todo to display colours, we MAY need to update the string, not the array??
        return Colour.green(s);
    }

    static colourMissing(s: string) {
        return Colour.red(s);
    }
}

function compare(a, b) {
    return a === b;
}
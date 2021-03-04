import * as diff from "fast-array-diff";
import {Colour} from "../Colour";
import {PrettyPrinter} from "../prettyPrint/PrettyPrinter";

export const stringDiff = (expected: string, actual: string, testing = false): string => {
    const result = Array.from(actual);
    const deltas = diff.getPatch(result, Array.from(expected), compare);
    let offset = 0;
    deltas.forEach(delta => {
        switch (delta.type) {
            case "add":
                const insert = add(delta.items.join(""), testing);
                result.splice(delta.oldPos + offset, 0, insert);
                offset += 1;
                break;
            case "remove":
                const start = delta.oldPos + offset;
                const removed = result.splice(start, delta.items.length).join('');
                result.splice(start, 0, minus(removed, testing));
                offset += 1 - delta.items.length;
                break;
        }
    });
    return result.join("");
}

// export const stringDiff = (expected: string, actual: string, testing = true): string => {
//     const result = Array.from(expected);
//     const deltas = diff.getPatch(result, Array.from(actual), compare);
//     let offset = 0;
//     PrettyPrinter.logToConsole(deltas);
//     deltas.forEach(delta => {
//         switch (delta.type) {
//             case "add":
//                 const insert = add(delta.items.join(""), testing);
//                 result.splice(delta.newPos + offset, 0, insert);
//                 offset += 1;
//                 break;
//             case "remove":
//                 const start = delta.newPos + offset;
//                 const removed = result.splice(start, delta.items.length).join('');
//                 result.splice(start, 0, minus(removed, testing));
//                 // result.splice(start, 0, "(");
//                 // result.splice(start + 1 + delta.items.length, 0, ")");
//                 offset += 1; // - delta.items.length;
//                 break;
//         }
//     });
//     return result.join("");
// }

const add = (s: string, testing: boolean): string =>
    testing ? "(" + s + ")" : diffColourExtra(s)

const minus = (s: string, testing: boolean): string =>
    testing ? "[" + s + "]" : diffColourMissing(s)

const compare = (a, b) => a === b;

// todo to display colours, we MAY need to update the string, not the array??
export const diffColourExtra = (s: string) => Colour.green(s);

export const diffColourMissing = (s: string) => Colour.red(s);


import {Colour} from "../Colour";
import {PatchItem} from "fast-array-diff/dist/diff/patch";
import * as diff from "fast-array-diff";

export const differ = (deltas: PatchItem<string>[],
                       result: string[],
                       testing = false): string => {
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

const add = (s: string, testing: boolean): string =>
    testing ? "(" + s + ")" : extraColour(s)

const minus = (s: string, testing: boolean): string =>
    testing ? "[" + s + "]" : missingColour(s)

const extraColour = (s: string) => Colour.green(s);

const missingColour = (s: string) => Colour.red(s);

const getPatch = (expected: string, actual: string) =>
    diff.getPatch(Array.from(actual), Array.from(expected), compare);

const patchDiffer = (expected: string, actual: string, testing = false) => {
    return differ(getPatch(expected, actual), Array.from(actual), testing)
}

const lengths = (deltas: PatchItem<string>[]) => {
    let totalAddLength = 0
    let totalRemoveLength = 0
    deltas.forEach(delta => {
        switch (delta.type) {
            case "add":
                totalAddLength += delta.items.length;
                break;
            case "remove":
                totalRemoveLength += delta.items.length;
                break;
        }
    });
    return {totalAddLength, totalRemoveLength}
}

const compare = (a, b) => a === b;

export const stringDiff = {
    getPatch,
    differ,
    patchDiffer,
    lengths,
    extraColour,
    missingColour
}
import {Colour} from "../Colour";

export class SelfReferenceChecker {
    seen: Array<ContextValue> = [];

    recurse<T>(context: string, value: any, fn: () => T): T {
        const selfRef = this.seen.find(pair => pair.value === value);
        if (selfRef) {
            // Return the path to the referred to object
            throw Error(SelfReferenceChecker.colouredMessage(selfRef.context));
        }
        this.seen.push({context, value});
        const result = fn();
        this.seen.pop();
        return result;
    }

    static colouredMessage(context: string): string {
        return Colour.bg_magenta("self-reference: " + context);
    }
}

interface ContextValue {
    context: string;
    value: any;
}
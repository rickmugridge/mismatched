import {ofType} from "../ofType";
import {Appender} from "./Appender";
import {SelfReferenceChecker} from "./SelfReferenceChecker";
import {PropertyName} from "./PropertyName";
import {isUndefined} from "util";
import {Tile} from "./tile/Tile";
import {SimpleTile} from "./tile/SimpleTile";
import {ArrayTile} from "./tile/ArrayTile";
import {PseudoCallTile} from "./tile/PseudoCallTile";
import {FieldTile, ObjectTile} from "./tile/ObjectTile";

export class PrettyPrinter {
    selfReference = new SelfReferenceChecker();

    static symbolForPseudoCall = Symbol("pseudoCall");
    static symbolForMockName: any | undefined;
    private static customPrettyPrinters = new Map<string, (t: any) => string>();

    static addCustomPrettyPrinter(theClass: Function, toString: (t: any) => string) {
        this.customPrettyPrinters.set(theClass.name, toString);
    }

    static make(lineWidth = 80,
                maxComplexity = 10,
                symbolForMockName?: any): PrettyPrinter {
        if (symbolForMockName) {
            PrettyPrinter.symbolForMockName = symbolForMockName; // Just use the latest one
        }
        return new PrettyPrinter(lineWidth, maxComplexity);
    }

    static isMock(value: any): boolean {
        return ofType.isFunction(value) &&
            PrettyPrinter.symbolForMockName &&
            !isUndefined(value[PrettyPrinter.symbolForMockName]);
    }

    static logToConsole(value: any) {
        return PrettyPrinter.make().logToConsole(value);
    }

    private constructor(private lineWidth = 80,
                        private maxComplexity = 10) {
    }

    render(value: any): string {
        const appender = new Appender(this.lineWidth, this.maxComplexity);
        this.tile("this.", value).render(appender);
        return appender.compose();
    }

    logToConsole(value: any) {
        console.log(this.render(value));
    }

    private tile(context: string, value: any): Tile {
        if (PrettyPrinter.isMock(value)) {
            const mockName = value[PrettyPrinter.symbolForMockName]();
            return this.tileObject(context, {mock: mockName});
        }
        if (ofType.isRegExp(value)) {
            return new SimpleTile(value);
        }
        if (ofType.isSymbol(value)) {
            return new SimpleTile(value.toString());
        }
        if (ofType.isString(value)) {
            return new SimpleTile(cleanString(value));
        }
        if (ofType.isFunction(value)) {
            return this.tileObject(context, this.functionDetails(value));
        }
        if (ofType.isArray(value)) {
            try {
                const items = this.selfReference.recurse(context, value, () =>
                    (value as Array<any>).map((v, i) => this.tile(context + "[" + i + "]", v)));
                return new ArrayTile(items);
            } catch (e) {
                return new SimpleTile(e.message);
            }
        }
        if (ofType.isObject(value)) {
            return this.tileObject(context, value);
        }
        return new SimpleTile(value);
    }

    private tileObject(context: string, value: object) {
        try {
            const callName = value[PrettyPrinter.symbolForPseudoCall];
            if (callName && ofType.isArray((value as any).args)) {
                // {[PrettyPrinter.symbolForPseudoCall]: "obj.method", args: ["a", true]}
                return new PseudoCallTile(callName, (value as any).args.map(
                    (v, i) => this.tile(context + "[" + i + "]", v)));
            }
            if (value instanceof Date) {
                return new SimpleTile('Date(' + JSON.stringify(value) + ')');
            }
            if (value instanceof Error) {
                // Error doesn't have a proper property 'message'
                return this.tileObject(context, {errorMessage: value.message});
            }
            const customToString = PrettyPrinter.customPrettyPrinters.get(value.constructor.name);
            if (customToString) {
                return new SimpleTile(customToString(value));
            }
            const fields = this.selfReference.recurse(context, value, () =>
                Object.keys(value).map(key => {
                    const renderedKey = PropertyName.render(key);
                    return new FieldTile(renderedKey, this.tile(context + renderedKey, value[key]))
                }));
            return new ObjectTile(fields);
        } catch (e) {
            return new SimpleTile(e.message); // todo Change this to a auto-coloured Tile
        }
    }

    private functionDetails(fn: Function) {
        try { // who knows when some weird JS will make this fail
            if (fn.toString) {
                let details = fn.toString();
                let fullFunction = false;
                if (details.startsWith("function ")) {
                    fullFunction = true;
                    details = details.substring("function ".length);
                }
                let bracket = details.indexOf(")");
                if (bracket < 0) {
                    bracket = 30;
                }
                details = details.substring(0, bracket + 1);
                if (fullFunction) {
                    return {function: details}
                }
                return {arrow: details + " =>"};
            }
        } catch (e) {
        }
        return {function: "no details"};
    }
}

function cleanString(value: string) {
    return '"' + value.replace(/"/, "\"") + '"';
}


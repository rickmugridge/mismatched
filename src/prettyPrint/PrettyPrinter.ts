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
import {DiffMatcher} from "../matcher/DiffMatcher";

export const defaultLineWidth = 80;
export const defaultMaxComplexity = 30;

export class PrettyPrinter {
    static symbolForPseudoCall = Symbol("pseudoCall");
    static symbolForMockName: any | undefined;
    private static customPrettyPrinters = new Map<DiffMatcher<any>, (t: any) => string>();
    selfReference = new SelfReferenceChecker();

    private constructor(private lineWidth: number,
                        private maxComplexity: number) {
    }

    static addCustomPrettyPrinter(matcher: DiffMatcher<any>, toString: (t: any) => string) {
        this.customPrettyPrinters.set(matcher, toString);
    }

    static make(lineWidth = defaultLineWidth,
                maxComplexity = defaultMaxComplexity,
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

    static functionDetails(fn: Function) {
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
                return {arrow: details};
            }
        } catch (e) {
        }
        return {function: "no details"};
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
            return this.tileObject(context, PrettyPrinter.functionDetails(value));
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

    private tileObject(context: string, value: object): Tile {
        try {
            const callName = (value as any)[PrettyPrinter.symbolForPseudoCall];
            let valueArgs = (value as any).args;
            if (callName && (ofType.isArray(valueArgs) || ofType.isUndefined(valueArgs))) {
                const args = valueArgs ? valueArgs.map(
                    (v: any, i: number) => this.tile(context + "[" + i + "]", v)) : undefined;
                return new PseudoCallTile(callName, args);
            }
            if (value instanceof Date) {
                return new SimpleTile('new Date(' + JSON.stringify(value) + ')');
            }
            if (value instanceof Set) {
                return new PseudoCallTile('new Set', Array.from(value).map(v => this.tile(context, v)), true);
            }
            if (value instanceof Map) {
                return new PseudoCallTile('new Map', Array.from(value.entries()).map(v => this.tile(context, v)), true);
            }
            if (value instanceof Error) {
                // Error doesn't have a proper property 'message'
                return this.tileObject(context, {errorMessage: value.message});
            }
            const matcher = Array.from(PrettyPrinter.customPrettyPrinters.keys())
                .find(matcher => matcher.matches(value).passed());
            if (matcher) {
                return new SimpleTile(PrettyPrinter.customPrettyPrinters.get(matcher)!(value));
            }
            const fields = this.selfReference.recurse(context, value, () =>
                Object.keys(value).map(key => {
                    const renderedKey = PropertyName.render(key);
                    return new FieldTile(renderedKey, this.tile(context + renderedKey, (value as any)[key]))
                }));
            return new ObjectTile(fields);
        } catch (e) {
            return new SimpleTile(e.message); // todo Change this to an auto-coloured Tile
        }
    }
}

export function cleanString(value: string): string {
    if (!value.includes(`"`)) {
        return `"` + value + `"`;
    }
    if (!value.includes(`'`)) {
        return `'` + value + `'`;
    }
    if (!value.includes('`')) {
        return '`' + value + '`';
    }
    return JSON.stringify(value);
}

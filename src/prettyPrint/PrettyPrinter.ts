import {ofType} from "../ofType";
import {Appender} from "./Appender";
import {ArrayTile, FieldTile, ObjectTile, SimpleTile, Tile} from "./tile/Tile";
import {SelfReferenceChecker} from "./SelfReferenceChecker";
import {PropertyName} from "./PropertyName";

export class PrettyPrinter {
    selfReference = new SelfReferenceChecker();

    constructor(private customPrettyPrinters: Array<CustomPrettyPrinter> = [],
                private lineWidth = 80,
                private maxComplexity = 10,
                private symbolForMockName?: any) {
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
        if (ofType.isRegExp(value)) {
            return new SimpleTile(value);
        }
        if (ofType.isString(value)) {
            return new SimpleTile(cleanString(value));
        }
        if (ofType.isFunction(value)) {
            return new SimpleTile('function'); // todo consider toString() of it
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
            if (value instanceof Date) {
                return new SimpleTile('Date(' + JSON.stringify(value) + ')');
            }
            if (this.customPrettyPrinters.length > 0) {
                const custom = this.customPrettyPrinters.find(c => value instanceof c.theClass);
                if (custom) {
                    return new SimpleTile(custom.toString(value));
                }
            }
            if (value[this.symbolForMockName]) {
                return new SimpleTile('"' + value[this.symbolForMockName] + '"');
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
}


export interface CustomPrettyPrinter {
    theClass: Function;

    toString(t: any): string;
}

function cleanString(value: string) {
    return value.replace(/"/, "\"");
}


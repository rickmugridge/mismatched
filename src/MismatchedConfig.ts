import {CustomPrettyPrinter} from "./prettyPrint/PrettyPrinter";

export class MismatchedConfig {
    static customPrettyPrinters: Array<CustomPrettyPrinter> = [];

    static addCustomPrettyPrinter(custom:CustomPrettyPrinter) {
        this.customPrettyPrinters.push(custom);
    }
}
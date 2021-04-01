import {ofType} from "../ofType";
import {PrettyPrinter} from "../prettyPrint/PrettyPrinter";

export const decompiledActual = (actual: any, contributors: object, enums: object = {}): any =>
    PrettyPrinter.logToConsole(decompile(actual, contributors, enums))


export const decompile = (actual: any, contributors: object, enums: object = {}): any =>
    mapToName(actual, buildMap(contributors, enums))


const buildMap = (contributors: object, enums: object): Map<any, string> => {
    const mapValueToContributorNames = new Map<any, string[]>();
    Object.keys(contributors).forEach(key => {
        walk(key, contributors[key], mapValueToContributorNames)
    });
    const mapValueToName = new Map(Array.from(mapValueToContributorNames).map(mapElement => {
        const [key, values] = mapElement;
        return [key, values.join(" || ")]
    }));
    // Only use enums where no contributor (sub)value matches
    Object.keys(enums).forEach(enumKey => {
        const enumeration = enums[enumKey]
        Object.keys(enumeration).forEach(key => {
            const enumValue = enumeration[key]
            const existing = mapValueToName.get(enumValue)
            if (!existing) {
                mapValueToName.set(enumValue, `${enumKey}.${key}`)
            }
        })
    });
    return mapValueToName;
}

const walk = (name: string, contributor: any, mapValueToContributorName: Map<any, string[]>) => {
    const existings = mapValueToContributorName.get(contributor);
    // Do not override one with a shorter name
    if (existings) {
        const currentlLength = existings[0].split('.').length;
        const newLength = name.split('.').length;
        if (newLength === currentlLength) {
            existings.push(name);
        } else if (newLength < currentlLength) {
            mapValueToContributorName.set(contributor, [name]);
        }
    } else {
        mapValueToContributorName.set(contributor, [name]);
    }
    // if (!existings || existings[0].split('.').length > name.split('.').length) {
    //     mapValueToContributorName.set(contributor, [name]);
    // }
    if (ofType.isArray(contributor)) {
        for (let i = 0; i < contributor.length; i++) {
            walk(`${name}[${i}]`, contributor[i], mapValueToContributorName)
        }
    } else if (ofType.isObject(contributor)) {
        Object.keys(contributor).forEach(key => {
            walk(`${name}.${key}`, contributor[key], mapValueToContributorName)
        })
    }
}

const mapToName = (actual: any, mapValueToContributorName: Map<any, string>): any => {
    if (actual === undefined) {
        return undefined
    }
    const source = mapValueToContributorName.get(actual)
    if (source) {
        return {[PrettyPrinter.symbolForPseudoCall]: source}
    }
    if (ofType.isArray(actual)) {
        const result: any[] = [];
        for (let i = 0; i < actual.length; i++) {
            result.push(mapToName(actual[i], mapValueToContributorName));
        }
        return result
    }
    if (ofType.isObject(actual)) {
        const result: any = {};
        Object.keys(actual).forEach(key => {
            result[key] = mapToName(actual[key], mapValueToContributorName);
        })
        return result
    }
    return actual;
}
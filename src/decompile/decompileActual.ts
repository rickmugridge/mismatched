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
    // Only use enums where no contributor (sub)value matches or there are more than one
    Object.keys(enums).forEach(enumKey => {
        const enumeration = enums[enumKey]
        Object.keys(enumeration).forEach(key => {
            const enumValue = enumeration[key]
            const contributors = mapValueToContributorNames.get(enumValue);
            if (!contributors || contributors.length > 1) {
                mapValueToContributorNames.set(enumValue, [`${enumKey}.${key}`])
            }
        })
    });
    return new Map(Array.from(mapValueToContributorNames).map(mapElement => {
        const [key, values] = mapElement;
        return [key, values.join(" || ")]
    }));
}

const walk = (name: string, contributor: any, mapValueToContributorName: Map<any, string[]>) => {
    const references = mapValueToContributorName.get(contributor);
    // Do not override one with a shorter name
    if (references) {
        const currentLength = references[0].split('.').length;
        const newLength = name.split('.').length;
        if (newLength === currentLength) {
            references.push(name);
        } else if (newLength < currentLength) {
            mapValueToContributorName.set(contributor, [name]);
        }
    } else {
        mapValueToContributorName.set(contributor, [name]);
    }
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
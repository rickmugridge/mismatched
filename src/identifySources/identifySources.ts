import {ofType} from "../ofType";
import {PrettyPrinter} from "../prettyPrint/PrettyPrinter";
import {FilteringMap} from "./FilteringMap";
import {enumFixer} from "./enumFixer";

// Note that this makes use of a special form that is handled by PrettyPrinter.
// For example, consider a reference to the first choice in an enum E {A = "E.A"}
// This created in the decompiled code as {[PrettyPrinter.symbolForPseudoCall]: "E.A"}
// And then PrettyPrinter prints it out as E.A, and not "E.A".
// See the tests for explicit details, which make use of the local function identifier()
export const identifySources = (actual: any, contributors: object, enums: object = {}): any =>
    PrettyPrinter.logToConsole(identify(actual, contributors, enums))


export const identify = (actual: any, contributors: object, enums: object = {}): any => {
    return mapToName(actual, buildMap(contributors, enums))
}


export const buildMap = (contributors: object, enums: object): FilteringMap => {
    // For any type of value we build a map from that value (as key) to a set of contributor path strings.
    // eg, "3" -> ["source.a"]
    // Values include arrays and objects
    const mapToContributorPaths = new FilteringMap()
    // We don't want the object that holds the set of contributors to be considered in paths
    Object.keys(contributors).forEach(keyAsPath => {
        walk(keyAsPath, contributors[keyAsPath], mapToContributorPaths)
    })
    buildMapForEnums(enums, mapToContributorPaths)
    return mapToContributorPaths
}

// Only use enums where no contributor (sub)value matches or where there are more than one
const buildMapForEnums = (enums: object, mapToContributorPaths: FilteringMap) => {
    Object.keys(enums).forEach(enumKey => {
        const enumeration = enums[enumKey]
        enumFixer.keysOf(enumeration).forEach(key => {
            const enumValue = enumeration[key]
            if (acceptEnum(key, enumValue)) {
                const contributors = mapToContributorPaths.get(enumValue);
                if (contributors.isNone() || contributors.get().length > 1) {
                    mapToContributorPaths.set(enumValue, [`${enumKey}.${key}`])
                }
            }
        })
    });
}

// Ignore enum values that are small numbers as such mappings are unlikely to be useful
// See enumFixer for code that handles them consistently
// Also ignore extra keys that are provided for numeric enums such as "0", "1", etc. JS!
const acceptEnum = (key: string, enumValue: any) =>
    isNaN(Number(key)) && (ofType.isString(enumValue) || enumValue > 10)

const walk = (path: string, contributor: any, mapToContributorNames: FilteringMap) => {
    addReference(path, contributor, mapToContributorNames);
    if (ofType.isArray(contributor)) {
        for (let i = 0; i < contributor.length; i++) {
            walk(`${path}[${i}]`, contributor[i], mapToContributorNames)
        }
    } else if (ofType.isObject(contributor)) {
        Object.keys(contributor).forEach(key => {
            walk(`${path}.${key}`, contributor[key], mapToContributorNames)
        })
    }
}

const addReference = (path: string, contributor: any, mapToContributorPaths: FilteringMap) => {
    const contributorPathNamesOption = mapToContributorPaths.get(contributor)
    if (contributorPathNamesOption.isNone()) {
        mapToContributorPaths.set(contributor, [path])
        return
    }
    const contributorPathNames = contributorPathNamesOption.get()
    // Due to logic below, the path length of all contributorPathNames will be the same
    const currentPathLength = contributorPathNames[0].split('.').length;
    const newPathLength = path.split('.').length;
    // Do not override current one when it has a shorter path
    if (newPathLength === currentPathLength) {
        if (contributorPathNames.length > 1) {
            mapToContributorPaths.deleteForever(contributor)
        }
        // Add to contributorPathNames if same path length
        contributorPathNames.push(path)
    } else if (newPathLength < currentPathLength) {
        // Replace if new path is shorter than the first (and thus all paths)
        mapToContributorPaths.set(contributor, [path]);
    }
}

export const mapToName = (actual: any, mapToContributorPaths: FilteringMap): any => {
    if (ofType.isUndefinedOrNull(actual) || ofType.isBoolean(actual)) {
        return actual
    }
    const contributions = mapToContributorPaths.get(actual)
    if (contributions.isSome()) {
        return {[PrettyPrinter.symbolForPseudoCall]: contributions.get().join(" | ")}
    }
    if (ofType.isArray(actual)) {
        const result: any[] = [];
        for (let i = 0; i < actual.length; i++) {
            result.push(mapToName(actual[i], mapToContributorPaths));
        }
        return result
    }
    if (ofType.isObject(actual)) {
        const result: any = {};
        Object.keys(actual).forEach(key => {
            result[key] = mapToName(actual[key], mapToContributorPaths)
        })
        return result
    }
    return actual
}
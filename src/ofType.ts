import {DiffMatcher} from "./matcher/DiffMatcher"

const isUndefined = (v: any): v is undefined => typeof v === "undefined"

const isUndefinedOrNull = <T>(v: T | undefined | null): v is undefined | null => isUndefined(v) || v === null

const isObject = (v: any): v is object =>
    v !== null && !isArray(v) && typeof v === "object" && !(v instanceof RegExp)

const isArray = (v: any): v is any[] => Array.isArray(v)

const isFunction = (v: any): boolean => typeof v === "function"

let isNaN = (v: any): boolean => v != v // Avoid weird JS coercing that make isNaN() and Number.isNaN() unreliable

export const ofType = {
    isArray,
    isSet: (v: any): v is Set<any> => v instanceof Set,
    isMap: (v: any): v is Map<any, any> => v instanceof Map,
    isBoolean: (v: any): v is boolean => typeof v === 'boolean',
    isError: (v: any): v is Error => v instanceof Error,
    isFunction,
    isMatcher: (v: any): boolean => isObject(v) && v instanceof DiffMatcher,
    isNaN: isNaN,
    isNumber: (v: any): v is number => typeof v === 'number',// && isFinite(value);
    isNull: (v: any): v is null => v === null,
    isObject,
    isRegExp: (v: any): v is RegExp => v instanceof RegExp,
    isString: (v: any): v is string => typeof v === 'string' || v instanceof String,
    isSymbol: (v: any): v is symbol => typeof v === 'symbol',
    isUndefined,
    isUndefinedOrNull,
    isDefined: <T>(v: T | undefined | null): v is T => !isUndefinedOrNull(v),
    isDate: (v: any): v is Date => v instanceof Date && !isNaN(v.getTime()),
}
function isUndefined(v: any): v is undefined {
    return typeof v === "undefined";
}

function isDefined<T>(v: T | undefined): v is T {
    return !isUndefined(v)
}

function isNull(v: any): v is null {
    return v === null;
}

function isObject(v: any): v is object {
    return v !== null && !isArray(v) && typeof v === "object" && !(v instanceof RegExp);
}

function isArray(v: any): v is any[] {
    return Array.isArray(v);
}

function isFunction(v: any): boolean {
    return typeof v === "function";
}

function isSet(v: any): v is Set<any> {
    return v instanceof Set;
}

function isMap(v: any): v is Map<any, any> {
    return v instanceof Map;
}

function isString(v: any): v is string {
    return typeof v === 'string' || v instanceof String;
}

function isNumber(v: any): v is number {
    return typeof v === 'number'; // && isFinite(value);
}

function isNaN(v: any): boolean {
    return v != v; // Avoid weird JS coercing that make isNaN() and Number.isNaN() unreliable
}

function isBoolean(v: any): v is boolean {
    return typeof v === 'boolean';
}

function isRegExp(v: any): v is RegExp {
    return v instanceof RegExp;
}

function isSymbol(v: any): v is symbol {
    return typeof v === 'symbol';
}

function isMatcher(v: any): boolean {
    return isObject(v) && !isUndefined((v as any).matches) && isFunction((v as any).matches);
}

function isError(v: any): v is Error {
    return v instanceof Error;
}

export const ofType = {
    isArray,
    isSet,
    isMap,
    isBoolean,
    isError,
    isFunction,
    isMatcher,
    isNaN,
    isNumber,
    isNull,
    isObject,
    isRegExp,
    isString,
    isSymbol,
    isUndefined,
    isDefined
};
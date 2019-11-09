function isUndefined(v: any) {
    return typeof v === "undefined";
}

function isNull(v: any) {
    return v === null;
}

function isObject(v: any) {
    return v !== null && !isArray(v) && typeof v === "object" && !(v instanceof RegExp);
}

function isArray(v: any) {
    return Array.isArray(v);
}


function isFunction(v: any) {
    return typeof v === "function";
}

function isString(v: any) {
    return typeof v === 'string' || v instanceof String;
}

function isNumber(value) {
    return typeof value === 'number'; // && isFinite(value);
}

function isNaN(value) {
    return value != value; // Avoid weird JS coercing that make isNaN() and Number.isNaN() unreliable
}

function isBoolean(v) {
    return typeof v === 'boolean';
}

function isRegExp(v) {
    return v instanceof RegExp;
}

function isSymbol(value) {
    return typeof value === 'symbol';
}

function isMatcher(v: any) {
    return isObject(v) && !isUndefined(v.matches) && isFunction(v.matches);
}

function isError(v) {
    return v instanceof Error;
}

export const ofType = {
    isArray,
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
    isUndefined
};
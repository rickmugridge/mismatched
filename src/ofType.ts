function isUndefined(v: any): boolean {
    return typeof v === "undefined";
}

function isNull(v: any): boolean {
    return v === null;
}

function isObject(v: any): boolean {
    return v !== null && !isArray(v) && typeof v === "object" && !(v instanceof RegExp);
}

function isArray(v: any): boolean {
    return Array.isArray(v);
}


function isFunction(v: any): boolean {
    return typeof v === "function";
}

function isString(v: any): boolean {
    return typeof v === 'string' || v instanceof String;
}

function isNumber(v: any): boolean {
    return typeof v === 'number'; // && isFinite(value);
}

function isNaN(v: any): boolean {
    return v != v; // Avoid weird JS coercing that make isNaN() and Number.isNaN() unreliable
}

function isBoolean(v: any): boolean {
    return typeof v === 'boolean';
}

function isRegExp(v: any): boolean {
    return v instanceof RegExp;
}

function isSymbol(v: any): boolean {
    return typeof v === 'symbol';
}

function isMatcher(v: any): boolean {
    return isObject(v) && !isUndefined(v.matches) && isFunction(v.matches);
}

function isError(v: any): boolean {
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
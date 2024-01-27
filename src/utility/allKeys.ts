export const allKeys = (actual: object): (string | symbol)[] =>
    (Object.keys(actual) as (string | symbol)[])
        .concat(Object.getOwnPropertySymbols(actual))

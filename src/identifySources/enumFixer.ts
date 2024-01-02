/*
Enums in JS are weird, as are Date, Error, and etc.
(Also, enums are compiled to a variable in JS, so at runtime there is no ability to get the name of
the enum itself from the enum.)
The following work fine for Enums with string values, but not those with number (int) values:
   o Object.keys(anEnum)
   o Object.values(anEnum)
For example, consider the following enum:
   enum NumberBased {A, B, C = 23}
Here the results for those functions:
   o Object.keys(NumberBased) --> ["A", "B", "C", 0, 1, 23]
   o Object.values(anEnum)  ----> ["A", "B", "C", 0, 1, 23]
In other words, it includes the index values as well
So this provides fixes:
*/

export module enumFixer {
    export const keysOf = (anEnum: object) =>
        Object.keys(anEnum).filter(key => isNaN(Number(key))) // && ofType.isString(key))

    export const valuesOf = (anEnum: object) =>
        keysOf(anEnum).map(key => anEnum[key])
}

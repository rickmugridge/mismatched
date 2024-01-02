import {enumFixer} from "../identifySources/enumFixer";

let nextStringIndex = 1

const stringInSequence = (label: string = "string"): string => `${label}-${nextStringIndex++}`
const aString = (label: string = "string"): string => `${label}-${int(0)}`
const int = (lowerBound: number = -10000, upperBound: number = 10000): number =>
    Math.round(lowerBound + Math.random() * Math.floor(upperBound - lowerBound))
const bigInt = (lowerBound: number = -10000, upperBound: number = 10000): BigInt =>
    BigInt(int(lowerBound, upperBound))
const float = (lowerBound: number = -10000, upperBound: number = 10000): number =>
    lowerBound + Math.random() * Math.floor(upperBound - lowerBound)
const decimal = (significantDigits: number = 2, lowerBound: number = -10000, upperBound: number = 10000): number => {
    const multiplier = Math.pow(10, significantDigits)
    return Math.round((lowerBound + Math.random() * Math.floor(upperBound - lowerBound)) * multiplier) / multiplier
}
const bool = (): boolean => anyOf([false, true])
const date = (timeUnits: TimeUnit = TimeUnit.Days,
              lowerBoundBefore: number = -1000,
              upperBoundAfter: number = 1000): Date => {
    const multiplier = timeMultiplier(timeUnits)
    let now = new Date().getTime()
    let offset = int(lowerBoundBefore, upperBoundAfter)
    return new Date(now + offset * multiplier)
}
const error = (message: string = aString("error")): Error => new Error(message)
const symbol = (message: string = aString("sym")): Symbol => Symbol(message)
const anyOf = <T>(possibles: Array<T>): T => {
    if (possibles.length === 0) {
        throw new Error("anyOf() has to have at least one possibility")
    }
    return possibles[int(0, possibles.length - 1)]
}
const anyEnum = (enumerator: any): any => anyOf(enumFixer.valuesOf(enumerator))
const arrayOf = <T>(elementGenerator: (index:number) => T,
                    lowerBound: number = 0, upperBound: number = 10): T[] => {
    const result: T[] = []
    const times = int(lowerBound, upperBound)
    for (let i = 0; i < times; i++) {
        result.push(elementGenerator(i))
    }
    return result
}
const setOf = <T>(elementGenerator: (index:number) => T,
                  lowerBound: number = 0, upperBound: number = 10): Set<T> =>
    new Set(arrayOf(elementGenerator, lowerBound, upperBound))
const mapOf = <S, T>(elementGenerator: (index:number) => [S, T],
                     lowerBound: number = 0, upperBound: number = 10): Map<S, T> =>
    new Map(arrayOf(elementGenerator, lowerBound, upperBound))

export const primitiveBuilder = {
    aString, stringInSequence,
    int, bigInt,
    float, decimal,
    bool,
    date,
    error,
    symbol,
    anyOf, anyEnum,
    arrayOf, setOf, mapOf
}

export enum TimeUnit {
    Milliseconds, Seconds, Minutes, Hours, Days
}

const timeMultiplier = (timeUnit: TimeUnit): number => {
    switch (timeUnit) {
        case TimeUnit.Milliseconds:
            return 1
        case TimeUnit.Seconds:
            return 1000
        case TimeUnit.Minutes:
            return 60 * 1000
        case TimeUnit.Hours:
            return 60 * 60 * 1000
        case TimeUnit.Days:
            return 24 * 60 * 60 * 1000
        default:
            return 1
    }
}


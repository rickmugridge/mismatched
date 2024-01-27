import {ofType} from "../ofType"

export module MapToArray {
    export const set = <S, T>(map: Map<S, T[]>, key: S, value: T) => {
        let values = map.get(key)
        if (ofType.isUndefined(values)) {
            map.set(key, [value])
        } else {
            values.push(value)
        }
    }
}
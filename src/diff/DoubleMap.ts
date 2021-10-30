export class DoubleMap<T, U, V> {
    map = new Map<T, Map<U, V>>()

    get(key1: T, key2: U) {
        return this.getSubMap(key1).get(key2);
    }

    set(key1: T, key2: U, value: V) {
        const subMap = this.getSubMap(key1)
        subMap.set(key2, value);
    }

    private getSubMap = (value: T): Map<U, V> => {
        const subMap = this.map.get(value)
        if (subMap) return subMap
        const subMap2 = new Map<U,V>();
        this.map.set(value, subMap2)
        return subMap2
    }
}
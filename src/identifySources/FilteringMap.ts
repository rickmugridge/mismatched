import {Option} from "prelude-ts";
import {ofType} from "../ofType";

export class FilteringMap {
    map = new Map<any, string[]>()
    ignored = new Set<any>()

    get(key: any): Option<string[]> {
        const item = this.map.get(key)
        if (ofType.isUndefined(item)) {
            return Option.none()
        }
        return Option.of(item)
    }

    set(key: any, pathNames: string[]) {
        if (!this.ignored.has(key)) {
            this.map.set(key, pathNames)
        }
    }

    deleteForever(key: any) {
        this.map.delete(key)
        this.ignored.add(key)
    }

    getAllElements(): any[] {
        return Array.from(this.map)
    }
}
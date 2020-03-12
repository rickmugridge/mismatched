import {Appender} from "../Appender";

export interface Tile {
    stringLength: number;
    complexity: number;

    render(appender: Appender): void;
}

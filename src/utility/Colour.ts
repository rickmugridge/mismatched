// See https://www.npmjs.com/package/ansi-escape-sequences

const black = "\u001b[30m";
const reset = "\u001b[0m";

export class Colour {
    static black(s: string) {
        return black + s;
    }

    static red(s: string) {
        return "\u001b[31m" + s + reset;
    }

    static green(s: string) {
        return "\u001b[32m" + s + reset;
    }

    static yellow(s: string) {
        return "\u001b[33m" + s + reset;
    }

    static blue(s: string) {
        return "\u001b[34m" + s + reset;
    }

    static magenta(s: string) {
        return "\u001b[35m" + s + reset;
    }

    static cyan(s: string) {
        return "\u001b[36m" + s + reset;
    }

    static white(s: string) {
        return "\u001b[37m" + s + reset;
    }

    static gray(s: string) {
        return "\u001b[90m" + s + reset;
    }

    static bg_black(s: string) {
        return "\u001b[40m" + s + reset;
    }

    static bg_red(s: string) {
        return "\u001b[41m" + s + reset;
    }

    static bg_green(s: string) {
        return "\u001b[42m" + s + reset;
    }

    static bg_yellow(s: string) {
        return "\u001b[43m" + s + reset;
    }

    static bg_blue(s: string) {
        return "\u001b[44m" + s + reset;
    }

    static bg_magenta(s: string) {
        return "\u001b[45m" + s + reset;
    }

    static bg_cyan(s: string) {
        return "\u001b[46m" + s + reset;
    }

    static bg_white(s: string) {
        return "\u001b[47m" + s + reset;
    }

    static bg_gray(s: string) {
        return "\u001b[100m" + s + reset;
    }

}
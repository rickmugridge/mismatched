import {primitiveBuilder, TimeUnit} from "./primitiveBuilder";
import {PrettyPrinter} from "../prettyPrint/PrettyPrinter";
import {assertThat} from "../assertThat";

describe("primitiveBuilder", () => {
    it("number", () => {
        assertThat(primitiveBuilder.int(4, 4)).is(4)
        sample("int", () => primitiveBuilder.int())
        sample("bigInt", () => primitiveBuilder.bigInt())
        sample("float", () => primitiveBuilder.float())
        sample("decimal, 2", () => primitiveBuilder.decimal(2))
        sample("decimal, 4", () => primitiveBuilder.decimal(4))
    })

    it("other error types", () => {
        throw new ReferenceError()
    })

    it("strings", () => {
        sample("aString", () => primitiveBuilder.aString())
        sample("stringInSequence", () => primitiveBuilder.stringInSequence())
    })

    it("dates", () => {
        let date = new Date();
        PrettyPrinter.logToConsole({now: date, dateInIso: date.toISOString()})
        sample("date 2 hours before", () =>
            primitiveBuilder.date(TimeUnit.Hours, -2, 0))
        sample("date 20 days after", () =>
            primitiveBuilder.date(TimeUnit.Days, 0, +20))
        sample("date", () => primitiveBuilder.date())
    })

    it("fixed set of possibilities", () => {
        frequencies("bool", () => primitiveBuilder.bool())
        frequencies("anyOf", () => primitiveBuilder.anyOf([1, 2, 3]))
    })

    it("enum values", () => {
        enum StringBased {A = "AA", B = "BB"}

        enum NumberBased {A, B, C = 23}

        enum Single {X = "X"}

        frequencies("StringBased", () => primitiveBuilder.anyEnum(StringBased))
        frequencies("NumberBased", () => primitiveBuilder.anyEnum(NumberBased))
        frequencies("Single", () => primitiveBuilder.anyEnum(Single))
    })

    it("example uses", () => {
        enum Eg {One, Two, Three}

        PrettyPrinter.logToConsole({
            stringInSequence: primitiveBuilder.stringInSequence("id"),
            aString: primitiveBuilder.aString("details"),
            int: primitiveBuilder.int(0, 20),
            bigInt: primitiveBuilder.bigInt(-20, 20),
            float: primitiveBuilder.float(0.5, 0.6),
            decimal: primitiveBuilder.decimal(2, 0, 100),
            bool: primitiveBuilder.bool(),
            anyOf: primitiveBuilder.anyOf(["A", "B", "C"]),
            anyEnum: primitiveBuilder.anyEnum(Eg),
            date: primitiveBuilder.date(TimeUnit.Hours, 0, 24),
            error: primitiveBuilder.error("whoops"),
            symbol: primitiveBuilder.symbol("hidden"),
            arrayOf: primitiveBuilder.arrayOf(
                () => primitiveBuilder.int(0, 20), 5, 6),
            setOf: primitiveBuilder.setOf(
                () => primitiveBuilder.aString(), 1, 3),
            mapOf: primitiveBuilder.mapOf(
                (i) => [`key#${i}`, primitiveBuilder.decimal()], 2, 3),
        })
    })
})

const frequencies = (fnName: string, generate: () => any) => {
    const frequency = new Map<any, number>
    for (let i = 0; i < 1000; i++) {
        const v = generate()
        let count = frequency.get(v)
        if (count) {
            frequency.set(v, count + 1)
        } else {
            frequency.set(v, 1)
        }
    }
    PrettyPrinter.logToConsole({fnName, frequency})
}

const sample = (fnName: string, generate: () => any) => {
    const samples: any[] = []
    for (let i = 0; i < 100; i++) {
        const v = generate()
        samples.push(v)
    }
    PrettyPrinter.logToConsole({fnName, samples})
}

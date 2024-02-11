# Primitive Builder for test data generation

It can be tedious to "manually" create test data for multiple non-trivial objects
with multiple nested fields.
The Builder design approach can work well here.
Builders can incorporate standard field values in an object,
and allow the user to alter or add to them.

If you're familiar with using the Builder pattern with "random" data,
you may like to skip to the last section.

# Using a simple Builder to create a test object

Here's a simple example of using a `Delivery` builder:

```
    const delivery = new DeliveryBuilder()
        .withOfType(DeliveryType.Urgent)
        .withDetails("new details")
        .addOrders([])
        .to()
```

This allows us to focus on the significant aspects of a Delivery in a test.

Here's how it's defined:

```
export class DeliveryBuilder {
    delivery: Delivery = {
        id: "some id",
        ofType: DeliveryType.Urgent,
        details: "some details",
        effectiveFrom: new Date(),
        isForSupplier: "supplier",
        hasSupplierCategory: "category",
        orders: []
    }

    withOfType(ofType: DeliveryType): this {
        this.delivery.ofType = ofType
        return this
    }

    withDetails(details: string): this {
        this.delivery.details = details
        return this
    }

    addOrders(orders: Order[]): this {
        orders.forEach(order => this.delivery.orders.push(order))
        return this
    }

    to(): Delivery {
        return this.delivery
    }
}
```

(Or equivalent without classes.)

## Limitations of the above builder

If we have several `Delivery` objects used in a test:

* We have to make them distinct, eg:
    * They may need unique ids, requiring an extra `withId()` call (not shown) for each one
    * Because they're so similar, it's harder and more confusing to make assertions where
      `Delivery` objects are the result of some processing
* We're reducing the value of a test by always using the same, simple values

Another, smaller issue is that it encourages assertions in our tests to check against
simple values. That's fine for tests with narrowly sized data.
But once the data gets wider and deeper, it makes it harder to read the intent from the test details.

## Using Primitive Builder (and other builders)

`PrimitiveBuilder` is a builder for simple values like numbers, strings, etc.
It uses randomness to create values of various types.

We can replace the initial value for our builder's `Delivery` as follows:

```
     delivery: Delivery = {
        id: "delivery#" + primitiveBuilder.aString("id"),
        ofType: primitiveBuilder.anyEnum(DeliveryType),
        details: primitiveBuilder.aString("details"),
        effectiveFrom: primitiveBuilder.date(TimeUnit.Days, 0, 14),
        isForSupplier: primitiveBuilder.aString("isForSupplier"),
        hasSupplierCategory: primitiveBuilder.aString("hasSupplierCategory"),
        orders: []
    }
```

Consider a test where a `Delivery` is updated, with an order being added.
We need to verify that the `effectiveFrom` field of the updated `Delivery` is unchanged.

The simple way to do that is to verify unchanged fields against the original. Eg:

```
 assertThat(updatedDelivery.effectiveFrom).is(delivery.effectiveFrom)
```

Notice how this makes the assertion more meaningful.
This is especially true when a test has to verify a function that takes in multiple wide objects
and creates a new object that contains data from each of them.

## primitiveBuilder

This consists of the following functions (including their default arguments):

* stringInSequence = (label: string = "string"): string
    * Each time this is called it generates a new string with subsequent integers, starting at 1
* aString = (label: string = "string"): string
* int = (lowerBound: number = -10000, upperBound: number = 10000): number
* bigInt = (lowerBound: number = -10000, upperBound: number = 10000): BigInt
* float = (lowerBound: number = -10000, upperBound: number = 10000): number
* decimal = (significantDigits: number = 2, lowerBound: number = -10000, upperBound: number = 10000):number
* bool = (): boolean
* date = (timeUnits: TimeUnit = TimeUnit.Days, lowerBoundBefore: number = -1000, upperBoundAfter: number = 1000): Date
* error = (message: string = aString("error")): Error
* symbol = (message: string = aString("sym")): Symbol
* anyOf = <T>(possibles: Array<T>): T
* anyEnum = (enumerator: any): any
* arrayOf = <T>(elementGenerator: (index:number) => T, lowerBound: number = 0, upperBound: number = 10): T[]
* setOf = setOf = <T>(elementGenerator: (index:number) => T, lowerBound: number = 0, upperBound: number = 10): Set<T>
* mapOf = <S, T>(elementGenerator: (index:number) => [S, T], lowerBound: number = 0, upperBound: number = 10): Map<S, T>

For example, when I ran the following:

```
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
            date: primitiveBuilder.date(TimeUnit.Hours, 0, 24),
            error: primitiveBuilder.error("whoops"),
            symbol: primitiveBuilder.symbol("hidden"),
             anyOf: primitiveBuilder.anyOf(["A", "B", "C"]),
            anyEnum: primitiveBuilder.anyEnum(Eg),
            arrayOf: [17, 9, 6, 1, 11], 
            arrayOf: primitiveBuilder.arrayOf(
                () => primitiveBuilder.int(0, 20), 5,6),
            setOf: primitiveBuilder.setOf(
                () => primitiveBuilder.aString(), 1,3),
            mapOf: primitiveBuilder.setOf(
                () => [primitiveBuilder.bool(),primitiveBuilder.decimal()], 2,3),
    })
```

I got:

```
     {
        stringInSequence: "id-1", 
        aString: "details-7511", 
        int: 6, 
        bigInt: 16,
        float: 0.5, 
        decimal: 43.59, 
        bool: true, 
        date: new Date("2024-01-02T14:30:51.166Z"), 
        error: {errorMessage: "whoops"},
        symbol: Symbol(hidden),
        anyOf: "B", 
        anyEnum: 1,
        arrayOf: [18, 19, 9, 4, 6],
        setOf: new Set(["string-3172", "string-4098", "string-2320"]), 
        mapOf: new Map([["key#0", -5908.74], ["key#1", 6883.11]])
    }
```

See the code in `primitiveBuilder.ts`.
For "tests" of corresponding usage, see `primitiveBuilder.localTest.ts`
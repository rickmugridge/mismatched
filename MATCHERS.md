# Matchers

There are a range of matchers provided, and a simple means of adding your own.

Matchers are responsible for matching against an actual value, and providing suitable feedback when they fail to match.

The built-in ones are assessed via the constant `match`, for easy auto-completion. 

## Equal Matchers

This matches a primitive value if it has the same value.
If matches an object or array if it is a reference to that object or array.

This is used by default when matching a primitive type (other than a string or NaN).

```
        describe('matches exact same value:', () => {
            it('number', () => {
                const actual = 3.4;
                assertThat(actual).is(match.isEquals(actual));
                assertThat(actual).is(actual);
            });
```

See [Equal Matchers](./EqualMatchers.md) for further details of structural and identity equality.

## Array Matchers

The `array` matchers allow for "exact" and partial matching on an array. 
Embedded matchers may used within the array elements.

We can match a literal array, as shown in the examples below.
This  expects that each of the elements of the actual array can be matched by a corresponding matcher/literal.

For example:

```
    describe("array.match", () => {
        it("literal", () => {
            assertThat([1, 2]).is<number[]>([1, 2]); // The generic type here is optional, giving compile-time feedback
        });

        it("Embedded matcher", () => {
            assertThat([1, 2]).is([1, match.number.greater(0)]);
        });
    });
```
Other array matching:
 * `match.array.contains()`: Check a subset of the elements
 * `match.array.every()`: Each of the elements of the array have to satisfy these properties
 * `match.array.length()`: Match the length of the array only
 * `match.array.unordered()`: Allow for the array to be unordered (allows for duplicate entries)
 * `match.array.unorderedContains()`: Check a subset of an unordered array (allows for duplicate entries)

See [Array Matchers](./ArrayMatchers.md) for further details.

## Set Matchers

The matches whole Sets and subsets.

For example:

```
    it('matches', () => {
        const actual = new Set([1, 2, 3]);
        assertThat(actual).is(match.aSet.match(new Set([1, 2, 3])));
        assertThat(actual).is(match.aSet.subset(new Set([1, 2])));
    });
```

Set matching:
 * `match.aSet.match()` matches the whole set
 * `match.aSet.subset()` matches a subset

See [Set Matchers](./SetMatchers.md) for further details.

## Object Matchers

The `obj` matchers allow for "exact" and partial matching on an object. 
Embedded matchers may used within the fields of the object.

For example:

```
    it("obj.match", () => {
            assertThat(actual)
                .is({
                    name: "hamcrest",
                    address: {
                        number: match.number.lessEqual(3),
                        street: "Oak St", 
                        other: match.ofType.array
                    }
                });
    });
```

Object matching:
 * `match.obj.match()` matches the whole object
 * `match.obj.has()` matches some fields of the object

See [Object Matchers](./ObjectMatchers.md) for further details.

## String Matchers

Various matchers on strings.

For examples:

```
it("string matchers", () => {
      const actual = "abcdefghijkl";
      assertThat(actual).is(actual);
      assertThat(actual).is(match.string.startsWith("abc"));
      assertThat(actual).is(match.string.endsWith("jkl"));
      assertThat(actual).is(match.string.includes("abc"));
});
```
String matching:
* `match.string.match()` matches the whole string
* `match.string.startsWith()` matches the start of a string
* `match.string.endsWith()` matches the end of a string
* `match.string.includes()` matches a substring

See [String Matchers](./StringMatchers.md) for further details.

## Number Matchers

For examples:

```
it("NumberMatcher:", () => {
        assertThat(2).is(2);
        assertThat(2).is(match.number.less(3));
        assertThat(3).is(match.number.lessEqual(3));
        assertThat(2).is(match.number.greater(1));
        assertThat(4).is(match.number.greaterEqual(3));
});

```

Number matchers:
 * `match.number.less()`
 * `match.number.lessEqual()`
 * `match.number.greater()`
 * `match.number.greaterEqual()`

See [Number Matchers](./NumberMatchers.md) for further details.

### RegExp Matcher

A matcher on regular expressions.

For example:

```
    it("Matches", () => {
        assertThat("ab").is(match.regEx.match(/a./));
        assertThat("ab").is(match.regEx.match(/ab/));
    });
```

### Any Matcher

Matches anything at all.

For example:

```
    it("Matches", () => {
        assertThat(new Date()).is(match.any);
        assertThat({a: 2}).is(match.any);
        assertThat(false).is(match.any);
    });
```

### AnyOf Matcher

Matches any one of the given matchers.

For example:

```
    it("Matches", () => {
        assertThat(new Date()).isAnyOf([match.isEquals(3), match.instanceOf(Date)]);
        assertThat({a: 2}).isAnyOf([match.instanceOf(Object)]);
    });
```

We can improve the validation errors when matching across subtypes of objects.
Define the `key` fields of each type of object with `match.obj.key()`.
Eg, we're validating that an object is either of type 'a' or type 'b':

```
        it("Just mentions the failures to match within the single key match", () => {
            const matchTypeA = {type: match.obj.key('a'), f: match.ofType.string()};
            const matchTYpeB = {type: match.obj.key('b'), f: match.ofType.number()};
            const actual = {type: 'a', f: 4};
            
            const validation = validateThat(actual).satisfies(match.anyOf([matchTypeA, matchTYpeB]));
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                '[{"actual.f": 4, expected: "ofType.string"}]'
            ]);
        });
```

The error above is then specific to type 'a'. Without specifying the key, either type would match equally well.

### AllOf Matcher

Matches all of the given matchers.

For example:

```
    it("Matches", () => {
        assertThat({a: 2}).isAllOf([match.instanceOf(Object)]);
        assertThat(new Date()).isAllOf([match.instanceOf(Object), match.instanceOf(Date)]);
    });
```

### Optional Matcher

Matches a value that is optional (undefined) but if it's there it must satisfy the matcher supplied

For example:

```
    it("Matches", () => {
        assertThat(3).is(match.optional(3));
        assertThat(undefined).is(match.optional(3));
    });
```

### OptionalNull Matcher

Matches a value that is optional (undefined or null) but if it's there it must satisfy the matcher supplied

For example:

```
    it("Matches", () => {
        assertThat(3).is(match.optionalNull(3));
        assertThat(null).is(match.optionalNull(3));
    });
```

### Not Matcher

The given matcher is expected to fail.

For example:

```
    it("matches", () => {
        assertThat(2).is(match.not(4));
        assertThat(2).isNot(4);
        assertThat(true).is(match.not(false));
        assertThat({f: 2}).is(match.not("a"));
    });
```

### InstanceOf Matcher

Checks that the value is an instance of the given class.

For example:

```
    it("Matches", () => {
        assertThat(new Date()).is(match.instanceOf(Date));
        assertThat({a: 2}).is(match.instanceOf(Object));
    });
```

### OfType Matcher

Checks that the value is one of the "primitive" types.

For examples:

```
    it("OfTypeMatcher:", () => {
            assertThat([1, 3]).is(match.ofType.array());
            assertThat((a, b) => a + b).is(match.ofType.function());
            assertThat("aa").is(match.ofType.string());
            assertThat(2.3).is(match.ofType.number());
            assertThat(false).is(match.ofType.boolean());
            assertThat(/a.*/).is(match.ofType.regExp());
            assertThat(Symbol("")).is(match.ofType.symbol());
    });
```
See [Number Matchers](./NumberMatchers.md) for further examples.

### Predicate Matcher

This is general-purpose. It takes a function that takes the actual value and returns a true if the match succeeds.
Many of the built-in matchers use this matcher. 

For example:

```
    it("Matches", () => {
        assertThat(5).is(match.predicate(v => v > 0, "positive"));
    });
```

### Binding Matcher

Sometimes a generated value, such as an ID, may occur at multiple points in a nested object or between objects.

In matching, we want to ensure that those values are all the same, but we dont know ahead of time what the value will be.

So we can use a binding matcher. 

See [Binding Matcher](./BindingMatcher.md) for an example and further details.

### Mapping Matcher

Sometimes, it's difficult to match directly on an object or a part of it.
This matcher allows the actual value to be mapped and the matcher is applied to the result.

See [MappedMatcher](./MappedMatcher.md) for an example and further details.


## Writing Custom Matchers

Simple matchers can use `match.predicate`. For examples:

```
    it("Provide an arrow. It is used for predicate matching", () => {
        assertThat(33).is(match.predicate(v => v >= 20 && v < 40));
    });

    it("Name the matcher so it can be used multiple times", () => {
        function fromUpTo(from: number, upto: number) {
            return match.predicate(v => v >= from && v < upto);
        }
        assertThat(33).is(fromUpTo(20, 40));
    });
 ```

Writing a matcher that composes over matchers can be more complex.
See [Custom Matchers](./CustomMatchers.md) for further details.

# The `match` const provides a good summary of the matchers:

```
export const match = {
    isEquals: (expected: any) => IsEqualsMatcher.make(expected),
    itIs: (expected: any) => ItIsMatcher.make(expected),
    array: {
        match: (expected: Array<DiffMatcher<any> | any>) => ArrayMatcher.make(expected),
        contains: (expected: DiffMatcher<any> | any) => ArrayContainsMatcher.make(expected),
        every: (expected: DiffMatcher<any> | any) => ArrayEveryMatcher.make(expected),
        length: (expected: number) => ArrayLengthMatcher.make(expected)
    },
    aSet: {
        match: (expected: Set<DiffMatcher<any> | any>) => SetMatcher.make(expected),
        subset: (expected: Set<DiffMatcher<any> | any>) => SetMatcher.make(expected, true),
    },
    obj: {
        match: (obj: object) => ObjectMatcher.make(obj),
        has: (expected: Array<DiffMatcher<any>> | object) => ObjectSomeMatcher.make(expected),
    },
    string: {
        match: (expected: string) => StringMatcher.make(expected),
        startsWith: (expected: string) => stringMatcher.startsWith(expected),
        endsWith: (expected: string) => stringMatcher.endsWith(expected),
        includes: (expected: string) => stringMatcher.includes(expected)
    },
    number: {
        nan: () => numberMatcher.nan(),
        less: (expected: number) => numberMatcher.less(expected),
        lessEqual: (expected: number) => numberMatcher.lessEqual(expected),
        greater: (expected: number) => numberMatcher.greater(expected),
        greaterEqual: (expected: number) => numberMatcher.greaterEqual(expected)
    },
    regEx: {
        match: (expected: RegExp) => RegExpMatcher.make(expected)
    },
    any: () => AnyMatcher.make(),
    anyOf: (matchers: Array<DiffMatcher<any> | any>) => AnyOfMatcher.make(matchers),
    allOf: (matchers: Array<DiffMatcher<any> | any>) => AllOfMatcher.make(matchers),
    optional: (matcher: DiffMatcher<any> | any) => OptionalMatcher.make(matcher),
    optionalNull: (matcher: DiffMatcher<any> | any) => OptionalNullMatcher.make(matcher),
    not: (matcher: DiffMatcher<any> | any) => NotMatcher.make(matcher),
    instanceOf: (expected: Function) => instanceOfMatcher.instanceOf(expected),
    ofType: {
        object: () => PredicateMatcher.make(ofType.isObject, "ofType.object"),
        array: () => PredicateMatcher.make(ofType.isArray, "ofType.array"),
        function: () => PredicateMatcher.make(ofType.isFunction, "ofType.function"),
        string: () => PredicateMatcher.make(ofType.isString, "ofType.string"),
        number: () => PredicateMatcher.make(ofType.isNumber, "ofType.number"),
        boolean: () => PredicateMatcher.make(ofType.isBoolean, "ofType.boolean"),
        regExp: () => PredicateMatcher.make(ofType.isRegExp, "ofType.regExp"),
        symbol: () => PredicateMatcher.make(ofType.isSymbol, "ofType.symbol")
    },
    predicate: (predicate: (v: any) => boolean,
                description: any = {predicateFailed:PrettyPrinter.functionDetails(predicate)}) =>
        PredicateMatcher.make(predicate, description),
    mapped: (map: (t: any) => any, matcher: DiffMatcher<any> | any, description: any) =>
        MappedMatcher.make(map, matcher, description),
    bind: (matcher?: DiffMatcher<any> | any) => BindMatcher.make(matcher),
    describeContext: (describeContext: (outerContext: string, actual: any) => string, matcher: DiffMatcher<any> | any) =>
        DescribeContextMatcher.make(describeContext, matcher),
    describe: (matcher: DiffMatcher<any> | any, description: (actual: any, context:string) => string) =>
        DescribeMatcher.make(matcher, description)
};
```

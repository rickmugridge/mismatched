## Matchers

There are a range of matchers provided, and a simple means of adding your own.
Matchers are responsible for matching against an actual value, and providing suitable feedback when they fail to match.

The built-in ones are assessed via the constant `match`, for easy auto-completion. 
This const provides a good summary of the matchers:

```
export const match = {
    isEquals: IsEqualsMatcher.make,
    array: {
        match: ArrayMatcher.make,
        contains: ArrayContainsMatcher.make,
        every: ArrayEveryMatcher.make,
        length: ArrayLengthMatcher.make
    },
    obj: {
        match: ObjectMatcher.make,
        has: ObjectSomeMatcher.make
    },
    string: {
        match: stringMatcher.match,
        startsWith: stringMatcher.startsWith,
        endsWith: stringMatcher.endsWith,
        includes: stringMatcher.includes
    },
    number: {
        nan: numberMatcher.nan,
        less: numberMatcher.less,
        lessEqual: numberMatcher.lessEqual,
        greater: numberMatcher.greater,
        greaterEqual: numberMatcher.greaterEqual
    },
    regEx: {
        match: RegExpMatcher.make
    },
    any: AnyMatcher.make,
    anyOf: AnyOfMatcher.make,
    allOf: AllOfMatcher.make,
    optional: OptionalMatcher.make,
    not: NotMatcher.make,
    instanceOf:instanceOfMatcher.instanceOf,
    ofType: {
        array: () => PredicateMatcher.make(ofType.isArray, "ofType.array"),
        function: () => PredicateMatcher.make(ofType.isFunction, "ofType.function"),
        string: () => PredicateMatcher.make(ofType.isString, "ofType.string"),
        number: () => PredicateMatcher.make(ofType.isNumber, "ofType.number"),
        boolean: () => PredicateMatcher.make(ofType.isBoolean, "ofType.boolean"),
        regExp: () => PredicateMatcher.make(ofType.isRegExp, "ofType.regExp"),
        symbol: () => PredicateMatcher.make(ofType.isSymbol, "ofType.symbol")
    },
    predicate: PredicateMatcher.make
};
```

### Equal Matchers

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

            it('boolean', () => {
                const actual = false;
                assertThat(actual).is(match.isEquals(actual));
                assertThat(actual).is(actual);
                assertThat(true).is(true);
            });

            it('Symbol', () => {
                const actual = Symbol('test');
                assertThat(actual).is(match.isEquals(actual));
                assertThat(actual).is(actual);
            });

            it('undefined', () => {
                const actual = undefined;
                assertThat(actual).is(match.isEquals(actual));
                assertThat(actual).is(actual);
            });

            it('null', () => {
                const actual = null;
                assertThat(actual).is(match.isEquals(actual));
                assertThat(actual).is(actual);
            });

            it('object itself', () => {
                const actual = {a: "b"};
                assertThat(actual).is(match.isEquals(actual));
                assertThat(actual).isNot(match.isEquals({a: "b"}));
            });

            it('array itself', () => {
                const actual = [1, 2, 3];
                assertThat(actual).is(match.isEquals(actual));
                assertThat(actual).isNot(match.isEquals([1, 2, 3]));
            });

            it('NaN is odd, as it is not equal to itself', () => {
                const actual = NaN;
                assertThat(actual).isNot(match.isEquals(actual));
            });
        });
```

### Array Matchers

The `array` matchers allow for "exact" and partial matching on an array. 
Embedded matchers may used within the array elements.

#### `array.match` 

This used by default whenever we try to match a literal array, as shown in the examples below.
This matcher expects that each of the elements of the actual array can be matched by a corresponding matcher/literal.

For example:

```
    describe("array.match", () => {
        it("literal", () => {
            assertThat([1, 2]).is([1, 2]);
            assertThat([1, 2]).is(match.array.match([1, 2])); // long-hand
        });

        it("Embedded matcher", () => {
            assertThat([1, 2]).is([1, match.number.greater(0)]);
            assertThat([1, 2]).is(match.array.match([1, match.number.greater(0)]));
        });
    });
```

#### `array.contains` 

This matcher expects that the actual array contains the expected element. It may contain other elements.

For example:

```
    it("array.contains", () => {
        assertThat([-1, 2]).is(match.array.contains(match.number.greater(0)));
    });
```

#### `array.every` 

This matcher expects that all elements of the actual array matches against the matcher.

For example:

```
    describe("array.every", () => {
        it("literal", () => {
            assertThat([1, 1]).is(match.array.every(1));
        });
        it("matcher", () => {
            assertThat([-1, 2]).is(match.array.every(match.number.greater(-5)));
        });
    });
```

#### `array.length` 

This matcher expects that the length of the actual array to be the expected value.

For example:

```
    it("array.length", () => {
        assertThat([-1, 2]).is(match.array.length(2));
    });
```

### Object Matchers

The `obj` matchers allow for "exact" and partial matching on an object. 
Embedded matchers may used within the fields of the object.

#### `obj.match` 

This used by default whenever we try to match a literal object, as shown in the first example below.
This matcher expects that each of the fields of the actual object can be matched by a corresponding matcher/literal.

For example:

```
    describe("obj.match", () => {
        const actual = {name: "hamcrest", address: {number: 3, street: "Oak St", other: [1, 2]}};

        it('Explicit', () => {
            assertThat(actual)
                .is(match.obj.match({name: "hamcrest", address: {number: 3, street: "Oak St", other: [1, 2]}}));
            assertThat(actual)
                .is({name: "hamcrest", address: {number: 3, street: "Oak St", other: [1, 2]}});
        });

        it('Embedded', () => {
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
    });
```

#### `obj.has` 

This matcher expects that some of the elements of the actual array can be matched by a corresponding matcher/literal.

For example:

```
    describe("obj.has", () => {
        const actual = {name: "hamcrest", address: {number: 3, street: "Oak St", other: [1, 2]}};

        it('Explicit', () => {
            assertThat(actual)
                .is(match.obj.has({name: "hamcrest"}));
        });

        it('Embedded', () => {
            assertThat(actual)
                .is(match.obj.has({
                    address: {
                        street: "Oak St", 
                        other: match.ofType.array
                    }
                }));
        });
    });
```

### String Matcher

For examples:

```
describe("string:", () => {
    const actual = "abcdefghijkl";

    it("string.match:", () => {
        assertThat(actual).is(match.string.match(actual));
        assertThat(actual).is(actual);
    });

    it("string.startsWith:", () => {
        assertThat(actual).is(match.string.startsWith("abc"));
    });

    it("string.endsWith:", () => {
        assertThat(actual).is(match.string.endsWith("jkl"));
    });

    it("string.includes:", () => {
        assertThat(actual).is(match.string.includes("abc"));
        assertThat(actual).is(match.string.includes("cde"));
    });
});
```

### Number Matchers

For examples:

```
describe("NumberMatcher:", () => {
    it("less", () => {
        assertThat(2).is(match.number.less(3));
        assertThat(4).is(match.not(match.number.less(3)));
    });

    it("lessEqual", () => {
        assertThat(2).is(match.number.lessEqual(3));
        assertThat(3).is(match.number.lessEqual(3));
        assertThat(4).is(match.not(match.number.lessEqual(3)));
    });

    it("greater", () => {
        assertThat(2).is(match.number.greater(1));
        assertThat(4).is(match.not(match.number.greater(5)));
    });

    it("greaterEqual", () => {
        assertThat(4).is(match.number.greaterEqual(3));
        assertThat(3).is(match.number.greaterEqual(3));
        assertThat(2).is(match.not(match.number.greaterEqual(3)));
    });
});

```

### RegExp Matcher

For example:

```
    it("Matches", () => {
        assertThat("ab").is(match.regEx.match(/a./));
        assertThat("ab").is(match.regEx.match(/ab/));
    });
```

### Any Matcher

For example:

```
    it("Matches", () => {
        assertThat(new Date()).is(match.any);
        assertThat({a: 2}).is(match.any);
        assertThat(false).is(match.any);
    });
```

### AnyOf Matcher

For example:

```
    it("Matches", () => {
        assertThat(new Date()).isAnyOf([match.isEquals(3), match.instanceOf(Date)]);
        assertThat({a: 2}).isAnyOf([match.instanceOf(Object)]);
    });
```

### AllOf Matcher

For example:

```
    it("Matches", () => {
        assertThat({a: 2}).isAllOf([match.instanceOf(Object)]);
        assertThat(new Date()).isAllOf([match.instanceOf(Object), match.instanceOf(Date)]);
    });
```

### Optional Matcher

For example:

```
    it("Matches", () => {
        assertThat(3).is(match.optional(3));
        assertThat(undefined).is(match.optional(3));
    });
```

### Not Matcher

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

For example:

```
    it("Matches", () => {
        assertThat(new Date()).is(match.instanceOf(Date));
        assertThat({a: 2}).is(match.instanceOf(Object));
    });
```

### OfType Matcher

For examples:

```
    describe("OfTypeMatcher:", () => {
        it("ofType.array", () => {
            assertThat([]).is(match.ofType.array());
            assertThat([1, 3]).is(match.ofType.array());
            assertThat(2).is(match.not(match.ofType.array()));
        });
    
        it("ofType.function", () => {
            assertThat(() => 1).is(match.ofType.function());
            assertThat((a, b) => a + b).is(match.ofType.function());
            assertThat(2).is(match.not(match.ofType.function()));
        });
    
        it("ofType.string", () => {
            assertThat("").is(match.ofType.string());
            assertThat("aa").is(match.ofType.string());
            assertThat(2).is(match.not(match.ofType.string()));
        });
    
        it("ofType.number", () => {
            assertThat(1).is(match.ofType.number());
            assertThat(2.3).is(match.ofType.number());
            assertThat(true).is(match.not(match.ofType.number()));
        });
    
        it("ofType.boolean", () => {
            assertThat(true).is(match.ofType.boolean());
            assertThat(false).is(match.ofType.boolean());
            assertThat(1).is(match.not(match.ofType.boolean()));
        });
    
        it("ofType.boolean", () => {
            assertThat(true).is(match.ofType.boolean());
            assertThat(false).is(match.ofType.boolean());
            assertThat(1).is(match.not(match.ofType.boolean()));
        });
    
        it("ofType.regExp", () => {
            assertThat(/a/).is(match.ofType.regExp());
            assertThat(/a.*/).is(match.ofType.regExp());
            assertThat(1).is(match.not(match.ofType.regExp()));
        });
    
        it("ofType.symbol", () => {
            assertThat(Symbol("")).is(match.ofType.symbol());
            assertThat(Symbol()).is(match.ofType.symbol());
            assertThat(1).is(match.not(match.ofType.symbol()));
        });
    });
```

### Predicate Matcher

This is general-purpose. It takes a function that takes the actual value and returns a true if the match suceeds.
Many of the built-in matchers use this matcher. 
As shown below, it is used automatically if the `assertThat().is()` value is a function.

For example:

```
    it("Matches", () => {
        assertThat(5).is(match.predicate(v => v > 0, "positive"));
        assertThat({a: 2}).is(v => v.a === 2);
    });
```

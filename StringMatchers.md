# String Matchers

Various matchers on strings.

## `match.string.match()`
Matches the whole string or regular expression, eg:

```
    it("string.match:", () => {
        assertThat("abcdefghijkl").is(match.string.match("abcdefghijkl"));
        assertThat("abcdefghijkl").is("abcdefghijkl");
        assertThat("abcdefghijkl").is(/abc.efg.ijkl/);
    });
```

## `match.string.startsWith()`
Matches the start of a string, eg:

```
    it("string.startsWith:", () => {
        assertThat("abcdefghijkl").is(match.string.startsWith("abc"));
    });
```

## `match.string.endsWith()`
Matches the end of a string, eg:

```
    it("string.endsWith:", () => {
        assertThat("abcdefghijkl").is(match.string.endsWith("jkl"));
    });
```

## `match.string.includes()` 
Matches a substring, eg:

```
    it("string.includes:", () => {
        assertThat("abcdefghijkl").is(match.string.includes("abc"));
        assertThat("abcdefghijkl").is(match.string.includes("cde"));
    });
```

## `match.uuid()`
Matches a string containing a UUID, eg:

```
    it("uuid", () => {
        assertThat('b28a0a82-a721-11e9-9037-077495dd0010').is(match.uuid())
        assertThat('077495dd00').isNot(match.uuid())
    });
```

# The following parse/map a string to another type, which is then matched against

## `match.asDate()`
Parses a string as a Date and matches that against an expected Date (or other matcher), eg:

```
         it("asDate()", () => {
            const date = new Date()
            assertThat(date.toISOString()).is(match.string.asDate(date))
        })
```

Note, however, that Dates are tricky. 
Eg, the following test shows that a Date parsed from the `toUTCString()` differs from the original:

```
        it("asDate() via UTC does not match", () => {
            const date = new Date()
            assertThat(date.toUTCString()).isNot(match.string.asDate(date))
        })
```

## `match.asSplit()`
Splits a string based on a given separator and matches that against an expected string[] (or other matcher)
```
        it("asSplit()", () => {
            assertThat("a,b,c").is(match.string.asSplit(",", ["a", "b", "c"]))
        })
```

## `match.asNumber()`
Parses a string as a number and matches that against an expected number (or other matcher), eg:
```
        it("asNumber()", () => {
            assertThat("345").is(match.string.asNumber(345))
        })
```

## `match.asDecimal()`
Parses a string as a number and matches that against an expected number (or other matcher).
If the string number doesn't satisfy the decimal places required, it converts it to NaN.
Eg:
```
        it("asDecimal()", () => {
            assertThat("3.45").is(match.string.asDecimal(2, 3.45))
        })
```

## `match.fromJson()`

JSON parses a string as a value and matches that against an expected value (or other matcher), eg:
```
        it("fromJson()", () => {
            assertThat('{"m":1}').is(match.string.fromJson({m: 1}))
        })
```



### String Matchers

Various matchers on strings.

## `match.string.match()` matches the whole string

```
    it("string.match:", () => {
        assertThat("abcdefghijkl").is(match.string.match("abcdefghijkl"));
        assertThat("abcdefghijkl").is("abcdefghijkl");
    });
```

## `match.string.startsWith()` matches the start of a string

```
    it("string.startsWith:", () => {
        assertThat("abcdefghijkl").is(match.string.startsWith("abc"));
    });
```

## `match.string.endsWith()` matches the end of a string

```
    it("string.endsWith:", () => {
        assertThat("abcdefghijkl").is(match.string.endsWith("jkl"));
    });
```

## `match.string.includes()` matches a substring

```
    it("string.includes:", () => {
        assertThat("abcdefghijkl").is(match.string.includes("abc"));
        assertThat("abcdefghijkl").is(match.string.includes("cde"));
    });
```


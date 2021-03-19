### String Matchers

Various matchers on strings.

## `match.string.match()` matches the whole string or regular expression

```
    it("string.match:", () => {
        assertThat("abcdefghijkl").is(match.string.match("abcdefghijkl"));
        assertThat("abcdefghijkl").is("abcdefghijkl");
        assertThat("abcdefghijkl").is(/abc.efg.ijkl/);
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

## `match.uuid()` matches a string containing a UUID

```
    it("uuid", () => {
        assertThat('b28a0a82-a721-11e9-9037-077495dd0010').is(match.uuid())
        assertThat('077495dd00').isNot(match.uuid())
    });
```



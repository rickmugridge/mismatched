# Fuzzy Diffing of Arrays in `mismatched` 11 February 2024

`mismatched` provides for diffing over arrays of arbitrary values (including arrays and objects).
This is straight forward when the matching succeeds, and a standard diffing approach can be used.
However, if the elements of an array only partially match, it is very useful to show those partial matches.
In general, this means that a fuzzy approach to matching is needed, as we explain further below.

## 1. A Simple Example with numbers

Consider the following example:

```
      assertThat([1, 2, 3]).is([2, 3, 4])
```

where `actual` is `[1, 2, 3]` and `expected` is `[2, 3, 4]`.

As described elsewhere, `mismatched` [compiles](..%2Fdocs%2FMismatchedAtWork.md) the `expected` value
into a relevant matcher.
In this case, `[2, 3, 4]` is compiled into an `ArrayMatcher` containing matchers for each of the array elements.

Clearly, common elements match (2 and 3) and others do not (1 and 4).

In our terms, in relation to the matchers within the `ArrayMatcher`:

* `1` is `unexpected` (ie, no matcher for it)
* `4` is `expected` (ie, expected by a matcher for `4` but no corresponding actual value)

todo Include gif showing result of running that assertThat()...

## 2. Simply out of order

```
      assertThat([1, 2, 3]).is([3, 2, 4])
```

In addition to `1` being `unexpected` and `4` is `expected`, we have:

* `2` is out of order, as it was expected after the `3`.

## 3. An array with arrays and objects

Consider the following example:

```
       it("arrays with objects and arrays match", () => {
            assertThat([1, {a: 2, b:3}, [[3, 4]]]).is([1, {a: 2, b:3}, [[3, 4]]])
        })
```

The matches one-for-one, so that's simple. But what if things are out of order and/or don't quite match:

## 4. When the expected uses matchers like `match.any()`





## 9. Using `fast-check` for diffing

`fast-check` takes two arrays, and a means of comparing them, and provides back deltas. For example:

```
   it("Out of order eg", () => {
        const deltas = diff.getPatch([1, 2, 3], [3, 2, 4], compare)
        assertThat(deltas).is([
            {type: "remove", oldPos: 0, newPos: 0, items: [1, 2]},
            {type: "add", oldPos: 3, newPos: 1, items: [2, 4]}
        ])
    })
```

The results are what patches should be applied to `[1, 2, 3]` to become `[3, 2, 4]`:

* Remove `1` from position [0] of the LHS
* Add items [2, 4] from the RHS

To fit with the `mismatched` style of error messages when things don't match, we map the deltas:
* Remove `1` means that the `1` is unexpected
* Add items [2, 4] means that they are expected
# How `mismatched` works

Note that it's not necessary to understand any of the following to use `mismatched`.

For ease of explanation, we describe it with multiple (partially made-up) evolutionary steps.
We start with the very simplest implementation: it just tests simple values, simply succeeding or failing.

We then evolve it as we add more sophisticated requirements:

* Match objects too, in a simple way
* Provide a decent diff in a readable form
* Match predicates
* Match number relations (<, <=, etc) and string relations (startsWith(), includes(), etc)
* Provide general matchers, such as match.any(), match.optional(), match.allOf(), match.anyOf()
* Match arrays too, in a simple way
* Measure the quality of partial matches
* Also provide for validating data
* Improve the quality of matching in sets and unordered arrays (bags)

The following are not covered here - see the code if you want more details:

* Ensure we can test `mismatched` with itself by verifying results when a test fails
* Allow for matching a set or unordered array (bag)
* Allow for matching a subset of the properties of an array
* Allow for matching a subset of the elements of an array or set
* Handle weirdo JS values such as NaN, Infinity, Symbols, and Error()
* Refine matching criteria for unordered arrays and sets of objects by specifying keys
* Allow for binding a randomly-created value, such as an id, when it occurs in more than one place
* Allow for self-referential values

## Aim 1: `assertThat()` simply succeeds or fails when testing simple values

Eg:

```typescript
assertThat(3).is(3);
assertThat(true).is(true);
assertThat('world').is('world');
```

which compares the `actual` value (left-hand side) to the `expected` value (right-hand side).

### `assertThat().is()` calls in the matchMaker to set up a matcher for the `expected` value.

Then it calls that matcher with the `actual` value.

```typescript
   export function assertThat<T>(actual: T) {
    return new Assertion<T>(actual);
}

class Assertion<T> {
    constructor(private actual: any) {
    }

    is(expected: T) {
        const matcher = matchMaker(expected);
        const result = matcher.matches(this.actual);
        if (result) {
            console.log('OK')
        } else {
            const message = JSON.stringify({actual, expected})
            throw new Error('failed: ' + message)
        }
    }
}
```

### `matchMaker` initially has little to do, as we have only simple values.

At this stage, it can just return a `ItIsMatcher`, which just checks that the actual and expected values are identical (
===).

```typescript
export function matchMaker(expected: any): DiffMatcher<any> {
    return new ItIsMatcher(expected)
}

```

and:

```typescript
export class ItIsMatcher extends DiffMatcher<any> {
    private constructor(private expected: any) {
        super();
    }

    matches(actual: any): boolean {
        return actual === this.expected;
    }
}
```

where `DiffMatcher` is initially very simple (we'll add further methods later):

```typescript
export abstract class DiffMatcher<T> {
    abstract matches(actual: T): boolean;
}
```

## Aim 2: Match objects too, in a simple way

Eg:

```typescript
assertThat({}).is({});
assertThat({f: 3}).is({f: 3});
assertThat({f: 3, g: {h: 4}}).is({f: 3, g: {h: 4}});
```

We extend the `matchMaker` to allow for (nested) objects, and introduce a new matcher, `ObjectMatcher`.

```typescript
export function matchMaker(expected: any): DiffMatcher<any> {
    if (ofType.isObject(expected) && !ofType.isArray(expected) && !ofType.isFunction(expected)) {
        return ObjectMatcher.make(expected);
    }
    return new ItIsMatcher(expected);
}
```

where `ObjectMatcher` is as follows:

```typescript
export class ObjectMatcher<T> extends DiffMatcher<T> {
    private constructor(private elementMatchers: Array<DiffMatcher<T>>) {
        super();
    }

    matches(actual: T): boolean {
        if (!ofType.isObject(actual) || allKeys(actual).length !== this.elementMatchers.length) {
            return false;
        }
        this.fieldMatchers.forEach(m => {
            if (!this.elementMatchers[1].matches(actual))
                return false
        })
        return true;
    }

    static make<T extends object>(obj: object): any {
        return new ObjectMatcher<T>(obj, DiffFieldMatcher.makeAll<T>(obj));
    }
}
```

where `allKeys()` returns all the string and symbol-based field names of the argument object. And:

```typescript
export class DiffFieldMatcher<T> extends DiffMatcher<T> {
    private constructor(public fieldName: string | symbol, private matcher: DiffMatcher<T>) {
        super();
    }

    matches(actual: T): boolean {
        return this.matcher.matches(actual[this.fieldName]);
    }

    static makeAll<T>(obj: object): Array<DiffFieldMatcher<T>> {
        return allKeys(obj).map(key => new DiffFieldMatcher(key, matchMaker(obj[key])));
    }
}
```

Of course, this is not very helpful when one value in a more complex object structure differs.

## Aim 3: Provide a decent diff in a readable form

We want to provide a diff that lays out the structure of object values.
It shows the actual value, with additional information when the expected differs from the actual.

Eg, in the following the actual :

```typescript
assertThat({f: 3, g: {h: 41}}).is({f: 3, g: {h: 42}});
```

where the h field differs between the `actual` (left) and `expected` (right).

We can show a mismatch like this, using a Javascript object form
(containing the `actual` value and a `diff` for the difference):

```
{
  actual: {f: 3, g: {h: 41}}, 
  diff: {f: 3, g: {h: {was: 41, expected: 42}}}
}
```

We create the `diff` by augmenting the `actual` value with fail information.
So instead of returning a boolean from matches(), let's return a `MatchResult`.
We also need a way to describe what a matcher expected:

```typescript
export abstract class DiffMatcher<T> {
    abstract matches(actual: T): MatchResult;

    abstract describe(): any;
}
```

and:

```typescript
export class MatchResult {
    static was = Colour.bg_cyan("     was");
    static expected = Colour.bg_cyan("expected");

    constructor(public diff: any, public passed: boolean) {
    }

    static wasExpected(was: any, expected: any, passed: boolean): MatchResult {
        return new MatchResult({
                [MatchResult.was]: was,
                [MatchResult.expected]: expected
            },
            passed);
    }

    static good() {
        return new MatchResult({}, true);
    }
}
```

and corresponding changes to `DiffFieldMatcher`:

```typescript
export class DiffFieldMatcher<T> extends DiffMatcher<T> {
    private constructor(public fieldName: string | symbol, private matcher: DiffMatcher<T>) {
        super();
    }

    matches(actual: T): MatchResult {
        return this.matcher.matches(actual[this.fieldName]);
    }

    describe(): any {
        return {[this.fieldName]: this.matcher.describe()};
    }

    static makeAll<T>(obj: object): Array<DiffFieldMatcher<T>> {
        return allKeys(obj).map(key => new DiffFieldMatcher(key, matchMaker(obj[key])));
    }
}
```

and `ObjectMatcher` has to change:

```typescript
export class ObjectMatcher<T> extends DiffMatcher<T> {
    private constructor(private elementMatchers: Array<DiffMatcher<T>>) {
        super();
    }

    matches(actual: T): MatchResult {
        if (!ofType.isObject(actual) || allKeys(actual).length !== this.elementMatchers.length) {
            return MatchResult.wasExpected(actual, this.describe(), false);
        }
        let passed = true;
        const diff = {};
        this.fieldMatchers.forEach(m => {
            let fieldMatchResult = this.elementMatchers[1].matches(actual);
            if (fieldMatchResult.passed) {
                diff[e.fieldName] = actual[e.fieldName];
            } else {
                diff[e.fieldName] = result.diff;
                passed = false;
            }
        })
        if (passed) {
            return MatchResult.good();
        }
        return new MatchResult(diff, false);
    }

    describe(): any {
        return concatObjects(this.fieldMatchers.map(e => e.describe()));
    }

    static make<T extends object>(obj: object): any {
        return new ObjectMatcher<T>(obj, DiffFieldMatcher.makeAll<T>(obj));
    }
}

export function concatObjects(objects: Array<object>): object {
    const result = {};
    objects.forEach(o => allKeys(o).forEach(key => result[key] = o[key]));
    return result;
}
```

We also need to lay out the result nicely. But `JSON.stringify()`:

* Doesn't handle symbol filed names, etc
* Without formatting - is hard to read with non-trivial objects, etc.
* With formatting - array and object layout can be too wide (too much detail) or too long (too much scrolling).

So `mismatched` contains a pretty printer for JS values, called `PrettyPrinter`.
See [PrettyPrinter](./src/prettyPrint/HowPrettyPrinterWorks.md) for further details.

For example, the following illustrates how `PrettyPrinter` gets a balance, avoiding too wide and too long:

```
{
  calfId: 56, 
  matches: [
    {
      calfId: 56, match_id: 1, match_type: "dam-only", selection_state: "open", 
      dam: {animalId: 561}, loci: {failures: []}, 
      links: [
        {
          href: "www.example.com/calf/56/match/1", 
          rel: "self"
        }, 
        {
          href: "www.example.com/calf/56/match/1/confirm", 
          rel: "confirm-match"
        }
      ]
    }
  ], links: []
}
```

## Aim 4: Match predicates

The user may have arbitrary conditions to apply when matching.

Eg:

```typescript
assertThat({f: 3, g: {h: 4}}).is({f: 3, g: {h: match.predicate(v => v > 3 && v < 10, '3 < value < 10')}});
```

We do that generally with a `PredicateMatcher` that takes a predicate and description of the expected value.

```typescript
export class PredicateMatcher extends DiffMatcher<any> {
    private constructor(private expected: (value: any) => boolean, private description: any) {
        super();
    }

    matches(actual: any): MatchResult {
        try {
            if (this.expected(actual)) {
                return MatchResult.good();
            }
        } catch (e: any) {
            const actualAndException = {actual, exception: exceptionMessage(e)};
            return MatchResult.wasExpected(actualAndException, this.describe(), false);
        }
        return MatchResult.wasExpected(actual, this.describe(), false);
    }

    describe(): any {
        return this.description;
    }

    static make<T>(predicate: (v: any) => boolean,
                   description: any = PrettyPrinter.functionDetails(predicate)): any {
        if (!isFunction(predicate)) {
            throw new Error("Predicate supplied must be a function");
        }
        return new PredicateMatcher(predicate, description);
    }
}
```

## Aim 5: Match number and string relations

Sometimes we don't want to match exact values.

Eg:

```typescript
assertThat({f: 3, g: {h: 4}}).is({f: 3, g: {h: match.number.less(5)}});
assertThat({f: 3, g: {h: 4.1}}).is({f: 3, g: {h: match.number.withinDelta(4.0, 0.2)}});
assertThat({f: 3, g: {h: "Hello"}}).is({f: 3, g: {h: match.string.startsWith("Hell")}});
```

We could write separate classes for these cases, but we'll use `PredicateMatcher` instead:

```typescript
export const numberMatcher = {
    nan: () => PredicateMatcher.make(ofType.isNaN, "NaN"),
    less: (expected: number) => PredicateMatcher.make(value =>
            ofType.isNumber(value) && value < expected,
        {"number.less": expected}),
    lessEqual: (expected: number) => PredicateMatcher.make(value =>
            ofType.isNumber(value) && (value <= expected || (isNaN(value) && isNaN(expected))),
        {"number.lessEqual": expected}),
    greater: (expected: number) => PredicateMatcher.make(value =>
            ofType.isNumber(value) && value > expected,
        {"number.greater": expected}),
    greaterEqual: (expected: number) => PredicateMatcher.make(value =>
            ofType.isNumber(value) && (value >= expected || (isNaN(value) && isNaN(expected))),
        {"number.greaterEqual": expected}),
    withinDelta: (expected: number, delta: number) => PredicateMatcher.make(value =>
            ofType.isNumber(value) && ofType.isNumber(delta) && (
                Math.abs(value - expected) <= delta ||
                (isNaN(value) && isNaN(expected)) ||
                (value === Infinity && expected === Infinity) ||
                (value === -Infinity && expected === -Infinity)
            ),
        {"number.nearWithDelta": expected}),
};
```

The code for string relations follow the same pattern.

## Aim 6: Provide general matchers, such as match.any(), match.optional(), match.allOf(), match.anyOf()

* `match.any()` can be used when a value within an array/object is irrelevant to the test,
  or we don't know what the value will be (eg, a generated id)
* `match.optional()` can be used when a value may be either a specific value or is `undefined`
* `match.allOf()` can be used when several conditions apply when matching
* `match.anyOf()` can be used when one of several conditions apply when matching

Eg:

```typescript
assertThat({f: 3, g: {h: 4}}).is({f: 3, g: {h: match.any()}});
assertThat({f: 3, g: {h: 4}}).is({f: 3, g: {h: match.optional(4)}});
assertThat({f: 3, g: {h: 4}}).is({f: 3, g: {h: match.allOf([match.number.greater(0), match.number.less(10)])}});
assertThat({f: 3, g: {h: "Hello"}}).is({
    f: 3,
    g: {h: match.anyOf([match.string.startsWith("H"), match.string.endsWith(".")])}
});
```

`match.any()` always matches:

```typescript
export class AnyMatcher<T> extends DiffMatcher<T> {
    complexity = 0

    static make<T>(): any {
        return new AnyMatcher();
    }

    matches(context: ContextOfValidationError, mismatched: Array<Mismatched>, actual: T): MatchResult {
        return MatchResult.wasExpected(actual, this.describe(), true);
    }

    describe(): any {
        return "any";
    }
}
```

`match.optional()` matches if the included `matcher` matches or the value is `undefined`.

```typescript
export class OptionalMatcher<T> extends DiffMatcher<T> {
    private constructor(private matcher: DiffMatcher<T>) {
        super();
        this.complexity = matcher.complexity
    }

    matches(actual: T): MatchResult {
        if (isUndefined(actual)) {
            return MatchResult.good();
        }
        return this.matcher.matches(actual);
    }

    describe(): any {
        return {optional: this.matcher.describe()};
    }

    static make<T>(matcher: DiffMatcher<T> | any): any {
        return new OptionalMatcher(matchMaker(matcher));
    }
}
```

`match.allOf()` matches if all included matchers match.

```typescript
export class AllOfMatcher<T> extends DiffMatcher<T> {
    private constructor(private matchers: Array<DiffMatcher<T>>) {
        super();
    }

    static make<T>(matchers: Array<DiffMatcher<T> | any>): any {
        const subMatchers = matchers.map(m => matchMaker(m)).filter(m => !(m instanceof AnyMatcher));
        switch (subMatchers.length) {
            case 0:
                return new AnyMatcher();
            case 1 :
                return subMatchers[0];
            default:
                return new AllOfMatcher(subMatchers);
        }
    }

    matches(actual: T): MatchResult {
        const incorrectMatchers: Array<DiffMatcher<T>> = [];
        this.matchers.forEach(m => {
            let matchResult = m.matches(actual);
            if (!matchResult.passed()) {
                incorrectMatchers.push(m);
            }
        });
        if (incorrectMatchers.length === 0) {
            return MatchResult.good(compares);
        }
        if (incorrectMatchers.length === 1) {
            // Just describe that specific one as an error
            const incorrect = incorrectMatchers[0];
            return MatchResult.wasExpected(actual, incorrect.describe(), false);
        }
        return MatchResult.wasExpected(actual, this.describe(), false);
    }

    describe(): any {
        return {allOf: this.matchers.map(m => m.describe())}
    }
}
```

`match.allOf()` is similar to that, but it stops as soon as it tries a `matcher` that succeeds.

## Aim 7: Match arrays too, in a simple way

eg:

```typescript
assertThat([1, 2, 3, [4, 5]]).is([1, 2, 3, [4, 5]]);
assertThat(["b", "x", "y"]).is(["a", "b", "c", "x"]);

```

Array matching is the most complex part of `mismatched`. Here's an extremely simple approach that is most unhelpful:

```typescript
export class ArrayMatcher<T> extends DiffMatcher<Array<T>> {
    private constructor(private elementMatchers: Array<DiffMatcher<T>>) {
        super();
    }

    static make<T>(expected: Array<DiffMatcher<T> | any>): any {
        return new ArrayMatcher<T>(expected.map(e => matchMaker(e)));
    }

    matches(actual: Array<T>): MatchResult {
        if (!ofType.isArray(actual) || actual.length !== this.elementMatchers.length) {
            return MatchResult.wasExpected(actual, this.describe(), false);
        }
        for (let i = 0; i < this.elementMatchers.length; i++) {
            if (!this.elementMatchers[i].matches(actual[i])) {
                return MatchResult.wasExpected(actual, this.describe(), false);
            }
        }
        return MatchResult.good();
    }

    describe(): any {
        return this.elementMatchers.map(e => e.describe());
    }
}
```

The real solution goes much further and solves the follows:
 * if any one element fails to match, we're informed of which element that is
 * If the actual value has insertions, deletions or replacement, we're provided with a useful diff

The solution utilises a standard diff library. 
However, it's complicated because:
 * The elements of an array may be nexted arrays/objects
 * A particular matcher may make a partial match against multiple elements.
The standard diff algorithm doesn't allow for such partial matches.

Eg, consider the following:
```typescript
assertThat([{f:{g:1, h:2}}, [{f:{g:1}}]]).is([{f:{g:2, h:2}}, [{f:{g:2}}]])
```

Here we get a better (partial) match of [{f:{g:1, h:2}}] with [{f:{g:2, h:2}}] over [{f:{g:2}}].

To allow for partial matches, we need to extend `MatchResult` and the rest of the code to track the quality of 
matches when they fail.

By the way, we also apply that diff algorithm to larger strings, to highlight the differences.

## Aim 8: Measure the quality of partial matches

As mentioned in the previous aim, providing good diffs on matching arrays requires that we measure the quality of partial matches.
This also applies to matching unordered arrays (bags) and sets, which we don't cover here.

There are four main cases for computing the quality of a match, which is called `matchRate` in `MatchResult`:
 * For a number, boolean, undefined, null, NaN the `matchRate` is either 0.0 or 1.0.
 * For a string the `matchRate` depends on the "similarity" of the actual and expected strings.
 * For an array, the `matchRate` depends on the accumulated `matchRates` of the associated elements (recursively)
 * For an object, the `matchRate` depends on the accumulated `matchRates` of the associated object fields (recursively)

Eg:
```typescript
assertThat(1).is(2); // matchRate of 0.0

assertThat("abcdefg").is("ABCDEFG"); // matchRate of 0.0
assertThat("abc").is("abcd"); // matchRate of 0.875
assertThat("abcdefg").is("abcdefgh"); // matchRate of 0.9375

assertThat([3]).is([2]); // matchRate of 0.0
assertThat([3, 4, 5, 6]).is([2, 4, 5, 6]); // matchRate of 0.6

assertThat({h: 3, i: 1}).is({h: 3, i: 222}); // matchRate of 0.5
assertThat({f: 2, g: {h: 3, i: 1}}).is({f: 2, g: {h: 3, i: 222}}); // matchRate of 0.67
```

We expand the constructor `MatchResult` to take the number of `compares` and the accumulated `matches`, to
compute the `matchRate`:

```typescript
export class MatchResult {

  constructor(public diff: any, public compares: number, public matches: number, public matchedObjectKey = false) {
    this.matchRate = compares === 0 ? 0.0 : matches / compares;
  }
}
```

The individual matchers then provide those values.

## Aim 9: Also provide for validating data

Much of the logic of `mismatched` so far is focussed on:
 * asserting values in unit tests
 * providing useful diff information when tests fail.

This is now extended to also provide for validating data, using the same matchers.
Validation differs in that we want a list of specific failures, indentified by context.

Eg, the following micro-test shows validation in action:

```typescript
it("fails as incorrect array, less simple", () => {
  const isNumber = match.ofType.number(); // matches if the actual value is a number
  const expected = [isNumber, isNumber, [isNumber, [isNumber]]];
  const validation = validateThat([1, 2, [3, ["s"]]]).satisfies(expected);
  assertThat(validation.passed()).is(false);
  assertThat(validation.errors).is([
    '{"actual[2]": [3, ["s"]], unexpected: ["s"]}',
    '{"actual[2]": [3, ["s"]], missing: ["ofType.number"]}'
  ]);
});
```

The result of the validateThat call, provides:
 * a `passed()` boolean value
 * a list if `errors`, each of which identify the position of the error within the `actual` value.

This requires additional code in the matchers, to also provide for such errors. 
This is managed with an extra method in `DiffMatcher`:

```typescript
export abstract class DiffMatcher<T> {

    // ...
    abstract mismatches(context: ContextOfValidationError, mismatched: Array<Mismatched>, actual: T): MatchResult;

    matches(actual: T): MatchResult {
      return this.mismatches(new ContextOfValidationError(), [], actual);
   }
}
```

All the matchers are changed so that their `matches()` method is renamed as `mismatches`, with additional arguments:
 * `context`: a full path to the point of an error, such as "actual[2]" or "actual.f[1].g"
 * `mismatched`: an accumulating array of mismatch details


## Aim 10: Improve the quality of matching in sets and unordered arrays (bags)

We haven't covered matching sets and bags, which are complicated like matching arrays.
One additional complication arises, illustrated by the following example:

```typescript
assertThat(new Set[1,2]).is(new Set[match.any(), 4, 1])
```

This fails to match, but what's the diff? The `match.any()` should match against the 2.
But if that matcher is tried first, it would match against the 1.

So the approach we take in this case is to apply more specific matchers before more general ones.
Eg, [1,{f:2, g:{h:3}}] is more specific than [1,{f:2, g:{h:match.any()}}], and so the former whould be applied first.

All matchers compute their _specificity_, with high values being more specific. 
`match.any()` has a specificity of 0.0. 
The specificity of an array or objects is the sum of the `specificity` of their elements.
This `specificity` is then used to determine the order in which matchers are applied when matching sets and bags.
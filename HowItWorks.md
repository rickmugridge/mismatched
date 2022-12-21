# How `mismatched` works

Note that it's not necessary to understand any of the following to use `mismatched`.

## Matching by example: `assertThat()` takes the actual value and sets up a matcher for the expected value

## `assertThat().is()` calls in the matchmaker

Aim: to layout what's expected using JS values, augmented with specialised matchers

## `assertThat().is()` calls into the created matcher, passing in the actual value

Matchers either succeed or provide a diff back, along with the count of compares and matches made. 

### Base cases

Primitive value
String

### Within `array` case
### Within `object` case
### Within `anyOf` case
### Within `allOf` case
### Within `optional` case
### Within `optionalNull` case
### Within `not` case

## Managing Object Keys
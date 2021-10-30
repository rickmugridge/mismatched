# Saving time with complex tests with `match.decompiledActual()`

Sometimes, when writing code involving complex, nested objects and arrays as inputs and outputs, it's
easier to develop the tests and code together, developing each test step after the code changes.
That's because it can be tedious to write the test first, especially when the displayed result can be 
hundreds of lines long.

This approach also applies to developers who write their tests afterwards.

So we can run the test code, manually check that the result is as expected, 
and then use that result in any checks/assertions.

However, it's not immediately obvious where those values have come from, 
as the result, or *actual* value, contains values that have been derived from the inputs. 
(This is especially so when a [builder pattern](https://en.wikipedia.org/wiki/Builder_pattern) 
is used to create the input values, where some values are randomly generated.)

But the *expected* values in the final test assertions need to be comprehensible in terms of the inputs, 
and independent of any randomness of a single test run.
However, it can be tedious, with complex structures, to revise them to be clear where the values came from.

We call this process "decompiling", for the want of a better word, 
so that values in the result are shown as being derived from the inputs (and any enums).

## Simple Example

Here's a unit test, which uses a `BusinessGraphBuilder` builder to create test input data:

```
   it('partyFromBusiness(). Unknown with no Persons', () => {
      const [businessCode, persons] = new BusinessGraphBuilder().addPerson().to()
      const detailTracker = new DetailTracker();
 
      const party = partyFromBusiness(businessCode, persons, detailTracker)
      assertThat(party).is({} as any) // Don't yet known what the result should be
    })
```

Running this, we can see that the result (from that run) was:

```
{
  id: "b500a511-32fc-4f17-8d7f-df30c5e9cd8f", version: "PersistedInitially", 
  partyType: "UnknownParty", relationships: [], subParties: [], 
  state: {
    timeline: [
      {
        value: "CURRENT", dateTime: {date: {}, microseconds: 0.571}, 
        modifiedBy: "unknown"
      }
    ], ignoreDelta: undefined
  }, created: {date: {}, microseconds: 0.566}, 
  UnknownParty: {
    timeline: {
      name: {
        timeline: [
          {
            value: "some-name-6", dateTime: {date: {}, microseconds: 0.571}, 
            modifiedBy: "unknown"
          }
        ], ignoreDelta: undefined
      }
    }
  }
}

```
Note the use of randomly-generated values here from the builder, such as the UUID of the id, "some-name-6" and the dates.
(Our builder creates a string value for a "name" field of the form "some-name-6", 
with the trailing number being distinct across strings generated, ensuring they are unique across objects.)

It's not clear where the various values come from. 
(This could be improved for generated strings in builders but not for other types, such as dates, numbers, etc.)

Let's call `match.decompiledActual()` to provide better information. This takes three arguments:
 1. The *actual* value (result)
 1. An object containing any input values of relevance - the *contributors*
 1. An object containing any enums of relevance

(Arguments 2 and 3 are each within an object so that both their names and their values are provided.)

Result from running
`match.decompiledActual(party, {businessCode, persons, detailTracker}, {PartyVersion, DomainType, DomainState)`:

```
{
  id: "ddce7506-856c-43ae-a9a8-d8ba9c70bf3c", version: PartyVersion.PersistedInitially, 
  partyType: DomainType.UnknownParty, relationships: [], subParties: [], 
  state: {
    timeline: [{value: businessCode.contacts[0].state, dateTime: detailTracker.dateOfModification, 
    modifiedBy: detailTracker.modifiedBy}], ignoreDelta: undefined
  }, created: businessCode.inserted, 
  UnknownParty: {
    timeline: {
      name: {
        timeline: [{value: businessCode.name, dateTime: detailTracker.dateOfModification, 
        modifiedBy: detailTracker.modifiedBy}], ignoreDelta: undefined
      }
    }
  }
}
```

We can now easily clean it up to use it in our assertion:

```
      assertThat(party).is({
        id: match.any(), version: PartyVersion.PersistedInitially,
        partyType: PartyType.UnknownParty, relationships: [], subParties: [],
        state: {
          timeline: [{value: businessCode.contacts![0].state, dateTime: detailTracker.dateOfModification,
            modifiedBy: detailTracker.modifiedBy}]
        }, created: businessCode.inserted,
        UnknownParty: {
          timeline: {
            name: {
              timeline: [{value: businessCode.name, dateTime: detailTracker.dateOfModification,
                modifiedBy: detailTracker.modifiedBy}]
            }
          }
        }
      })
```

## Limitations, requiring some disambiguation

 * If a value could come from several *contributors*, it just shows one of them.
 * If several enums have the same value, it just shows one of them.
   For example the value "UnknownParty" is shown to be from the enum value `DomainType.UnknownParty` 
   but it was actually from `PartyType.UnknownParty`.

Things that can help:
 * Use a builder that generates values sufficiently randomly, where possible,
   across all object values, including strings.
 * Use string-based enums and make the values distinct across enums
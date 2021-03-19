# Decompiled Actual: Saving time with complex tests

You've just written a test involving inputs of complex, nested objects and arrays.
The output from the tested code is equally complex. 
We call this output the *actual* value, as compared to the *expected* value (a matcher, etc).

However, the actual value contains values that have been derived from the inputs.
It's not necessarily obvious where those values have come from, 
especially when a builder pattern is used to create the input values. 
And especially when values are somewhat random.

To make the expected value comprehensible, we need to revise it to be clear where the values within it come from.
This can be rather tedious with complex structures.

We call this "decompiling", for the want of a better word. 
But it's really being clear about how the values in the result were derived from the inputs (and any enums).

Here's a unit test, which uses a `BusinessGraphBuilder` builder to create test input data:

```
   it('Unknown with no Persons', () => {
      const [businessCode, []] = new BusinessGraphBuilder().addPerson().toPartyGraph()
      const detailTracker = new DetailTracker();
      const party = asParty.fromBusiness(businessCode, [], detailTracker)

      match.decompiledActual(party, {}, {})
      // match.decompiledActual(party, {}, {PartyVersion, DomainType, DomainState)
      // match.decompiledActual(party, {businessCode, detailTracker}, {PartyVersion, DomainType, DomainState)
    })
```

The call to `decompiledActual(party, {}, {})` displays the bare result without alteration:

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
It's not clear where the various values come from. 

Let's call `match.decompiledActual(party, {}, {PartyVersion, DomainType, DomainState)` instead. 
The third argument is a list of relevant enums.
The output now identifies where enum values are being used (eg, the `partyType` field below):

```
{
  id: "9eee6a40-8c37-4030-8729-69d551366170", version: PartyVersion.PersistedInitially, 
  partyType: DomainType.UnknownParty, relationships: [], subParties: [], 
  state: {
    timeline: [
      {
        value: DomainState.Current, dateTime: {date: {}, microseconds: 0.814}, 
        modifiedBy: "unknown"
      }
    ], ignoreDelta: undefined
  }, created: {date: {}, microseconds: 0.809}, 
  UnknownParty: {
    timeline: {
      name: {
        timeline: [
          {
            value: "some-name-6", dateTime: {date: {}, microseconds: 0.814}, 
            modifiedBy: "unknown"
          }
        ], ignoreDelta: undefined
      }
    }
  }
}
```

Now let's feed in the inputs into the second argument, calling 
`match.decompiledActual(party, {businessCode, detailTracker}, {PartyVersion, DomainType, DomainState)` instead:

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

Of course, this is particularly effective when the inputs and results are more complex.
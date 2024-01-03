# IdentifySources to improve some tests

## Rationale

Consider when unit and acceptance tests involve multiple larger nested objects.
It can take considerable time to complete the tests, including the validations (ie, `assertThat()`).

For example, we have an Order with a list of OrderItems for various Products.
We have lots of Products defined.
Our system produces an OnlineSummary prior to payment.
This includes details from the Order, date, customer, and the OrderItems with related Product information.

To validate the resulting summary, we need to check the information supplied against the Orders, Products, etc,
and any calculations.

That can take a lot of detailed time to define what we expect.
Writing the validations can be painful, so I'm incline to start with these steps:

* Create the various objects needed. I use [builders](./PrimitiveBuilder.md) for doing this,
  as well prepared examples.
  Note that these values could be inserted and then accessed via a database.
* Run the code to produce the expected `result`
* `PrettyPrinter.logToConsole(result)`. This provides a much more useful display than using `console.log()` with or
  without JSON.stringify()

Here's an example test with very simplified objects (see `primitiveBuilder.localTest.ts` for the code):

```
    it("OnLineSummary", () => {
        const products = primitiveBuilder.arrayOf(() => new ProductBuilder().to(), 2, 10)
        const productIds = products.map(p => p.productId)
        const order = new OrderBuilder().withItems(...).to()
        const result: OnLineSummary = onlineSummary(order, products)
        PrettyPrinter.logToConsole(result)
    })
```

So now we see the result and can check it, eg:

```
{
  customerName: "customerName-8100", 
  customerDetails: {
    deliveryAddress: "deliveryAddress-5690", email: "email-319"
  }, 
  items: [
    {
      productId: "productId-1", productName: "productName-1366", 
      productType: "Urgent", productDescription: "description-5038", quantity: 2, 
      pricePerUnit: 22.28, price: 44.56
    }, 
    {
      productId: "productId-2", productName: "productName-1209", 
      productType: "Urgent", productDescription: "description-6840", quantity: 9, 
      pricePerUnit: 28.1, price: 252.9
    }, 
    {
      productId: "productId-3", productName: "productName-7047", 
      productType: "Urgent", productDescription: "description-3974", quantity: 5, 
      pricePerUnit: 25.27, price: 126.35
    }
  ]
}
```

Does it make sense? Lots of cross-checking is required.
And to do that we may need to display the generated input objects.
Eg, is this LineItem `productDescription` the right one, given the OrderItem and Product involved?

If that result looks right, we can paste it into the `assertThat()`.
But then we need to do various adjustments to make the test useful and to ensure that the
expected result is of the same type as the result type:

* Replace each enum value (strings and numbers) with the `Enum.Value`, such as `ProductType.Urgent`.
* Replace each arbitrary string or numbers by a reference into the corresponding inputs, such as OrderItems.
  Eg, replace `22.28` by `products[0].price`. This means that, later, code readers can see
  exactly where data came from, rather than having to scan back and forth between multiple object displays.
* Replace each whole object or array by a reference into the corresponding inputs, such as an Order.
  Eg, replace `{deliveryAddress: "deliveryAddress-5690", email: "email-319"}` by `order.customerDetails`.

## Making life easier

We can make life much easier for both the test writer and subsequence test readers:
We automate much of the task of creating useful validations.

In our test above, we can replace the last line (PrettyPrinter) by this:

```
        match.identifySources(result, {order, products}, {ProductType: ProductType})
```

The arguments to `match.identifySources()` are as follows:

* The computed result
* An object containing references to the sources of data used in the computation.
* An optional object containing any enums that may be used.

The second and third arguments are supplied as objects so we have names for them.

Here's the output of running this now:

```
{
  customerName: order.customerName, customerDetails: order.customerDetails, 
  items: [
    {
      productId: products[0].productId, productName: products[0].productName, 
      productType: ProductType.OutOfStock, productDescription: products[0].description, 
      quantity: order.items[0].quantity, pricePerUnit: products[0].price, 
      price: 60.24
    }, 
    {
      productId: products[1].productId, productName: products[1].productName, 
      productType: ProductType.OutOfStock, productDescription: products[1].description, 
      quantity: order.items[1].quantity, pricePerUnit: products[1].price, 
      price: 287.54
    }, 
    {
      productId: products[2].productId, productName: products[2].productName, 
      productType: products[2].productType, productDescription: products[2].description, 
      quantity: order.items[2].quantity, pricePerUnit: products[2].price, 
      price: 393.15
    }
  ]
}
```

The call to `match.identifySources()` uses `PrettyPrinter` to display the result.
This is needed, so that the display can include code like `products[0].productId`
and `ProductType.Urgent`.

So now we can check that with much more ease, make a few updates (to `price`), and paste it into the test to complete it.
Eg:

```
       ...
       const result: OnLineSummary = onlineSummary(order, products)
       assertThat(result).is({
                customerName: order.customerName, customerDetails: order.customerDetails,
                items: [
                    {
                        productId: products[0].productId, productName: products[0].productName,
                        productType: ProductType.OutOfStock, productDescription: products[0].description,
                        quantity: order.items[0].quantity, pricePerUnit: products[0].price,
                        price: order.items[0].quantity * products[0].price
                    },
                    {
                        ...
                    },
                    {
                        ...
                    }
                ]
            }
        )
    })
```

Of course, this could be cleaned up further, but we won't do that here.

## When sources are ambiguous

Many times, simple values like 0 may come from multiple sources. 
If there are only a few such sources, `match.identifySources()` displays the possibilities, separated by "|".
Eg `products[0].productName | products[1].productName`. 
When there are more possibilities, or none, it simply shows that value. 
Eg, the OrderItem `price` has no direct source.

## Summary

When writing tests with several non-trivial objects involved, we can often reduce parts of the effort by automation. 
`match.identifySources()` does the work of determining likely sources of data that is carried from 
input objects into the results of computations.

Not only does this speed up test writing, it generates tests that will be easier to read (and change) in the future.






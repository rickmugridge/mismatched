import {primitiveBuilder} from "../builder/primitiveBuilder";
import {assertThat} from "../assertThat";

describe("OneLineSummary", () => {
    it("OnLineSummary", () => {
        const products = primitiveBuilder.arrayOf(() => new ProductBuilder().to(), 3, 3)
        const order = new OrderBuilder().withItems(
            products.map((product) =>
                new OrderItemBuilder().withProductId(product.productId).to())
        ).to()
        const result: OnLineSummary = onlineSummary(order, products)
        // PrettyPrinter.logToConsole(result)
        // match.identifySources(result, {order, products}, {ProductType: ProductType})
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
                        productId: products[1].productId, productName: products[1].productName,
                        productType: ProductType.OutOfStock, productDescription: products[1].description,
                        quantity: order.items[1].quantity, pricePerUnit: products[1].price,
                        price: order.items[1].quantity * products[1].price
                    },
                    {
                        productId: products[2].productId, productName: products[2].productName,
                        productType: products[2].productType, productDescription: products[2].description,
                        quantity: order.items[2].quantity, pricePerUnit: products[2].price,
                        price: order.items[2].quantity * products[2].price
                    }
                ]
            }
        )
    })
})

const onlineSummary = (order: Order, products: Product[]): OnLineSummary => {
    return {
        customerName: order.customerName,
        customerDetails: order.customerDetails,
        items: order.items.map(orderItem => {
            const product = products.find(p => p.productId == orderItem.productId)!
            return {
                productId: product.productId,
                productName: product.productName,
                productType: product.productType,
                productDescription: product.description,
                quantity: orderItem.quantity,
                pricePerUnit: product.price,
                price: orderItem.quantity * product.price
            }
        })

    }
}

// This example has many over-simplifications in order to constrain the size of the example
type Order = {
    customerName: string,
    customerDetails: CustomerDetails
    items: OrderItem[]
}

type CustomerDetails = {
    email: string,
    deliveryAddress: string
}

type OrderItem = {
    productId: string,
    quantity: number
}

class OrderBuilder {
    order: Order = {
        customerName: primitiveBuilder.aString("customerName"),
        customerDetails: {
            deliveryAddress: primitiveBuilder.aString("deliveryAddress"),
            email: primitiveBuilder.aString("email")
        },
        items: []
    }

    withItems(items: OrderItem[]): this {
        this.order.items = items
        return this
    }

    to(): Order {
        return this.order
    }
}

class OrderItemBuilder {
    orderItem: OrderItem = {
        productId: primitiveBuilder.stringInSequence("productId"),
        quantity: primitiveBuilder.int(1, 10)
    }

    withProductId(productId: string): this {
        this.orderItem.productId = productId
        return this
    }

    to(): OrderItem {
        return this.orderItem
    }
}

type Product = {
    productId: string,
    productType: ProductType,
    productName: string
    description: string,
    price: number
}

enum ProductType {Urgent = "Urgent", OutOfStock = "OutOfStock"}

class ProductBuilder {
    product: Product = {
        productId: primitiveBuilder.stringInSequence("productId"),
        productType: primitiveBuilder.anyEnum(ProductType),
        productName: primitiveBuilder.aString("productName"),
        description: primitiveBuilder.aString("description"),
        price: primitiveBuilder.decimal(2, 1.00, 100.0)
    }

    to(): Product {
        return this.product
    }
}

type OnLineSummary = {
    customerName: string,
    customerDetails: CustomerDetails
    items: LineItem[]
}

type LineItem = {
    productId: string,
    productName: string
    productType: ProductType,
    productDescription: string
    quantity: number
    pricePerUnit: number,
    price: number
}
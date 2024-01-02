import {Date} from "fast-check/lib/types/utils/globals";
import {primitiveBuilder, TimeUnit} from "./primitiveBuilder";
import {assertThat} from "../assertThat";

type Delivery = {
    id: string,
    ofType: DeliveryType,
    details: string,
    effectiveFrom: Date,
    isForSupplier: string,
    hasSupplierCategory: string,
    orders: Order[]
}

export class DeliveryBuilder {
    delivery: Delivery = {
        id: "some id",
        ofType: DeliveryType.Urgent,
        details: "some details",
        effectiveFrom: new Date(),
        isForSupplier: "supplier",
        hasSupplierCategory: "category",
        orders: []
    }

    withOfType(ofType: DeliveryType): this {
        this.delivery.ofType = ofType
        return this
    }

    withDetails(details: string): this {
        this.delivery.details = details
        return this
    }

    addOrders(orders: Order[]): this {
        orders.forEach(order => this.delivery.orders.push(order))
        return this
    }

    to(): Delivery {
        return this.delivery
    }
}

const _eg = () => {
    const delivery = new DeliveryBuilder()
        .withOfType(DeliveryType.Urgent)
        .withDetails("new details")
        .addOrders([])
        .to()

    const updatedDelivery: Delivery = {
        id: "delivery#" + primitiveBuilder.aString("id"),
        ofType: primitiveBuilder.anyEnum(DeliveryType),
        details: primitiveBuilder.aString("details"),
        effectiveFrom: primitiveBuilder.date(TimeUnit.Days, 0, 14),
        isForSupplier: primitiveBuilder.aString("isForSupplier"),
        hasSupplierCategory: primitiveBuilder.aString("hasSupplierCategory"),
        orders: []
    }

    assertThat(updatedDelivery.effectiveFrom).is(delivery.effectiveFrom)
}

enum DeliveryType {
    Urgent = "Urgent"
}

type Order = {}


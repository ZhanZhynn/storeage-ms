import { describe, expect, it } from "vitest";
import { createInvoiceSchema } from "./invoice";
import { createOrderSchema } from "./order";

describe("transaction currency validation", () => {
  it("defaults new orders to MYR and accepts supported currencies", () => {
    const order = createOrderSchema.parse({
      items: [{ productId: "product-1", quantity: 1 }],
    });
    expect(order.currency).toBe("MYR");
    expect(
      createOrderSchema.parse({
        currency: "USD",
        items: [{ productId: "product-1", quantity: 1 }],
      }).currency,
    ).toBe("USD");
  });

  it("rejects unsupported currencies and allows invoices to inherit an order currency", () => {
    expect(() =>
      createOrderSchema.parse({
        currency: "EUR",
        items: [{ productId: "product-1", quantity: 1 }],
      }),
    ).toThrow();
    expect(
      createInvoiceSchema.parse({
        orderId: "order-1",
        dueDate: "2026-07-24",
      }).currency,
    ).toBeUndefined();
  });
});

import { describe, expect, it } from "vitest";
import { receiveBodySchema } from "./receiving";

describe("receiveBodySchema", () => {
  const base = { warehouseId: "warehouse", poId: "po", items: [{ productId: "product", poItemId: "line" }] };

  it("accepts structured accepted, damaged, and shortage quantities", () => {
    expect(receiveBodySchema.safeParse({ ...base, items: [{ ...base.items[0], acceptedQuantity: 3, damagedQuantity: 1, shortageQuantity: 2 }] }).success).toBe(true);
  });

  it("rejects an empty receipt line", () => {
    expect(receiveBodySchema.safeParse({ ...base, items: [{ ...base.items[0], acceptedQuantity: 0 }] }).success).toBe(false);
  });

  it("accepts inspection photo URLs and actual landed costs", () => {
    expect(receiveBodySchema.safeParse({ ...base, actualFreightMyr: 12.5, items: [{ ...base.items[0], acceptedQuantity: 1, inspectionPhotoUrls: ["https://example.com/inspection.jpg"] }] }).success).toBe(true);
  });
});

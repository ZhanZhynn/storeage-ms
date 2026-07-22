import { describe, expect, it } from "vitest";
import { allocateLandedCost, estimateLandedCost } from "./landed-cost";

describe("estimateLandedCost", () => {
  it("includes freight, duty, tax, and other costs in unit landed cost", () => {
    expect(estimateLandedCost({ quantity: 100, unitPriceCny: 10, fxRate: 0.65, freightMyr: 100, dutyRate: 10, taxRate: 6, otherCostMyr: 50 })).toMatchObject({ goodsMyr: 650, dutyMyr: 75, taxMyr: 49.5, totalMyr: 924.5, unitLandedMyr: 9.245 });
  });
});

describe("allocateLandedCost", () => {
  it("allocates actual charges by accepted quantity without losing rounding cents", () => {
    expect(allocateLandedCost(10, [1, 2, 3])).toEqual([1.67, 3.33, 5]);
  });

  it("does not allocate a charge when nothing was accepted", () => {
    expect(allocateLandedCost(10, [0, 0])).toEqual([0, 0]);
  });
});

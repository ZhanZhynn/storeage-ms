export type LandedCostInput = {
  quantity: number;
  unitPriceCny: number;
  fxRate: number;
  freightMyr?: number;
  dutyRate?: number;
  taxRate?: number;
  otherCostMyr?: number;
};

/** Calculates an estimate only; it never changes the approved quote or PO snapshot. */
export function estimateLandedCost(input: LandedCostInput) {
  const goodsMyr = input.quantity * input.unitPriceCny * input.fxRate;
  const freightMyr = input.freightMyr ?? 0;
  const dutyMyr = (goodsMyr + freightMyr) * (input.dutyRate ?? 0) / 100;
  const taxMyr = (goodsMyr + freightMyr + dutyMyr) * (input.taxRate ?? 0) / 100;
  const otherCostMyr = input.otherCostMyr ?? 0;
  const totalMyr = goodsMyr + freightMyr + dutyMyr + taxMyr + otherCostMyr;
  return { goodsMyr, freightMyr, dutyMyr, taxMyr, otherCostMyr, totalMyr, unitLandedMyr: input.quantity ? totalMyr / input.quantity : 0 };
}

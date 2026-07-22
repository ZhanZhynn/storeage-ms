import { describe, expect, it } from "vitest";
import {
  convertMoney,
  formatMoney,
  fromStripeMinorUnits,
  resolveTransactionCurrency,
  roundMoney,
  toStripeMinorUnits,
} from "./money";

describe("money", () => {
  it("formats MYR and CNY with explicit currencies", () => {
    expect(formatMoney(12.5, "MYR")).toContain("RM");
    expect(formatMoney(12.5, "CNY")).not.toContain("RM");
  });

  it("converts and rounds only at the target currency boundary", () => {
    expect(convertMoney(12.5, 0.602882)).toBe(7.54);
    expect(roundMoney(1.005)).toBe(1.01);
  });

  it("rejects invalid rates", () => {
    expect(() => convertMoney(1, 0)).toThrow("positive exchange rate");
  });

  it("uses MYR for legacy records and converts Stripe minor units", () => {
    expect(resolveTransactionCurrency(undefined)).toBe("MYR");
    expect(resolveTransactionCurrency("USD")).toBe("USD");
    expect(toStripeMinorUnits(12.345, "USD")).toBe(1235);
    expect(fromStripeMinorUnits(1235, "USD")).toBe(12.35);
  });
});

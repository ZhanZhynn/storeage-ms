import { describe, expect, it } from "vitest";
import { calculateBusinessDueAt, defaultSourcingSlaConfig, normalizeSourcingSlaConfig } from "./sla";

describe("sourcing SLA business time", () => {
  it("counts only configured business hours", () => {
    const due = calculateBusinessDueAt(new Date("2024-05-06T08:00:00.000Z"), 2, defaultSourcingSlaConfig);
    expect(due.toISOString()).toBe("2024-05-06T11:00:00.000Z");
  });

  it("skips weekends in the workspace schedule", () => {
    const due = calculateBusinessDueAt(new Date("2024-05-03T16:00:00.000Z"), 2, defaultSourcingSlaConfig);
    expect(due.toISOString()).toBe("2024-05-06T10:00:00.000Z");
  });

  it("keeps legacy workspaces on a complete default policy", () => {
    expect(normalizeSourcingSlaConfig({ timezone: "not-a-timezone", escalation: { recipientIds: ["a", "a"], thresholdHours: -1 } })).toMatchObject({
      timezone: "UTC",
      escalation: { thresholdHours: 24, recipientIds: ["a"] },
      rules: defaultSourcingSlaConfig.rules,
    });
  });

  it("falls back when legacy business hours are reversed", () => {
    expect(normalizeSourcingSlaConfig({ businessHours: { start: "17:00", end: "09:00", weekdays: [1] } }).businessHours).toMatchObject({ start: "09:00", end: "17:00", weekdays: [1] });
  });
});

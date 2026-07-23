import type { Prisma } from "@prisma/client";

export const sourcingSlaRules = [
  "first_response",
  "quote_submission",
  "approval",
  "shipment",
] as const;
export type SourcingSlaRule = (typeof sourcingSlaRules)[number];

export type SourcingSlaConfig = {
  timezone: string;
  businessHours: { start: string; end: string; weekdays: number[] };
  rules: Record<SourcingSlaRule, number>;
  escalation: { thresholdHours: number; recipientIds: string[] };
};

export const defaultSourcingSlaConfig: SourcingSlaConfig = {
  timezone: "UTC",
  businessHours: { start: "09:00", end: "17:00", weekdays: [1, 2, 3, 4, 5] },
  rules: { first_response: 8, quote_submission: 24, approval: 16, shipment: 48 },
  escalation: { thresholdHours: 24, recipientIds: [] },
};

function validTimezone(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

/** Safely reads legacy/missing workspace config and fills all new fields. */
export function normalizeSourcingSlaConfig(value: unknown): SourcingSlaConfig {
  const input = value && typeof value === "object" ? value as Partial<SourcingSlaConfig> : {};
  const hours = input.businessHours;
  const rules = input.rules;
  const escalation = input.escalation;
  const start = /^([01]\d|2[0-3]):[0-5]\d$/.test(hours?.start || "") ? hours!.start : defaultSourcingSlaConfig.businessHours.start;
  const end = /^([01]\d|2[0-3]):[0-5]\d$/.test(hours?.end || "") ? hours!.end : defaultSourcingSlaConfig.businessHours.end;
  const validHours = start < end;
  return {
    timezone: validTimezone(input.timezone) ? input.timezone : defaultSourcingSlaConfig.timezone,
    businessHours: {
      start: validHours ? start : defaultSourcingSlaConfig.businessHours.start,
      end: validHours ? end : defaultSourcingSlaConfig.businessHours.end,
      weekdays: Array.isArray(hours?.weekdays) && hours.weekdays.length && hours.weekdays.every((day) => Number.isInteger(day) && day >= 1 && day <= 7)
        ? [...new Set(hours.weekdays)] : defaultSourcingSlaConfig.businessHours.weekdays,
    },
    rules: Object.fromEntries(sourcingSlaRules.map((rule) => [rule, typeof rules?.[rule] === "number" && rules[rule] > 0 ? rules[rule] : defaultSourcingSlaConfig.rules[rule]])) as Record<SourcingSlaRule, number>,
    escalation: {
      thresholdHours: typeof escalation?.thresholdHours === "number" && escalation.thresholdHours >= 0 ? escalation.thresholdHours : defaultSourcingSlaConfig.escalation.thresholdHours,
      recipientIds: Array.isArray(escalation?.recipientIds) ? [...new Set(escalation.recipientIds.filter((id): id is string => typeof id === "string" && id.length > 0))] : [],
    },
  };
}

function zonedParts(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((item) => item.type === type)?.value || 0);
  const weekday = parts.find((item) => item.type === "weekday")?.value;
  return { weekday: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekday || "") || 7, minuteOfDay: part("hour") * 60 + part("minute") };
}

/** Adds working minutes in the workspace timezone. Minute iteration preserves DST boundaries. */
export function calculateBusinessDueAt(startedAt: Date, hours: number, config: SourcingSlaConfig): Date {
  const [startHour, startMinute] = config.businessHours.start.split(":").map(Number);
  const [endHour, endMinute] = config.businessHours.end.split(":").map(Number);
  const opening = startHour! * 60 + startMinute!;
  const closing = endHour! * 60 + endMinute!;
  if (closing <= opening) return new Date(startedAt.getTime() + hours * 3600000);
  let cursor = new Date(Math.ceil(startedAt.getTime() / 60000) * 60000);
  let minutesRemaining = Math.ceil(hours * 60);
  while (minutesRemaining > 0) {
    const local = zonedParts(cursor, config.timezone);
    if (config.businessHours.weekdays.includes(local.weekday) && local.minuteOfDay >= opening && local.minuteOfDay < closing) minutesRemaining -= 1;
    cursor = new Date(cursor.getTime() + 60000);
  }
  return cursor;
}

export function dueAtForSourcingSla(rule: SourcingSlaRule, startedAt: Date, config: SourcingSlaConfig) {
  return calculateBusinessDueAt(startedAt, config.rules[rule], config);
}

export async function completeSourcingSla(
  tx: Prisma.TransactionClient,
  caseId: string,
  rule: SourcingSlaRule,
  completedAt: Date,
) {
  const open = await tx.sourcingSlaRecord.findFirst({ where: { caseId, rule, completedAt: null }, orderBy: { startedAt: "desc" } });
  if (!open) return;
  await tx.sourcingSlaRecord.update({ where: { id: open.id }, data: { completedAt, onTime: completedAt <= open.dueAt } });
}

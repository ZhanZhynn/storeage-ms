import { describe, expect, it } from "vitest";
import { sourcingCommentSchema } from "./sourcing";

describe("sourcingCommentSchema", () => {
  it("accepts a trimmed comment and explicit mentions", () => {
    expect(sourcingCommentSchema.parse({ body: "  Please review this. ", mentionedUserIds: ["user-1"] })).toEqual({ body: "Please review this.", mentionedUserIds: ["user-1"] });
  });

  it("rejects blank comments and duplicate mentions", () => {
    expect(sourcingCommentSchema.safeParse({ body: "   " }).success).toBe(false);
    expect(sourcingCommentSchema.safeParse({ body: "Review", mentionedUserIds: ["user-1", "user-1"] }).success).toBe(false);
  });
});

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
    ...authTables,
    staffUsers: defineTable({
        name: v.string(),
        email: v.string(),
        role: v.string(), // "admin", "staff"
        status: v.string(), // "active", "inactive"
        createdAt: v.number(),
        authUserId: v.optional(v.string()),
    }).index("by_email", ["email"])
        .index("by_auth_user_id", ["authUserId"]),
    messages: defineTable({
        body: v.string(),
        authorName: v.optional(v.string()),
        authorEmail: v.optional(v.string()),
        edited: v.optional(v.boolean()),
        pinned: v.optional(v.boolean()),
        timestamp: v.number(),
    }),
    inquiries: defineTable({
        name: v.string(),
        email: v.string(),
        plan: v.string(),
        message: v.string(),
        status: v.string(), // "pending", "replied"
    }),
});

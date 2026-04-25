import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    messages: defineTable({
        body: v.string(),
        author: v.string(),
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

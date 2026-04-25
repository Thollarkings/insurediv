import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listInquiries = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("inquiries").order("desc").take(100);
    },
});

export const addInquiry = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        plan: v.string(),
        message: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("inquiries", {
            ...args,
            status: "pending",
        });
    },
});

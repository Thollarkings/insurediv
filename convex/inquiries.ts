import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listInquiries = query({
    args: {},
    handler: async (ctx) => {
        // Check if user is authenticated
        const userIdentity = await ctx.auth.getUserIdentity();
        if (!userIdentity) {
            // Return empty array for unauthenticated users instead of throwing error
            return [];
        }

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
        // Public contact form - no authentication required
        await ctx.db.insert("inquiries", {
            ...args,
            status: "pending",
        });
    },
});

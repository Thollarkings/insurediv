import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listMessages = query({
    args: {},
    handler: async (ctx) => {
        const userIdentity = await ctx.auth.getUserIdentity();
        if (!userIdentity) {
            return [];
        }

        const messages = await ctx.db.query("messages").order("desc").take(50);

        const messagesWithNames = await Promise.all(
            messages.map(async (msg) => {
                let authorName = msg.author;
                
                // If author is missing or looks like an email, resolve it from staffUsers
                if (!authorName || authorName.includes('@')) {
                    if (msg.authorEmail) {
                        const staff = await ctx.db
                            .query("staffUsers")
                            .withIndex("by_email", (q) => q.eq("email", msg.authorEmail))
                            .first();
                        if (staff) {
                            authorName = staff.name;
                        }
                    }
                }
                
                return {
                    ...msg,
                    author: authorName || "Unknown",
                };
            })
        );

        return messagesWithNames;
    },
});

export const send = mutation({
    args: { body: v.string() },
    handler: async (ctx, { body }) => {
        const userIdentity = await ctx.auth.getUserIdentity();
        if (!userIdentity) {
            throw new Error("Unauthorized");
        }

        const email = userIdentity.email ?? "";
        // Use explicit name if available, otherwise derive from email
        const fallbackName = userIdentity.name ?? email.split('@')[0] ?? "Staff";

        const staffUser = await ctx.db
            .query("staffUsers")
            .withIndex("by_email", (q) => q.eq("email", email))
            .first();

        // Prefer staffUsers name, fallback to identity-derived name
        const author = staffUser?.name || fallbackName;

        await ctx.db.insert("messages", {
            body,
            author,
            authorEmail: email,
            timestamp: Date.now(),
        });
    },
});

export const clearMessages = mutation({
    args: {},
    handler: async (ctx) => {
        const userIdentity = await ctx.auth.getUserIdentity();
        if (!userIdentity) {
            throw new Error("Unauthorized");
        }

        const messages = await ctx.db.query("messages").collect();
        for (const msg of messages) {
            await ctx.db.delete(msg._id);
        }
    },
});

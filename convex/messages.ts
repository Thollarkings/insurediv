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

        // Resolve author names for all messages
        const messagesWithNames = await Promise.all(
            messages.map(async (msg) => {
                // Try to resolve name from staffUsers via authorEmail (new messages)
                // or via author field matching staff name (old messages)
                let staff = null;
                if (msg.authorEmail) {
                    staff = await ctx.db
                        .query("staffUsers")
                        .withIndex("by_email", (q) => q.eq("email", msg.authorEmail))
                        .first();
                } else if (msg.author) {
                    // Old message: try to find staff by name
                    staff = await ctx.db
                        .query("staffUsers")
                        .filter((q) => q.eq(q.field("name"), msg.author))
                        .first();
                }
                const authorName = staff?.name || msg.author || "Unknown";
                return {
                    ...msg,
                    author: authorName,
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

        const staffUser = await ctx.db
            .query("staffUsers")
            .withIndex("by_email", (q) => q.eq("email", email))
            .first();

        // Resolve author name (use || to treat empty strings as falsy)
        const author =
            staffUser?.name ||
            userIdentity.name ||
            email ||
            "Unknown Staff";

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

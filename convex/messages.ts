import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ========== MESSAGE FUNCTIONS ==========

export const listMessages = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const messages = await ctx.db.query("messages").order("desc").take(50);

        // Convex Auth password provider uses email as account ID (subject)
        const currentUserEmail = (identity.email || identity.subject || "").toString();

        // Resolve author names from staffUsers table using email
        const messagesWithNames = await Promise.all(
            messages.map(async (msg) => {
                let authorName = msg.author;

                // If author is "Unknown" or missing, try to resolve from staffUsers
                if (!authorName || authorName === "Unknown") {
                    const email = msg.authorEmail || currentUserEmail;
                    if (email) {
                        const staff = await ctx.db
                            .query("staffUsers")
                            .withIndex("by_email", (q: any) => q.eq("email", email))
                            .first();
                        if (staff) {
                            authorName = staff.name;
                        } else {
                            // Fallback to email prefix
                            authorName = email.split('@')[0];
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
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        // Convex Auth password provider uses email as account ID (subject)
        const email = (identity.email || identity.subject || "").toString();

        // Look up staff user by email (primary identifier)
        let authorName = identity.name || email.split('@')[0] || "Unknown";

        if (email) {
            const staff = await ctx.db
                .query("staffUsers")
                .withIndex("by_email", (q: any) => q.eq("email", email))
                .first();

            if (staff) {
                authorName = staff.name;
            }
        }

        await ctx.db.insert("messages", {
            body,
            author: authorName,
            authorEmail: email,
            timestamp: Date.now(),
        });
    },
});

export const clearMessages = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const messages = await ctx.db.query("messages").collect();
        for (const msg of messages) {
            await ctx.db.delete(msg._id);
        }
    },
});

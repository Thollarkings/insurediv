import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * List messages with author name, pinned first then by timestamp ascending (oldest first).
 * We fetch up to 50 pinned messages and up to 50 non-pinned messages, then combine
 * with pinned first, and limit to 50 total.
 * Returns oldest first so that flex-col-reverse in UI shows newest at bottom.
 */
export const listMessages = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        // Fetch pinned messages (oldest first)
        const pinnedMessages = await ctx.db
            .query("messages")
            .filter((q) => q.eq(q.field("pinned"), true))
            .order("asc")
            .take(50);

        // Fetch non-pinned messages (oldest first)
        const nonPinnedMessages = await ctx.db
            .query("messages")
            .filter((q) => q.eq(q.field("pinned"), false))
            .order("asc")
            .take(50);

        // Combine: pinned first, then non-pinned, and take at most 50 total
        const combined = [...pinnedMessages, ...nonPinnedMessages].slice(0, 50);

        // Return messages oldest first (flex-col-reverse will flip to newest at bottom)
        return combined;
    },
});

/**
 * Send a new message.
 * - Requires authentication.
 * - Looks up author name from staffUsers table using reliable email from auth.
 * - Stores authorName, authorEmail (optional), body, timestamp, edited=false, pinned=false.
 */
export const sendMessage = mutation({
    args: { body: v.string() },
    handler: async (ctx, { body }) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        // Trim and validate body
        const trimmedBody = body.trim();
        if (trimmedBody === "") {
            throw new Error("Message body cannot be empty");
        }
        if (trimmedBody.length > 5000) {
            throw new Error("Message body too long (max 5000 characters)");
        }

        // Get reliable email by looking up auth account (same method as getCurrentUser)
        const userId = identity.subject.split("|")[0];
        const authAccounts = await ctx.db.query("authAccounts").collect();
        const authAccount = authAccounts.find((a: any) => a.userId === userId);
        const email = authAccount?.providerAccountId || identity.email || "";

        // Look up staff user by reliable email to get author name
        let authorName = identity.name || email.split("@")[0] || "Unknown";
        if (email) {
            const staff = await ctx.db
                .query("staffUsers")
                .withIndex("by_email", (q) => q.eq("email", email))
                .first();
            if (staff) {
                authorName = staff.name;
            }
        }

        // Insert message with default values for new fields
        await ctx.db.insert("messages", {
            body: trimmedBody,
            authorName,
            authorEmail: email || undefined,
            edited: false,
            pinned: false,
            timestamp: Date.now(),
        });
    },
});

/**
 * Fix the authorName for all messages by looking up the staff user by authorEmail.
 * This is a one-time migration to fix existing messages that had incorrect authorName.
 */
export const fixAuthorName = mutation({
    args: {},
    handler: async (ctx) => {
        const messages = await ctx.db.query("messages").collect();
        for (const message of messages) {
            let email = message.authorEmail;
            // If authorEmail looks like an auth subject (contains |), look up the actual email
            if (email && email.includes("|")) {
                const userId = email.split("|")[0];
                const authAccounts = await ctx.db.query("authAccounts").collect();
                const authAccount = authAccounts.find((a: any) => a.userId === userId);
                email = authAccount?.providerAccountId || undefined;
            }
            if (email) {
                const staff = await ctx.db
                    .query("staffUsers")
                    .withIndex("by_email", (q) => q.eq("email", email))
                    .first();
                if (staff) {
                    await ctx.db.patch(message._id, {
                        authorName: staff.name,
                        authorEmail: email,
                    });
                }
            }
        }
    },
});

/**
 * Edit a message.
 * - Only the author can edit their own message.
 * - Sets edited flag to true.
 * - Requires authentication.
 */
export const editMessage = mutation({
    args: { messageId: v.id("messages"), newBody: v.string() },
    handler: async (ctx, { messageId, newBody }) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        // Get the message to check author
        const message = await ctx.db.get("messages", messageId);
        if (!message) throw new Error("Message not found");

        // Get caller's email by looking up auth account (same method as getCurrentUser)
        const userId = identity.subject.split("|")[0];
        const authAccounts = await ctx.db.query("authAccounts").collect();
        const authAccount = authAccounts.find((a: any) => a.userId === userId);
        const callerEmail = authAccount?.providerAccountId || identity.email || "";

        // Authorization: only owner can edit
        const isOwner = message.authorEmail === callerEmail;
        if (!isOwner) {
            throw new Error("Unauthorized to edit this message");
        }

        // Trim and validate new body
        const trimmedBody = newBody.trim();
        if (trimmedBody === "") {
            throw new Error("Message body cannot be empty");
        }
        if (trimmedBody.length > 5000) {
            throw new Error("Message body too long (max 5000 characters)");
        }

        // Update message
        await ctx.db.patch(messageId, {
            body: trimmedBody,
            edited: true,
        });
    },
});

/**
 * Delete a message.
 * - Users can delete their own messages.
 * - Admins can delete any message.
 * - Requires authentication.
 */
export const deleteMessage = mutation({
    args: { messageId: v.id("messages") },
    handler: async (ctx, { messageId }) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        // Get the message to check author
        const message = await ctx.db.get("messages", messageId);
        if (!message) throw new Error("Message not found");

        // Get caller's email by looking up auth account (same method as getCurrentUser)
        const userId = identity.subject.split("|")[0];
        const authAccounts = await ctx.db.query("authAccounts").collect();
        const authAccount = authAccounts.find((a: any) => a.userId === userId);
        const callerEmail = authAccount?.providerAccountId || identity.email || "";

        // Get caller's staff record to check role
        let isAdmin = false;
        if (callerEmail) {
            const callerStaff = await ctx.db
                .query("staffUsers")
                .withIndex("by_email", (q) => q.eq("email", callerEmail))
                .first();
            isAdmin = callerStaff?.role === "admin";
        }

        // Authorization: owner or admin
        const isOwner = message.authorEmail === callerEmail;
        if (!isOwner && !isAdmin) {
            throw new Error("Unauthorized to delete this message");
        }

        // Delete the message
        await ctx.db.delete(messageId);
    },
});

/**
 * Pin or unpin a message.
 * - Only admins can pin/unpin messages.
 * - Toggles the pinned flag.
 * - Requires authentication.
 */
export const pinMessage = mutation({
    args: { messageId: v.id("messages") },
    handler: async (ctx, { messageId }) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        // Get caller's email by looking up auth account (same method as getCurrentUser)
        const userId = identity.subject.split("|")[0];
        const authAccounts = await ctx.db.query("authAccounts").collect();
        const authAccount = authAccounts.find((a: any) => a.userId === userId);
        const callerEmail = authAccount?.providerAccountId || identity.email || "";

        // Get caller's staff record to check role
        let isAdmin = false;
        if (callerEmail) {
            const callerStaff = await ctx.db
                .query("staffUsers")
                .withIndex("by_email", (q) => q.eq("email", callerEmail))
                .first();
            isAdmin = callerStaff?.role === "admin";
        }

        if (!isAdmin) {
            throw new Error("Only admins can pin/unpin messages");
        }

        // Get the message
        const message = await ctx.db.get("messages", messageId);
        if (!message) throw new Error("Message not found");

        // Toggle pinned flag
        await ctx.db.patch(messageId, {
            pinned: !message.pinned,
        });
    },
});
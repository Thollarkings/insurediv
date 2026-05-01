import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * List messages with author name, pinned first then by timestamp descending.
 * We fetch up to 50 pinned messages and up to 50 non-pinned messages, then combine
 * with pinned first, and limit to 50 total.
 */
export const listMessages = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        // Fetch pinned messages (most recent first)
        const pinnedMessages = await ctx.db
            .query("messages")
            .filter((q) => q.eq(q.field("pinned"), true))
            .order("desc")
            .take(50);

        // Fetch non-pinned messages (most recent first)
        const nonPinnedMessages = await ctx.db
            .query("messages")
            .filter((q) => q.eq(q.field("pinned"), false))
            .order("desc")
            .take(50);

        // Combine: pinned first, then non-pinned, and take at most 50 total
        const combined = [...pinnedMessages, ...nonPinnedMessages].slice(0, 50);

        // Return messages as-is (authorName already stored)
        return combined;
    },
});

/**
 * Send a new message.
 * - Requires authentication.
 * - Looks up author name from staffUsers table using email from auth.
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

        // Get email from identity (Convex Auth password provider uses email as subject)
        const email = (identity.email || identity.subject || "").toString();

        // Look up staff user by email to get author name
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

        // Get caller's staff record to check role
        const callerEmail = (identity.email || identity.subject || "").toString();
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

        // Get caller's email
        const callerEmail = (identity.email || identity.subject || "").toString();

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

        // Get caller's staff record to check role
        const callerEmail = (identity.email || identity.subject || "").toString();
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

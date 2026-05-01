import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { createAccount } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

const ENROLLMENT_CODE = "tnib-4926";

// ========== ENROLLMENT ==========

export const verifyEnrollmentCode = query({
    args: { code: v.string() },
    handler: async (ctx, { code }) => code === ENROLLMENT_CODE,
});

export const createStaffUser = action({
    args: {
        name: v.string(),
        email: v.string(),
        password: v.string(),
        role: v.string(),
        enrollmentCode: v.string(),
    },
    handler: async (ctx, args) => {
        // Server-side enrollment code validation
        if (args.enrollmentCode !== ENROLLMENT_CODE) {
            throw new Error("Invalid enrollment code");
        }

        // Validate role
        if (args.role !== "staff" && args.role !== "admin") {
            throw new Error("Invalid role. Must be 'staff' or 'admin'.");
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(args.email)) {
            throw new Error("Invalid email format");
        }

        // Validate password length
        if (args.password.length < 6) {
            throw new Error("Password must be at least 6 characters");
        }

        // Validate name
        if (args.name.trim().length === 0) {
            throw new Error("Name is required");
        }

        // Create auth account (requires action context)
        await createAccount(ctx, {
            provider: "password",
            account: { id: args.email, secret: args.password },
            profile: { name: args.name, email: args.email },
        });

        // Create staff record via mutation
        return await ctx.runMutation(api.staff.createStaffRecord, {
            name: args.name,
            email: args.email,
            role: args.role,
        });
    },
});

export const createStaffRecord = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        role: v.string(),
    },
    handler: async (ctx, args) => {
        // Check if staff already exists
        const existing = await ctx.db
            .query("staffUsers")
            .withIndex("by_email", (q: any) => q.eq("email", args.email))
            .first();

        if (existing) {
            // Update existing record with new name/role if needed
            await ctx.db.patch(existing._id, {
                name: args.name,
                role: args.role,
                status: "active",
            });
            return { id: existing._id, name: args.name, email: args.email, role: args.role };
        }

        const staffId = await ctx.db.insert("staffUsers", {
            name: args.name,
            email: args.email,
            role: args.role,
            status: "active",
            createdAt: Date.now(),
        });

        return { id: staffId, name: args.name, email: args.email, role: args.role };
    },
});

// ========== AUTH & USER LOOKUP ==========

export const getCurrentUser = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            console.log("getCurrentUser: No identity found");
            return null;
        }

        // Log identity for debugging
        console.log("getCurrentUser identity:", {
            subject: identity.subject,
            email: identity.email,
            name: identity.name,
        });

        // Convex Auth password provider uses email as account ID (subject)
        // identity.email may not be populated, so use subject as fallback
        const email = (identity.email || identity.subject || "").toString();

        if (!email) {
            console.log("getCurrentUser: No email found in identity");
            return { email: "", name: "Unknown", role: "unknown" };
        }

        // Look up staff by email (primary identifier)
        const staff = await ctx.db
            .query("staffUsers")
            .withIndex("by_email", (q: any) => q.eq("email", email))
            .first();

        console.log("getCurrentUser: Staff lookup by email", email, "found:", !!staff);

        if (staff) {
            return {
                email: staff.email,
                name: staff.name,
                role: staff.role,
            };
        }

        // Fallback: use identity name or email prefix
        console.log("getCurrentUser: No staff found, using fallback");
        return {
            email,
            name: identity.name || email.split('@')[0] || "Unknown",
            role: "unknown",
        };
    },
});

// ========== ADMIN FUNCTIONS ==========

/**
 * List all staff users. Returns name, email, role, status, and _id.
 * Does NOT expose passwordHash or any auth-internal fields.
 */
export const listStaffUsers = query({
    args: {},
    handler: async (ctx) => {
        const staff = await ctx.db.query("staffUsers").collect();
        // Return only safe fields — no passwordHash is stored in this table,
        // but we explicitly pick fields to be future-proof.
        return staff.map((s) => ({
            _id: s._id,
            name: s.name,
            email: s.email,
            role: s.role,
            status: s.status,
            createdAt: s.createdAt,
        }));
    },
});

/**
 * Delete a staff user. Requires the enrollment code for confirmation.
 * Also attempts to clean up the associated auth account.
 */
export const deleteStaffUser = mutation({
    args: {
        id: v.id("staffUsers"),
        enrollmentCode: v.string(),
    },
    handler: async (ctx, args) => {
        // Server-side enrollment code validation
        if (args.enrollmentCode !== ENROLLMENT_CODE) {
            throw new Error("Invalid enrollment code");
        }

        const staff = await ctx.db.get(args.id);
        if (!staff) {
            throw new Error("Staff user not found");
        }

        // Delete the staff record
        await ctx.db.delete(args.id);

        // Note: Full auth account deletion requires access to the auth tables
        // which are managed by @convex-dev/auth. The auth account will be
        // orphaned but inaccessible since the staff record is gone.
        // For a complete cleanup, consider using the auth SDK's deleteUser
        // in an action context if available.

        return { id: args.id, name: staff.name };
    },
});

/**
 * Update a staff member's designation (role).
 * Supports promoting to "admin" or demoting to "staff".
 */
export const updateDesignation = mutation({
    args: {
        id: v.id("staffUsers"),
        role: v.string(),
    },
    handler: async (ctx, args) => {
        // Validate role
        if (args.role !== "staff" && args.role !== "admin") {
            throw new Error("Invalid role. Must be 'staff' or 'admin'.");
        }

        const staff = await ctx.db.get(args.id);
        if (!staff) {
            throw new Error("Staff user not found");
        }

        await ctx.db.patch(args.id, { role: args.role });

        return {
            id: args.id,
            name: staff.name,
            email: staff.email,
            role: args.role,
        };
    },
});

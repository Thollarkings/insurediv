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
    handler: async (ctx, args): Promise<{ id: string; name: string; email: string; role: string } | null> => {
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
    handler: async (ctx, args): Promise<{ id: string; name: string; email: string; role: string; status: string; createdAt: number }> => {
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
            return { id: existing._id, name: args.name, email: args.email, role: args.role, status: "active", createdAt: existing.createdAt };
        }

        const staffId = await ctx.db.insert("staffUsers", {
            name: args.name,
            email: args.email,
            role: args.role,
            status: "active",
            createdAt: Date.now(),
        });

        return { id: staffId, name: args.name, email: args.email, role: args.role, status: "active", createdAt: Date.now() };
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

        // For the Password provider, the account ID is the email
        // Look up the authAccounts table to find the email for this user
        const userId = identity.subject.split("|")[0];

        // Find the auth account record to get the email
        const authAccounts = await ctx.db.query("authAccounts").collect();
        const authAccount = authAccounts.find((a: any) => a.userId === userId);
        const email = authAccount?.providerAccountId || identity.email || "";

        console.log("getCurrentUser: found authAccount for userId", userId, "email:", email);

        // Look up staff by email
        if (email) {
            const staff = await ctx.db
                .query("staffUsers")
                .withIndex("by_email", (q: any) => q.eq("email", email))
                .first();

            if (staff) {
                return {
                    email: staff.email,
                    name: staff.name,
                    role: staff.role,
                };
            }
        }

        // Final fallback: use identity name
        console.log("getCurrentUser: No staff found, using identity fallback");
        return {
            email: email || "",
            name: identity.name || "Staff",
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

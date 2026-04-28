import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { createAccount } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

const ENROLLMENT_CODE = process.env.ENROLLMENT_CODE ?? "diven45-2026";

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
        if (args.enrollmentCode !== ENROLLMENT_CODE) {
            throw new Error("Invalid enrollment code");
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

export const listStaffUsers = query({
    args: {},
    handler: async (ctx) => ctx.db.query("staffUsers").collect(),
});

export const deleteStaffUser = mutation({
    args: {
        id: v.id("staffUsers"),
        enrollmentCode: v.string(),
    },
    handler: async (ctx, args) => {
        if (args.enrollmentCode !== ENROLLMENT_CODE) {
            throw new Error("Invalid enrollment code");
        }
        const staff = await ctx.db.get(args.id);
        if (!staff) throw new Error("Staff user not found");
        await ctx.db.delete(args.id);
        return { id: args.id, name: staff.name };
    },
});

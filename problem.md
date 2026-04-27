# Problem: Staff Names Displaying as "Unknown" in Chat

## Description
The chat messages in the Admin portal are currently displaying "Unknown Staff" or "Unknown" instead of the actual staff member's name. This breaks the user experience and makes it impossible to distinguish between different staff members in the conversation.

## Current Behavior
- When a staff member sends a message, the `author` field in the database is either missing, incorrect, or defaults to a fallback string.
- The UI renders `{msg.author ?? 'Unknown'}`, resulting in "Unknown" or "Unknown Staff" being shown below each message bubble.
- Message alignment (left vs right) may also be broken because `currentUserName` in the frontend doesn't match the stored `author` string.

## Expected Behavior
- Each message should display the correct staff name (e.g., "john", "jane", or whatever was set during onboarding).
- The frontend should correctly identify the current user's messages to align them to the right (gold bubble) and others to the left (navy bubble).
- Fallbacks should be graceful and consistent across backend and frontend.

## Code Analysis & Suspected Causes
1. **Missing Email in `staffUsers`**: The `ensureStaffUser` mutation in `Admin.jsx` only passes `{ name: email.split('@')[0] }`. If the backend `ensureStaffUser` mutation doesn't explicitly save the `email` field, the `listMessages` query will fail to find the staff record via `withIndex("by_email", ...)`.
2. **`userIdentity.name` is Undefined**: Convex Auth's `userIdentity` object often does not include a `name` field by default. The fallback `userIdentity.name ?? email.split('@')[0] ?? "Staff"` might resolve to `email.split('@')[0]`, but if `ensureStaffUser` didn't save that name correctly, lookups fail.
3. **Inconsistent Fallback Strings**: `listMessages` falls back to `"Unknown"`, but the UI previously showed `"Unknown Staff"`. This inconsistency suggests mismatched fallback logic.
4. **Frontend/Backend Name Mismatch**: `currentUserName` is computed as `currentUser?.name ?? currentUser?.email?.split('@')[0] ?? ''`. If the backend stores a slightly different format (e.g., with capitalization or extra spaces), the `===` comparison for bubble alignment will fail.

## Required Fix
- Update `convex/staff.ts` (or equivalent) to ensure `ensureStaffUser` saves both `name` and `email` correctly.
- Simplify `convex/messages.ts` `send` mutation to reliably store the author's name and email.
- Update `listMessages` to handle missing names gracefully without complex fallback chains, or pre-resolve names efficiently.
- Ensure `Admin.jsx` computes `currentUserName` exactly as it's stored in the database to fix bubble alignment.
- Standardize fallback strings to avoid "Unknown" vs "Unknown Staff" confusion.

## Files Involved
- `convex/messages.ts`
- `convex/staff.ts` (needs inspection)
- `src/pages/Admin.jsx`
- `convex/schema.ts` (already correct)

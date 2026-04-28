# Test Credentials for Top Notch Insurance Brokers

## Admin Test User

**Email:** enrol@topnotchib.com

## How to Use

### First-Time Setup
Since Convex Password authentication requires users to create their own passwords, you'll need to:

1. Navigate to the Admin page (`/admin`)
2. Click "Authorize Entry"
3. Enter the email: `enrol@topnotchib.com`
4. Enter a new password (this will create the account)
5. Use these credentials for future sign-ins

### Subsequent Logins
1. Navigate to the Admin page (`/admin`)
2. Sign in with:
   - **Email:** enrol@topnotchib.com
   - **Password:** [the password you set during sign-up]

### Once Authenticated
- View and send messages in the secure staff chat
- Sign out when finished

## Creating Additional Staff Accounts

You can create additional staff accounts using the Staff Enrollment portal:

1. Navigate to `/enroll`
2. Enter the enrollment code: `diven45-2026`
3. Fill in the staff member's details:
   - Full Name
   - Email Address
   - Role (Staff Member or Administrator)
4. Click "Create Staff Account"

The staff member can then log in at `/admin` using their email and a password they create during their first sign-in.

## Notes

- The password auth provider allows any email to sign up
- For production, consider restricting to specific domains
- All messages are stored with the authenticated user's email as the author
- Passwords are securely hashed and cannot be retrieved
- Staff accounts created through the enrollment portal are stored in the `staffUsers` table with their role and status
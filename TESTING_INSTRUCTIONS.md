# Testing Instructions for Top Notch Insurance Brokers Chat

## Setting Up a Fresh Staff Account

### Prerequisites
1. Make sure you have the development server running:
   ```bash
   npm run dev
   ```
2. Ensure Convex dev is running:
   ```bash
   npx convex dev
   ```

### Creating a New Staff Account

1. Navigate to the enrollment page:
   ```
   http://localhost:5174/enroll
   ```

2. Enter the enrollment code: `tnib-4926`

3. Fill out the staff registration form:
   - **Full Name**: Enter your name (e.g., "Test User")
   - **Email Address**: Use a unique email (e.g., "test1@example.com")
   - **Password**: Choose a secure password (minimum 6 characters)
   - **Designation**: Select either "Staff" or "Admin"

4. Click "Create Staff Account"

### Testing the Chat Functionality

1. After successful registration, you'll be redirected to the staff dashboard
2. Navigate to the admin/chat page:
   ```
   http://localhost:5174/admin
   ```

3. You should see the chat interface. If you're not automatically redirected, you may need to log in first.

### Testing Features

#### Sending Messages
- Type a message in the input box at the bottom
- Press Enter or click the send button
- Verify the message appears in the chat list

#### Editing Messages (Own Messages Only)
- Hover over your own message
- Click the "Edit" button that appears
- Modify the message in the edit modal
- Click "Save" to confirm changes
- Verify the message shows "(edited)" label

#### Deleting Messages
- **Own Messages**: Hover over your message and click the "Delete" button
- **Admin Messages**: As an admin, you can delete any message by hovering and clicking "Delete"
- Confirm deletion in the modal that appears

#### Pinning Messages (Admin Only)
- As an admin user, hover over any message
- Click the "Pin" button to pin it to the top
- Click "Unpin" to remove it from the top position

#### Real-time Updates
- Open multiple browser windows or incognito tabs
- Log in as different users in each window
- Send messages from one window and verify they appear in real-time in others

### Testing Different User Roles

#### Staff User
- Can send, edit, and delete own messages
- Cannot delete other users' messages
- Cannot pin/unpin messages

#### Admin User
- Can send, edit, and delete own messages
- Can delete any user's messages
- Can pin/unpin any message
- Sees admin badge next to name in chat

### Verifying Data Persistence
- Refresh the page - messages should remain
- Close and reopen the browser - messages should persist
- Log out and log back in - messages should still be there

### Troubleshooting

#### If you see a blank screen or error:
1. Check the browser console for error messages
2. Ensure Convex dev is running (`npx convex dev`)
3. Verify the Vite dev server is running (`npm run dev`)
4. Check that your Convex URL is correctly configured in `.env.local`

#### If messages aren't appearing in real-time:
1. Verify you're using the `useQuery` hook correctly
2. Check that your Convex functions are deployed
3. Look for any authentication errors in the console

## Technical Details

### Authentication
- Uses Convex Auth with email/password provider
- Protected routes redirect to login automatically
- User role (staff/admin) determined from `staffUsers` table

### Data Flow
- Messages stored in `messages` table with:
  - `body`: Message content
  - `authorName`: Cached name for performance
  - `authorEmail`: Email for ownership checking
  - `edited`: Boolean flag for edited messages
  - `pinned`: Boolean flag for pinned messages (admin only)
  - `timestamp`: Creation time

### Security
- All mutations verify authentication
- Ownership checks performed server-side
- Admin privileges verified via `staffUsers.role`
- Input validation and sanitization on message length/content

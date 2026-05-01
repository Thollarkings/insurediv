# Fix Admin Page Blank Issue

## Problem Analysis
The admin page (`/admin`) shows only the navbar with a blank main content area. This occurs because the `Admin.jsx` component returns `null` when the user is not authenticated, instead of rendering a sign-in form or allowing the `ConvexAuthProvider` to handle authentication UI.

## Root Cause
In `src/pages/Admin.jsx`:
- Lines 67-75: The component returns `null` when `currentUser` is `undefined` (loading) or `null` (not authenticated)
- This prevents the `ConvexAuthProvider` from displaying its built-in authentication UI
- The page appears blank except for the navbar from the layout

## Solution
Modify `Admin.jsx` to:
1. Show a loading indicator while checking authentication status
2. Display a custom sign-in form when not authenticated (instead of returning null)
3. Show the chat interface when authenticated

## Implementation Steps

### Step 1: Update Import Statement
Add `useAuth` hook and import necessary icons for the sign-in form:
```diff
import { useQuery, useMutation } from 'convex/react';
+ import { useAuth } from '@convex-dev/auth/react';
import { api } from '../../convex/_generated/api';
+ import { LogOut, ShieldCheck, User, X, AlertCircle, RefreshCw } from 'lucide-react';
```

### Step 2: Enhance Component Logic
Replace the current authentication handling with:
```diff
- const currentUser = useQuery(api.staff.getCurrentUser);
+ const currentUser = useQuery(api.staff.getCurrentUser);
+ const { signIn, signOut, isAuthenticated } = useAuth();

// Local state
const [newMessage, setNewMessage] = useState('');
+ const [email, setEmail] = useState('');
+ const [password, setPassword] = useState('');
+ const [isLoading, setIsLoading] = useState(false);
+ const [error, setError] = useState('');
const messagesEndRef = useRef(null);

const isAdmin = currentUser?.role === 'admin';
```

### Step 3: Add Sign-In Handler
Add a function to handle form submission:
```javascript
const handleSignIn = async (e) => {
  e.preventDefault();
  setError('');
  setIsLoading(true);
  
  try {
    await signIn('email', { email, password });
    setEmail('');
    setPassword('');
  } catch (err) {
    console.error('Sign in error:', err);
    setError('Invalid email or password');
  } finally {
    setIsLoading(false);
  }
};
```

### Step 4: Update Conditional Rendering
Replace the null returns with appropriate UI:
```diff
- // If loading currentUser, show nothing (ConvexAuthProvider will show login UI)
- if (currentUser === undefined) {
-   return null;
- }
- 
- // If not authenticated, return null (ConvexAuthProvider will show the login UI)
- if (!currentUser) {
-   return null;
- }
+ // If loading currentUser, show loading indicator
+ if (currentUser === undefined) {
+   return (
+     <div className="min-h-screen bg-gray-50 pt-24 pb-12 flex items-center justify-center">
+       <div className="text-center">
+         <RefreshCw className="w-10 h-10 text-[#002147] animate-spin mx-auto mb-4" />
+         <p className="text-gray-500 text-lg">Checking authentication...</p>
+       </div>
+     </div>
+   );
+ }
+ 
+ // If not authenticated, show sign-in form
+ if (!currentUser) {
+   return (
+     <div className="min-h-screen bg-gray-50 pt-24 pb-12 flex items-center justify-center">
+       <div className="max-w-md w-full mx-auto px-4">
+         <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-2xl">
+           <div className="text-center mb-8">
+             <div className="inline-flex items-center justify-center w-20 h-20 bg-[#002147] rounded-3xl mb-6">
+               <ShieldCheck className="w-10 h-10 text-[#D4AF37]" />
+             </div>
+             <h2 className="text-2xl font-bold text-[#002147] mb-4">Admin Sign In</h2>
+             <p className="text-gray-500">
+               Sign in to access the staff portal
+             </p>
+           </div>
+           
+           {error && (
+             <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
+               <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
+               <p className="text-red-700 text-sm">{error}</p>
+             </div>
+           )}
+           
+           <form onSubmit={handleSignIn} className="space-y-6">
+             <div>
+               <label className="text-sm font-bold text-[#002147] mb-2 block">
+                 Email Address
+               </label>
+               <input
+                 type="email"
+                 value={email}
+                 onChange={(e) => {
+                   setEmail(e.target.value);
+                   setError('');
+                 }}
+                 placeholder="Enter your email"
+                 className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-[#002147] outline-none text-lg"
+                 required
+               />
+             </div>
+             
+             <div>
+               <label className="text-sm font-bold text-[#002147] mb-2 block">
+                 Password
+               </label>
+               <input
+                 type="password"
+                 value={password}
+                 onChange={(e) => {
+                   setPassword(e.target.value);
+                   setError('');
+                 }}
+                 placeholder="Enter your password"
+                 className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl focus:ring-2 focus-ring-[#002147] outline-none text-lg"
+                 required
+               />
+             </div>
+             
+             <button
+               type="submit"
+               disabled={isLoading}
+               className="w-full bg-[#002147] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#D4AF37] hover:text-[#002147] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
+             >
+               {isLoading ? (
+                 <>
+                   <RefreshCw className="w-5 h-5 animate-spin" />
+                   Signing in…
+                 </>
+               ) : (
+                 <>
+                   <LogOut className="w-5 h-5" />
+                   Sign In
+                 </>
+               )}
+             </button>
+             
+             <p className="text-center text-sm text-gray-500">
+               Don't have an account? Contact an administrator to create one.
+             </p>
+           </form>
+         </div>
+       </div>
+     </div>
+   );
+ }
```

### Step 5: Keep Authenticated UI Intact
The existing authenticated UI (lines 77-136 in current file) should remain unchanged as it already displays the chat interface correctly.

## Files to Modify
- `src/pages/Admin.jsx` - Main fix implementation

## Testing Procedure
1. Start development servers: `npm run dev` and `npx convex dev`
2. Visit `http://localhost:5174/admin` 
3. Verify sign-in form appears instead of blank page
4. Sign in with test credentials (enrol@topnotchib.com + password)
5. Verify chat interface loads after successful authentication
6. Test sign-out functionality
7. Test page refresh maintains authentication state

## Expected Outcome
- Admin page shows sign-in form when not authenticated
- Admin page shows chat interface when authenticated
- No more blank page issue
- Proper authentication flow maintained
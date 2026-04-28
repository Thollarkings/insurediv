import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      // This will allow sign up with any email
      // In a production app, you might want to restrict this to specific domains
      // For now, we'll allow any email and rely on the admin check in the UI
    }),
  ],
});

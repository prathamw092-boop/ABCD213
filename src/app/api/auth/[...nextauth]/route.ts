import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

const ADMIN_EMAILS = [
  "prathamwadiyar@gmail.com",
  "prathamw092@gmail.com"
];

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "dummy_client_id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy_client_secret",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
        loginType: { label: "Login Type", type: "text" } // "admin" or "consumer"
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const isAdmin = ADMIN_EMAILS.includes(credentials.email);

        if (credentials.loginType === "admin") {
          if (!isAdmin) {
            throw new Error("Access denied. Not an authorized admin.");
          }
          // MVP dummy password check for admin
          if (credentials.password !== "admin123") {
            throw new Error("Invalid admin password");
          }
          return { id: "1", name: "Admin User", email: credentials.email, role: "admin" };
        } else {
          // Consumer Login
          if (isAdmin) {
            throw new Error("Admins must use the Admin login portal.");
          }
          // MVP dummy password check for consumer (accepts any password for demo, or hardcoded "consumer123")
          // In real app, check against DB
          return { id: "2", name: "Consumer User", email: credentials.email, role: "consumer" };
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        // If user logged in via OAuth, we need to set their role
        if (account?.provider === "google") {
          token.role = ADMIN_EMAILS.includes(user.email || "") ? "admin" : "consumer";
        } else {
          // @ts-ignore - custom property
          token.role = user.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore - custom property
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

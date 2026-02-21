import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import clientPromise from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: Record<string, string> | undefined) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        try {
          console.log("[next-auth] authorize called for:", { email: credentials.email });
          const client = await clientPromise;
          const db = client.db("askheirs");

          const user = await db.collection("users").findOne({ email: credentials.email });
          console.log("[next-auth] user lookup result:", { found: !!user, id: user?._id?.toString?.() ?? user?.id });

          if (!user) throw new Error("No account found for that email");
          if (!user.password) throw new Error("Account has no password; try signing in with a provider");

          const ok = await bcrypt.compare(credentials.password, user.password);
          if (!ok) throw new Error("Invalid email or password");

          const result = {
            id: user._id?.toString?.() ?? user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
          console.log("[next-auth] authorize success for:", { email: result.email, id: result.id });
          return result;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error("[next-auth] authorize error:", msg);
          if (err instanceof Error) throw err;
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) token.id = user.id;
      if (user?.role) token.role = user.role;
      return token;
    },
    async session({ session, token }: any) {
      if (token?.id) session.user = { ...session.user, id: token.id } as any;
      if (token?.role) session.user = { ...session.user, role: token.role } as any;
      return session as any;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};


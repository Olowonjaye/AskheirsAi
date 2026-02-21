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
        if (!credentials?.email || !credentials?.password) return null;

        const client = await clientPromise;
        const db = client.db("askheirs");

        const user = await db.collection("users").findOne({ email: credentials.email });
        if (user && user.password) {
          const ok = await bcrypt.compare(credentials.password, user.password);
          if (ok) return { id: user._id?.toString?.() ?? user.id, name: user.name, email: user.email, role: user.role };
        }

        return null;
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


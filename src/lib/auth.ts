import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";

// Note: PrismaClient will be used once database is connected
// For now, we'll use a mock adapter for development

export const { handlers, auth, signIn, signOut } = NextAuth({
  // adapter: PrismaAdapter(prisma), // Uncomment when database is connected
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // In production, query the database
        // const user = await prisma.user.findUnique({
        //   where: { email: credentials.email as string },
        // });

        // For development, use a mock user
        const mockUser = {
          id: "1",
          email: credentials.email as string,
          name: "Test User",
          image: null,
        };

        // In production, verify password:
        // if (!user?.password) return null;
        // const isValid = await bcrypt.compare(credentials.password as string, user.password);
        // if (!isValid) return null;

        return mockUser;
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
});

// Helper to hash passwords
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Helper to verify passwords
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

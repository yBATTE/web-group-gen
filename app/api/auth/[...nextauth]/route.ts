// app/api/auth/[...nextauth]/route.ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { findMenuUser } from "@/lib/menu-users";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Menu Editor",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(creds) {
        const user = findMenuUser(creds?.username, creds?.password);
        if (!user) return null;

        return {
          id: user.id,
          name: user.name,
          username: user.username,
          station: user.station,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.username = (user as any).username;
        token.station = (user as any).station;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).username = token.username;
        (session.user as any).station = token.station;
      }
      return session;
    },
  },
  pages: {
    signIn: "/precios/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
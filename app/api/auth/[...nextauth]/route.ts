import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const authOptions = {
  session: { strategy: "jwt" as const },
  providers: [
    Credentials({
      name: "Admin",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(creds) {
        if (
          creds?.username === process.env.ADMIN_USER &&
          creds?.password === process.env.ADMIN_PASS
        ) {
          return { id: "admin", name: "Administrador" }
        }
        return null
      },
    }),
  ],
  pages: { signIn: "/precios/login" },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

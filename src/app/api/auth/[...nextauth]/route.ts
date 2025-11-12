import NextAuth, { type NextAuthOptions, type User as NextAuthUser } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<NextAuthUser | null> {
        const { username, password } = credentials ?? {}
        if (!username || !password) return null

        const [rows] = await db.query(
          "SELECT * FROM users WHERE username = ? AND deleted_at IS NULL LIMIT 1",
          [username]
        )
        const user = (rows as any[])[0]
        if (!user) return null

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) return null

        // คืนค่าเป็น NextAuthUser type
        return {
          id: String(user.user_id),
          name: user.username,
          email: null,
          role: user.role,
          user_id: user.user_id,
        } as NextAuthUser
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.user_id = (user as any).user_id
      }
      return token
    },
    async session({ session, token }) {
      if (token?.role && session.user) {
        session.user.role = token.role as string
        session.user.user_id = token.user_id as number
      }
      return session
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

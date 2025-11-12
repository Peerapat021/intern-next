import NextAuth, { DefaultUser } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      user_id: number
      username?: string | null
      image?: string | null
      role?: string
    }
  }

  interface User extends DefaultUser {
    user_id: number
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user_id: number
    role: string
  }
}

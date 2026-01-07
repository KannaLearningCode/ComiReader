import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id:string
            role:string
            bio?: string
        } & DefaultSession["user"]
    }

    interface User {
        bio?: string
    }
}

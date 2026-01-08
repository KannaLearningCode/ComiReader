
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnAdmin = nextUrl.pathname.startsWith("/admin");
            const isOnProfile = nextUrl.pathname.startsWith("/profile");

            if (isOnAdmin) {
                if (isLoggedIn) return true;
                return false;
            }

            if (isOnProfile) {
                if (isLoggedIn) return true;
                return false;
            }

            return true;
        },
        async session({ session, token }) {
            if (token.sub && session.user) {
                // @ts-ignore
                session.user.id = token.sub;
                // @ts-ignore
                session.user.role = token.role;
                session.user.image = token.picture;
            }
            return session;
        },
        async jwt({ token, user , trigger,session }) {
            if (user) {
                token.sub = user.id;
                // @ts-ignore
                token.role = user.role;
            }
            if (trigger === "update" && session?.image) {
            token.picture = session.image;
        }
            return token;
        }
    },
    providers: [], 
} satisfies NextAuthConfig;

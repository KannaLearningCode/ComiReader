import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { authConfig } from "@/auth.config";
import { z } from "zod";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: MongoDBAdapter(clientPromise),
    session: {
        strategy: "jwt",
    },
    providers: [
        // Google({
        //     clientId: process.env.GOOGLE_CLIENT_ID,
        //     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        //     profile(profile) {
        //         return {
        //             id: profile.sub,
        //             name: profile.name,
        //             email: profile.email,
        //             image: profile.picture,
        //             role: "user",
        //         }
        //     }
        // }),
        Credentials({
            async authorize(credentials) {
                try {
                    const parsedCredentials = z
                        .object({ email: z.string().email(), password: z.string().min(6) })
                        .safeParse(credentials);

                    if (parsedCredentials.success) {
                        const { email, password } = parsedCredentials.data;
                        await connectToDatabase();
                        const user = await User.findOne({ email });
                        if (!user) return null;
                        if (!user.password && user.provider !== 'credentials') return null;

                        const passwordsMatch = await bcrypt.compare(password, user.password || '');
                        if (passwordsMatch) return user as any;
                    }
                    return null;
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            // Khi đăng nhập
            if (user) {
                token.id = user.id;
                token.role = (user as any).role || "user";
                token.picture = (user as any).image;
            }

            
            if (trigger === "update" && session) {
                if (session.name) token.name = session.name;
                if (session.image) token.picture = session.image;
                
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.image = token.picture as string;

            }
            return session;
        },
    },
});
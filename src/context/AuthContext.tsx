"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { IUser } from "@/types/user";

// Re-export a dummy AuthProvider to prevent imports from breaking
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
};

export function useAuth() {
    const { data: session, status } = useSession();

    // Map NextAuth session user to legacy user format
    const user: IUser | null = session?.user
        ? ({
            ...session.user,
            username: session.user.name || "", // Map name to username
            // Ensure other required fields from IUser are present or handled
            id: session.user.id || "",
            email: session.user.email || "",
        } as unknown as IUser)
        : null;

    const login = async (email: string, password: string) => {
        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                return { success: false, error: result.error };
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: "Something went wrong" };
        }
    };

    const logout = () => {
        signOut({ callbackUrl: "/" });
    };

    const register = async (email: string, password: string, username: string) => {
        // Kept to satisfy interface compatibility
        return { success: false, error: "Use API route for registration" };
    };

    return {
        user,
        isAuthenticated: status === "authenticated",
        isCheckingAuth: status === "loading",
        login,
        logout,
        register,
    };
}
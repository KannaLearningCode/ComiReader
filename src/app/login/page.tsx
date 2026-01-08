
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import * as z from "zod";
import { toast } from "sonner";

// --- SCHEMA DEFINITIONS ---
const loginSchema = z.object({
    email: z.string().min(1, "Vui lòng nhập email"),
    password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

const registerSchema = z.object({
    email: z.string().email("Email không đúng định dạng"),
    username: z.string().min(3, "Username phải có ít nhất 3 ký tự"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("login");

    // Form Login
    const {
        register: registerLogin,
        handleSubmit: handleSubmitLogin,
        formState: { errors: errorsLogin },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    // Form Register
    const {
        register: registerReg,
        handleSubmit: handleSubmitReg,
        formState: { errors: errorsReg },
        reset: resetReg
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
    });

    // --- HANDLERS ---
    const onLoginSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        try {
            const result = await signIn("credentials", {
                redirect: false,
                email: data.email,
                password: data.password,
            });

            if (result?.error) {
                toast.error("Đăng nhập thất bại. Kiểm tra lại email/mật khẩu.");
            } else {
                toast.success('Đăng nhập thành công!');
                router.push('/');
                router.refresh();
            }
        } catch (error) {
            toast.error('Lỗi hệ thống, vui lòng thử lại');
        } finally {
            setIsLoading(false);
        }
    };

    const onRegisterSubmit = async (data: RegisterFormValues) => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: data.username,
                    email: data.email,
                    password: data.password,
                }),
            });

            const result = await res.json();

            if (!res.ok) {
                toast.error(result.error || "Đăng ký thất bại");
                return;
            }

            toast.success('Đăng ký thành công! Hãy đăng nhập.');
            resetReg();
            setActiveTab("login");

        } catch (error) {
            toast.error('Có lỗi xảy ra khi đăng ký');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex h-screen w-full flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
            {/* Back Button */}
            <div className="absolute left-4 top-4 md:left-8 md:top-8">
                <Button variant="ghost" asChild className="gap-2">
                    <Link href="/">
                        <ChevronLeft size={18} />
                        Trang chủ
                    </Link>
                </Button>
            </div>

            <div className="w-full max-w-[400px] px-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="login">Đăng nhập</TabsTrigger>
                        <TabsTrigger value="register">Đăng ký</TabsTrigger>
                    </TabsList>

                    {/* LOGIN TAB */}
                    <TabsContent value="login">
                        <Card>
                            <CardHeader>
                                <CardTitle>Đăng nhập</CardTitle>
                                <CardDescription>Nhập email và mật khẩu của bạn.</CardDescription>
                            </CardHeader>
                            <form onSubmit={handleSubmitLogin(onLoginSubmit)}>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="login-email">Email</Label>
                                        <Input
                                            id="login-email"
                                            placeholder="user@example.com"
                                            {...registerLogin("email")}
                                        />
                                        {errorsLogin.email && <span className="text-xs text-red-500">{errorsLogin.email.message}</span>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="login-pass">Mật khẩu</Label>
                                        <Input
                                            id="login-pass"
                                            type="password"
                                            placeholder="******"
                                            {...registerLogin("password")}
                                        />
                                        {errorsLogin.password && <span className="text-xs text-red-500">{errorsLogin.password.message}</span>}
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? "Đang xử lý..." : "Đăng nhập"}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </TabsContent>

                    {/* REGISTER TAB */}
                    <TabsContent value="register">
                        <Card>
                            <CardHeader>
                                <CardTitle>Đăng ký</CardTitle>
                                <CardDescription>Tạo tài khoản mới hoàn toàn miễn phí.</CardDescription>
                            </CardHeader>
                            <form onSubmit={handleSubmitReg(onRegisterSubmit)}>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="reg-email">Email</Label>
                                        <Input
                                            id="reg-email"
                                            placeholder="user@example.com"
                                            {...registerReg("email")}
                                        />
                                        {errorsReg.email && <span className="text-xs text-red-500">{errorsReg.email.message}</span>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="reg-user">Username</Label>
                                        <Input
                                            id="reg-user"
                                            placeholder="Tên hiển thị"
                                            {...registerReg("username")}
                                        />
                                        {errorsReg.username && <span className="text-xs text-red-500">{errorsReg.username.message}</span>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="reg-pass">Mật khẩu</Label>
                                        <Input
                                            id="reg-pass"
                                            type="password"
                                            placeholder="******"
                                            {...registerReg("password")}
                                        />
                                        {errorsReg.password && <span className="text-xs text-red-500">{errorsReg.password.message}</span>}
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? "Đang tạo..." : "Đăng ký"}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
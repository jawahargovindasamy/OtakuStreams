import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Loader2,
    Mail,
    Lock,
    AlertCircle,
    Eye,
    EyeOff,
    Sparkles
} from "lucide-react";
import { useAuth } from '@/context/auth-provider';

const Login = () => {
    const navigate = useNavigate();
    const { api, login } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        rememberMe: false
    });

    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth - 0.5) * 20,
                y: (e.clientY / window.innerHeight - 0.5) * 20
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
        if (generalError) setGeneralError("");
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});
        setGeneralError("");

        try {
            const res = await api.post("/auth/login", formData);
            if (res.data.success) {
                login(res.data.data);
                navigate("/home");
            }
        } catch (error) {
            if (!error.response) {
                setGeneralError("Unable to connect to server. Please try again.");
            } else {
                const data = error.response.data;
                if (data?.errors) {
                    const fieldErrors = {};
                    data.errors.forEach((e) => (fieldErrors[e.path] = e.msg));
                    setErrors(fieldErrors);
                } else {
                    setGeneralError(data?.message || "Login failed");
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#0a0a0f]">
            {/* Animated Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

            {/* Radial Gradient Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-20%,#7c3aed30,transparent)]" />

            {/* Floating Orbs */}
            <div
                className="absolute top-20 left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-[100px] animate-pulse"
                style={{ transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)` }}
            />
            <div
                className="absolute bottom-20 right-10 w-96 h-96 bg-pink-600/10 rounded-full blur-[120px] animate-pulse delay-1000"
                style={{ transform: `translate(${-mousePosition.x * 0.3}px, ${-mousePosition.y * 0.3}px)` }}
            />

            {/* Decorative Lines */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-purple-500/20 to-transparent" />
                <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-pink-500/20 to-transparent" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-md px-4">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent tracking-tight">
                        OtakuStreams
                    </h1>
                    <p className="text-zinc-400 mt-2 text-sm">Your gateway to infinite worlds</p>
                </div>

                <Card className="w-full border-zinc-800/50 bg-zinc-900/40 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

                    <CardHeader className="space-y-1 pb-6">
                        <CardTitle className="text-xl font-semibold text-white text-center">
                            Welcome Back
                        </CardTitle>
                        <CardDescription className="text-zinc-400 text-center text-sm">
                            Enter your credentials to continue watching
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-5">
                        {generalError && (
                            <Alert className="border-red-500/30 bg-red-500/10 backdrop-blur-sm">
                                <AlertCircle className="h-4 w-4 text-red-400" />
                                <AlertDescription className="text-red-200 text-sm">
                                    {generalError}
                                </AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-zinc-300">
                                    Email Address
                                </Label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="shinji@nerv.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        disabled={isLoading}
                                        className={`pl-10 h-11 bg-zinc-950/50 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-purple-500/50 focus:ring-purple-500/20 rounded-lg transition-all ${errors.email ? "border-red-500/50 focus:border-red-500" : ""}`}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-xs text-red-400 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-sm font-medium text-zinc-300">
                                        Password
                                    </Label>
                                    <Button
                                        type="button"
                                        variant="link"
                                        onClick={() => navigate("/forgot-password")}
                                        className="p-0 h-auto text-xs text-purple-400 hover:text-purple-300"
                                    >
                                        Forgot password?
                                    </Button>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        disabled={isLoading}
                                        className={`pl-10 pr-10 h-11 bg-zinc-950/50 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-purple-500/50 focus:ring-purple-500/20 rounded-lg transition-all ${errors.password ? "border-red-500/50 focus:border-red-500" : ""}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-xs text-red-400 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="remember"
                                    checked={formData.rememberMe}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, rememberMe: checked }))}
                                    className="border-zinc-700 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                />
                                <label htmlFor="remember" className="text-sm text-zinc-400 cursor-pointer select-none">
                                    Remember me for 30 days
                                </label>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-lg shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Sign In
                                        <Sparkles className="w-4 h-4" />
                                    </span>
                                )}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-4 pt-2 pb-6">
                        <div className="text-sm text-zinc-400 text-center">
                            Don't have an account?{" "}
                            <Button
                                variant="link"
                                onClick={() => navigate("/register")}
                                className="p-0 h-auto font-semibold text-purple-400 hover:text-purple-300"
                            >
                                Create account
                            </Button>
                        </div>
                        <p className="text-xs text-zinc-600 text-center">
                            By signing in, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </CardFooter>
                </Card>

                <div className="mt-8 text-center">
                    <p className="text-xs text-zinc-600">
                        © 2024 OtakuStreams. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
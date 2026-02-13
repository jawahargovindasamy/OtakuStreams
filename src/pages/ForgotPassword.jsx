import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/auth-provider";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
    Loader2,
    Mail,
    AlertCircle,
    CheckCircle2,
    ArrowLeft,
    Sparkles,
    KeyRound
} from "lucide-react";

const ForgotPassword = () => {
    const { api } = useAuth();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [generalError, setGeneralError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Track mouse for parallax effect
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

    const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    const resetErrors = () => {
        setEmailError("");
        setGeneralError("");
        setSuccessMessage("");
    };

    const handleChange = (e) => {
        setEmail(e.target.value);
        resetErrors();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        resetErrors();

        if (!email.trim()) {
            setEmailError("Email is required");
            return;
        }

        if (!validateEmail(email)) {
            setEmailError("Please enter a valid email address");
            return;
        }

        setLoading(true);

        try {
            const res = await api.post("/auth/forgot-password", {
                email: email.trim(),
            });

            const { success, message } = res.data;

            if (!success) throw new Error(message);

            setIsSuccess(true);
            setSuccessMessage(
                message ||
                "If an account exists with this email, you will receive reset instructions."
            );
            setEmail("");
        } catch (err) {
            if (err.response?.status === 404) {
                setIsSuccess(true);
                setSuccessMessage(
                    "If an account exists with this email, you will receive reset instructions."
                );
            } else {
                setGeneralError(
                    err.response?.data?.message ||
                    err.message ||
                    "Something went wrong. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#0a0a0f] p-4">
            {/* Animated Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

            {/* Radial Gradient Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-20%,#7c3aed30,transparent)]" />

            {/* Floating Orbs */}
            <div
                className="absolute top-32 left-20 w-64 h-64 bg-purple-600/20 rounded-full blur-[100px] animate-pulse"
                style={{ transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)` }}
            />
            <div
                className="absolute bottom-32 right-20 w-80 h-80 bg-pink-600/10 rounded-full blur-[120px] animate-pulse delay-1000"
                style={{ transform: `translate(${-mousePosition.x * 0.3}px, ${-mousePosition.y * 0.3}px)` }}
            />

            {/* Decorative Lines */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-purple-500/20 to-transparent" />
                <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-pink-500/20 to-transparent" />
            </div>

            {/* Back Button */}
            <Link
                to="/login"
                className="absolute top-6 left-6 z-20 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to login</span>
            </Link>

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent tracking-tight">
                        OtakuStreams
                    </h1>
                </div>

                <Card className="w-full border-zinc-800/50 bg-zinc-900/40 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

                    <CardHeader className="text-center space-y-4 pb-6">
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center border border-purple-500/20">
                            {isSuccess ? (
                                <CheckCircle2 className="h-8 w-8 text-green-400" />
                            ) : (
                                <KeyRound className="h-8 w-8 text-purple-400" />
                            )}
                        </div>
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-semibold text-white">
                                {isSuccess ? "Check Your Email" : "Forgot Password?"}
                            </CardTitle>
                            <CardDescription className="text-zinc-400 text-sm">
                                {isSuccess
                                    ? "We've sent you reset instructions"
                                    : "No worries, we'll send you reset instructions"}
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* Success Alert */}
                        {successMessage && (
                            <Alert className="border-green-500/30 bg-green-500/10 backdrop-blur-sm">
                                <CheckCircle2 className="h-4 w-4 text-green-400" />
                                <AlertDescription className="text-green-200 text-sm">
                                    {successMessage}
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Error Alert */}
                        {generalError && (
                            <Alert className="border-red-500/30 bg-red-500/10 backdrop-blur-sm">
                                <AlertCircle className="h-4 w-4 text-red-400" />
                                <AlertDescription className="text-red-200 text-sm">
                                    {generalError}
                                </AlertDescription>
                            </Alert>
                        )}

                        {!isSuccess ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium text-zinc-300">
                                        Email Address
                                    </Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={handleChange}
                                            placeholder="shinji@nerv.com"
                                            disabled={loading}
                                            className={`pl-10 h-11 bg-zinc-950/50 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-purple-500/50 focus:ring-purple-500/20 rounded-lg transition-all ${emailError ? "border-red-500/50 focus:border-red-500" : ""}`}
                                        />
                                    </div>
                                    {emailError && (
                                        <p className="text-xs text-red-400 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {emailError}
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-lg shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            Send Reset Link
                                            <Sparkles className="w-4 h-4" />
                                        </span>
                                    )}
                                </Button>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-4 rounded-lg bg-zinc-950/50 border border-zinc-800 text-center">
                                    <p className="text-sm text-zinc-400 mb-2">
                                        Didn't receive the email?
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                        Check your spam folder or try again in a few minutes
                                    </p>
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsSuccess(false);
                                        setSuccessMessage("");
                                    }}
                                    className="w-full h-11 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50 hover:border-zinc-600 text-zinc-300 transition-all"
                                >
                                    Try different email
                                </Button>
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="flex justify-center pb-6">
                        <p className="text-sm text-zinc-500">
                            Remember your password?{" "}
                            <Link
                                to="/login"
                                className="font-semibold text-purple-400 hover:text-purple-300 hover:underline transition-colors"
                            >
                                Sign in
                            </Link>
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

export default ForgotPassword;
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/auth-provider";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Loader2,
    User,
    Mail,
    Lock,
    AlertCircle,
    Eye,
    EyeOff,
    Sparkles,
    ArrowLeft
} from "lucide-react";

const Register = () => {
    const navigate = useNavigate();
    const { login, api } = useAuth();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        agreeTerms: false
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
        if (error) setError("");
    };

    const handleCheckboxChange = (checked) => {
        setFormData(prev => ({ ...prev, agreeTerms: checked }));
        if (errors.agreeTerms) setErrors(prev => ({ ...prev, agreeTerms: "" }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (formData.username.length < 3) {
            newErrors.username = "Username must be at least 3 characters";
        }
        if (formData.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
        }
        if (!formData.agreeTerms) {
            newErrors.agreeTerms = "You must agree to the terms";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setError("");
        setLoading(true);

        try {
            const res = await api.post("/auth/register", {
                username: formData.username,
                email: formData.email,
                password: formData.password
            });

            const { success, data, message } = res.data;

            if (!success) throw new Error(message);

            login(data);
            navigate("/home");
        } catch (err) {
            if (err.response?.data?.errors) {
                const fieldErrors = {};
                err.response.data.errors.forEach((e) => {
                    fieldErrors[e.path] = e.msg;
                });
                setErrors(fieldErrors);
            } else {
                setError(err.response?.data?.message || err.message || "Registration failed");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#0a0a0f] py-8">
            {/* Animated Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]" />

            {/* Radial Gradient Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-20%,#7c3aed30,transparent)]" />

            {/* Floating Orbs */}
            <div
                className="absolute top-20 right-10 w-72 h-72 bg-purple-600/20 rounded-full blur-[100px] animate-pulse"
                style={{ transform: `translate(${-mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)` }}
            />
            <div
                className="absolute bottom-20 left-10 w-96 h-96 bg-pink-600/10 rounded-full blur-[120px] animate-pulse delay-1000"
                style={{ transform: `translate(${mousePosition.x * 0.3}px, ${-mousePosition.y * 0.3}px)` }}
            />

            {/* Decorative Lines */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/3 w-px h-full bg-linear-to-b from-transparent via-purple-500/20 to-transparent" />
                <div className="absolute top-0 right-1/3 w-px h-full bg-linear-to-b from-transparent via-pink-500/20 to-transparent" />
            </div>

            {/* Back Button */}
            <button
                onClick={() => navigate("/login")}
                className="absolute top-6 left-6 z-20 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to login</span>
            </button>

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-md px-4">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-linear-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent tracking-tight">
                        OtakuStreams
                    </h1>
                    <p className="text-zinc-400 mt-2 text-sm">Begin your anime journey</p>
                </div>

                <Card className="w-full border-zinc-800/50 bg-zinc-900/40 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-purple-500/50 to-transparent" />

                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-xl font-semibold text-white text-center">
                            Create Account
                        </CardTitle>
                        <CardDescription className="text-zinc-400 text-center text-sm">
                            Join our community of anime enthusiasts
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {error && (
                            <Alert className="border-red-500/30 bg-red-500/10 backdrop-blur-sm">
                                <AlertCircle className="h-4 w-4 text-red-400" />
                                <AlertDescription className="text-red-200 text-sm">
                                    {error}
                                </AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Username */}
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-sm font-medium text-zinc-300">
                                    Username
                                </Label>
                                <div className="relative group">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                                    <Input
                                        id="username"
                                        name="username"
                                        placeholder="OtakuKing99"
                                        value={formData.username}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className={`pl-10 h-11 bg-zinc-950/50 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-purple-500/50 focus:ring-purple-500/20 rounded-lg transition-all ${errors.username ? "border-red-500/50 focus:border-red-500" : ""}`}
                                    />
                                </div>
                                {errors.username && (
                                    <p className="text-xs text-red-400 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.username}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
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
                                        onChange={handleChange}
                                        disabled={loading}
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

                            {/* Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium text-zinc-300">
                                    Password
                                </Label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        disabled={loading}
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
                                <p className="text-xs text-zinc-500">
                                    Must be at least 8 characters
                                </p>
                            </div>

                            {/* Terms Checkbox */}
                            <div className="space-y-2">
                                <div className="flex items-start space-x-2">
                                    <Checkbox
                                        id="agreeTerms"
                                        checked={formData.agreeTerms}
                                        onCheckedChange={handleCheckboxChange}
                                        className="mt-1 border-zinc-700 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                    />
                                    <label htmlFor="agreeTerms" className="text-sm text-zinc-400 cursor-pointer select-none leading-relaxed">
                                        I agree to the{" "}
                                        <Link to="/terms" className="text-purple-400 hover:text-purple-300 hover:underline">
                                            Terms of Service
                                        </Link>
                                        {" "}and{" "}
                                        <Link to="/privacy" className="text-purple-400 hover:text-purple-300 hover:underline">
                                            Privacy Policy
                                        </Link>
                                    </label>
                                </div>
                                {errors.agreeTerms && (
                                    <p className="text-xs text-red-400 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.agreeTerms}
                                    </p>
                                )}
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-11 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-lg shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Create Account
                                        <Sparkles className="w-4 h-4" />
                                    </span>
                                )}
                            </Button>
                        </form>

                        {/* Login link */}
                        <div className="text-sm text-zinc-400 text-center pt-2">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="font-semibold text-purple-400 hover:text-purple-300 hover:underline transition-colors"
                            >
                                Sign in
                            </Link>
                        </div>
                    </CardContent>
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

export default Register;
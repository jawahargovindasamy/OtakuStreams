import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Mail,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Sun,
  Moon,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/context/auth-provider";
import { useTheme } from "@/context/theme-provider";

import LightLogo from "@/assets/Logo Light.png";
import DarkLogo from "@/assets/Logo Dark.png";
import AppLogo from "@/assets/App Logo (2).png";
import loginBg from "@/assets/login-bg.jpg";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { api, login, user } = useAuth();
  const { theme, setTheme } = useTheme();

  // Validate return destination: redirect to same-origin path or /home if already logged in
  const rawFrom = location.state?.from?.pathname || "/home";
  const isValidReturn = rawFrom.startsWith("/") && !rawFrom.startsWith("//");
  const from = isValidReturn ? rawFrom : "/home";

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  // Set document metadata for SEO & Open Graph
  useEffect(() => {
    document.title = "Sign In — OtakuStreams";

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content",
      "Sign in to your OtakuStreams account to sync your watchlist, resume active streams, and access personalized anime recommendations."
    );

    // Open Graph Metadata
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", "Sign In — OtakuStreams");
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", "Sign in to sync your anime watchlist and continue watching.");
  }, []);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: true
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (generalError) setGeneralError("");
  };

  const validateForm = () => {
    const newErrors = {};
    const emailTrimmed = formData.email.trim();

    if (!emailTrimmed) {
      newErrors.email = "Enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password = "Enter your password.";
    }

    setErrors(newErrors);

    // Accessibility: Focus first field with error
    if (newErrors.email) {
      document.getElementById("email")?.focus();
    } else if (newErrors.password) {
      document.getElementById("password")?.focus();
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setGeneralError("");

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const payload = {
        email: formData.email.trim(),
        password: formData.password,
        rememberMe: formData.rememberMe
      };

      const res = await api.post("/auth/login", payload);
      if (res.data.success) {
        login(res.data.data);
        navigate(from, { replace: true });
      }
    } catch (error) {
      if (!error.response) {
        setGeneralError("Unable to connect to server. Please check your connection and try again.");
      } else {
        const data = error.response.data;
        if (data?.errors && Array.isArray(data.errors)) {
          const fieldErrors = {};
          data.errors.forEach((err) => {
            if (err.path) fieldErrors[err.path] = err.msg;
          });
          setErrors(fieldErrors);
        } else {
          setGeneralError(data?.message || "That email or password didn't match.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      window.location.href = `${import.meta.env.VITE_API_URL || ""}/api/auth/google`;
    } catch {
      setGeneralError("Could not initiate Google Sign-in. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-dvh w-full relative flex flex-col justify-between overflow-x-hidden bg-background text-foreground font-sans selection:bg-primary/30">
      {/* Accessibility Skip Link */}
      <a
        href="#login-form"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-xl shadow-lift transition-all"
      >
        Skip to sign in form
      </a>

      {/* Background Artwork & Section C 3-Layer Scrims */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <img
          src={loginBg}
          alt=""
          decoding="async"
          className="w-full h-full object-cover object-[45%_center] md:object-[42%_center] lg:object-[33%_center] transition-all duration-500"
        />

        {/* Scrim Layer 1: Global Lateral Contrast Overlay */}
        <div className="absolute inset-0 bg-black/20 dark:bg-black/40" />

        {/* Scrim Layer 2: Right Panel-Side Ambient Contrast Overlay */}
        <div className="absolute inset-0 bg-gradient-to-l from-background/90 via-background/40 to-transparent max-lg:bg-none" />

        {/* Scrim Layer 3: Bottom Edge Fade into Page Background */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      {/* Navigation Header (80px height) */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        {/* Brand Link (Rotates 3deg on hover) */}
        <Link
          to="/"
          className="group flex items-center gap-2.5 transition-transform duration-300 hover:rotate-3"
          aria-label="OtakuStreams Home"
        >
          <img
            src={AppLogo}
            alt=""
            className="w-9 h-9 sm:w-10 sm:h-10 object-contain drop-shadow-md"
          />
          <img
            src={theme === "light" ? LightLogo : DarkLogo}
            alt="OtakuStreams"
            className="h-6 sm:h-7 object-contain drop-shadow-md"
          />
        </Link>

        {/* Top-Right Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-10 h-10 rounded-full bg-surface/80 hover:bg-elevated border border-border/80 text-foreground flex items-center justify-center transition-all shadow-xs backdrop-blur-md cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Back Home Button */}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-surface/80 hover:bg-elevated border border-border/80 text-xs font-semibold text-foreground transition-all backdrop-blur-md shadow-xs focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back home</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 flex-1 flex flex-col justify-center py-6 lg:pb-12 lg:pt-4">
        
        {/* 12-Column Layout Grid (items-end aligns bottom of left column to bottom of login panel) */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
          
          {/* Left Column: Story Copy Aligned to Bottom/End of Login Container */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-end space-y-3.5 text-left max-w-xl pb-2">
            <div className="flex items-center gap-1.5 text-accent font-sans">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-cyan-400 dark:text-cyan-300">
                YOUR STORY CONTINUES
              </span>
            </div>

            <h2 className="font-display font-black text-4xl lg:text-5xl text-foreground leading-[1.1] tracking-tight drop-shadow-md">
              Every great return<br />
              begins with one familiar<br />
              frame.
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground font-sans leading-relaxed max-w-md">
              Pick up your watchlist, rediscover old favorites, and step back into the worlds waiting for you.
            </p>
          </div>

          {/* Right Column: Authentication Panel */}
          <div className="w-full lg:col-span-6 flex justify-center lg:justify-end">
            <div className="w-full max-w-md lg:max-w-[440px] bg-surface/85 backdrop-blur-2xl border border-border/80 rounded-t-[24px] sm:rounded-3xl shadow-lift p-5 sm:p-8 lg:p-10 text-left transition-all duration-300">
              
              {/* Panel Top Status Row */}
              <div className="flex items-center justify-between mb-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/80 border border-border/80 text-[11px] font-medium text-foreground/90 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  Secure sign in
                </span>
                <span className="text-xs text-muted-foreground font-sans">Welcome back</span>
              </div>

              {/* Panel Heading */}
              <div className="space-y-1 mb-6">
                <h1 className="font-display font-black text-2xl sm:text-3xl text-foreground tracking-tight">
                  Continue your journey.
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground font-sans leading-relaxed">
                  Sign in to sync your watchlist and continue exactly where you left off.
                </p>
              </div>

              {/* Form-Level General Error Alert */}
              {generalError && (
                <Alert
                  role="alert"
                  className="mb-5 border-destructive/40 bg-destructive/10 text-destructive dark:bg-destructive/20 backdrop-blur-sm rounded-xl"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <AlertDescription className="text-xs font-medium">
                    {generalError}
                  </AlertDescription>
                </Alert>
              )}

              {/* Sign In Form */}
              <form id="login-form" onSubmit={handleLogin} noValidate aria-busy={isLoading} className="space-y-4">
                
                {/* Email Address Field */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs sm:text-sm font-semibold text-foreground">
                    Email address
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      maxLength={255}
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      aria-invalid={errors.email ? "true" : "false"}
                      aria-describedby={errors.email ? "email-error" : undefined}
                      className={`pl-11 pr-4 h-[52px] rounded-xl bg-background/60 border-input focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground/60 text-xs sm:text-sm font-sans transition-all ${
                        errors.email ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p id="email-error" className="text-xs text-destructive font-medium flex items-center gap-1.5 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs sm:text-sm font-semibold text-foreground">
                      Password
                    </Label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-semibold text-primary hover:text-primary/80 hover:underline transition-colors focus-visible:ring-1 focus-visible:ring-primary rounded"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      maxLength={128}
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      aria-invalid={errors.password ? "true" : "false"}
                      aria-describedby={errors.password ? "password-error" : undefined}
                      className={`pl-11 pr-12 h-[52px] rounded-xl bg-background/60 border-input focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground/60 text-xs sm:text-sm font-sans transition-all ${
                        errors.password ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p id="password-error" className="text-xs text-destructive font-medium flex items-center gap-1.5 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.password}</span>
                    </p>
                  )}
                </div>

                {/* Remember Me & Security Reassurance Row */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <label htmlFor="remember" className="flex items-center gap-2.5 cursor-pointer select-none py-1 min-h-[44px]">
                    <Checkbox
                      id="remember"
                      checked={formData.rememberMe}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, rememberMe: !!checked }))
                      }
                      className="w-5 h-5 rounded-md border-input data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <span className="text-xs sm:text-sm text-foreground/90 font-medium">
                      Remember me
                    </span>
                  </label>

                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-success shrink-0" />
                    <span>Private & secure</span>
                  </div>
                </div>

                {/* Primary Submit Button (52px height) */}
                <Button
                  type="submit"
                  disabled={isLoading || isGoogleLoading}
                  className="w-full h-[52px] rounded-xl brand-gradient text-white font-sans font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-glow hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 mt-3"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign in</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Horizontal Divider */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/80" />
                </div>
                <div className="relative inline-block px-3 bg-[#0c111d] dark:bg-[#0c111d] bg-surface text-[10px] sm:text-[11px] font-extrabold tracking-widest text-muted-foreground uppercase">
                  OR CONTINUE WITH
                </div>
              </div>

              {/* Google Sign In Action (52px height) */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading || isGoogleLoading}
                className="w-full h-[52px] rounded-xl bg-background/60 hover:bg-elevated border border-input text-foreground font-sans font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-[0.99] disabled:opacity-50 shadow-xs focus-visible:ring-2 focus-visible:ring-primary"
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>

              {/* Registration Account Switch */}
              <div className="mt-5 text-center text-xs sm:text-sm text-muted-foreground font-sans">
                New to OtakuStreams?{" "}
                <Link
                  to="/register"
                  className="font-bold text-primary hover:underline transition-colors"
                >
                  Create an account
                </Link>
              </div>

              {/* Terms and Privacy */}
              <p className="mt-3 text-[10px] sm:text-[11px] text-muted-foreground/80 text-center leading-relaxed font-sans">
                By continuing, you agree to our{" "}
                <Link to="/terms" className="underline hover:text-foreground transition-colors">
                  Terms
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="underline hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
};

export default Login;
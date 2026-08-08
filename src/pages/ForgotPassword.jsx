import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Mail,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sun,
  Moon,
  Sparkles,
  KeyRound,
  ShieldCheck
} from "lucide-react";
import { useAuth } from "@/context/auth-provider";
import { useTheme } from "@/context/theme-provider";

import LightLogo from "@/assets/Logo Light.png";
import DarkLogo from "@/assets/Logo Dark.png";
import AppLogo from "@/assets/App Logo (2).png";
import loginBg from "@/assets/login-bg.jpg";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { api, user } = useAuth();
  const { theme, setTheme } = useTheme();

  // If already logged in, redirect to /home
  useEffect(() => {
    if (user) {
      navigate("/home", { replace: true });
    }
  }, [user, navigate]);

  // Set document metadata for SEO
  useEffect(() => {
    document.title = "Forgot Password — OtakuStreams";
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content",
      "Reset your OtakuStreams account password to regain access to your anime watchlists and profile."
    );
  }, []);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

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

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setEmailError("Enter your email address.");
      document.getElementById("email")?.focus();
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setEmailError("Enter a valid email address.");
      document.getElementById("email")?.focus();
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/forgot-password", {
        email: trimmedEmail
      });

      const { success, message } = res.data;

      if (!success) throw new Error(message);

      setIsSuccess(true);
      setSuccessMessage(
        message || "If an account exists with this email, you will receive password reset instructions."
      );
      setEmail("");
    } catch (err) {
      if (err.response?.status === 404) {
        setIsSuccess(true);
        setSuccessMessage(
          "If an account exists with this email, you will receive password reset instructions."
        );
      } else {
        setGeneralError(
          err.response?.data?.message || err.message || "Unable to send reset email. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh w-full relative flex flex-col justify-between overflow-x-hidden bg-background text-foreground font-sans selection:bg-primary/30">
      {/* Skip Link */}
      <a
        href="#forgot-form"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-xl shadow-lift transition-all"
      >
        Skip to password recovery form
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

      {/* Navigation Header */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        {/* Brand Link */}
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
          {/* Theme Switcher */}
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-10 h-10 rounded-full bg-surface/80 hover:bg-elevated border border-border/80 text-foreground flex items-center justify-center transition-all shadow-xs backdrop-blur-md cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Back to Login Button */}
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-surface/80 hover:bg-elevated border border-border/80 text-xs font-semibold text-foreground transition-all backdrop-blur-md shadow-xs focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to login</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 flex-1 flex flex-col justify-center py-6 lg:pb-12 lg:pt-4">
        
        {/* 12-Column Grid Aligned at Bottom */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
          
          {/* Left Column: Story Copy Aligned to Bottom/End of Panel */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-end space-y-3.5 text-left max-w-xl pb-2">
            <div className="flex items-center gap-1.5 text-accent font-sans">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-cyan-400 dark:text-cyan-300">
                ACCOUNT RECOVERY
              </span>
            </div>

            <h2 className="font-display font-black text-4xl lg:text-5xl text-foreground leading-[1.1] tracking-tight drop-shadow-md">
              Never lose your<br />
              place in your favorite<br />
              story.
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground font-sans leading-relaxed max-w-md">
              We'll help you get back into your account safely so you can resume watching without missing a single beat.
            </p>
          </div>

          {/* Right Column: Recovery Panel */}
          <div className="w-full lg:col-span-6 flex justify-center lg:justify-end">
            <div className="w-full max-w-md lg:max-w-[440px] bg-surface/85 backdrop-blur-2xl border border-border/80 rounded-t-[24px] sm:rounded-3xl shadow-lift p-5 sm:p-8 lg:p-10 text-left transition-all duration-300">
              
              {/* Panel Top Status Row */}
              <div className="flex items-center justify-between mb-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/80 border border-border/80 text-[11px] font-medium text-foreground/90 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  Account recovery
                </span>
                <span className="text-xs text-muted-foreground font-sans">Password reset</span>
              </div>

              {/* Panel Heading */}
              <div className="space-y-1 mb-6">
                <h1 className="font-display font-black text-2xl sm:text-3xl text-foreground tracking-tight">
                  {isSuccess ? "Check your email." : "Forgot password?"}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground font-sans leading-relaxed">
                  {isSuccess
                    ? "We've sent password reset instructions to your email."
                    : "No worries! Enter your email address and we'll send you a link to reset your password."}
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

              {/* Form-Level Success Alert */}
              {successMessage && (
                <Alert
                  role="status"
                  className="mb-5 border-success/40 bg-success/10 text-success dark:bg-success/20 backdrop-blur-sm rounded-xl"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <AlertDescription className="text-xs font-medium">
                    {successMessage}
                  </AlertDescription>
                </Alert>
              )}

              {!isSuccess ? (
                /* Password Reset Form */
                <form id="forgot-form" onSubmit={handleSubmit} noValidate aria-busy={loading} className="space-y-4">
                  
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
                        value={email}
                        onChange={handleChange}
                        disabled={loading}
                        aria-invalid={emailError ? "true" : "false"}
                        aria-describedby={emailError ? "email-error" : undefined}
                        className={`pl-11 pr-4 h-[52px] rounded-xl bg-background/60 border-input focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground/60 text-xs sm:text-sm font-sans transition-all ${
                          emailError ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
                        }`}
                      />
                    </div>
                    {emailError && (
                      <p id="email-error" className="text-xs text-destructive font-medium flex items-center gap-1.5 mt-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{emailError}</span>
                      </p>
                    )}
                  </div>

                  {/* Primary Submit Button (52px height) */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-[52px] rounded-xl brand-gradient text-white font-sans font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-glow hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 mt-4"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending reset link...</span>
                      </>
                    ) : (
                      <>
                        <span>Send reset link</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                /* Success Feedback State */
                <div className="space-y-4 pt-1">
                  <div className="p-4 rounded-xl bg-background/60 border border-border/80 text-left space-y-1.5">
                    <p className="text-xs font-semibold text-foreground">
                      Didn't receive the email?
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Check your spam or junk folder, or wait a few minutes before trying again.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsSuccess(false);
                      setSuccessMessage("");
                    }}
                    className="w-full h-[52px] rounded-xl bg-background/60 hover:bg-elevated border border-input text-foreground font-sans font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99] shadow-xs focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Try a different email address
                  </button>
                </div>
              )}

              {/* Login Switch */}
              <div className="mt-6 text-center text-xs sm:text-sm text-muted-foreground font-sans">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="font-bold text-primary hover:underline transition-colors"
                >
                  Sign in
                </Link>
              </div>

            </div>
          </div>

        </div>

      </main>
    </div>
  );
};

export default ForgotPassword;
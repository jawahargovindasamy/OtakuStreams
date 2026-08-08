import React, { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AvatarPicker from "@/components/AvatarPicker";
import { useAuth } from "@/context/auth-provider";
import { useTheme } from "@/context/theme-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  User,
  Lock,
  Mail,
  CalendarDays,
  Camera,
  Check,
  Eye,
  EyeOff,
  Sun,
  Moon,
  LogOut,
  Trash2,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Globe,
  Bell,
  Film,
  Tv,
  RotateCcw,
  Loader2,
  Pencil,
} from "lucide-react";

import loginBg from "@/assets/login-bg.jpg";

// Predefined avatar gallery selection (Cloudinary hosted anime character portraits)
const CURATED_AVATARS = [
  { id: "jjk-1", name: "Gojo Satoru", url: "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305912/jjk_13_q1gumf.jpg" },
  { id: "jjk-2", name: "Ryomen Sukuna", url: "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305912/jjk_12_memp13.jpg" },
  { id: "jjk-3", name: "Megumi Fushiguro", url: "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305907/jjk_9_dwyhne.jpg" },
  { id: "aot-1", name: "Eren Yeager", url: "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305975/AOT_8_rosy3h.jpg" },
  { id: "aot-2", name: "Levi Ackerman", url: "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305974/AOT_7_fi7vm2.jpg" },
  { id: "op-1", name: "Monkey D. Luffy", url: "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305833/one_piece_11_itfgms.jpg" },
  { id: "op-2", name: "Roronoa Zoro", url: "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305833/one_piece_10_x96js9.jpg" },
  { id: "naruto-1", name: "Naruto Uzumaki", url: "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305872/naruto_14_esvija.jpg" },
  { id: "naruto-2", name: "Kakashi Hatake", url: "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305867/naruto_11_qrz21i.jpg" },
  { id: "solo-1", name: "Sung Jin-Woo", url: "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305667/Solo_leveling_9_xjrpeb.jpg" },
  { id: "opm-1", name: "Saitama", url: "https://res.cloudinary.com/dp1orljzz/image/upload/v1771305782/One_punch_man_7_sdhrie.jpg" },
  { id: "bc-1", name: "Asta", url: "https://res.cloudinary.com/dp1orljzz/image/upload/v1771306008/black_clover_9_v8bz3c.jpg" },
];

const Progress = ({ value = 0, className = "" }) => (
  <div className={`relative w-full h-1.5 rounded-full bg-muted overflow-hidden ${className}`}>
    <div
      className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

const Profile = () => {
  const { user, api, updateProfile, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    document.title = user?.displayName ? `${user.displayName}'s Profile — OtakuStreams` : "User Profile — OtakuStreams";
  }, [user]);

  // Form states
  const [name, setName] = useState("");
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [accountSuccess, setAccountSuccess] = useState("");
  const [accountError, setAccountError] = useState("");

  // Avatar states
  const [stagedAvatar, setStagedAvatar] = useState("");
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [avatarSuccess, setAvatarSuccess] = useState("");
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // Password states
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Mobile scroll & focus detection for sticky mini-summary
  const [scrolledPast, setScrolledPast] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  useEffect(() => {
    const initialName = user?.username || user?.name || "";
    setName(initialName);
    setStagedAvatar(user?.avatar || "");
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 140) {
        setScrolledPast(true);
      } else {
        setScrolledPast(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Compute profile completeness percentage
  const completionPercentage = useMemo(() => {
    let score = 30; // base email verified
    if (name && name.trim().length > 0) score += 30;
    if (user?.avatar || stagedAvatar) score += 40;
    return score;
  }, [name, user?.avatar, stagedAvatar]);

  // Derived initial letter fallback
  const initialLetter = useMemo(() => {
    const displayName = name || user?.username || user?.name || user?.email || "User";
    return displayName.charAt(0).toUpperCase();
  }, [name, user]);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const pass = passwords.new;
    if (!pass) return { score: 0, label: "—", color: "bg-muted" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: "Weak", color: "bg-destructive" };
      case 2:
        return { score: 2, label: "Fair", color: "bg-amber-500" };
      case 3:
        return { score: 3, label: "Strong", color: "bg-primary" };
      case 4:
        return { score: 4, label: "Very strong", color: "bg-emerald-500" };
      default:
        return { score: 1, label: "Weak", color: "bg-destructive" };
    }
  }, [passwords.new]);

  // Account Information Save
  const handleSaveAccountInfo = async () => {
    setAccountError("");
    setAccountSuccess("");
    if (!name.trim()) {
      setAccountError("Display name cannot be empty");
      return;
    }
    setIsSavingAccount(true);
    try {
      await updateProfile({ username: name.trim() });
      setAccountSuccess("Your account details were saved.");
      setIsEditingAccount(false);
      setTimeout(() => setAccountSuccess(""), 4000);
    } catch (err) {
      setAccountError(err?.response?.data?.message || "Failed to update profile name");
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handleCancelAccountInfo = () => {
    setName(user?.username || user?.name || "");
    setAccountError("");
    setIsEditingAccount(false);
  };

  // Avatar Selection Save
  const handleSaveAvatar = async () => {
    if (!stagedAvatar || stagedAvatar === user?.avatar) return;
    setAvatarSuccess("");
    setIsSavingAvatar(true);
    try {
      await updateProfile({ avatar: stagedAvatar });
      setAvatarSuccess("Avatar updated successfully.");
      setTimeout(() => setAvatarSuccess(""), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const handleRevertAvatar = () => {
    setStagedAvatar(user?.avatar || "");
  };

  // Password Update
  const handlePasswordChange = (field, value) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
    if (passwordError) setPasswordError("");
    if (passwordSuccess) setPasswordSuccess("");
  };

  const handleUpdatePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!passwords.current) {
      setPasswordError("Current password is required");
      return;
    }
    if (!passwords.new) {
      setPasswordError("New password is required");
      return;
    }
    if (passwords.new.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setPasswordError("New passwords do not match");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { data } = await api.post("/auth/reset-password", {
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });

      setPasswordSuccess(data?.message || "Password updated successfully");
      setPasswords({ current: "", new: "", confirm: "" });
      setTimeout(() => setPasswordSuccess(""), 4000);
    } catch (err) {
      setPasswordError(err?.response?.data?.message || "Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Account Deletion
  const handleDeleteAccountConfirm = async () => {
    setIsDeleting(true);
    try {
      await api.delete("/auth/account");
      logout();
    } catch (err) {
      console.error("Account deletion failed:", err);
      // Fallback logout if endpoint returns error
      logout();
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const memberSinceDate = useMemo(() => {
    if (!user?.createdAt) return "August 2025";
    try {
      return new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    } catch {
      return "August 2025";
    }
  }, [user?.createdAt]);

  const isDirtyAccount = name.trim() !== (user?.username || user?.name || "");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
      {/* 1. Shared Navbar */}
      <header className="sticky top-0 z-40 w-full glass border-b border-glass-border">
        <Navbar />
      </header>

      {/* Mobile Sticky Mini-Summary (<768px) */}
      {scrolledPast && !isInputFocused && (
        <div className="md:hidden sticky top-[64px] z-30 w-full glass border-b border-glass-border px-4 py-2.5 flex items-center justify-between shadow-soft animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-8 w-8 rounded-full border border-border shrink-0">
              <AvatarImage src={stagedAvatar || user?.avatar} className="object-cover" />
              <AvatarFallback className="bg-elevated text-foreground font-display text-xs font-bold">
                {initialLetter}
              </AvatarFallback>
            </Avatar>
            <span className="font-display font-bold text-sm text-foreground truncate max-w-[180px]">
              {name || user?.username || user?.name || "Profile"}
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              const el = document.getElementById("account-info");
              if (el) el.scrollIntoView({ behavior: "smooth" });
              setIsEditingAccount(true);
            }}
            className="h-8 px-3 text-xs font-semibold text-primary hover:bg-primary/10 rounded-lg"
          >
            Edit
          </Button>
        </div>
      )}

      <main id="main" className="flex-1 w-full pb-16 lg:pb-24">
        {/* 2. Section 2 — Cinematic Profile Hero */}
        <section
          aria-labelledby="hero-display-name"
          className="relative w-full min-h-[380px] sm:min-h-[420px] md:min-h-[480px] lg:min-h-[520px] overflow-hidden pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-14 flex items-end"
        >
          {/* Background Artwork (Same as Login Screen) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <img
              src={loginBg}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover object-center transition-opacity duration-700"
            />

            {/* Theme-Adaptive Scrim Overlays — Soft bottom fade for legibility in both Light & Dark modes */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent dark:from-background dark:via-background/70 dark:to-transparent" />
            <div className="absolute inset-0 bg-white/10 dark:bg-black/30" />
          </div>

          {/* Hero Content Box matching reference layout */}
          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="space-y-5 max-w-4xl">
              {/* PROFILE Eyebrow */}
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-muted-foreground font-sans">
                PROFILE
              </div>

              {/* Avatar + Main Info Row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
                {/* Avatar with White Ring */}
                <div className="relative group shrink-0">
                  <Avatar className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full border-4 border-white dark:border-surface shadow-lift bg-elevated transition-transform duration-300 group-hover:scale-[1.02]">
                    <AvatarImage src={stagedAvatar || user?.avatar} className="object-cover" />
                    <AvatarFallback className="bg-elevated text-foreground font-display text-3xl font-black">
                      {initialLetter}
                    </AvatarFallback>
                  </Avatar>

                  <button
                    type="button"
                    onClick={() => setShowAvatarModal(true)}
                    aria-label="Change profile avatar"
                    className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 sm:p-2.5 rounded-full shadow-md hover:bg-primary/90 transition-all duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>

                {/* Identity Info */}
                <div className="space-y-1 min-w-0">
                  <h1
                    id="hero-display-name"
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-black font-display text-slate-900 dark:text-foreground tracking-tight line-clamp-2 break-words leading-none"
                  >
                    {name || user?.username || user?.name || "Kenji Watanabe"}
                  </h1>
                  <p className="text-sm font-sans font-medium text-slate-600 dark:text-subtle flex flex-wrap items-center gap-2 pt-1">
                    <span className="truncate max-w-[220px] sm:max-w-xs">{user?.email || "kenji@example.com"}</span>
                    <span className="text-slate-400 dark:text-muted-foreground/60">•</span>
                    <span>Member since {memberSinceDate}</span>
                  </p>
                </div>
              </div>

              {/* Progress & Edit Profile Button Row */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 pt-1">
                {/* Progress Bar & Label */}
                <div className="space-y-1.5 min-w-[200px] sm:min-w-[240px]">
                  <Progress value={completionPercentage} className="h-2 bg-slate-200 dark:bg-muted" />
                  <p className="text-xs font-semibold text-slate-500 dark:text-muted-foreground">
                    Profile {completionPercentage}% complete
                  </p>
                </div>

                {/* Pill Edit Profile Button */}
                <Button
                  onClick={() => {
                    const el = document.getElementById("account-info");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                    setIsEditingAccount(true);
                  }}
                  className="h-10 px-5 rounded-full font-semibold bg-[#6366f1] hover:bg-indigo-600 text-white shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer self-start sm:self-auto flex items-center gap-2 text-sm"
                >
                  <Pencil className="h-4 w-4" />
                  Edit profile
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Area — Two-Column Grid on Desktop */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8 lg:mt-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Main Editing Column (col-span-8) */}
            <div className="lg:col-span-8 space-y-8 lg:space-y-12">
              {/* 4. Section 4 — Account Information */}
              <section
                id="account-info"
                aria-labelledby="account-info-title"
                className="bg-surface rounded-3xl border border-border p-6 sm:p-7 lg:p-8 shadow-soft space-y-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2
                      id="account-info-title"
                      className="text-xl sm:text-2xl font-bold font-display text-foreground tracking-tight"
                    >
                      Account information
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-sans">
                      Manage your display name and registered email address.
                    </p>
                  </div>

                  {!isEditingAccount ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingAccount(true)}
                      className="h-9 px-4 rounded-xl text-xs font-semibold border-border hover:bg-elevated cursor-pointer"
                    >
                      Edit
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      {isDirtyAccount && (
                        <Badge variant="secondary" className="text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                          Unsaved changes
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Alerts */}
                {accountSuccess && (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in duration-200">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{accountSuccess}</span>
                  </div>
                )}
                {accountError && (
                  <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in duration-200">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{accountError}</span>
                  </div>
                )}

                <div className="space-y-5">
                  {/* Display Name Field */}
                  <div className="space-y-2">
                    <Label htmlFor="display-name" className="text-xs font-semibold text-foreground uppercase tracking-wider">
                      Display name
                    </Label>
                    {isEditingAccount ? (
                      <Input
                        id="display-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setIsInputFocused(false)}
                        placeholder="Enter display name"
                        className="h-11 rounded-xl bg-background border-input text-foreground px-3.5 focus-visible:ring-ring"
                      />
                    ) : (
                      <div className="h-11 px-3.5 flex items-center font-medium text-foreground text-sm sm:text-base bg-elevated/40 rounded-xl border border-transparent">
                        {name || user?.username || user?.name || "Not set"}
                      </div>
                    )}
                    <div className="min-h-5 text-xs text-muted-foreground">
                      Shown publicly across OtakuStreams.
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email-address" className="text-xs font-semibold text-foreground uppercase tracking-wider">
                      Email address
                    </Label>
                    <div className="relative">
                      <Input
                        id="email-address"
                        value={user?.email || ""}
                        readOnly
                        className="h-11 rounded-xl bg-elevated/40 border-border/50 text-foreground px-3.5 pr-24 cursor-not-allowed"
                      />
                      <Badge
                        variant="secondary"
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[11px] font-medium"
                      >
                        Verified
                      </Badge>
                    </div>
                    <div className="min-h-5 text-xs text-muted-foreground">
                      Used for sign-in and account notices.
                    </div>
                  </div>
                </div>

                {/* Edit Mode Action Row */}
                {isEditingAccount && (
                  <div className="pt-3 border-t border-border/60 flex items-center justify-end gap-3 animate-in fade-in duration-200">
                    <Button
                      variant="outline"
                      onClick={handleCancelAccountInfo}
                      disabled={isSavingAccount}
                      className="h-11 px-5 rounded-xl text-sm font-semibold border-border hover:bg-elevated cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveAccountInfo}
                      disabled={isSavingAccount || !isDirtyAccount}
                      className="h-11 px-6 rounded-xl text-sm font-semibold bg-primary text-primary-foreground shadow-glow hover:bg-primary/90 cursor-pointer disabled:opacity-50"
                    >
                      {isSavingAccount ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Saving…
                        </>
                      ) : (
                        "Save changes"
                      )}
                    </Button>
                  </div>
                )}
              </section>

              {/* 5. Section 5 — Avatar Gallery */}
              <section
                aria-labelledby="avatar-gallery-title"
                className="bg-surface rounded-3xl border border-border p-6 sm:p-7 lg:p-8 shadow-soft space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2
                      id="avatar-gallery-title"
                      className="text-xl sm:text-2xl font-bold font-display text-foreground tracking-tight"
                    >
                      Choose your avatar
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-sans">
                      Select a character portrait from the gallery below.
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAvatarModal(true)}
                    className="h-9 px-4 rounded-xl text-xs font-semibold border-border hover:bg-elevated cursor-pointer self-start sm:self-auto"
                  >
                    Browse all categories
                  </Button>
                </div>

                {/* Avatar Success Alert */}
                {avatarSuccess && (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in duration-200">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{avatarSuccess}</span>
                  </div>
                )}

                {/* Avatar Card Grid / Mobile Snap Rail */}
                <div
                  role="radiogroup"
                  aria-labelledby="avatar-gallery-title"
                  className="flex sm:grid grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory py-1 px-1 -mx-1"
                >
                  {CURATED_AVATARS.map((av) => {
                    const isStaged = stagedAvatar === av.url;
                    const isCurrent = user?.avatar === av.url;

                    return (
                      <div
                        key={av.id}
                        role="radio"
                        aria-checked={isStaged}
                        tabIndex={0}
                        onClick={() => setStagedAvatar(av.url)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setStagedAvatar(av.url);
                          }
                        }}
                        className={`snap-start shrink-0 w-[116px] sm:w-auto aspect-square rounded-2xl border overflow-hidden relative cursor-pointer group transition-all duration-200 select-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                          isStaged
                            ? "border-primary ring-2 ring-primary shadow-glow scale-[1.02]"
                            : "border-border/70 hover:border-border hover:-translate-y-0.5 hover:shadow-lift"
                        }`}
                      >
                        <img
                          src={av.url}
                          alt={av.name}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />

                        {/* Current Pill */}
                        {isCurrent && (
                          <span className="absolute top-2 left-2 bg-elevated/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-foreground px-2 py-0.5 rounded-full border border-border/50 shadow-xs">
                            Current
                          </span>
                        )}

                        {/* Selected Check Badge */}
                        {isStaged && (
                          <span className="absolute bottom-2 right-2 bg-primary text-primary-foreground p-1 rounded-full shadow-md animate-in zoom-in-50 duration-150">
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Gallery Action Controls */}
                {stagedAvatar !== user?.avatar && (
                  <div className="pt-3 border-t border-border/60 flex items-center justify-end gap-3 animate-in fade-in duration-200">
                    <Button
                      variant="outline"
                      onClick={handleRevertAvatar}
                      disabled={isSavingAvatar}
                      className="h-11 px-5 rounded-xl text-sm font-semibold border-border hover:bg-elevated cursor-pointer"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Revert
                    </Button>
                    <Button
                      onClick={handleSaveAvatar}
                      disabled={isSavingAvatar}
                      className="h-11 px-6 rounded-xl text-sm font-semibold bg-primary text-primary-foreground shadow-glow hover:bg-primary/90 cursor-pointer"
                    >
                      {isSavingAvatar ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Saving…
                        </>
                      ) : (
                        "Save avatar"
                      )}
                    </Button>
                  </div>
                )}
              </section>

              {/* 6. Section 6 — Password Management */}
              <section
                aria-labelledby="password-title"
                className="bg-surface rounded-3xl border border-border p-6 sm:p-7 lg:p-8 shadow-soft space-y-6"
              >
                <div>
                  <h2
                    id="password-title"
                    className="text-xl sm:text-2xl font-bold font-display text-foreground tracking-tight"
                  >
                    Password
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-sans">
                    Update your password to secure your account.
                  </p>
                </div>

                {/* Password Alerts */}
                {passwordSuccess && (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in duration-200">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}
                {passwordError && (
                  <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in duration-200">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <div className="space-y-4 max-w-xl">
                  {/* Current Password */}
                  <div className="space-y-2">
                    <Label htmlFor="current-pass" className="text-xs font-semibold text-foreground uppercase tracking-wider">
                      Current password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="current-pass"
                        type={showCurrentPass ? "text" : "password"}
                        value={passwords.current}
                        onChange={(e) => handlePasswordChange("current", e.target.value)}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setIsInputFocused(false)}
                        autoComplete="current-password"
                        placeholder="Enter current password"
                        className="h-11 pl-10 pr-12 rounded-xl bg-background border-input text-foreground"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        aria-label={showCurrentPass ? "Hide password" : "Show password"}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                      >
                        {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="new-pass" className="text-xs font-semibold text-foreground uppercase tracking-wider">
                      New password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="new-pass"
                        type={showNewPass ? "text" : "password"}
                        value={passwords.new}
                        onChange={(e) => handlePasswordChange("new", e.target.value)}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setIsInputFocused(false)}
                        autoComplete="new-password"
                        placeholder="Enter new password"
                        className="h-11 pl-10 pr-12 rounded-xl bg-background border-input text-foreground"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        aria-label={showNewPass ? "Hide password" : "Show password"}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                      >
                        {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Strength Meter (Reserved 28px) */}
                    <div className="pt-2 min-h-[28px] space-y-1.5">
                      <div className="flex gap-1.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-full flex-1 transition-all duration-300 rounded-full ${
                              level <= passwordStrength.score ? passwordStrength.color : "bg-transparent"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                        <span>Password strength</span>
                        <span className="font-semibold">{passwordStrength.label}</span>
                      </div>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirm-pass" className="text-xs font-semibold text-foreground uppercase tracking-wider">
                      Confirm new password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-pass"
                        type={showConfirmPass ? "text" : "password"}
                        value={passwords.confirm}
                        onChange={(e) => handlePasswordChange("confirm", e.target.value)}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setIsInputFocused(false)}
                        autoComplete="new-password"
                        placeholder="Confirm new password"
                        className="h-11 pl-10 pr-12 rounded-xl bg-background border-input text-foreground"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        aria-label={showConfirmPass ? "Hide password" : "Show password"}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                      >
                        {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Match Feedback */}
                    <div className="min-h-5 text-xs font-medium">
                      {passwords.confirm && (
                        passwords.new === passwords.confirm ? (
                          <span className="text-emerald-500 flex items-center gap-1.5">
                            <Check className="h-3.5 w-3.5" /> Passwords match
                          </span>
                        ) : (
                          <span className="text-destructive flex items-center gap-1.5">
                            <AlertCircle className="h-3.5 w-3.5" /> Passwords don't match
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      onClick={handleUpdatePassword}
                      disabled={isUpdatingPassword || !passwords.current || !passwords.new || passwords.new !== passwords.confirm}
                      className="h-11 px-6 rounded-xl font-semibold bg-primary text-primary-foreground shadow-glow hover:bg-primary/90 cursor-pointer disabled:opacity-50"
                    >
                      {isUpdatingPassword ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Updating…
                        </>
                      ) : (
                        "Update password"
                      )}
                    </Button>
                  </div>
                </div>
              </section>

              {/* 7. Section 7 — Preferences Overview (Visual Placeholders) */}
              <section
                aria-labelledby="preferences-title"
                className="bg-surface rounded-3xl border border-border p-6 sm:p-7 lg:p-8 shadow-soft space-y-6"
              >
                <div>
                  <h2
                    id="preferences-title"
                    className="text-xl sm:text-2xl font-bold font-display text-foreground tracking-tight"
                  >
                    Preferences
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-sans">
                    Manage your app theme and playback preferences.
                  </p>
                </div>

                <div className="divide-y divide-border/60">
                  {/* Theme Row (Live Interactive) */}
                  <div className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="p-2.5 rounded-xl bg-elevated text-muted-foreground shrink-0">
                        {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm sm:text-base text-foreground">Theme mode</div>
                        <div className="text-xs text-muted-foreground truncate">
                          Currently in {theme === "dark" ? "Dark mode" : "Light mode"}
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                      className="h-9 px-4 rounded-xl text-xs font-semibold border-border hover:bg-elevated cursor-pointer shrink-0"
                    >
                      Toggle {theme === "dark" ? "Light" : "Dark"}
                    </Button>
                  </div>

                  {/* Language Row (Placeholder) */}
                  <div className="py-4 flex items-center justify-between gap-4 aria-disabled" aria-disabled="true">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="p-2.5 rounded-xl bg-elevated/50 text-muted-foreground/60 shrink-0">
                        <Globe className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm sm:text-base text-foreground/80">Title language</div>
                        <div className="text-xs text-muted-foreground/70 truncate">
                          Display anime titles in English or Japanese
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[11px] font-medium bg-muted text-muted-foreground border-border shrink-0">
                      Coming soon
                    </Badge>
                  </div>

                  {/* Notifications Row (Placeholder) */}
                  <div className="py-4 flex items-center justify-between gap-4 aria-disabled" aria-disabled="true">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="p-2.5 rounded-xl bg-elevated/50 text-muted-foreground/60 shrink-0">
                        <Bell className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm sm:text-base text-foreground/80">Notifications</div>
                        <div className="text-xs text-muted-foreground/70 truncate">
                          Episode release alerts & push notifications
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[11px] font-medium bg-muted text-muted-foreground border-border shrink-0">
                      Coming soon
                    </Badge>
                  </div>

                  {/* Anime Preferences Row (Placeholder) */}
                  <div className="py-4 flex items-center justify-between gap-4 aria-disabled" aria-disabled="true">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="p-2.5 rounded-xl bg-elevated/50 text-muted-foreground/60 shrink-0">
                        <Film className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm sm:text-base text-foreground/80">Anime preferences</div>
                        <div className="text-xs text-muted-foreground/70 truncate">
                          Content filters & default audio preference
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[11px] font-medium bg-muted text-muted-foreground border-border shrink-0">
                      Coming soon
                    </Badge>
                  </div>

                  {/* Playback Row (Placeholder) */}
                  <div className="py-4 flex items-center justify-between gap-4 aria-disabled" aria-disabled="true">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="p-2.5 rounded-xl bg-elevated/50 text-muted-foreground/60 shrink-0">
                        <Tv className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm sm:text-base text-foreground/80">Playback controls</div>
                        <div className="text-xs text-muted-foreground/70 truncate">
                          Autoplay, default video quality & player controls
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[11px] font-medium bg-muted text-muted-foreground border-border shrink-0">
                      Coming soon
                    </Badge>
                  </div>
                </div>
              </section>

              {/* 8. Section 8 — Account Actions */}
              <div className="mt-16 sm:mt-20 pt-8 border-t border-border">
                <section
                  aria-labelledby="account-actions-title"
                  className="bg-background rounded-3xl border border-border p-6 sm:p-7 lg:p-8 space-y-6"
                >
                  <div>
                    <h2
                      id="account-actions-title"
                      className="text-xl sm:text-2xl font-bold font-display text-foreground tracking-tight"
                    >
                      Account actions
                    </h2>
                  </div>

                  <div className="space-y-6">
                    {/* Sign Out Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="font-semibold text-sm sm:text-base text-foreground">Sign out</div>
                        <div className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                          Sign out of OtakuStreams on this device.
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={logout}
                        className="h-11 px-6 rounded-xl font-semibold border-border hover:bg-elevated text-foreground cursor-pointer shrink-0"
                      >
                        <LogOut className="h-4 w-4 mr-2 text-muted-foreground" />
                        Sign out
                      </Button>
                    </div>

                    <div className="h-px bg-border/60" />

                    {/* Delete Account Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="font-semibold text-sm sm:text-base text-destructive">Delete account</div>
                        <div className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                          Deleting your account is permanent. All data will be erased.
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => setShowDeleteModal(true)}
                        className="h-11 px-6 rounded-xl font-semibold border border-destructive/40 text-destructive hover:bg-destructive/10 cursor-pointer shrink-0"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete account
                      </Button>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Sticky Overview Rail on Desktop (col-span-4) */}
            <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
              <div className="bg-surface rounded-3xl border border-border p-6 sm:p-7 shadow-soft space-y-6">
                <h2 className="text-lg font-bold font-display text-foreground tracking-tight">
                  Account overview
                </h2>

                <dl className="space-y-4">
                  {/* Row 1: Signed in as */}
                  <div className="space-y-1.5">
                    <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Signed in as
                    </dt>
                    <dd className="flex items-center gap-3 pt-0.5">
                      <Avatar className="h-10 w-10 rounded-full border border-border shrink-0">
                        <AvatarImage src={stagedAvatar || user?.avatar} className="object-cover" />
                        <AvatarFallback className="bg-elevated text-foreground font-display text-sm font-bold">
                          {initialLetter}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-semibold text-foreground text-sm truncate">
                          {name || user?.username || user?.name || "Otaku User"}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {user?.email}
                        </div>
                      </div>
                    </dd>
                  </div>

                  {/* Row 2: Email */}
                  <div className="space-y-1">
                    <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Email address
                    </dt>
                    <dd className="text-sm font-medium text-subtle break-words">
                      {user?.email || "user@otakustreams.app"}
                    </dd>
                  </div>

                  {/* Row 3: Member since */}
                  <div className="space-y-1">
                    <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Member since
                    </dt>
                    <dd className="text-sm font-medium text-muted-foreground tabular-nums">
                      {memberSinceDate}
                    </dd>
                  </div>

                  <div className="h-px bg-border/60" />

                  {/* Row 4: Theme */}
                  <div className="flex items-center justify-between">
                    <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Theme
                    </dt>
                    <dd>
                      <Badge variant="outline" className="text-xs font-medium border-border capitalize">
                        {theme}
                      </Badge>
                    </dd>
                  </div>

                  {/* Row 5: Session */}
                  <div className="flex items-center justify-between">
                    <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Session
                    </dt>
                    <dd className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <Badge variant="secondary" className="text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                        Active
                      </Badge>
                    </dd>
                  </div>

                  {/* Row 6: Profile completeness */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                      <span>Completeness</span>
                      <span>{completionPercentage}%</span>
                    </div>
                    <Progress value={completionPercentage} />
                  </div>
                </dl>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Full Avatar Modal Picker */}
      <AvatarPicker
        open={showAvatarModal}
        onOpenChange={setShowAvatarModal}
        setOpen={setShowAvatarModal}
        selectedAvatar={stagedAvatar || user?.avatar}
      />

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md bg-surface border-border rounded-3xl p-6 sm:p-7 shadow-lift">
          <DialogHeader className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-bold font-display text-foreground">
              Delete your account?
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              This action cannot be undone. All your watch history, bookmarks, and preferences will be permanently erased.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
              className="h-11 px-5 rounded-xl text-sm font-semibold border-border hover:bg-elevated cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteAccountConfirm}
              disabled={isDeleting}
              className="h-11 px-6 rounded-xl text-sm font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting…
                </>
              ) : (
                "Delete account"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 9. Section 9 — Shared Footer */}
      <Footer />
    </div>
  );
};

export default Profile;

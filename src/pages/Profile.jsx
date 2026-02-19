import Navbar from "@/components/Navbar";
import SecondaryNavbar from "@/components/SecondaryNavbar";
import React, { useState, useEffect } from "react";
import { User, ChevronDown, ChevronUp, Lock, Mail, CalendarDays, Camera } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth-provider";
import AvatarPicker from "@/components/AvatarPicker";
import { AnimatePresence } from "framer-motion";

const Profile = () => {
  const { user, api, updateProfile } = useAuth();
  const [name, setName] = useState();
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [open, setOpen] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    setName(user?.username || user?.name || "");
  }, [user]);

  /* =============================
     Password Handlers
  ============================= */
  const handlePasswordChange = (field, value) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
    if (passwordError) setPasswordError("");
    if (passwordSuccess) setPasswordSuccess("");
  };

  const validatePasswordForm = () => {
    if (!passwords.current.trim()) return setPasswordError("Current password is required");
    if (!passwords.new.trim()) return setPasswordError("New password is required");
    if (passwords.new.length < 6) return setPasswordError("New password must be at least 6 characters");
    if (passwords.new !== passwords.confirm) return setPasswordError("New passwords do not match");
    return true;
  };

  const handlePasswordUpdate = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!validatePasswordForm()) return;

    setIsUpdatingPassword(true);

    try {
      const { data } = await api.post("/auth/reset-password", {
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });

      setPasswordSuccess(data.message || "Password updated successfully");
      setPasswords({ current: "", new: "", confirm: "" });
      setShowPasswordFields(false);
    } catch (error) {
      setPasswordError(error.response?.data?.message || "Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  /* =============================
     Profile Save Handler
  ============================= */
  const handleProfileSave = async () => {
    await updateProfile({
      username: name
    })
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <SecondaryNavbar />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <User className="h-6 w-6 sm:h-8 sm:w-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Edit Profile</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Manage your account settings and preferences
            </p>
          </div>
        </div>

        <Card className="border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardContent className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_380px] gap-6 sm:gap-8 p-4 sm:p-6 lg:p-8">

            {/* Form Section */}
            <div className="space-y-5 sm:space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" /> Email Address
                </Label>
                <div className="relative">
                  <Input value={user?.email} readOnly className="bg-muted/50 text-foreground border-border/50 h-10 sm:h-11 pr-24" />
                  <Badge
                    variant="secondary"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                  >
                    Verified
                  </Badge>
                </div>
              </div>

              <Separator className="bg-border/50" />

              {/* Name */}
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">Your Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background text-foreground border-border/50 h-10 sm:h-11 focus-visible:ring-primary/20"
                  placeholder="Enter your name"
                />
              </div>

              {/* Member Since */}
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <CalendarDays className="h-3.5 w-3.5" /> Member Since
                </Label>
                <Input
                  value={new Date(user?.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  readOnly
                  className="bg-muted/50 text-foreground border-border/50 h-10 sm:h-11"
                />
              </div>

              <Separator className="bg-border/50" />

              {/* Password Section */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordFields(!showPasswordFields)}
                  className="flex items-center justify-between w-full group py-2 rounded-lg hover:bg-accent/50 px-3 -ml-3 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                      <Lock className="h-4 w-4" />
                    </div>
                    Change Password
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    <span className="hidden sm:inline">{showPasswordFields ? "Hide" : "Show"}</span>
                    {showPasswordFields ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </button>

                <AnimatePresence>
                  {showPasswordFields && (
                    <div className="overflow-hidden animate-in slide-in-from-top-2 duration-200">
                      <div className="space-y-4 pt-2 pl-4 sm:pl-6 border-l-2 border-primary/30">
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Current Password</Label>
                          <Input
                            type="password"
                            value={passwords.current}
                            onChange={(e) => handlePasswordChange("current", e.target.value)}
                            placeholder="Enter current password"
                            disabled={isUpdatingPassword}
                            className="bg-background border-border/50 h-10 sm:h-11 focus-visible:ring-primary/20"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">New Password</Label>
                          <Input
                            type="password"
                            value={passwords.new}
                            onChange={(e) => handlePasswordChange("new", e.target.value)}
                            placeholder="Enter new password"
                            className="bg-background border-border/50 h-10 sm:h-11 focus-visible:ring-primary/20"
                            disabled={isUpdatingPassword}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Confirm New Password</Label>
                          <Input
                            type="password"
                            value={passwords.confirm}
                            onChange={(e) => handlePasswordChange("confirm", e.target.value)}
                            placeholder="Confirm new password"
                            disabled={isUpdatingPassword}
                            className="bg-background border-border/50 h-10 sm:h-11 focus-visible:ring-primary/20"
                          />
                        </div>

                        {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
                        {passwordSuccess && <p className="text-green-500 text-sm">{passwordSuccess}</p>}

                        <Button
                          onClick={handlePasswordUpdate}
                          disabled={isUpdatingPassword}
                          className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                        >
                          {isUpdatingPassword ? (
                            <>
                              <span className="animate-spin mr-2">⏳</span> Updating...
                            </>
                          ) : (
                            "Update Password"
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Save Button */}
              <Button
                onClick={handleProfileSave}
                className="w-full h-11 sm:h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Save Changes
              </Button>
            </div>

            {/* Avatar Section */}
            <div className="flex flex-col items-center justify-center rounded-2xl bg-linear-to-b from-muted/30 to-muted/10 border border-border/50 p-6 sm:p-8 space-y-4">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-linear-to-r from-primary to-primary/50 rounded-full opacity-30 group-hover:opacity-50 blur transition duration-500" />
                <Avatar className="relative h-32 w-32 sm:h-36 sm:w-36 ring-4 ring-background shadow-2xl">
                  <AvatarImage src={user?.avatar} className="object-cover" />
                  <AvatarFallback className="bg-muted text-foreground text-2xl font-bold">{user?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>

                <button
                  onClick={() => setOpen(true)}
                  className="absolute bottom-1 right-1 bg-primary text-primary-foreground p-2.5 sm:p-3 rounded-full shadow-lg hover:bg-primary/90 transition-all duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
                  aria-label="Change avatar"
                >
                  <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>

              <div className="text-center space-y-1">
                <h3 className="font-semibold text-foreground">{user?.name}</h3>
                <p className="text-xs text-muted-foreground">Click the camera to update</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <AvatarPicker
        open={open}
        onOpenChange={setOpen}
        setOpen={setOpen}
        selectedAvatar={user?.avatar}
      />
    </div>
  );
};

export default Profile;

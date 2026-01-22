import Navbar from "@/components/Navbar";
import SecondaryNavbar from "@/components/SecondaryNavbar";
import React, { useState } from "react";
import { User, Pencil, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/auth-provider";
import AvatarPicker from "@/components/AvatarPicker";

const Profile = () => {
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [open, setOpen] = useState(false);
  const [avatar, setAvatar] = useState("/src/assets/JJK/av-jjk-02.png");
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const { user, setUser } = useAuth();

  const handlePasswordChange = (field, value) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      <SecondaryNavbar />
      <div className="min-h-screen p-8">
        <div className="flex items-center gap-3 mb-8 text-black dark:text-white">
          <User className="h-8 w-8" />
          <h1 className="text-3xl font-semibold">Edit Profile</h1>
        </div>

        <Card className="border border-gray-400 dark:border-gray-700 bg-white dark:bg-gray-900">
          <CardContent className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8 p-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-gray-600 dark:text-gray-400">
                  EMAIL ADDRESS
                </Label>
                <Input
                  value={user.email}
                  readOnly
                  className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-700"
                />
                <Badge
                  variant="outline"
                  className="mt-2 w-fit border-pink-400 text-pink-400 dark:border-pink-500 dark:text-pink-500"
                >
                  ✔ Verified
                </Badge>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-600 dark:text-gray-400">
                  YOUR NAME
                </Label>
                <Input
                  defaultValue={user.name}
                  className="bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-600 dark:text-gray-400">
                  JOINED
                </Label>
                <Input
                  value={user.createdAt}
                  readOnly
                  className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-700"
                />
              </div>

              <button
                onClick={() => setShowPasswordFields(!showPasswordFields)}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
              >
                🔑 Change password
                {showPasswordFields ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {/* Password Change Fields */}
              {showPasswordFields && (
                <div className="space-y-4 pl-6 border-l-2 border-pink-400 dark:border-purple-600">
                  <div className="space-y-2">
                    <Label className="text-gray-600 dark:text-gray-400">
                      CURRENT PASSWORD
                    </Label>
                    <Input
                      type="password"
                      value={passwords.current}
                      onChange={(e) =>
                        handlePasswordChange("current", e.target.value)
                      }
                      placeholder="Enter current password"
                      className="bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-600 dark:text-gray-400">
                      NEW PASSWORD
                    </Label>
                    <Input
                      type="password"
                      value={passwords.new}
                      onChange={(e) =>
                        handlePasswordChange("new", e.target.value)
                      }
                      placeholder="Enter new password"
                      className="bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-600 dark:text-gray-400">
                      CONFIRM NEW PASSWORD
                    </Label>
                    <Input
                      type="password"
                      value={passwords.confirm}
                      onChange={(e) =>
                        handlePasswordChange("confirm", e.target.value)
                      }
                      placeholder="Confirm new password"
                      className="bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-700"
                    />
                  </div>
                </div>
              )}

              {/* Save */}
              <Button className="w-full bg-pink-400 dark:bg-pink-500 text-white hover:bg-pink-500 dark:hover:bg-pink-600">
                Save
              </Button>
            </div>

            <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-b from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 p-6">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-pink-400 dark:border-purple-600">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-gray-300 dark:bg-gray-700 text-black dark:text-white">
                    JG
                  </AvatarFallback>
                </Avatar>

                <button
                  onClick={() => setOpen(true)}
                  className="absolute bottom-1 right-1 bg-white dark:bg-gray-800 text-black dark:text-white p-2 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <AvatarPicker
                  open={open}
                  onOpenChange={setOpen}
                  onSelect={(selectedAvatar) => {
                    setUser((prevUser) => ({
                      ...prevUser,
                      avatar: selectedAvatar,
                    }));
                    setOpen(false);
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;

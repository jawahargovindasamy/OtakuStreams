import Navbar from '@/components/Navbar'
import SecondaryNavbar from '@/components/SecondaryNavbar'
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import { Bell, Languages, FolderX } from 'lucide-react'
import { useAuth } from '@/context/auth-provider'

const Settings = () => {
  const { language, setLanguage, ignoredFolders, setIgnoredFolders, updateSettings } = useAuth()


  const handleFolderToggle = (folder) => {
    const updated = {
      ...ignoredFolders,
      [folder]: !ignoredFolders[folder],
    };

    // optimistic UI update
    setIgnoredFolders(updated);

    // send correct API body
    updateSettings({
      watching: updated.watching,
      on_hold: updated.onHold,
      plan_to_watch: updated.planToWatch,
      dropped: updated.dropped,
      completed: updated.completed,
    });
  };



  const folders = [
    { key: 'watching', label: 'Watching' },
    { key: 'onHold', label: 'On-Hold' },
    { key: 'planToWatch', label: 'Plan to Watch' },
    { key: 'completed', label: 'Completed' },
    { key: 'dropped', label: 'Dropped' },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <SecondaryNavbar />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground mt-2">Manage your preferences and notification settings</p>
          </div>

          {/* Language Settings */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Languages className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Anime Name Language</CardTitle>
                  <CardDescription>Choose how anime titles are displayed</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={language}
                onValueChange={setLanguage}
                className="flex flex-col sm:flex-row gap-4"
              >
                <div className={cn(
                  "flex items-center space-x-3 rounded-xl border-2 p-4 cursor-pointer transition-all duration-200",
                  language === 'EN'
                    ? "border-primary bg-primary/5"
                    : "border-border/50 hover:border-border hover:bg-accent"
                )}>
                  <RadioGroupItem value="EN" id="EN" />
                  <Label htmlFor="EN" className="cursor-pointer font-medium">
                    English
                  </Label>
                </div>
                <div className={cn(
                  "flex items-center space-x-3 rounded-xl border-2 p-4 cursor-pointer transition-all duration-200",
                  language === 'JP'
                    ? "border-primary bg-primary/5"
                    : "border-border/50 hover:border-border hover:bg-accent"
                )}>
                  <RadioGroupItem value="JP" id="JP" />
                  <Label htmlFor="JP" className="cursor-pointer font-medium">
                    Japanese (日本語)
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Notification Settings</CardTitle>
                  <CardDescription>Ignore notifications from specific folders</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {folders.map((folder) => (
                  <div
                    key={folder.key}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200",
                      ignoredFolders[folder.key]
                        ? "border-destructive/50 bg-destructive/5"
                        : "border-border/50 hover:border-border hover:bg-accent/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <FolderX className={cn(
                        "w-5 h-5 transition-colors duration-200",
                        ignoredFolders[folder.key] ? "text-destructive" : "text-muted-foreground"
                      )} />
                      <div>
                        <Label
                          htmlFor={folder.key}
                          className="font-medium cursor-pointer"
                        >
                          {folder.label}
                        </Label>
                        <p className="text-sm text-muted-foreground/80">
                          {ignoredFolders[folder.key] ? 'Notifications ignored' : 'Notifications enabled'}
                        </p>
                      </div>
                    </div>
                    <Switch
                      id={folder.key}
                      checked={ignoredFolders[folder.key]}
                      onCheckedChange={() => handleFolderToggle(folder.key)}
                      className={cn(
                        "data-[state=checked]:bg-destructive cursor-pointer"
                      )}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Save Indicator */}
          <div className="flex justify-end">
            <p className="text-sm text-muted-foreground/60">
              Changes are saved automatically
            </p>
          </div>

        </div>
      </main>
    </div>
  )
}

export default Settings
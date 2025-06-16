
'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { User, Lock, BellRing, Languages, Image as ImageIcon, Save } from 'lucide-react';

export default function SettingsPage() {
  const { toast } = useToast();

  // Profile State
  const [username, setUsername] = useState('DemoUser123');
  const [email, setEmail] = useState('demo.user@example.com');
  const [bio, setBio] = useState(
    'Loves coding, hiking, and exploring new technologies. Building the future, one line of code at a time.'
  );

  // Account State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [language, setLanguage] = useState('en');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);

  const handleProfileSave = (e: FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this data to your backend
    console.log('Profile settings to save:', { username, email, bio });
    toast({
      title: 'Profile Settings Saved',
      description: 'Your profile information has been updated (mock).',
    });
  };

  const handleAccountSave = (e: FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this data to your backend
    if (newPassword && newPassword !== confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'New password and confirm password do not match.',
        variant: 'destructive',
      });
      return;
    }
    console.log('Account settings to save:', {
      passwordChanged: !!newPassword,
      is2FAEnabled,
      language,
      emailNotifications,
      pushNotifications,
    });
    toast({
      title: 'Account Settings Saved',
      description: 'Your account settings have been updated (mock).',
    });
    // Clear password fields after mock save
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSetup2FA = () => {
    toast({
      title: '2FA Setup',
      description: 'Two-Factor Authentication setup process would start here (mock).',
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-0 max-w-3xl">
      <Card className="shadow-xl bg-card">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-card-foreground">Settings</CardTitle>
          <CardDescription className="text-muted-foreground">
            Manage your profile and account settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-background border border-border">
              <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <User className="mr-2 h-4 w-4" /> Profile
              </TabsTrigger>
              <TabsTrigger value="account" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Lock className="mr-2 h-4 w-4" /> Account
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <form onSubmit={handleProfileSave} className="space-y-6">
                <Card className="bg-secondary/30 border-border">
                  <CardHeader>
                    <CardTitle className="text-xl">Profile Information</CardTitle>
                    <CardDescription>Update your public profile details.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="bg-input border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-input border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us a little about yourself"
                        className="min-h-[100px] bg-input border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Profile Picture</Label>
                      <div className="flex items-center gap-4">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted border border-dashed border-border">
                          <ImageIcon className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <Button type="button" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                          Upload Image
                        </Button>
                      </div>
                       <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB. (Upload is mock)</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="ml-auto bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Save className="mr-2 h-4 w-4" /> Save Profile
                    </Button>
                  </CardFooter>
                </Card>
              </form>
            </TabsContent>

            <TabsContent value="account">
              <form onSubmit={handleAccountSave} className="space-y-8">
                <Card className="bg-secondary/30 border-border">
                  <CardHeader>
                    <CardTitle className="text-xl">Change Password</CardTitle>
                     <CardDescription>Update your account password. Choose a strong and unique password.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="bg-input border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-input border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-input border-border"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-secondary/30 border-border">
                  <CardHeader>
                    <CardTitle className="text-xl">Security</CardTitle>
                     <CardDescription>Enhance your account security.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-input">
                      <div>
                        <Label htmlFor="2fa" className="font-semibold">Two-Factor Authentication</Label>
                        <p className="text-xs text-muted-foreground">
                          Protect your account with an extra layer of security.
                        </p>
                      </div>
                      <Switch
                        id="2fa"
                        checked={is2FAEnabled}
                        onCheckedChange={setIs2FAEnabled}
                        aria-label="Toggle Two-Factor Authentication"
                      />
                    </div>
                    {is2FAEnabled && (
                       <Button type="button" variant="outline" onClick={handleSetup2FA} className="w-full md:w-auto border-accent text-accent hover:bg-accent/10">
                        Setup 2FA Devices
                      </Button>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-secondary/30 border-border">
                   <CardHeader>
                    <CardTitle className="text-xl">Preferences</CardTitle>
                     <CardDescription>Customize your experience.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger id="language" className="w-full md:w-[280px] bg-input border-border">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          <SelectItem value="en">English (United States)</SelectItem>
                          <SelectItem value="es">Español (Spanish)</SelectItem>
                          <SelectItem value="fr">Français (French)</SelectItem>
                          <SelectItem value="de">Deutsch (German)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3 pt-2">
                      <Label className="text-base font-medium flex items-center">
                        <BellRing className="mr-2 h-5 w-5 text-muted-foreground" /> Notification Preferences
                      </Label>
                      <div className="flex items-center space-x-3 rounded-md border border-border p-3 bg-input">
                        <Checkbox
                          id="emailNotifications"
                          checked={emailNotifications}
                          onCheckedChange={(checked) => setEmailNotifications(Boolean(checked))}
                        />
                        <Label htmlFor="emailNotifications" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Receive email notifications for important updates and promotions.
                        </Label>
                      </div>
                       <div className="flex items-center space-x-3 rounded-md border border-border p-3 bg-input">
                        <Checkbox
                          id="pushNotifications"
                          checked={pushNotifications}
                          onCheckedChange={(checked) => setPushNotifications(Boolean(checked))}
                        />
                        <Label htmlFor="pushNotifications" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Enable push notifications for real-time alerts on your device.
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex justify-end pt-4">
                    <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        <Save className="mr-2 h-4 w-4" /> Save Account Settings
                    </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

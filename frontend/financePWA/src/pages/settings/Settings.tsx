
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFinance } from '@/context/FinanceContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/sonner';
import * as userApi from '@/services/userApi';
import * as dbService from '@/services/dbService';
import { useNavigate } from 'react-router-dom';

const ProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
});

const PasswordSchema = z.object({
  currentPassword: z.string().min(8, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const PreferencesSchema = z.object({
  currency: z.string(),
  dateFormat: z.string(),
  startOfMonth: z.string(),
  language: z.string(),
});

const NotificationSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  budgetAlerts: z.boolean(),
  goalReminders: z.boolean(),
  weeklyReports: z.boolean(),
});

const Settings: React.FC = () => {
  const { user } = useFinance();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState({
    profile: false,
    password: false,
    preferences: false,
    notifications: false,
    logout: false
  });

  const profileForm = useForm({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  const passwordForm = useForm({
    resolver: zodResolver(PasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const preferencesForm = useForm({
    resolver: zodResolver(PreferencesSchema),
    defaultValues: {
      currency: 'NGN',
      dateFormat: 'MM/DD/YYYY',
      startOfMonth: '1',
      language: 'en',
    },
  });

  const notificationForm = useForm({
    resolver: zodResolver(NotificationSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      budgetAlerts: true,
      goalReminders: true,
      weeklyReports: true,
    },
  });

  // Load user settings on component mount
  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        // Try to load profile from API first
        try {
          const profileData = await userApi.getUserProfile();
          if (profileData?.success) {
            profileForm.reset({
              firstName: profileData.data.firstName,
              lastName: profileData.data.lastName,
              email: profileData.data.email,
              phone: profileData.data.phone || '',
            });
            // Save to IndexedDB for offline use
            await dbService.saveUserSettings('profile', profileData.data);
          }
        } catch (error) {
          console.error('Error loading profile from API, trying IndexedDB:', error);
          // If API fails, try to load from IndexedDB
          const localProfile = await dbService.getUserSettings('profile');
          if (localProfile) {
            profileForm.reset({
              firstName: localProfile.firstName,
              lastName: localProfile.lastName,
              email: localProfile.email,
              phone: localProfile.phone || '',
            });
          }
        }

        // Load preferences
        try {
          const preferencesData = await userApi.getUserPreferences();
          if (preferencesData?.success) {
            preferencesForm.reset(preferencesData.data);
            // Save to IndexedDB for offline use
            await dbService.saveUserSettings('preferences', preferencesData.data);
          }
        } catch (error) {
          console.error('Error loading preferences from API, trying IndexedDB:', error);
          // If API fails, try to load from IndexedDB
          const localPreferences = await dbService.getUserSettings('preferences');
          if (localPreferences) {
            preferencesForm.reset(localPreferences);
          }
        }

        // Load notification settings
        try {
          const notificationsData = await userApi.getUserNotifications();
          if (notificationsData?.success) {
            notificationForm.reset(notificationsData.data);
            // Save to IndexedDB for offline use
            await dbService.saveUserSettings('notifications', notificationsData.data);
          }
        } catch (error) {
          console.error('Error loading notifications from API, trying IndexedDB:', error);
          // If API fails, try to load from IndexedDB
          const localNotifications = await dbService.getUserSettings('notifications');
          if (localNotifications) {
            notificationForm.reset(localNotifications);
          }
        }
      } catch (error) {
        console.error('Error loading user settings:', error);
        toast.error('Failed to load settings');
      }
    };

    loadUserSettings();
  }, []);

  const onProfileSubmit = async (values: z.infer<typeof ProfileSchema>) => {
    try {
      setIsLoading(prev => ({ ...prev, profile: true }));
      console.log('Updating profile:', values);
      
      // Save to API
      const result = await userApi.updateUserProfile(values);
      
      // Save to IndexedDB for offline use
      await dbService.saveUserSettings('profile', values);
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      
      // If API fails but we're online, still save to IndexedDB
      if (navigator.onLine) {
        try {
          await dbService.saveUserSettings('profile', values);
          toast.info('Profile saved locally, will sync when online');
        } catch (dbError) {
          console.error('Error saving profile to IndexedDB:', dbError);
        }
      }
    } finally {
      setIsLoading(prev => ({ ...prev, profile: false }));
    }
  };

  const onPasswordSubmit = async (values: z.infer<typeof PasswordSchema>) => {
    try {
      setIsLoading(prev => ({ ...prev, password: true }));
      console.log('Changing password');
      
      // Send to API
      await userApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });
      
      toast.success('Password changed successfully!');
      passwordForm.reset();
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    } finally {
      setIsLoading(prev => ({ ...prev, password: false }));
    }
  };

  const onPreferencesSubmit = async (values: z.infer<typeof PreferencesSchema>) => {
    try {
      setIsLoading(prev => ({ ...prev, preferences: true }));
      console.log('Updating preferences:', values);
      
      // Save to API
      await userApi.updateUserPreferences(values);
      
      // Save to IndexedDB for offline use
      await dbService.saveUserSettings('preferences', values);
      
      toast.success('Preferences updated successfully!');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
      
      // If API fails but we're online, still save to IndexedDB
      if (navigator.onLine) {
        try {
          await dbService.saveUserSettings('preferences', values);
          toast.info('Preferences saved locally, will sync when online');
        } catch (dbError) {
          console.error('Error saving preferences to IndexedDB:', dbError);
        }
      }
    } finally {
      setIsLoading(prev => ({ ...prev, preferences: false }));
    }
  };

  const onNotificationSubmit = async (values: z.infer<typeof NotificationSchema>) => {
    try {
      setIsLoading(prev => ({ ...prev, notifications: true }));
      console.log('Updating notification settings:', values);
      
      // Save to API
      await userApi.updateUserNotifications(values);
      
      // Save to IndexedDB for offline use
      await dbService.saveUserSettings('notifications', values);
      
      toast.success('Notification settings updated successfully!');
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast.error('Failed to update notification settings');
      
      // If API fails but we're online, still save to IndexedDB
      if (navigator.onLine) {
        try {
          await dbService.saveUserSettings('notifications', values);
          toast.info('Notification settings saved locally, will sync when online');
        } catch (dbError) {
          console.error('Error saving notification settings to IndexedDB:', dbError);
        }
      }
    } finally {
      setIsLoading(prev => ({ ...prev, notifications: false }));
    }
  };
  

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="flex justify-between items-center mb-4">
        <Tabs defaultValue="profile" onValueChange={setActiveTab} value={activeTab} className="flex-1">
          <TabsList className="grid grid-cols-4 w-full max-w-3xl">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit">Save Profile</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Change Password</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>App Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...preferencesForm}>
                <form onSubmit={preferencesForm.handleSubmit(onPreferencesSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={preferencesForm.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="NGN">NGN (₦)</SelectItem>
                              <SelectItem value="USD">USD ($)</SelectItem>
                              <SelectItem value="EUR">EUR (€)</SelectItem>
                              <SelectItem value="GBP">GBP (£)</SelectItem>
                              <SelectItem value="JPY">JPY (¥)</SelectItem>
                              <SelectItem value="CAD">CAD ($)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={preferencesForm.control}
                      name="dateFormat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date Format</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select date format" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={preferencesForm.control}
                      name="startOfMonth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget Start Day</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select start day" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">1st of month</SelectItem>
                              <SelectItem value="15">15th of month</SelectItem>
                              <SelectItem value="custom">Custom date</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={preferencesForm.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Language</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select language" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="es">Spanish</SelectItem>
                              <SelectItem value="fr">French</SelectItem>
                              <SelectItem value="de">German</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit">Save Preferences</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={notificationForm.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Email Notifications</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Receive updates and alerts via email
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={notificationForm.control}
                      name="pushNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Push Notifications</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Receive push notifications on your devices
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={notificationForm.control}
                      name="budgetAlerts"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Budget Alerts</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Get notified when you're approaching budget limits
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={notificationForm.control}
                      name="goalReminders"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Goal Reminders</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Receive reminders about your savings goals
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={notificationForm.control}
                      name="weeklyReports"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Weekly Reports</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Receive weekly financial summary reports
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit">Save Notification Settings</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </div>
)
};

export default Settings;

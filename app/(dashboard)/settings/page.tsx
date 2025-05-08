"use client";

import { Button, Input } from "@/components/atoms";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/molecules";
import { Card } from "@/components/organisms";
import { useState } from "react";

export default function SettingsPage() {
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    sms: true,
    push: false,
    marketing: false,
    appointmentReminders: true,
    newsletterUpdates: false,
    specialOffers: true,
  });

  const [accountForm, setAccountForm] = useState({
    firstName: "Emma",
    lastName: "Davis",
    email: "emma.davis@example.com",
    phone: "+1 (555) 123-4567",
  });

  const [preferencesForm, setPreferencesForm] = useState({
    theme: "system",
    language: "english",
    timeFormat: "12h",
    dateFormat: "MM/DD/YYYY",
  });

  // Handle password form changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordFormData({
      ...passwordFormData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle account form changes
  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccountForm({
      ...accountForm,
      [e.target.name]: e.target.value,
    });
  };

  // Handle toggle change
  const handleToggleChange = (key: string) => {
    setNotificationSettings({
      ...notificationSettings,
      [key]: !notificationSettings[key as keyof typeof notificationSettings],
    });
  };

  // Handle theme change
  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPreferencesForm({
      ...preferencesForm,
      theme: e.target.value,
    });
  };

  // Handle language change
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPreferencesForm({
      ...preferencesForm,
      language: e.target.value,
    });
  };

  // Handle time format change
  const handleTimeFormatChange = (format: string) => {
    setPreferencesForm({
      ...preferencesForm,
      timeFormat: format,
    });
  };

  // Handle date format change
  const handleDateFormatChange = (format: string) => {
    setPreferencesForm({
      ...preferencesForm,
      dateFormat: format,
    });
  };

  // Toggle component
  const Toggle = ({
    isActive,
    onChange,
    label,
  }: { isActive: boolean; onChange: () => void; label: string }) => (
    <div className="flex justify-between items-center mb-4">
      <span className="text-sm font-medium">{label}</span>
      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? "bg-primary dark:bg-white" : "bg-gray-500"}`}
        aria-pressed={isActive}
        aria-labelledby={`toggle-${label.toLowerCase().replace(/\s+/g, "-")}`}
      >
        <span className="sr-only" id={`toggle-${label.toLowerCase().replace(/\s+/g, "-")}`}>
          {isActive ? `Disable ${label}` : `Enable ${label}`}
        </span>
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white dark:bg-gray-900 transform transition-transform ${isActive ? "translate-x-6" : "translate-x-1"}`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-500">Manage your account settings and preferences.</p>
      </div>

      <Tabs value="account" onValueChange={() => {}} defaultValue="account" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Account Settings */}
        <TabsContent value="account">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>
            <p className="text-gray-500 mb-6">
              Update your account details and personal information.
            </p>

            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium mb-1">
                    First Name
                  </label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={accountForm.firstName}
                    onChange={handleAccountChange}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium mb-1">
                    Last Name
                  </label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={accountForm.lastName}
                    onChange={handleAccountChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={accountForm.email}
                  onChange={handleAccountChange}
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  name="phone"
                  value={accountForm.phone}
                  onChange={handleAccountChange}
                />
              </div>

              <div className="pt-2">
                <Button type="button">Save Changes</Button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-medium mb-4">Delete Account</h3>
              <p className="text-gray-500 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button variant="destructive">Delete Account</Button>
            </div>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
            <p className="text-gray-500 mb-6">Manage how you receive notifications and updates.</p>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Notification Channels</h3>
                <div className="space-y-4">
                  <Toggle
                    isActive={notificationSettings.email}
                    onChange={() => handleToggleChange("email")}
                    label="Email Notifications"
                  />
                  <Toggle
                    isActive={notificationSettings.sms}
                    onChange={() => handleToggleChange("sms")}
                    label="SMS Notifications"
                  />
                  <Toggle
                    isActive={notificationSettings.push}
                    onChange={() => handleToggleChange("push")}
                    label="Push Notifications"
                  />
                </div>
              </div>

              <div className="pt-6 border-t">
                <h3 className="text-lg font-medium mb-4">Notification Types</h3>
                <div className="space-y-4">
                  <Toggle
                    isActive={notificationSettings.appointmentReminders}
                    onChange={() => handleToggleChange("appointmentReminders")}
                    label="Appointment Reminders"
                  />
                  <Toggle
                    isActive={notificationSettings.newsletterUpdates}
                    onChange={() => handleToggleChange("newsletterUpdates")}
                    label="Newsletter Updates"
                  />
                  <Toggle
                    isActive={notificationSettings.specialOffers}
                    onChange={() => handleToggleChange("specialOffers")}
                    label="Special Offers"
                  />
                  <Toggle
                    isActive={notificationSettings.marketing}
                    onChange={() => handleToggleChange("marketing")}
                    label="Marketing Communications"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button type="button">Save Preferences</Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Preferences Settings */}
        <TabsContent value="preferences">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Display Preferences</h2>
            <p className="text-gray-500 mb-6">
              Customize your app experience and regional settings.
            </p>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="theme-select" className="block text-sm font-medium mb-2">
                    Theme
                  </label>
                  <select
                    id="theme-select"
                    value={preferencesForm.theme}
                    onChange={handleThemeChange}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System Default</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Select your preferred color theme</p>
                </div>

                <div>
                  <label htmlFor="language-select" className="block text-sm font-medium mb-2">
                    Language
                  </label>
                  <select
                    id="language-select"
                    value={preferencesForm.language}
                    onChange={handleLanguageChange}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="english">English</option>
                    <option value="spanish">Spanish</option>
                    <option value="french">French</option>
                    <option value="german">German</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Select your preferred language for the app
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t">
                <h3 className="text-lg font-medium mb-4">Regional Settings</h3>

                <div className="mb-4">
                  <span id="time-format-label" className="block text-sm font-medium mb-2">
                    Time Format
                  </span>
                  <div className="flex space-x-4">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="12-hour"
                        name="timeFormat"
                        className="h-4 w-4 text-primary"
                        defaultChecked
                        aria-labelledby="time-format-label"
                      />
                      <label htmlFor="12-hour" className="ml-2 text-sm">
                        12-hour (AM/PM)
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="24-hour"
                        name="timeFormat"
                        className="h-4 w-4 text-primary"
                        aria-labelledby="time-format-label"
                      />
                      <label htmlFor="24-hour" className="ml-2 text-sm">
                        24-hour
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <span id="date-format-label" className="block text-sm font-medium mb-2">
                    Date Format
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="mm-dd-yyyy"
                        name="dateFormat"
                        className="h-4 w-4 text-primary"
                        defaultChecked
                        aria-labelledby="date-format-label"
                      />
                      <label htmlFor="mm-dd-yyyy" className="ml-2 text-sm">
                        MM/DD/YYYY
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="dd-mm-yyyy"
                        name="dateFormat"
                        className="h-4 w-4 text-primary"
                        aria-labelledby="date-format-label"
                      />
                      <label htmlFor="dd-mm-yyyy" className="ml-2 text-sm">
                        DD/MM/YYYY
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="yyyy-mm-dd"
                        name="dateFormat"
                        className="h-4 w-4 text-primary"
                        aria-labelledby="date-format-label"
                      />
                      <label htmlFor="yyyy-mm-dd" className="ml-2 text-sm">
                        YYYY-MM-DD
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="month-day-year"
                        name="dateFormat"
                        className="h-4 w-4 text-primary"
                        aria-labelledby="date-format-label"
                      />
                      <label htmlFor="month-day-year" className="ml-2 text-sm">
                        Month Day, Year
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button type="button">Save Preferences</Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
            <p className="text-gray-500 mb-6">Update your password and security preferences.</p>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Change Password</h3>
                <form className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium mb-1">
                      Current Password
                    </label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={passwordFormData.currentPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium mb-1">
                      New Password
                    </label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={passwordFormData.newPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                      Confirm New Password
                    </label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={passwordFormData.confirmPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>

                  <div className="pt-2">
                    <Button type="button">Update Password</Button>
                  </div>
                </form>
              </div>

              <div className="pt-6 border-t">
                <h3 className="text-lg font-medium mb-4">Two-Factor Authentication</h3>
                <p className="text-gray-500 mb-4">
                  Add an extra layer of security to your account by enabling two-factor
                  authentication.
                </p>
                <Button type="button" variant="outline">
                  Enable 2FA
                </Button>
              </div>

              <div className="pt-6 border-t">
                <h3 className="text-lg font-medium mb-4">Active Sessions</h3>
                <div className="border rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Current Device</p>
                      <p className="text-sm text-gray-500">Mac • Safari • San Francisco, CA</p>
                      <p className="text-xs text-gray-500">Last active: Just now</p>
                    </div>
                    <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">iPhone 13</p>
                      <p className="text-sm text-gray-500">iOS • Safari • San Francisco, CA</p>
                      <p className="text-xs text-gray-500">Last active: 2 days ago</p>
                    </div>
                    <Button type="button" variant="outline" size="sm">
                      Sign Out
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

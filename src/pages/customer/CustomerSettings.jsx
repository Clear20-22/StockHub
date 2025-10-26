import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  Eye,
  EyeOff,
  Save,
  Mail,
  Phone,
  MapPin,
  Lock,
  Trash2,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  Info,
  RefreshCw,
} from "lucide-react";
import { authAPI, usersAPI } from "../../services/api";

const CustomerSettings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile Settings - Will be populated from API
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  });

  // Notification Settings - Will be saved to backend
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: {
      orderUpdates: true,
      storageReminders: true,
      promotions: false,
      securityAlerts: true,
      newsletterUpdates: false,
    },
    pushNotifications: {
      orderUpdates: true,
      storageReminders: true,
      promotions: false,
      securityAlerts: true,
    },
    smsNotifications: {
      orderUpdates: false,
      storageReminders: true,
      securityAlerts: true,
    },
  });

  // Privacy Settings - Will be saved to backend
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "private",
    dataSharing: false,
    analyticsOptIn: true,
    marketingOptIn: false,
    twoFactorAuth: true,
    sessionTimeout: "30",
  });

  // Password Change
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy & Security", icon: Shield },
    { id: "password", label: "Change Password", icon: Lock },
  ];

  // Fetch user data from backend on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      setDataLoading(true);
      setError(null);

      try {
        const response = await authAPI.getCurrentUser();
        const userData = response.data;

        // Update profile data with real backend data
        setProfileData({
          firstName: userData.first_name || "",
          lastName: userData.last_name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          address: userData.address || "",
          bio: userData.bio || "",
          avatar:
            userData.avatar ||
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        });

        // If user has saved settings, load them
        if (userData.notification_settings) {
          setNotificationSettings(userData.notification_settings);
        }

        if (userData.privacy_settings) {
          setPrivacySettings(userData.privacy_settings);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data. Please refresh the page.");
      } finally {
        setDataLoading(false);
        setIsInitialLoad(false);
      }
    };

    fetchUserData();
  }, []);

  // Auto-save function for real-time updates
  const autoSave = async (dataType, data) => {
    try {
      const updateData = {
        [dataType]: data,
      };

      // If updating profile, map to backend field names
      if (dataType === "profile") {
        updateData.first_name = data.firstName;
        updateData.last_name = data.lastName;
        updateData.email = data.email;
        updateData.phone = data.phone;
        updateData.address = data.address;
        updateData.bio = data.bio;
        updateData.avatar = data.avatar;
        delete updateData.profile;
      } else if (dataType === "notifications") {
        updateData.notification_settings = data;
        delete updateData.notifications;
      } else if (dataType === "privacy") {
        updateData.privacy_settings = data;
        delete updateData.privacy;
      }

      await usersAPI.updateMe(updateData);

      // Show success indicator briefly
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error("Error auto-saving:", error);
      setError("Failed to save changes. Please try again.");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleProfileChange = (field, value) => {
    const newProfileData = {
      ...profileData,
      [field]: value,
    };
    setProfileData(newProfileData);

    // Auto-save after 1 second delay (debounce) - only if not initial load
    if (!isInitialLoad) {
      clearTimeout(window.profileSaveTimeout);
      window.profileSaveTimeout = setTimeout(() => {
        autoSave("profile", newProfileData);
      }, 1000);
    }
  };

  const handleNotificationChange = (category, setting, value) => {
    const newNotificationSettings = {
      ...notificationSettings,
      [category]: {
        ...notificationSettings[category],
        [setting]: value,
      },
    };
    setNotificationSettings(newNotificationSettings);

    // Auto-save immediately for settings - only if not initial load
    if (!isInitialLoad) {
      autoSave("notifications", newNotificationSettings);
    }
  };

  const handlePrivacyChange = (setting, value) => {
    const newPrivacySettings = {
      ...privacySettings,
      [setting]: value,
    };
    setPrivacySettings(newPrivacySettings);

    // Auto-save immediately for settings - only if not initial load
    if (!isInitialLoad) {
      autoSave("privacy", newPrivacySettings);
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      // Save all current settings to backend
      const updateData = {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address,
        bio: profileData.bio,
        avatar: profileData.avatar,
        notification_settings: notificationSettings,
        privacy_settings: privacySettings,
      };

      await usersAPI.updateMe(updateData);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setError("Failed to save settings. Please try again.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      setTimeout(() => setError(null), 5000);
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      setTimeout(() => setError(null), 5000);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Make API call to change password
      await authAPI.changePassword({
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating password:", error);
      setError(
        "Failed to update password. Please check your current password and try again."
      );
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setDataLoading(true);
    setError(null);

    try {
      const response = await authAPI.getCurrentUser();
      const userData = response.data;

      setProfileData({
        firstName: userData.first_name || "",
        lastName: userData.last_name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        address: userData.address || "",
        bio: userData.bio || "",
        avatar:
          userData.avatar ||
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      });

      if (userData.notification_settings) {
        setNotificationSettings(userData.notification_settings);
      }

      if (userData.privacy_settings) {
        setPrivacySettings(userData.privacy_settings);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      setError("Failed to refresh data. Please try again.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setDataLoading(false);
    }
  };

  const handleExportData = () => {
    // Simulate data export
    const data = JSON.stringify(
      { profileData, notificationSettings, privacySettings },
      null,
      2
    );
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stockhub-account-data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Personal Information
        </h3>

        {/* Avatar Upload */}
        <div className="flex items-center space-x-6 mb-6">
          <div className="relative">
            <img
              src={profileData.avatar}
              alt="Profile"
              className="h-20 w-20 rounded-full object-cover border-4 border-gray-200"
            />
            <button className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
              <Upload className="h-3 w-3" />
            </button>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">
              {profileData.firstName} {profileData.lastName}
            </h4>
            <p className="text-sm text-gray-500">JPG, PNG up to 5MB</p>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Change photo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline h-4 w-4 mr-1" />
              First Name
            </label>
            <input
              type="text"
              value={profileData.firstName}
              onChange={(e) => handleProfileChange("firstName", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline h-4 w-4 mr-1" />
              Last Name
            </label>
            <input
              type="text"
              value={profileData.lastName}
              onChange={(e) => handleProfileChange("lastName", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="inline h-4 w-4 mr-1" />
              Email Address
            </label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => handleProfileChange("email", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="inline h-4 w-4 mr-1" />
              Phone Number
            </label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => handleProfileChange("phone", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="inline h-4 w-4 mr-1" />
            Address
          </label>
          <input
            type="text"
            value={profileData.address}
            onChange={(e) => handleProfileChange("address", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            value={profileData.bio}
            onChange={(e) => handleProfileChange("bio", e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Tell us a bit about yourself..."
          />
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      {Object.entries(notificationSettings).map(([category, settings]) => (
        <div
          key={category}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
            {category.replace(/([A-Z])/g, " $1").toLowerCase()} Settings
          </h3>
          <div className="space-y-4">
            {Object.entries(settings).map(([setting, enabled]) => (
              <div key={setting} className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 capitalize">
                    {setting.replace(/([A-Z])/g, " $1").toLowerCase()}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {getNotificationDescription(setting)}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) =>
                      handleNotificationChange(
                        category,
                        setting,
                        e.target.checked
                      )
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Privacy Settings
        </h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Visibility
            </label>
            <select
              value={privacySettings.profileVisibility}
              onChange={(e) =>
                handlePrivacyChange("profileVisibility", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="private">Private</option>
              <option value="limited">Limited (StockHub staff only)</option>
              <option value="public">Public</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Timeout
            </label>
            <select
              value={privacySettings.sessionTimeout}
              onChange={(e) =>
                handlePrivacyChange("sessionTimeout", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="never">Never</option>
            </select>
          </div>

          {[
            {
              key: "twoFactorAuth",
              label: "Two-Factor Authentication",
              description: "Add an extra layer of security to your account",
            },
            {
              key: "dataSharing",
              label: "Data Sharing",
              description:
                "Allow StockHub to share anonymized data for service improvement",
            },
            {
              key: "analyticsOptIn",
              label: "Analytics",
              description: "Help us improve our service with usage analytics",
            },
            {
              key: "marketingOptIn",
              label: "Marketing Communications",
              description: "Receive promotional offers and product updates",
            },
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{label}</h4>
                <p className="text-sm text-gray-500">{description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacySettings[key]}
                  onChange={(e) => handlePrivacyChange(key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Data Management
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Export Account Data</h4>
              <p className="text-sm text-gray-500">
                Download a copy of your account data
              </p>
            </div>
            <button
              onClick={handleExportData}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-red-600">Delete Account</h4>
              <p className="text-sm text-gray-500">
                Permanently delete your account and all data
              </p>
            </div>
            <button className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPasswordTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Change Password
        </h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={(e) =>
                  handlePasswordChange("currentPassword", e.target.value)
                }
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) =>
                  handlePasswordChange("newPassword", e.target.value)
                }
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  handlePasswordChange("confirmPassword", e.target.value)
                }
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <Info className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Password Requirements:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>At least 8 characters long</li>
                  <li>Include uppercase and lowercase letters</li>
                  <li>Include at least one number</li>
                  <li>Include at least one special character</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={handlePasswordUpdate}
            disabled={
              loading ||
              !passwordData.currentPassword ||
              !passwordData.newPassword ||
              !passwordData.confirmPassword
            }
            className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            ) : (
              <Lock className="h-5 w-5 mr-2" />
            )}
            Update Password
          </button>
        </div>
      </div>
    </div>
  );

  const getNotificationDescription = (setting) => {
    const descriptions = {
      orderUpdates: "Get notified when your storage orders are updated",
      storageReminders: "Receive reminders about your stored items",
      promotions: "Get notified about special offers and discounts",
      securityAlerts: "Important security notifications about your account",
      newsletterUpdates:
        "Monthly newsletters with storage tips and company updates",
    };
    return descriptions[setting] || "Notification setting";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 mt-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/customer/dashboard")}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Account Settings
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage your account preferences and security settings
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <p className="text-green-800 font-medium">
                Settings saved successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
                      activeTab === tab.id
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <tab.icon
                      className={`h-5 w-5 mr-3 ${
                        activeTab === tab.id ? "text-blue-600" : "text-gray-400"
                      }`}
                    />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === "profile" && renderProfileTab()}
            {activeTab === "notifications" && renderNotificationsTab()}
            {activeTab === "privacy" && renderPrivacyTab()}
            {activeTab === "password" && renderPasswordTab()}

            {/* Save Button (except for password tab) */}
            {activeTab !== "password" && (
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="h-5 w-5 mr-2" />
                  )}
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSettings;

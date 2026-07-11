import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Bell, Lock, MonitorSmartphone, Volume2, Shield } from 'lucide-react';
import { motion } from 'framer-motion';


const NAV_SECTIONS = [
  { label: 'Appearance', icon: MonitorSmartphone },
  { label: 'Notifications', icon: Bell },
  { label: 'Privacy & Security', icon: Lock },
  { label: 'Audio & Video', icon: Volume2 },
  { label: 'Advanced', icon: Shield },
];

const Toggle = ({ on, onToggle }) => (
  <button
    onClick={onToggle}
    className={`relative h-6 w-11 rounded-full transition-colors duration-300 focus:outline-none ${on ? 'bg-[var(--accent)] shadow-[0_0_10px_var(--accent-glow)]' : 'bg-[var(--bg-glass)] border border-[var(--border)]'}`}
  >
    <span
      className={`absolute left-0 top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-300 ${on ? 'translate-x-[23px]' : 'translate-x-[3px]'}`}
    />
  </button>
);

const Settings = () => {
  const [activeSection, setActiveSection] = useState(0);
  const [compactMode, setCompactMode] = useState(false);
  const [linkPreviews, setLinkPreviews] = useState(true);
  const [desktopNotifs, setDesktopNotifs] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });
    // Privacy Settings
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [friendRequests, setFriendRequests] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState("public");

  // Password Fields (UI Only)
  const [currentPassword, setCurrentPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const applyTheme = (mode) => {
    setThemeMode(mode);
    localStorage.setItem('theme', mode);
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (mode === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };
  const handlePasswordChange = () => {
  setPasswordError("");

  if (!currentPassword || !newPassword || !confirmPassword) {
    setPasswordError("Please fill in all password fields.");
    return;
  }
  if (newPassword.length < 8) {
    setPasswordError("New password must be at least 8 characters.");
    return;
  }
  if (newPassword !== confirmPassword) {
    setPasswordError("New password and confirmation do not match.");
    return;
  }

  // TODO: replace with actual API call to update password on the backend
  console.log("Password change submitted:", { currentPassword, newPassword });

  setCurrentPassword("");
  setNewPassword("");
  setConfirmPassword("");
  setPasswordError("");
};
  useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (themeMode === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []); // empty array = runs once on mount
  useEffect(() => {
    if (themeMode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode]);

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-[var(--bg-surface)]">
      <div className="max-w-4xl mx-auto p-6 lg:p-8 space-y-7">

        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">Settings</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Manage your account settings and preferences.</p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-[220px_1fr]">

          {/* Settings Nav */}
          <motion.nav
            className="flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 custom-scrollbar"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {NAV_SECTIONS.map(({ label, icon: Icon }, i) => (
              <button
                key={label}
                onClick={() => setActiveSection(i)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium w-full text-left transition-all duration-150 shrink-0 ${
                  i === activeSection
                    ? 'bg-[var(--bg-glass-active)] text-[var(--accent)] border border-[var(--border-active)]'
                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-glass-hover)] hover:text-[var(--text)] border border-transparent'
                }`}
              >
                <Icon size={15} className="shrink-0" />
                {label}
              </button>
            ))}
          </motion.nav>

          {/* Settings Content */}
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            {activeSection === 0 && (
              <>
                {/* Theme card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Theme Preferences</CardTitle>
                    <CardDescription>Customize the look and feel of your application.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-[var(--text)]">Color Mode</h4>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">The platform is optimized for dark mode.</p>
                      </div>
                      <div className="flex items-center gap-1 bg-[var(--bg-glass)] border border-[var(--border)] p-1 rounded-lg">
                        {['Light', 'Dark', 'System'].map((mode) => {
                          const currentVal = mode.toLowerCase();
                          const active = themeMode === currentVal;
                          return (
                            <button
                              key={mode}
                              onClick={() => applyTheme(currentVal)}
                              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer ${
                                active
                                  ? 'bg-[var(--accent)] text-white shadow-[0_0_10px_var(--accent-glow)]'
                                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                              }`}
                            >
                              {mode}
                            </button>
                          );
                        })}
                      </div>

                    </div>
                  </CardContent>
                </Card>

                {/* Message display */}
                <Card>
                  <CardHeader>
                    <CardTitle>Message Display</CardTitle>
                    <CardDescription>Control how messages are rendered in your chat window.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {[
                      { label: 'Compact Mode', desc: 'Fit more messages on the screen.', value: compactMode, toggle: () => setCompactMode(v => !v) },
                      { label: 'Show Link Previews', desc: 'Automatically fetch and display embedded URLs.', value: linkPreviews, toggle: () => setLinkPreviews(v => !v) },
                    ].map(({ label, desc, value, toggle }) => (
                      <div key={label} className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-[var(--text)]">{label}</h4>
                          <p className="text-xs text-[var(--text-muted)] mt-0.5">{desc}</p>
                        </div>
                        <Toggle on={value} onToggle={toggle} />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </>
            )}

            {activeSection === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Manage how and when you receive notifications.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {[
                    { label: 'Desktop Notifications', desc: 'Receive push notifications on your desktop.', value: desktopNotifs, toggle: () => setDesktopNotifs(v => !v) },
                    { label: 'Sound Alerts', desc: 'Play a sound when new messages arrive.', value: soundEnabled, toggle: () => setSoundEnabled(v => !v) },
                  ].map(({ label, desc, value, toggle }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-[var(--text)]">{label}</h4>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">{desc}</p>
                      </div>
                      <Toggle on={value} onToggle={toggle} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {activeSection === 2 && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy & Security</CardTitle>
                    <CardDescription>Manage your privacy preferences and account security.</CardDescription>
                  </CardHeader>
                 
                  <CardContent>
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-[var(--text)]">
                            Show Online Status
                          </h4>
                          <p className="text-xs text-[var(--text-muted)] mt-1">
                            Let others know when you're online.
                          </p>
                        </div>
                        <Toggle
                          on={onlineStatus}
                          onToggle={() => setOnlineStatus(!onlineStatus)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-[var(--text)]">
                            Read Receipts
                          </h4>
                          <p className="text-xs text-[var(--text-muted)] mt-1">
                            Show when you've read messages.
                          </p>
                        </div>
                        <Toggle
                          on={readReceipts}
                          onToggle={() => setReadReceipts(!readReceipts)}
                        />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-[var(--text)]">
                              Allow Friend Requests
                            </h4>
                            <p className="text-xs text-[var(--text-muted)] mt-1">
                              Allow others to send friend requests.
                            </p>
                          </div>
                          <Toggle
                            on={friendRequests}
                            onToggle={() => setFriendRequests(!friendRequests)}
                          />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                            <h4 className="text-sm font-medium text-[var(--text)]">
                              Profile Visibility
                            </h4>
                            <p className="text-xs text-[var(--text-muted)] mt-1">
                              Control who can see your profile details.
                            </p>
                          </div>
                          <div className="flex items-center gap-1 bg-[var(--bg-glass)] border border-[var(--border)] p-1 rounded-lg">
                            {['Public', 'Friends', 'Private'].map((option) => {
                              const val = option.toLowerCase();
                              const active = profileVisibility === val;
                              return (
                                <button
                                  key={option}
                                  onClick={() => setProfileVisibility(val)}
                                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer ${
                                  active
                                    ? 'bg-[var(--accent)] text-white shadow-[0_0_10px_var(--accent-glow)]'
                                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                                  }`}
                                >
                                  {option}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Change Password</CardTitle>
                      <CardDescription>Update your account password.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-[var(--text-muted)] mb-1 block">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[var(--bg-glass)] border border-[var(--border)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[var(--text-muted)] mb-1 block">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[var(--bg-glass)] border border-[var(--border)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                        placeholder="Enter new password"
                      />
                      </div>
                      <div>
                      <label className="text-xs font-medium text-[var(--text-muted)] mb-1 block">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[var(--bg-glass)] border border-[var(--border)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                        placeholder="Confirm new password"
                      />
                    </div>
                    {passwordError && (
                      <p className="text-xs text-red-400">{passwordError}</p>
                    )}
                    <Button onClick={handlePasswordChange} className="w-full">
                      Update Password
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
            {activeSection === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Audio & Video</CardTitle>
                  <CardDescription>
                    Configure audio and video preferences.
                  </CardDescription>
                </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-[var(--text)]">
                      Microphone Access
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Allow the app to use your microphone for calls.
                    </p>
                  </div>
                  <Toggle
                    on={micEnabled}
                    onToggle={() => setMicEnabled(!micEnabled)}
                  />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-[var(--text)]">
                        Camera Access
                      </h4>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        Allow the app to use your camera for video calls.
                      </p>
                    </div>
                    <Toggle
                      on={cameraEnabled}
                      onToggle={() => setCameraEnabled(!cameraEnabled)}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
            {activeSection === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle>Advanced</CardTitle>
                  <CardDescription>
                    Advanced application settings.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-[var(--text-muted)]">
                    More advanced settings will be added here.
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

import React, { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'chatplatform_profile';

const DEFAULT_PROFILE = {
  firstName: 'John',
  lastName: 'Doe',
  title: 'Senior Frontend Engineer',
  email: 'john.doe@example.com',
  bio: 'Passionate software engineer focused on building scalable frontend architectures and beautiful user experiences.',
  location: 'San Francisco, CA',
  company: 'ChatPlatform Inc.',
  website: 'github.com/johndoe',
  avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
  coverUrl: null, // null = default gradient
};

const ProfileContext = createContext(null);

function loadInitialProfile() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
    }
  } catch (err) {
    console.warn('Could not load saved profile, using defaults.', err);
  }
  return DEFAULT_PROFILE;
}

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(loadInitialProfile);

  // Persist any time profile changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (err) {
      console.warn('Could not save profile.', err);
    }
  }, [profile]);

  const updateProfile = (updates) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  return (
    <ProfileContext.Provider value={{ profile, setProfile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return ctx;
};
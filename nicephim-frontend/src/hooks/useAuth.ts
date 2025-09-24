'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  display_name?: string;
  email?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsLoggedIn(true);
        } else {
          setUser(null);
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        setUser(null);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Check initial status
    checkLoginStatus();

    // Listen for storage events (for cross-tab updates)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'user') {
        checkLoginStatus();
      }
    };

    // Listen for custom auth events (for same-tab updates)
    const handleAuthChange = () => {
      checkLoginStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-change', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  const login = (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsLoggedIn(true);

    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('auth-change'));
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsLoggedIn(false);

    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('auth-change'));
  };

  return {
    user,
    isLoggedIn,
    isLoading,
    login,
    logout
  };
}

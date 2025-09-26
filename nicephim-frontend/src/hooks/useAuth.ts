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
          console.log('Found user data in localStorage:', parsedUser);

          // Map the user object to match the expected interface
          // API returns user_id, but frontend expects id
          const mappedUser = {
            id: parsedUser.user_id || parsedUser.id,
            username: parsedUser.username,
            display_name: parsedUser.display_name,
            email: parsedUser.email
          };

          console.log('Mapped user object:', mappedUser);
          setUser(mappedUser);
          setIsLoggedIn(true);
        } else {
          console.log('No user data found in localStorage');
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

  const login = (userData: any) => {
    console.log('Login function called with userData:', userData);

    // Map the user object to match the expected interface
    // API returns user_id, but frontend expects id
    const mappedUser = {
      id: userData.user_id || userData.id,
      username: userData.username,
      display_name: userData.display_name,
      email: userData.email
    };

    console.log('Storing mapped user in localStorage:', mappedUser);
    localStorage.setItem('user', JSON.stringify(mappedUser));
    setUser(mappedUser);
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

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { isAdminUser } from '@/utils/adminUtils';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { user, isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // If user is not logged in, redirect to login
      if (!isLoggedIn) {
        router.push('/login');
        return;
      }

      // If user is logged in but not admin, redirect to home
      const isAdmin = isAdminUser(user);
      if (!isAdmin) {
        console.log('User is not admin:', user);
        router.push('/');
        return;
      }
    }
  }, [isLoggedIn, isLoading, user, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--bg-2)'}}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // If not logged in or not admin, don't render children (redirect will happen)
  const isAdmin = isAdminUser(user);
  if (!isLoggedIn || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
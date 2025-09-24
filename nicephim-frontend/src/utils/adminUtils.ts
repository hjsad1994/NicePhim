// Utility functions for admin access

export function ensureAdminStatus() {
  if (typeof window === 'undefined') return;

  try {
    const userData = localStorage.getItem('user');
    if (!userData) return;

    const user = JSON.parse(userData);

    // Check if user should be admin based on username
    const shouldBeAdmin = user.username === 'admin' || user.username === 'administrator';

    if (shouldBeAdmin && !user.is_admin) {
      console.log('Updating admin status for user:', user.username);
      user.is_admin = true;
      localStorage.setItem('user', JSON.stringify(user));

      // Dispatch event to update components
      window.dispatchEvent(new Event('auth-change'));

      // Reload page to apply changes
      window.location.reload();
    }
  } catch (error) {
    console.error('Error ensuring admin status:', error);
  }
}

export function isAdminUser(user?: { username?: string; is_admin?: boolean }): boolean {
  if (!user) {
    console.log('isAdminUser: No user provided');
    return false;
  }

  const isAdmin = user.is_admin || user.username === 'admin' || user.username === 'administrator';
  console.log('isAdminUser check:', {
    username: user.username,
    is_admin: user.is_admin,
    result: isAdmin
  });

  return isAdmin;
}
// Debug and fix authentication issues

export function debugAuth() {
  if (typeof window === 'undefined') return;

  console.log('=== AUTH DEBUG ===');

  // Check localStorage
  const userData = localStorage.getItem('user');
  console.log('localStorage user:', userData);

  if (userData) {
    try {
      const parsedUser = JSON.parse(userData);
      console.log('Parsed user:', parsedUser);

      // Check if should be admin
      const shouldBeAdmin = parsedUser.username === 'admin' || parsedUser.username === 'administrator';
      console.log('Should be admin:', shouldBeAdmin);
      console.log('Current is_admin:', parsedUser.is_admin);

      if (shouldBeAdmin && !parsedUser.is_admin) {
        console.log('FIXING: Setting is_admin to true');
        parsedUser.is_admin = true;
        localStorage.setItem('user', JSON.stringify(parsedUser));
        console.log('Fixed user data:', parsedUser);

        // Reload page
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }

  console.log('=== END AUTH DEBUG ===');
}

export function forceAdminStatus() {
  if (typeof window === 'undefined') return;

  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      user.is_admin = true;
      localStorage.setItem('user', JSON.stringify(user));
      console.log('Forced admin status for user:', user.username);

      // Reload page
      window.location.reload();
    } catch (error) {
      console.error('Error forcing admin status:', error);
    }
  }
}
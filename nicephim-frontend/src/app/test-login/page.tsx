'use client';

import { useAuth } from '@/hooks/useAuth';

export default function TestLoginPage() {
  const { user, isLoggedIn, login, logout } = useAuth();

  const handleTestLogin = () => {
    const testUser = {
      id: '1',
      username: 'testuser',
      display_name: 'Test User',
      email: 'test@example.com'
    };
    login(testUser);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Test Login Page</h1>
      
      <div className="mb-4">
        <p>Login Status: {isLoggedIn ? 'Logged In' : 'Not Logged In'}</p>
        {user && (
          <div>
            <p>User: {user.display_name || user.username}</p>
            <p>Email: {user.email}</p>
          </div>
        )}
      </div>

      <div className="space-x-4">
        <button 
          onClick={handleTestLogin}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
        >
          Test Login
        </button>
        
        <button 
          onClick={logout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

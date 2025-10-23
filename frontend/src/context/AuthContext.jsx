import React, { createContext, useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import axiosInstance from '../api/axiosInstance';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { getToken, signOut } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncUser = async () => {
      if (isLoaded && isSignedIn && clerkUser) {
        try {
          // Get Clerk session token
          const token = await getToken();
          
          // Sync user with backend
          const response = await axiosInstance.post('/auth/sync-user', {
            clerk_user_id: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress,
            name: clerkUser.fullName || clerkUser.firstName || 'User',
            avatar_url: clerkUser.imageUrl
          }, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          setUser(response.data.user);
          
          // Store token for API calls
          localStorage.setItem('clerk_token', token);
        } catch (error) {
          console.error('User sync error:', error);
        }
      } else {
        setUser(null);
        localStorage.removeItem('clerk_token');
      }
      setLoading(false);
    };

    syncUser();
  }, [isLoaded, isSignedIn, clerkUser, getToken]);

  const logout = async () => {
    await signOut();
    setUser(null);
    localStorage.removeItem('clerk_token');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      logout,
      clerkUser,
      isSignedIn 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

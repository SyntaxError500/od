import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Helper function to handle API responses and check for session invalidation
export const handleApiResponse = async (response, authContext) => {
  // Check if response indicates session invalidation
  if (response.status === 403) {
    const data = await response.json();
    if (data.error && data.error.includes('session has been invalidated')) {
      // Call force logout
      if (authContext && authContext.forceLogout) {
        await authContext.forceLogout('Your session has been invalidated. Admin may have forced you to logout.');
      }
      return { sessionInvalidated: true, error: data.error };
    }
  }
  
  return { sessionInvalidated: false };
};

// Wrapped fetch function that automatically handles session invalidation
export const fetchWithSessionCheck = async (url, options = {}, authContext = null) => {
  try {
    const response = await fetch(url, options);
    
    // Check for session invalidation
    if (response.status === 403) {
      const data = await response.json();
      if (data.error && data.error.includes('session has been invalidated')) {
        // Force logout and return error
        if (authContext && authContext.forceLogout) {
          await authContext.forceLogout('Your session has been invalidated. Admin may have forced you to logout.');
        }
        return { 
          ok: false, 
          status: 403, 
          sessionInvalidated: true,
          json: async () => data 
        };
      }
    }
    
    return response;
  } catch (error) {
    throw error;
  }
};

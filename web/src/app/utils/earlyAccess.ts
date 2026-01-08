// utils/earlyAccess.ts

export const clearEarlyAccess = () => {
  try {
    localStorage.removeItem('forme_early_access');
    localStorage.removeItem('forme_early_access_timestamp');
    window.location.reload(); // Reload to show coming soon page
  } catch (error) {
    console.error('Error clearing early access:', error);
  }
};

export const checkEarlyAccess = (): boolean => {
  try {
    const auth = localStorage.getItem('forme_early_access');
    const authTimestamp = localStorage.getItem('forme_early_access_timestamp');
    
    if (auth === 'true' && authTimestamp) {
      const timestamp = parseInt(authTimestamp);
      const now = Date.now();
      const oneWeek = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
      
      // Check if authentication is still valid (within 7 days)
      if (now - timestamp < oneWeek) {
        return true;
      } else {
        // Clear expired authentication
        clearEarlyAccess();
        return false;
      }
    }
    return false;
  } catch (error) {
    console.error('Error checking early access:', error);
    return false;
  }
};

export const setEarlyAccess = () => {
  try {
    localStorage.setItem('forme_early_access', 'true');
    localStorage.setItem('forme_early_access_timestamp', Date.now().toString());
    return true;
  } catch (error) {
    console.error('Error setting early access:', error);
    return false;
  }
};
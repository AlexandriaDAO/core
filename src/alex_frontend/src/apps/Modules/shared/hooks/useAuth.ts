import { getAuthClient } from '@/features/auth/utils/authUtils';

export const useAuth = () => {
  const checkAuthentication = async () => {
    const client = await getAuthClient();
    return client.isAuthenticated();
  };

  return { checkAuthentication };
}; 
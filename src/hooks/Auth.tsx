import React, {
  createContext, useCallback, useState, useContext, useEffect,
} from 'react';
import asyncStorage from '@react-native-community/async-storage';

import api from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
}

interface AuthState {
  token: string;
  user: User;
}

interface SignInCredentials {
  email: string;
  password: string;
}

interface AuthContextData {
  user: User;
  signIn(credentials: SignInCredentials): Promise<void>;
  signOut(): void;
  updateUser(user: User): Promise<void>;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextData>(
  {} as AuthContextData,
);

export const AuthProvider: React.FC = ({ children }) => {
  const [data, setData] = useState<AuthState>({} as AuthState);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData(): Promise<void> {
      const [token, user] = await asyncStorage.multiGet([
        '@Gobarber:token',
        '@Gobarber:user',
      ]);

      if (token[1] && user[1]) {
        api.defaults.headers.authorization = `Bearer ${token[1]}`;

        setData({ token: token[1], user: JSON.parse(user[1]) });
      }
      setLoading(false);
    }
    loadStorageData();
  }, []);

  const signIn = useCallback(async ({ email, password }: SignInCredentials) => {
    const response = await api.post('sessions', {
      email,
      password,
    });

    const { token, user } = response.data;
    await asyncStorage.multiSet([
      ['@Gobarber:token', token],
      ['@Gobarber:user', JSON.stringify(user)],
    ]);

    api.defaults.headers.authorization = `Bearer ${token}`;
    setData({ token, user });
  }, []);

  const signOut = useCallback(async () => {
    await asyncStorage.multiRemove([
      '@Gobarber:token',
      '@Gobarber:user',
    ]);

    setData({} as AuthState);
  }, []);

  const updateUser = useCallback(
    async (user: User) => {
      await asyncStorage.setItem('@Gobarber:user', JSON.stringify(user));

      setData({
        token: data.token,
        user,
      });
    },
    [data.token],
  );
  return (
    <AuthContext.Provider value={{
      user: data.user, isLoading, signIn, signOut, updateUser,
    }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used an AuthProvider');
  }

  return context;
}

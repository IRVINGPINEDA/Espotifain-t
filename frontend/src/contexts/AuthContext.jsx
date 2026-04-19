import { createContext, startTransition, useEffect, useState } from 'react';
import { authApi } from '../api/services';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('spotifynt-token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('spotifynt-token')));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setUser(null);
      return;
    }

    let active = true;

    authApi
      .me()
      .then((response) => {
        if (!active) {
          return;
        }

        startTransition(() => {
          setUser(response.user);
          setLoading(false);
        });
      })
      .catch(() => {
        localStorage.removeItem('spotifynt-token');
        if (!active) {
          return;
        }

        startTransition(() => {
          setToken(null);
          setUser(null);
          setLoading(false);
        });
      });

    return () => {
      active = false;
    };
  }, [token]);

  const persistSession = (nextToken, nextUser) => {
    localStorage.setItem('spotifynt-token', nextToken);
    startTransition(() => {
      setToken(nextToken);
      setUser(nextUser);
      setLoading(false);
    });
  };

  const login = async (payload) => {
    const response = await authApi.login(payload);
    persistSession(response.token, response.user);
    return response.user;
  };

  const register = async (payload) => {
    const response = await authApi.register(payload);
    persistSession(response.token, response.user);
    return response.user;
  };

  const logout = () => {
    localStorage.removeItem('spotifynt-token');
    startTransition(() => {
      setToken(null);
      setUser(null);
      setLoading(false);
    });
  };

  const updateUser = (nextUser) => {
    startTransition(() => {
      setUser(nextUser);
    });
  };

  return (
    <AuthContext.Provider
      value={{
        loading,
        login,
        logout,
        register,
        token,
        updateUser,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

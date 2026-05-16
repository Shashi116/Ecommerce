'use client';

import React, { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const cachedUser = window.localStorage.getItem('userInfo');
    if (cachedUser) {
      setUser(JSON.parse(cachedUser));
    }

    const syncSession = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          window.localStorage.setItem('userInfo', JSON.stringify(data));
        } else {
          setUser(null);
          window.localStorage.removeItem('userInfo');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setAuthLoading(false);
      }
    };

    syncSession();
  }, []);

  const login = (userData) => {
    setUser(userData);
    window.localStorage.setItem('userInfo', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    } catch (error) {
      console.error(error);
    }
    setUser(null);
    window.localStorage.removeItem('userInfo');
  };

  return (
    <AuthContext.Provider value={{ user, authLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

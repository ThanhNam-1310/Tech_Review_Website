import React from "react";
import { createContext, useContext } from "react";
import { useState, useEffect } from "react";

const AuthContext = createContext({
  user: null,
  loading: true,
  setUser: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadUser = async () => {
      try {
        const data = await getMe();
        if (isMounted) {
          setUser(data);
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadUser();
    return () => {
      isMounted = false;
    };
  }, []);

  const logout = async () => {
    try {
      await logOut({});
    } catch (error) {
      console.error("Logout thất bại:", error);
    } finally {
      setUser(null);
      setLoading(false);
      // navigate("/login");
    }
  };

  const value = { user, loading, setUser, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

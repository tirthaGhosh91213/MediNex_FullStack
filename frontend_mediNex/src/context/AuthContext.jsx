import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [role, setRole] = useState(localStorage.getItem("role") || null);
  const [loading, setLoading] = useState(true);

  // Default axios config
  axios.defaults.baseURL = "https://medinex-fullstack-backend.onrender.com/api";
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  // Configure axios to show user data on load
  useEffect(() => {
    const fetchUser = async () => {
      if (token && role) {
        try {
          // Adjust endpoint based on role
          const endpoint = `/${role.toLowerCase()}/profile`;
          const res = await axios.get(endpoint);
          
          let userData = null;
          const lowerRole = role.toLowerCase();
          if (lowerRole === "admin") userData = res.data.admin;
          else if (lowerRole === "broker") userData = res.data.broker;
          else if (lowerRole === "patient") userData = res.data.patient;
          
          setUser(userData);
        } catch (error) {
          console.error("Fetch user error", error);
          logout();
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token, role]);

  const login = async (email, password) => {
    const roles = ["Patient", "Broker", "Admin"];
    
    for (const loginRole of roles) {
      try {
        const endpoint = `/${loginRole.toLowerCase()}/login`;
        const { data } = await axios.post(endpoint, { email, password });
        
        if (data.success) {
          const userData = data.patient || data.broker || data.admin;
          
          setUser(userData);
          setToken(data.token);
          setRole(loginRole);
          
          localStorage.setItem("token", data.token);
          localStorage.setItem("role", loginRole);
          
          axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
          
          toast.success(`Welcome back! Logged in as ${loginRole}`);
          return { success: true, role: loginRole };
        }
      } catch (error) {
        // If it's a 404 or 401, we just continue to the next role
        // If all roles fail, we'll show an error at the end
      }
    }
    
    toast.error("Invalid Credentials or Account Not Found");
    return { success: false, message: "Invalid Credentials" };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRole(null);
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    delete axios.defaults.headers.common["Authorization"];
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, token, role, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

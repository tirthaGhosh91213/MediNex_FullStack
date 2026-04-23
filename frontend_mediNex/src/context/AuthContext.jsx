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
  axios.defaults.baseURL = "http://localhost:4000/api";
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
          if (role === "admin") userData = res.data.admin;
          else if (role === "broker") userData = res.data.broker;
          else if (role === "patient") userData = res.data.patient;
          
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

  const login = async (email, password, loginRole) => {
    try {
      // The backend expects different routes based on the role
      // For Phase 1 we have /patient/login, /broker/login, /admin/login
      const endpoint = `/${loginRole.toLowerCase()}/login`;
      
      const { data } = await axios.post(endpoint, { email, password });
      
      if (data.success) {
        // Find user data object in the response (it could be patient, broker, or admin)
        const userData = data.patient || data.broker || data.admin;
        
        setUser(userData);
        setToken(data.token);
        setRole(loginRole);
        
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", loginRole);
        
        // Update axios header
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        
        toast.success(`Welcome back! Logged in as ${loginRole}`);
        return { success: true, role: loginRole };
      }
      return { success: false };
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid Credentials");
      return { success: false, message: error.response?.data?.message };
    }
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

"use client"; // Context musi być Client Component

import { createContext, useContext, useState, useEffect } from "react";
import { isTokenValid, getUserRole, logout as authLogout } from "../utils/auth";
import { fetcher } from "../services/api";

interface User {
  id: string;
  username: string;
  role: string;
}

interface AuthContextType {
  user: { id: string; username: string, role: string } | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {                                                                                     
    const token = localStorage.getItem("access_token");                                                 
    if (token && isTokenValid(token)) {                                                                 
      fetcher("/users/profile", {                                                                       
        headers: {                                                                                      
          "Authorization": `Bearer ${token}`                                                            
        }                                                                                               
      })                                                                                                
        .then((userData: User) => {                                                                     
          setUser(userData);                                                                            
        })                                                                                              
        .catch(() => {                                                                                  
          authLogout();                                                                                 
          setUser(null);                                                                                
        });                                                                                             
    }                                                                                                   
  }, []);  

  const login = async (username: string, password: string) => {                                         
    const res = await fetcher("/auth/login", {                                                          
      method: "POST",                                                                                   
      body: JSON.stringify({ username, password }),                                                     
      headers: { "Content-Type": "application/json" },                                                  
    });                                                                                                 
    if (res.token) {                                                                                    
      localStorage.setItem("access_token", res.token);                                                  
      // Pobierz dane użytkownika po zalogowaniu                                                        
      const userData = await fetcher("/users/profile", {                                                
        headers: {                                                                                      
          "Authorization": `Bearer ${res.token}`                                                        
        }                                                                                               
      });                                                                                               
      setUser({ id: userData.id, username: userData.username, role: userData.role });                   
    }                                                                                                   
  }; 

  const logout = () => {
    authLogout();
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
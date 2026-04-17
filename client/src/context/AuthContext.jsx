import { createContext, useState, useContext } from "react";

// Create Context
export const AuthContext = createContext();

// Provider Component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

// 🔥 Custom Hook (fix for "useAuth is not defined")
export const useAuth = () => {
  return useContext(AuthContext);
};
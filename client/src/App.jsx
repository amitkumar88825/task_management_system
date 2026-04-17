import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import AdminLogin from "./components/admin/Auth";
import UserLogin from "./components/user/Login";
import UserSingup from "./components/user/Singup";
import AdminDashboard from "./components/admin/Dashboard";
import UserDashboard from "./components/user/Dashboard";
import AdminUsers from "./components/admin/Users";
import AdminTasks from "./components/admin/Tasks";
import LandingPage from "./components/landing-page/LandingPage";
import { useAuth } from "./context/AuthContext";
import axios from "axios";
import { useEffect } from "react";

function App() {
  const { user, setUser } = useAuth();
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!user) {
      const fetchUser = async () => {
        const { data } = await axios.get(`${API}/api/users/info`, {
          withCredentials: true,
          headers: {
            "Cache-Control": "no-cache",
          },
        });
        setUser(data);
      };
      fetchUser();
    }
  }, []);


  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/user-login" element={<UserLogin />} />
          <Route path="/user-singup" element={<UserSingup />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/tasks" element={<AdminTasks />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;

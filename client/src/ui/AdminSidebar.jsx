import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;
  const menu = [
    { name: "Dashboard", path: "/admin/dashboard" },
    { name: "Users", path: "/admin/users" },
    { name: "Tasks", path: "/admin/tasks" },
  ];


const handleLogout = async () => {
  try {
    // Call backend logout API
    await axios.post(
      `${API}/api/auth/logout`,
      {
        withCredentials: true
      }
    );

  } catch (error) {
    console.error("Logout API error:", error);
  } finally {
    navigate("/");
  }
};

  return (
    <div className="w-64 h-screen bg-black text-white p-5 fixed left-0 top-0 flex flex-col justify-between">
      
      {/* Top Section */}
      <div>
        <h1 className="text-2xl font-bold mb-8">Admin Panel</h1>

        <nav className="flex flex-col gap-3">
          {menu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 rounded-lg text-sm ${
                location.pathname === item.path
                  ? "bg-white text-black font-semibold"
                  : "hover:bg-gray-800"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom Logout */}
      <div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-red-500 hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

    </div>
  );
};

export default AdminSidebar;
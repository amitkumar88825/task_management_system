import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../ui/AdminSidebar";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  });

    const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get(
            `${API}/api/tasks/stats`, 
          {
            withCredentials: true
          }
        );

        setStats(data);
      } catch (error) {
        console.error(error);

        // fallback
        setStats({
          total: 20,
          pending: 8,
          inProgress: 6,
          completed: 6,
        });
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="flex">
      
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="ml-64 w-full p-6 bg-gray-100 min-h-screen">
        
        <h1 className="text-2xl font-bold mb-6">
          Admin Dashboard
        </h1>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          <div className="bg-white shadow rounded-xl p-5">
            <h3 className="text-gray-500 text-sm">All Tasks</h3>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>

          <div className="bg-yellow-100 shadow rounded-xl p-5">
            <h3 className="text-yellow-700 text-sm">Pending</h3>
            <p className="text-2xl font-bold">{stats.pending}</p>
          </div>

          <div className="bg-blue-100 shadow rounded-xl p-5">
            <h3 className="text-blue-700 text-sm">In Progress</h3>
            <p className="text-2xl font-bold">{stats.inProgress}</p>
          </div>

          <div className="bg-green-100 shadow rounded-xl p-5">
            <h3 className="text-green-700 text-sm">Completed</h3>
            <p className="text-2xl font-bold">{stats.completed}</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
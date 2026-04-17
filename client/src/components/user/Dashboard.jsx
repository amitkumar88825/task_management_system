import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import TaskModal from "../../ui/TaskModal";
import { useAuth } from "../../context/AuthContext";

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  });

  // 🔥 NEW STATES
  const [productivity, setProductivity] = useState(0);
  const [daily, setDaily] = useState(0);
  const [weekly, setWeekly] = useState(0);
  const [monthly, setMonthly] = useState(0);

  const [openMenuId, setOpenMenuId] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const API = import.meta.env.VITE_API_URL;

  const handleOpenUpdate = (task) => {
    setSelectedTask(task);
    setOpenModal(true);
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === updatedTask._id ? updatedTask : t))
    );
  };

  useEffect(() => {
    const closeMenu = () => setOpenMenuId(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // ✅ Tasks
        const { data } = await axios.get(
          `${API}/api/tasks/user-tasks`,
          { withCredentials: true }
        );

        // ✅ Stats
        const { data: statsData } = await axios.get(
          `${API}/api/tasks/user-tasks-report`,
          { withCredentials: true }
        );

        // ✅ Productivity
        const { data: productivityData } = await axios.get(
          `${API}/api/tasks/productivity`,
          { withCredentials: true }
        );

        // ✅ Daily
        const { data: dailyData } = await axios.get(
          `${API}/api/tasks/daily-stats`,
          { withCredentials: true }
        );

        // ✅ Weekly
        const { data: weeklyData } = await axios.get(
          `${API}/api/tasks/weekly-stats`,
          { withCredentials: true }
        );

        // ✅ Monthly (optional backend)
        let monthlyValue = 0;
        try {
          const { data: monthlyData } = await axios.get(
            `${API}/api/tasks/monthly-stats`,
            { withCredentials: true }
          );
          monthlyValue = monthlyData?.total || 0;
        } catch(error) {
          console.error(error);
        }

        // 🔥 SET STATE
        setTasks(data);
        setStats(statsData);

        setProductivity(productivityData?.productivityScore || 0);
        setDaily(dailyData?.completed || 0);
        setWeekly(weeklyData?.length || 0);
        setMonthly(monthlyValue);

      } catch (error) {
        console.error(error);
      }
    };

    fetchAll();
  }, [API]);

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "in-progress":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100";
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API}/api/auth/logout`, {}, {
        withCredentials: true,
      });

      navigate("/");
    } catch (error) {
      console.error(error);
      alert("Logout failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome {user?.name}</h1>
          <p className="text-gray-600">Here’s your task overview</p>
        </div>

        <button
          onClick={handleLogout}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
        >
          Logout
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card title="All Tasks" value={stats.total} />
        <Card title="Pending" value={stats.pending} color="yellow" />
        <Card title="In Progress" value={stats.inProgress} color="blue" />
        <Card title="Completed" value={stats.completed} color="green" />
      </div>

      {/* Productivity */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card title="Productivity Score" value={productivity} />
        <Card title="Daily Completed" value={daily} color="yellow" />
        <Card title="Weekly Activity" value={weekly} color="blue" />
        <Card title="Monthly Activity" value={monthly} color="green" />
      </div>

      {/* Task Table */}
      <div className="bg-white shadow rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-4">Your Tasks</h2>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th>#</th>
              <th>Title</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-6 text-center text-gray-500">
                  No tasks found
                </td>
              </tr>
            ) : (
              tasks.map((task, index) => (
                <tr key={task._id} className="border-b hover:bg-gray-50">
                  <td>{index + 1}</td>
                  <td>{task.title}</td>

                  <td>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusStyle(task.status)}`}>
                      {task.status}
                    </span>
                  </td>

                  <td className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === task._id ? null : task._id);
                      }}
                      className="px-2 py-1 hover:bg-gray-100"
                    >
                      ⋮
                    </button>

                    {openMenuId === task._id && (
                      <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-md z-50">
                        <button
                          onClick={() => {
                            handleOpenUpdate(task);
                            setOpenMenuId(null);
                          }}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          Update Status
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <TaskModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onTaskCreated={handleTaskUpdated}
        initialData={selectedTask}
      />
    </div>
  );
};

// 🔥 Reusable Card Component
const Card = ({ title, value, color = "white" }) => {
  const bg = {
    yellow: "bg-yellow-100",
    blue: "bg-blue-100",
    green: "bg-green-100",
    white: "bg-white shadow",
  };

  return (
    <div className={`${bg[color]} p-4 rounded-xl`}>
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
};

export default UserDashboard;
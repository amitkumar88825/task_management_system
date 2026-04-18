import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../ui/AdminSidebar";
import TaskModal from "../../ui/TaskModal";

const AdminTasks = () => {
  const API = import.meta.env.VITE_API_URL;
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  const handleViewTask = (task) => {
    alert(`Task: ${task.title}`);
  };

  const handleEditTask = (task) => {
    alert("Edit task coming soon");
  };

  useEffect(() => {
    const closeMenu = () => setOpenMenuId(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data } = await axios.get(`${API}/api/tasks`, {
          withCredentials: true,
        });

        setTasks(data);
      } catch (error) {
        console.error(error);

        setTasks([
          { _id: "1", title: "Design UI", status: "pending" },
          { _id: "2", title: "Build API", status: "in-progress" },
          { _id: "3", title: "Deploy App", status: "completed" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

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

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-700 border border-green-200";

      case "medium":
        return "bg-yellow-100 text-yellow-700 border border-yellow-200";

      case "high":
        return "bg-red-100 text-red-700 border border-red-200";

      default:
        return "bg-gray-100 text-gray-600 border border-gray-200";
    }
  };

  const handleTaskCreated = (newTask) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("adminToken");

      await axios.delete(`${API}/api/tasks/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // ✅ Update UI instantly
      setTasks((prev) => prev.filter((task) => task._id !== id));
    } catch (error) {
      console.error(error);
      alert("Failed to delete task");
    }
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <AdminSidebar />

      {/* ✅ Main Content FIXED */}
      <div className="ml-64 w-full p-6 bg-gray-100 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Tasks Management</h1>

          <button
            onClick={() => setOpenModal(true)}
            className="bg-black text-white px-4 py-2 rounded-lg"
          >
            Create Task
          </button>
        </div>

        {/* Table */}
        <div className="bg-white shadow rounded-xl p-4">
          {loading ? (
            <p>Loading tasks...</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2">#</th>
                  <th className="py-2">Title</th>
                  <th className="py-2">Priority</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Action</th>
                </tr>
              </thead>

              <tbody>
                {tasks.map((task, index) => (
                  <tr key={task._id} className="border-b hover:bg-gray-50">
                    <td className="py-2">{index + 1}</td>

                    <td className="py-2">{task.title}</td>

                    <td className="py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${getPriorityStyle(
                          task.priority,
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </td>

                    <td className="py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${getStatusStyle(
                          task.status,
                        )}`}
                      >
                        {task.status}
                      </span>
                    </td>

                    <td className="py-2 relative">
                      {/* 3-dot button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(
                            openMenuId === task._id ? null : task._id,
                          );
                        }}
                        className="text-lg px-2 py-1 rounded hover:bg-gray-100"
                      >
                        ⋮
                      </button>

                      {/* Dropdown */}
                      {openMenuId === task._id && (
                        <div
                          className="absolute right-0 mt-2 w-36 bg-white border rounded-lg shadow-md z-50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              handleViewTask(task);
                              setOpenMenuId(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            View
                          </button>

                          <button
                            onClick={() => {
                              handleEditTask(task);
                              setOpenMenuId(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => {
                              handleDelete(task._id);
                              setOpenMenuId(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      <TaskModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
};

export default AdminTasks;

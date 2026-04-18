import { useEffect, useState, useRef } from "react";
import axios from "axios";
import AdminSidebar from "../../ui/AdminSidebar";
import TaskModal from "../../ui/TaskModal";
import TaskViewModal from "../../ui/TaskViewModal";

const AdminTasks = () => {
  const API = import.meta.env.VITE_API_URL;

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  const [selectedTask, setSelectedTask] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);

  const observerRef = useRef(null);

  // ---------------- FETCH TASKS ----------------
  const fetchTasks = async (pageNum = 1) => {
    try {
      if (fetchingMore) return;

      if (pageNum === 1) setLoading(true);
      else setFetchingMore(true);

      const { data } = await axios.get(
        `${API}/api/tasks?page=${pageNum}&limit=10`,
        { withCredentials: true }
      );

      if (pageNum === 1) {
        setTasks(data.tasks);
      } else {
        setTasks((prev) => [...prev, ...data.tasks]);
      }

      setHasMore(data.hasMore);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  };

  // ---------------- INITIAL LOAD ----------------
  useEffect(() => {
    fetchTasks(1);
  }, []);

  // ---------------- PAGE CHANGE ----------------
  useEffect(() => {
    if (page === 1) return;
    fetchTasks(page);
  }, [page]);

  // ---------------- INTERSECTION OBSERVER ----------------
  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !fetchingMore) {
          setPage((prev) => prev + 1);
        }
      },
      {
        threshold: 1,
      }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [hasMore, fetchingMore]);

  // ---------------- MENU CLOSE ----------------
  useEffect(() => {
    const closeMenu = () => setOpenMenuId(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  // ---------------- ACTIONS ----------------
  const handleViewTask = (task) => {
    setSelectedTask(task);
    setIsViewOpen(true);
  };

  const handleEditTask = (task) => {
    setEditTask(task);
    setIsEditOpen(true);
  };

  const handleTaskCreated = () => {
    setPage(1);
    fetchTasks(1);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/api/tasks/${id}`, {
        withCredentials: true,
      });

      setTasks((prev) => prev.filter((task) => task._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  // ---------------- STYLES ----------------
  const getStatusStyle = (status) => {
    if (status === "pending") return "bg-yellow-100 text-yellow-700";
    if (status === "in-progress") return "bg-blue-100 text-blue-700";
    if (status === "completed") return "bg-green-100 text-green-700";
    return "bg-gray-100";
  };

  const getPriorityStyle = (priority) => {
    if (priority === "low")
      return "bg-green-100 text-green-700 border border-green-200";
    if (priority === "medium")
      return "bg-yellow-100 text-yellow-700 border border-yellow-200";
    if (priority === "high")
      return "bg-red-100 text-red-700 border border-red-200";
    return "bg-gray-100 text-gray-600 border border-gray-200";
  };

  return (
    <div className="flex">
      <AdminSidebar />

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
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </td>

                    <td className="py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${getStatusStyle(
                          task.status
                        )}`}
                      >
                        {task.status}
                      </span>
                    </td>

                    <td className="py-2 relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(
                            openMenuId === task._id ? null : task._id
                          );
                        }}
                        className="text-lg px-2 py-1 rounded hover:bg-gray-100"
                      >
                        ⋮
                      </button>

                      {openMenuId === task._id && (
                        <div className="absolute right-0 mt-2 w-36 bg-white border rounded-lg shadow-md z-50">
                          <button
                            onClick={() => handleViewTask(task)}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            View
                          </button>

                          <button
                            onClick={() => handleEditTask(task)}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(task._id)}
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

          {/* Loading */}
          {fetchingMore && (
            <p className="text-center py-4 text-gray-500">
              Loading more tasks...
            </p>
          )}

          {/* 🔥 Sentinel (IMPORTANT) */}
          <div ref={observerRef} className="h-10" />
        </div>
      </div>

      {/* Modals */}
      <TaskModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onTaskCreated={handleTaskCreated}
      />

      <TaskModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialData={editTask}
        onTaskCreated={handleTaskCreated}
      />

      <TaskViewModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        task={selectedTask}
      />
    </div>
  );
};

export default AdminTasks;
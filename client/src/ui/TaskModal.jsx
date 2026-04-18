import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { createPortal } from "react-dom";

const TaskModal = ({ isOpen, onClose, onTaskCreated, initialData }) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    assignedTo: "",
    estimatedTime: "",
    actualTime: "",
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(false);

  const API = import.meta.env.VITE_API_URL;

  // ---------------- EDIT MODE ----------------
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        status: initialData.status || "pending",
        priority: initialData.priority || "medium",
        actualTime: initialData.actualTime || "",
        estimatedTime: initialData.estimatedTime || "",
        assignedTo: initialData?.assignedTo?._id || "",
      });
    }
  }, [initialData]);

  // ---------------- FETCH USERS ----------------
  useEffect(() => {
    if (!isOpen) return;

    const fetchUsers = async () => {
      try {
        setFetchingUsers(true);

        const { data } = await axios.get(`${API}/api/users/list`, {
          withCredentials: true,
        });

        const activeUsers = data.filter((u) => u.isActive !== false);
        setUsers(activeUsers);
      } catch (error) {
        console.error(error);
      } finally {
        setFetchingUsers(false);
      }
    };

    fetchUsers();
  }, [isOpen]);

  // ---------------- SCROLL LOCK ----------------
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";

    return () => (document.body.style.overflow = "auto");
  }, [isOpen]);

  // ---------------- HANDLERS ----------------
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      status: "pending",
      priority: "medium",
      assignedTo: "",
      actualTime: "",
      estimatedTime: "",
    });
  };

  const CloseModal = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;

      const payload = {
        ...formData,
        estimatedTime: Number(formData.estimatedTime),
        actualTime: Number(formData.actualTime),
      };

      if (initialData) {
        if (user?.role === "user") {
          response = await axios.put(
            `${API}/api/tasks/update-status/${initialData._id}`,
            payload,
            { withCredentials: true }
          );
        } else {
          response = await axios.put(
            `${API}/api/tasks/${initialData._id}`,
            payload,
            { withCredentials: true }
          );
        }
      } else {
        response = await axios.post(`${API}/api/tasks`, payload, {
          withCredentials: true,
        });
      }

      onTaskCreated(response.data.task);
      resetForm();
      CloseModal();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- EXIT ----------------
  if (!isOpen) return null; // ✅ ONLY THIS CONDITION

  // ---------------- PORTAL ----------------
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={CloseModal}
    >
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-semibold">
            {initialData ? "Update Task Status" : "Create Task"}
          </h2>

          <button
            onClick={CloseModal}
            className="text-gray-500 hover:text-black text-lg"
          >
            ✕
          </button>
        </div>

        {/* USER NOT READY */}
        {!user ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {user?.role === "admin" && (
              <>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Title"
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Description"
                  className="w-full px-3 py-2 border rounded-lg"
                />

                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">
                    {fetchingUsers ? "Loading..." : "Select user"}
                  </option>

                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name}
                    </option>
                  ))}
                </select>

                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </>
            )}

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <input
              type="number"
              name="estimatedTime"
              value={formData.estimatedTime}
              onChange={handleChange}
              placeholder="Estimated Time"
              disabled={user?.role === "user"}
              className="w-full px-3 py-2 border rounded-lg"
            />

            <input
              type="number"
              name="actualTime"
              value={formData.actualTime}
              onChange={handleChange}
              placeholder="Actual Time"
              className="w-full px-3 py-2 border rounded-lg"
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={CloseModal}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-black text-white rounded-lg"
              >
                {loading ? "Processing..." : "Submit"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.getElementById("modal-root") || document.body
  );
};

export default TaskModal;
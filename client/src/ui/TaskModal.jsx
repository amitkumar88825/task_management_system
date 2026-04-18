import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const TaskModal = ({ isOpen, onClose, onTaskCreated, initialData }) => {
  const { user } = useAuth();  

  const [formData, setFormData] = useState(() => ({
    title: initialData?.title || "",
    description: initialData?.description || "",
    status: initialData?.status || "pending",
    priority: initialData?.priority || "medium",
    assignedTo: initialData?.assignedTo || "",
  }));
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const API = import.meta.env.VITE_API_URL;


  // ✅ Fetch users only when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchUsers = async () => {
      try {
        setFetchingUsers(true);

        const { data } = await axios.get(`${API}/api/users`, {
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

  if (!isOpen) return null;

    if (!user) return null;

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
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;

      if (initialData) {
        if (user?.role === "user") {
          response = await axios.put(
            `${API}/api/tasks/update-status/${initialData._id}`,
            formData,
            { withCredentials: true },
          );
        } else {
          response = await axios.put(
            `${API}/api/tasks/${initialData._id}`,
            formData,
            { withCredentials: true },
          );
        }
      } else {
        response = await axios.post(
          `${API}/api/tasks`,
          formData,
          { withCredentials: true },
        );
      }

      onTaskCreated(response.data.task);
      resetForm();
      onClose();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onClose}
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
            onClick={onClose}
            className="text-gray-500 hover:text-black text-lg"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {user?.role === "admin" && (
            <>
              {/* Title */}
              <div>
                <label className="text-sm font-medium">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter task title"
                  className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Optional description"
                  rows={3}
                  className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Assign User */}
              <div>
                <label className="text-sm font-medium">Assign To</label>
                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="">
                    {fetchingUsers ? "Loading users..." : "Select a user"}
                  </option>

                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="text-sm font-medium">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </>
          )}

          {/* Status */}
          <div>
            <label className="text-sm font-medium">Status</label>
            <select
              name="status"
              value={formData.status}
              disable={
                formData?.priority === "completed" && user?.role === "user"
              }
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {loading
                ? initialData
                  ? "Updating..."
                  : "Creating..."
                : initialData
                  ? "Update"
                  : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;

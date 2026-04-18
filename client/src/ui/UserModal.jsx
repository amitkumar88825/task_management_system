import { useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const UserModal = ({ user, onClose, onSuccess }) => {
  const isEdit = !!user;

const [form, setForm] = useState(() => ({
  name: user?.name || "",
  email: user?.email || "",
  password: "",
  role: user?.role || "user",
}));

  const [loading, setLoading] = useState(false);


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let res;

      if (isEdit) {
        res = await axios.put(
          `${API}/api/users/${user._id}`,
          form,
          { withCredentials: true }
        );
      } else {
        res = await axios.post(
          `${API}/api/users`,
          form,
          { withCredentials: true }
        );
      }

      onSuccess(res.data, isEdit);
      onClose();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl w-[400px] shadow-lg">
        <h2 className="text-xl font-bold mb-4">
          {isEdit ? "Edit User" : "Add User"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />

          {!isEdit && (
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />
          )}

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <div className="flex justify-end gap-2 mt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-black text-white rounded"
            >
              {loading ? "Saving..." : isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
import { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../ui/AdminSidebar";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${API}/api/users`, {
          withCredentials: true,
        });

        setUsers(data);
      } catch (error) {
        console.error(error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const closeMenu = () => setOpenMenuId(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  const handleViewUser = (user) => {
    alert(`User: ${user.name} (${user.email})`);
  };

  const handleEditUser = (user) => {
    console.log("Edit user:", user);
    alert("Edit user coming soon");
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await axios.delete(`${API}/api/users/${id}`, {
        withCredentials: true,
      });

      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (error) {
      console.error(error);
      alert("Failed to delete user");
    }
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="ml-64 w-full p-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">All Users</h1>

        {/* Table */}
        <div className="bg-white shadow rounded-xl overflow-visible">
          {loading ? (
            <p className="p-5 text-center">Loading users...</p>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-3 text-sm">Name</th>
                  <th className="p-3 text-sm">Email</th>
                  <th className="p-3 text-sm">Role</th>
                  <th className="p-3 text-sm">Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-5 text-center">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="border-t">
                      <td className="p-3">{user.name}</td>
                      <td className="p-3">{user.email}</td>
                      <td className="p-3 capitalize">{user.role}</td>

                      <td className="p-3 relative">
                        {/* 3-dot button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // 🔥 IMPORTANT
                            setOpenMenuId(
                              openMenuId === user._id ? null : user._id,
                            );
                          }}
                          className="text-lg px-2 py-1 rounded hover:bg-gray-100"
                        >
                          ⋮
                        </button>

                        {/* Dropdown */}
                        {openMenuId === user._id && (
                          <div className="absolute right-0 mt-2 w-36 bg-white border rounded-lg shadow-md z-50">
                            <button
                              onClick={() => {
                                handleViewUser(user);
                                setOpenMenuId(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            >
                              👁 View
                            </button>

                            <button
                              onClick={() => {
                                handleEditUser(user);
                                setOpenMenuId(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            >
                              ✏️ Edit
                            </button>

                            <button
                              onClick={() => {
                                handleDeleteUser(user._id);
                                setOpenMenuId(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
                            >
                              🗑 Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;

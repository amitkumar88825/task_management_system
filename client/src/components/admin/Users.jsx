import { useEffect, useState, useRef } from "react";
import axios from "axios";
import AdminSidebar from "../../ui/AdminSidebar";
import UserModal from "../../ui/UserModal";
import ViewUserModal from "../../ui/ViewUserModal";


  const DeleteConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-[350px] rounded-2xl p-6 shadow-2xl">
        
        <h2 className="text-lg font-semibold mb-2">
          Delete User
        </h2>

        <p className="text-sm text-gray-600 mb-5">
          Are you sure you want to delete this user? This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminUsers = () => {
  const API = import.meta.env.VITE_API_URL;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingMore, setFetchingMore] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [openMenuId, setOpenMenuId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const observerRef = useRef(null);

  const updateOnClose = async() => {
    await fetchUsers(page)
    setIsModalOpen(false)
  }

  // ---------------- FETCH USERS ----------------
  const fetchUsers = async (pageNum = 1) => {
    try {
      if (fetchingMore) return; // ✅ prevent duplicate calls

      if (pageNum === 1) setLoading(true);
      else setFetchingMore(true);

      const { data } = await axios.get(
        `${API}/api/users?page=${pageNum}&limit=10`,
        { withCredentials: true }
      );

      setUsers((prev) =>
        pageNum === 1 ? data.users : [...prev, ...data.users]
      );

      setHasMore(data.hasMore);
    } catch (error) {
      console.error(error);
      setUsers([]);
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  };

  // ---------------- INITIAL LOAD ----------------
  useEffect(() => {
    setUsers([]);
    setPage(1);
    setHasMore(true);
  }, []);

  // ---------------- FETCH ON PAGE CHANGE ----------------
  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  // ---------------- INFINITE SCROLL ----------------
  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !fetchingMore &&
          hasMore
        ) {
          setPage((prev) => prev + 1);
        }
      },
      {
        threshold: 0.5, // ✅ FIXED
        rootMargin: "100px", // ✅ preload earlier
      }
    );

    const currentRef = observerRef.current;

    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [hasMore, fetchingMore]);

  // ---------------- MENU CLOSE ----------------
  useEffect(() => {
    const closeMenu = () => setOpenMenuId(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  // ---------------- ACTIONS ----------------
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };


const handleDeleteUser = async () => {
  if (!deleteId) return;

  try {
    await axios.delete(`${API}/api/users/${deleteId}`, {
      withCredentials: true,
    });

    // reset list
    setUsers([]);
    setPage(1);
    setHasMore(true);

    setIsDeleteOpen(false);
    setDeleteId(null);
    await fetchUsers(page);
  } catch (error) {
    console.error(error);
  }
};

  return (
    <div className="flex">
      <AdminSidebar />

      <div className="ml-64 w-full p-6 bg-gray-100 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">All Users</h1>

          <button
            onClick={() => {
              setSelectedUser(null);
              setIsModalOpen(true);
            }}
            className="bg-black text-white px-4 py-2 rounded-lg"
          >
            Add User
          </button>
        </div>

        {/* Table */}
        <div className="bg-white shadow rounded-xl overflow-visible">
          {loading ? (
            <p className="p-5 text-center">Loading users...</p>
          ) : (
            <>
              <table className="w-full text-left">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-3 text-sm">Name</th>
                    <th className="p-3 text-sm">Email</th>
                    <th className="p-3 text-sm">Role</th>
                    <th className="p-3 text-sm text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => {
                    const isInactive = user.isActive === false;

                    return (
                      <tr
                        key={user._id}
                        className={`border-t ${
                          isInactive ? "opacity-50 grayscale" : ""
                        }`}
                      >
                        <td className="p-3">{user.name}</td>
                        <td className="p-3">{user.email}</td>
                        <td className="p-3 capitalize">{user.role}</td>

                        <td className="p-3 relative text-right">
                          <button
                            disabled={isInactive}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isInactive) return;

                              setOpenMenuId(
                                openMenuId === user._id
                                  ? null
                                  : user._id
                              );
                            }}
                            className={`px-2 py-1 rounded ${
                              isInactive
                                ? "cursor-not-allowed text-gray-400"
                                : "hover:bg-gray-100"
                            }`}
                          >
                            ⋮
                          </button>

                          {!isInactive &&
                            openMenuId === user._id && (
                              <div className="absolute right-0 mt-2 w-36 bg-white border rounded-lg shadow-md z-50">
                                <button
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setIsViewModalOpen(true);
                                    setOpenMenuId(null);
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                >
                                  View
                                </button>

                                <button
                                  onClick={() => {
                                    handleEditUser(user);
                                    setOpenMenuId(null);
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                >
                                  Edit
                                </button>

                                <button
                                  onClick={() => {
setDeleteId(user._id);
setIsDeleteOpen(true);
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
                    );
                  })}
                </tbody>
              </table>

              {/* Loading indicator */}
              {fetchingMore && (
                <p className="text-center py-4 text-gray-500">
                  Loading more users...
                </p>
              )}

              {/* 🔥 Trigger element */}
              <div ref={observerRef} className="h-10" />
            </>
          )}
        </div>

        {/* Modals */}
        {isModalOpen && (
          <UserModal
            user={selectedUser}
            onClose={() => updateOnClose()}
            onSuccess={() => {
              setUsers([]);
              setPage(1);
              setHasMore(true);
            }}
          />
        )}

        {isViewModalOpen && (
          <ViewUserModal
            user={selectedUser}
            onClose={() => setIsViewModalOpen(false)}
          />
        )}

<DeleteConfirmModal
  isOpen={isDeleteOpen}
  onClose={() => setIsDeleteOpen(false)}
  onConfirm={handleDeleteUser}
/>

      </div>
    </div>
  );
};

export default AdminUsers;
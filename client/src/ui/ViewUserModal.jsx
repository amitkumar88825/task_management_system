import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const ViewUserModal = ({ user, onClose }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `${API}/api/users/${user._id}/stats`,
          { withCredentials: true }
        );
        setStats(data.stats);
      } catch (err) {
        console.error(err);
        alert("Failed to load stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl w-[400px] shadow-lg">
        <h2 className="text-xl font-bold mb-4">User Details</h2>

        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>

        <div className="mt-4">
          <h3 className="font-semibold mb-2">Task Stats</h3>

          {loading ? (
            <p>Loading...</p>
          ) : stats ? (
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-gray-100 p-3 rounded">
                <p className="text-lg font-bold">{stats.total}</p>
                <p className="text-sm">Total</p>
              </div>

              <div className="bg-yellow-100 p-3 rounded">
                <p className="text-lg font-bold">{stats.pending}</p>
                <p className="text-sm">Pending</p>
              </div>

              <div className="bg-green-100 p-3 rounded">
                <p className="text-lg font-bold">{stats.completed}</p>
                <p className="text-sm">Completed</p>
              </div>
            </div>
          ) : (
            <p>No data</p>
          )}
        </div>

        <div className="flex justify-end mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewUserModal;
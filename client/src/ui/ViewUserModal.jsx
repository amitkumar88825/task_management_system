import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const ViewUserModal = ({ user, onClose }) => {
  const [stats, setStats] = useState(null);
  const [productivity, setProductivity] = useState(null);
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
        setProductivity(data.productivity);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-2xl w-[550px] shadow-xl">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">User Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-lg"
          >
            ✖
          </button>
        </div>

        {/* User Info */}
        <div className="mb-4">
          <p className="text-sm"><strong>Name:</strong> {user.name}</p>
          <p className="text-sm"><strong>Email:</strong> {user.email}</p>
        </div>

        {/* Stats Section */}
        <div className="mt-4">
          <h3 className="font-semibold mb-3 text-gray-700">Task Stats</h3>

          {loading ? (
            <p className="text-center">Loading...</p>
          ) : stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">

              <div className="bg-gray-100 p-3 rounded-xl shadow-sm">
                <p className="text-lg font-bold">{stats.total}</p>
                <p className="text-xs text-gray-600">Total</p>
              </div>

              <div className="bg-yellow-100 p-3 rounded-xl shadow-sm">
                <p className="text-lg font-bold">{stats.pending}</p>
                <p className="text-xs text-gray-600">Pending</p>
              </div>

              <div className="bg-blue-100 p-3 rounded-xl shadow-sm">
                <p className="text-lg font-bold">{stats.inProgress}</p>
                <p className="text-xs text-gray-600">In Progress</p>
              </div>

              <div className="bg-green-100 p-3 rounded-xl shadow-sm">
                <p className="text-lg font-bold">{stats.completed}</p>
                <p className="text-xs text-gray-600">Completed</p>
              </div>

            </div>
          ) : (
            <p>No data</p>
          )}
        </div>

        {/* Productivity Section */}
        <div className="mt-6">
          <h3 className="font-semibold mb-3 text-gray-700">Productivity</h3>

          {productivity ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">

              <div className="bg-purple-100 p-3 rounded-xl shadow-sm">
                <p className="text-lg font-bold text-purple-700">
                  {productivity.overall}%
                </p>
                <p className="text-xs text-gray-600">📊 Overall</p>
              </div>

              <div className="bg-orange-100 p-3 rounded-xl shadow-sm">
                <p className="text-lg font-bold text-orange-600">
                  {productivity.daily}%
                </p>
                <p className="text-xs text-gray-600">📅 Daily</p>
              </div>

              <div className="bg-blue-100 p-3 rounded-xl shadow-sm">
                <p className="text-lg font-bold text-blue-600">
                  {productivity.weekly}%
                </p>
                <p className="text-xs text-gray-600">📈 Weekly</p>
              </div>

              <div className="bg-green-100 p-3 rounded-xl shadow-sm">
                <p className="text-lg font-bold text-green-600">
                  {productivity.monthly}%
                </p>
                <p className="text-xs text-gray-600">📆 Monthly</p>
              </div>

            </div>
          ) : (
            <p>No productivity data</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default ViewUserModal;
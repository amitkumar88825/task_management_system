import React from "react";

const TaskViewModal = ({ isOpen, onClose, task }) => {
  if (!isOpen || !task) return null;

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "in-progress":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "high":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md px-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              {task.title}
            </h2>
            <p className="text-sm text-gray-500 mt-1">Task Overview</p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black text-xl"
          >
            ✕
          </button>
        </div>

        {/* BADGES */}
        <div className="flex gap-3 mb-6">
          <span
            className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusStyle(
              task.status,
            )}`}
          >
            {task.status}
          </span>

          <span
            className={`px-3 py-1 text-xs font-medium rounded-full ${getPriorityStyle(
              task.priority,
            )}`}
          >
            {task.priority} priority
          </span>
        </div>

        {/* DESCRIPTION */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-1">Description</p>
          <p className="text-gray-700">
            {task.description || "No description provided."}
          </p>
        </div>

        {/* GRID INFO */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-xs text-gray-500">Estimated Time</p>
            <p className="text-lg font-semibold">
              {task.estimatedTime || 0} hrs
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-xs text-gray-500">Actual Time</p>
            <p className="text-lg font-semibold">{task.actualTime || 0} hrs</p>
          </div>
        </div>

        {/* USERS */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-xs text-gray-500">Assigned To</p>
            <p className="font-medium text-gray-800">
              {task.assignedTo?.name || "N/A"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Created By</p>
            <p className="font-medium text-gray-800">
              {task.createdBy?.name || "N/A"}
            </p>
          </div>
        </div>

        {/* DATE */}
        <div className="mb-6">
          <p className="text-xs text-gray-500">Created At</p>
          <p className="text-gray-700">
            {new Date(task.createdAt).toLocaleString()}
          </p>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-black text-white hover:bg-gray-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskViewModal;

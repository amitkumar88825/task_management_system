import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { IoArrowBack, IoEye, IoEyeOff } from "react-icons/io5";

const UserSingup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const API = import.meta.env.VITE_API_URL;
  const { name, email, password } = formData;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${API}/api/auth/register`,
        { name, email, password },
        {
          withCredentials: true
        }
      );

      // ✅ store user data
      localStorage.setItem("userToken", data.token);
      localStorage.setItem("userData", JSON.stringify(data.user));

      // redirect to user dashboard
      navigate("/user/dashboard");

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          
          {/* Back */}
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <IoArrowBack size={20} className="text-gray-700" />
          </button>

          {/* Title */}
          <h2 className="text-xl font-semibold">
            Create Account
          </h2>

          {/* Spacer */}
          <div className="w-8"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="user@email.com"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block text-sm font-medium mb-1">
              Password
            </label>

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black pr-10"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-500 hover:text-black transition"
            >
              {showPassword ? <IoEyeOff size={18} /> : <IoEye size={18} />}
            </button>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition"
          >
            {loading ? "Creating..." : "Signup"}
          </button>
        </form>

        {/* Switch to login */}
        <p className="text-sm text-center text-gray-600 mt-4">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/auth")}
            className="text-black font-medium cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default UserSingup;
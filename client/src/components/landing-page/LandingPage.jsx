import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="bg-gray-100 min-h-screen">

      {/* Navbar */}
<header className="flex justify-between items-center px-8 py-4 bg-white shadow">
  <h1 className="text-2xl font-bold text-black">TaskFlow</h1>

  <div className="flex gap-4">
<div className="flex items-center gap-3">
  <Link
    to="/admin"
    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
  >
    Admin
  </Link>

  <Link
    to="/user-login"
    className="px-5 py-2 text-sm font-medium bg-black text-white rounded-lg shadow-sm hover:bg-gray-800 transition"
  >
    Login
  </Link>
</div>

    {/* <Link
      to="/user-singup"
      className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800"
    >
      Signup
    </Link> */}
  </div>
</header>

      {/* Hero Section */}
      <section className="text-center py-20 px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Manage Tasks Smarter & Easier
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
          Organize, track, and complete your tasks efficiently with our powerful
          task management system designed for teams and individuals.
        </p>

        <div className="flex justify-center gap-4">
          <Link
            to="/user-login"
            className="px-6 py-3 bg-black text-white rounded-lg"
          >
            Get Started
          </Link>

          <button className="px-6 py-3 border rounded-lg">
            Learn More
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="px-8 py-16 bg-white">
        <h2 className="text-3xl font-bold text-center mb-10">
          Features
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          
          <div className="p-6 shadow rounded-xl">
            <h3 className="font-semibold text-lg mb-2">
              Task Management
            </h3>
            <p className="text-gray-600">
              Create, update, and track tasks easily with status control.
            </p>
          </div>

          <div className="p-6 shadow rounded-xl">
            <h3 className="font-semibold text-lg mb-2">
              Team Collaboration
            </h3>
            <p className="text-gray-600">
              Assign tasks to team members and monitor progress.
            </p>
          </div>

          <div className="p-6 shadow rounded-xl">
            <h3 className="font-semibold text-lg mb-2">
              Real-time Dashboard
            </h3>
            <p className="text-gray-600">
              View stats for pending, completed, and in-progress tasks.
            </p>
          </div>

        </div>
      </section>

      {/* Stats */}
      <section className="py-16 text-center">
        <h2 className="text-3xl font-bold mb-10">Our Impact</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-8">
          <div>
            <p className="text-2xl font-bold">10K+</p>
            <p className="text-gray-500">Users</p>
          </div>

          <div>
            <p className="text-2xl font-bold">50K+</p>
            <p className="text-gray-500">Tasks Created</p>
          </div>

          <div>
            <p className="text-2xl font-bold">95%</p>
            <p className="text-gray-500">Completion Rate</p>
          </div>

          <div>
            <p className="text-2xl font-bold">24/7</p>
            <p className="text-gray-500">Support</p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-white py-16 px-8">
        <h2 className="text-3xl font-bold text-center mb-10">
          How it Works
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-xl shadow">
            <h3 className="font-semibold mb-2">1. Create Tasks</h3>
            <p className="text-gray-600">
              Add tasks with title, priority, and deadlines.
            </p>
          </div>

          <div className="p-6 rounded-xl shadow">
            <h3 className="font-semibold mb-2">2. Assign & Track</h3>
            <p className="text-gray-600">
              Assign tasks and monitor progress in real-time.
            </p>
          </div>

          <div className="p-6 rounded-xl shadow">
            <h3 className="font-semibold mb-2">3. Complete</h3>
            <p className="text-gray-600">
              Mark tasks completed and analyze productivity.
            </p>
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-16">
        <h2 className="text-3xl font-bold mb-4">
          Ready to boost your productivity?
        </h2>
        <p className="text-gray-600 mb-6">
          Join thousands of users managing tasks efficiently.
        </p>

        <Link
          to="/user-login"
          className="px-6 py-3 bg-black text-white rounded-lg"
        >
          Start Now
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white text-center py-6">
        <p>© 2026 TaskFlow. All rights reserved.</p>
      </footer>

    </div>
  );
};

export default LandingPage;
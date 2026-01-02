"use client";
import { useState } from "react";
import { api } from "@/lib/api";

// ✅ Store token safely
function saveToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");

    try {
      // ✅ POST to your backend
      const { data } = await api.post("/api/auth/restaurant/login", {
        email,
        password,
      });

      // ✅ If backend returns just the token string:
      const token = typeof data === "string" ? data : data.token;
      if (!token) throw new Error("Token missing in response");

      saveToken(token);
      window.location.href = "/dashboard"; // redirect to dashboard
    } catch (e: any) {
      setErr(e?.response?.data?.error || "Invalid credentials");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col md:flex-row overflow-hidden">
        {/* Left Section - Form */}
        <div className="flex-1 p-10 flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome Back 👋
          </h1>
          <p className="text-gray-500 mb-8">
            Login to your CloudMenu Admin Dashboard
          </p>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-teal-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-teal-500 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold text-lg py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              Login
            </button>

            {err && (
              <p className="text-red-600 text-sm text-center font-medium">
                {err}
              </p>
            )}
          </form>

          <p className="text-sm text-gray-500 text-center mt-6">
            Don’t have an account?{" "}
            <a
              href="/signup"
              className="text-teal-600 hover:underline font-medium"
            >
              Create one
            </a>
          </p>
        </div>

        {/* Right Section - Branding */}
        <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-teal-500 to-teal-700 text-white p-10">
          <div className="text-center">
            <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="white"
                className="w-10 h-10"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 7.5h18M3 12h18m-9 4.5h9"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold">Cloud Menu</h2>
            <p className="text-white/80 mt-2">
              Digital restaurant solutions made simple
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


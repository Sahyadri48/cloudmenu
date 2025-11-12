"use client";
import { useState } from "react";
import { api } from "@/lib/api";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setSuccess("");
    try {
      const { data } = await api.post("/api/auth/restaurant/signup", {
        name: form.name,
        email: form.email,
        password: form.password,
        logoUrl: "",
        primaryColor: "#0f766e",
        secondaryColor: "#e0f2f1",
      });
      setSuccess("Account created! You can now log in.");
      console.log("Token:", data.token);
    } catch (e: any) {
      setErr(e?.response?.data?.error || "Signup failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-md overflow-hidden max-w-4xl w-full">
        {/* Left Side – Form */}
        <div className="flex-1 p-10 flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rilix</h1>
          <p className="text-teal-600 font-semibold mb-8">Cloud Menu</p>

          <h2 className="text-xl font-semibold mb-6">Sign up</h2>
          <form onSubmit={submit} className="space-y-4">
            <input
              className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-teal-500 focus:outline-none"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
            />
            <input
              className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-teal-500 focus:outline-none"
              placeholder="Email Address"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              required
            />
            <input
              className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-teal-500 focus:outline-none"
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg py-3 transition-all"
            >
              Create Account
            </button>
          </form>

          {success && <p className="text-green-600 text-sm mt-3">{success}</p>}
          {err && <p className="text-red-600 text-sm mt-3">{err}</p>}

          <p className="text-sm text-gray-600 mt-6 text-center">
            Already have an account?{" "}
            <a href="/login" className="text-teal-600 hover:underline">
              Log in
            </a>
          </p>
        </div>

        {/* Right Side – Branding */}
        <div className="flex-1 bg-gray-50 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-gray-100 p-10">
          <div className="bg-teal-100 rounded-full p-6 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-10 h-10 text-teal-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6l4 2"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Cloud Menu</h3>
          <p className="text-gray-500 text-sm text-center">
            Digital restaurant solutions
          </p>
        </div>
      </div>
    </div>
  );
}

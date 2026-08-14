import { useState } from "react";
import {
  LogIn,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      await login({
        email: email.trim(),
        password,
      });

      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);

      setError(
        err.message ||
          "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8">

      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 lg:grid-cols-2">

        {/* Left Section */}
        <section className="hidden lg:block">

          <div className="max-w-xl">

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300">

              <Sparkles
                size={16}
                className="text-indigo-400"
              />

              Intelligent Quiz Analytics

            </div>

            <h1 className="text-5xl font-bold tracking-tight text-white">
              Learn smarter.
              <br />
              Measure better.
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-400">
              Practice quizzes, understand your
              performance and discover where you
              can improve.
            </p>

          </div>

        </section>

        {/* Login Card */}
        <section className="mx-auto w-full max-w-md">

          <div className="rounded-3xl bg-white p-6 shadow-2xl sm:p-8">

            {/* Header */}
            <div className="mb-8">

              <div className="mb-4 inline-flex rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <LogIn size={22} />
              </div>

              <h2 className="text-2xl font-bold text-slate-900">
                Welcome back
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Sign in with your email and password.
              </p>

            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 whitespace-pre-line rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Email */}
              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />

              </div>

              {/* Password */}
              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />

              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={
                  loading ||
                  !email ||
                  !password
                }
                className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Signing in..."
                  : "Sign in"}
              </button>

            </form>

            {/* Register */}
            <div className="mt-6 border-t border-slate-100 pt-6 text-center">

              <p className="text-sm text-slate-500">
                Don't have an account?
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/register")
                }
                className="mt-3 inline-flex items-center gap-2 font-semibold text-indigo-600 hover:text-indigo-700"
              >
                <UserPlus size={17} />
                Create an account
              </button>

            </div>

            <p className="mt-6 text-center text-xs text-slate-400">
              SkillBytes Quiz Analytics
            </p>

          </div>

        </section>

      </div>

    </main>
  );
}
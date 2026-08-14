import { useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import {
  AuthProvider,
  useAuth,
} from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Exams from "./pages/Exams";
import Subjects from "./pages/Subjects";
import Chapters from "./pages/Chapters";
import Quiz from "./pages/Quiz";
import Result from "./pages/Result";
import Analytics from "./pages/Analytics";


function ProtectedLayout() {
  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Top Navbar */}
      <Navbar
        user={user}
        onLogout={logout}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="mx-auto flex max-w-[1600px]">

        {/* Sidebar */}
        <Sidebar
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        {/* Main Content */}
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">

          <Routes>

            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            {/* Exams */}
            <Route
              path="/exams"
              element={<Exams />}
            />

            {/* Subjects */}
            <Route
              path="/exams/:examId/subjects"
              element={<Subjects />}
            />

            {/* Chapters */}
            <Route
              path="/subjects/:subjectId/chapters"
              element={<Chapters />}
            />

            {/* Quiz */}
            <Route
              path="/quiz/:chapterId"
              element={<Quiz />}
            />

            {/* Result */}
            <Route
              path="/result/:quizId"
              element={<Result />}
            />

            {/* Analytics */}
            <Route
              path="/analytics"
              element={<Analytics />}
            />

            {/* Unknown protected route */}
            <Route
              path="*"
              element={
                <Navigate
                  to="/dashboard"
                  replace
                />
              }
            />

          </Routes>

        </main>
      </div>
    </div>
  );
}


function AppRoutes() {
  return (
    <Routes>

      {/* =========================
          LOGIN
      ========================= */}

      <Route
        path="/login"
        element={<Login />}
      />


      {/* =========================
          REGISTER
      ========================= */}

      <Route
        path="/register"
        element={<Register />}
      />


      {/* =========================
          ROOT
          / → /login
      ========================= */}

      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />


      {/* =========================
          PROTECTED APPLICATION
      ========================= */}

      <Route element={<ProtectedRoute />}>

        <Route
          path="/*"
          element={<ProtectedLayout />}
        />

      </Route>


      {/* =========================
          UNKNOWN PUBLIC ROUTE
          → LOGIN
      ========================= */}

      <Route
        path="*"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

    </Routes>
  );
}


function App() {
  return (
    <BrowserRouter>

      <AuthProvider>

        <AppRoutes />

      </AuthProvider>

    </BrowserRouter>
  );
}


export default App;
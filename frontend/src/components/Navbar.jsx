import {
  BarChart3,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";


export default function Navbar({
  user,
  onLogout,
  mobileOpen,
  setMobileOpen,
}) {

  const navigate = useNavigate();


  function handleLogout() {

    console.log(
      "LOGOUT BUTTON CLICKED"
    );


    // Clear saved user
    localStorage.removeItem(
      "skillbytes_user"
    );


    // Update AuthContext
    if (
      typeof onLogout === "function"
    ) {
      onLogout();
    }


    // Go to login
    navigate(
      "/login",
      {
        replace: true,
      }
    );
  }


  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">

      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* =========================
            LEFT
        ========================= */}

        <div className="flex items-center gap-3">

          {/* Mobile Menu */}

          <button
            type="button"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() =>
              setMobileOpen(
                !mobileOpen
              )
            }
            aria-label="Toggle menu"
          >

            {mobileOpen ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}

          </button>


          {/* Logo */}

          <div className="flex items-center gap-2">

            <div className="rounded-xl bg-indigo-600 p-2 text-white">

              <BarChart3
                size={19}
              />

            </div>


            <div>

              <h1 className="text-sm font-bold text-slate-900 sm:text-base">
                SkillBytes
              </h1>

              <p className="hidden text-[10px] text-slate-500 sm:block">
                Quiz Analytics
              </p>

            </div>

          </div>

        </div>


        {/* =========================
            RIGHT
        ========================= */}

        <div className="flex items-center gap-3">

          {/* USER */}

          <div className="hidden text-right sm:block">

            <p className="text-sm font-semibold text-slate-800">
              {user?.name ||
                "Student"}
            </p>

            <p className="text-xs text-slate-500">
              {user?.email ||
                ""}
            </p>

          </div>


          {/* LOGOUT */}

          <button
            type="button"
            onClick={
              handleLogout
            }
            className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 hover:text-red-600"
            title="Logout"
            aria-label="Logout"
          >

            <LogOut
              size={18}
            />

          </button>

        </div>

      </div>

    </header>
  );
}
import {
  BarChart3,
  BookOpen,
  Home,
  Trophy,
  X,
} from "lucide-react";

import {
  NavLink,
} from "react-router-dom";


const links = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: Home,
  },
  {
    to: "/exams",
    label: "Exams",
    icon: BookOpen,
  },
  {
    to: "/analytics",
    label: "Analytics",
    icon: BarChart3,
  },
];


export default function Sidebar({
  mobileOpen,
  setMobileOpen,
}) {

  return (
    <>

      {/* =========================
          MOBILE OVERLAY
      ========================= */}

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={() =>
            setMobileOpen(false)
          }
          aria-label="Close sidebar"
        />
      )}


      {/* =========================
          SIDEBAR
      ========================= */}

      <aside
        className={`
          fixed
          left-0
          top-16
          z-50
          h-[calc(100vh-4rem)]
          w-72
          border-r
          border-slate-200
          bg-white
          p-4
          transition-transform

          lg:static
          lg:top-0
          lg:z-auto
          lg:h-[calc(100vh-4rem)]
          lg:translate-x-0

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >

        {/* =========================
            MOBILE HEADER
        ========================= */}

        <div className="mb-4 flex items-center justify-between lg:hidden">

          <span className="font-semibold text-slate-900">
            Menu
          </span>


          <button
            type="button"
            onClick={() =>
              setMobileOpen(false)
            }
            className="rounded-lg p-2 hover:bg-slate-100"
            aria-label="Close menu"
          >

            <X size={20} />

          </button>

        </div>


        {/* =========================
            NAVIGATION
        ========================= */}

        <nav className="space-y-2">

          {links.map((link) => {

            const Icon =
              link.icon;


            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() =>
                  setMobileOpen(false)
                }
                className={({
                  isActive,
                }) =>
                  `
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                  font-medium
                  transition

                  ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }
                `
                }
              >

                <Icon size={19} />

                {link.label}

              </NavLink>
            );

          })}

        </nav>


        {/* =========================
            LEARNING CARD
        ========================= */}

        <div className="mt-8 rounded-2xl bg-slate-900 p-5 text-white">

          <Trophy size={22} />


          <p className="mt-3 font-semibold">
            Keep learning
          </p>


          <p className="mt-1 text-xs leading-5 text-slate-300">
            Practice consistently and use
            your analytics to improve.
          </p>

        </div>

      </aside>

    </>
  );
}
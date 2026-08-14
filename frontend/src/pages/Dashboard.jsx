import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Target,
  Users,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import StatCard from "../components/StatCard";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";


export default function Dashboard() {

  const { user } = useAuth();

  const navigate =
    useNavigate();


  // =========================
  // STATE
  // =========================

  const [summary, setSummary] =
    useState(null);

  const [exams, setExams] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // =========================
  // LOAD DASHBOARD
  // =========================

  useEffect(() => {

    async function load() {

      try {

        setLoading(true);
        setError("");


        const [
          summaryData,
          examsData,
        ] = await Promise.all([

          api.userSummary(
            user.id
          ),

          api.exams(),

        ]);


        console.log(
          "DASHBOARD SUMMARY:",
          summaryData
        );


        console.log(
          "DASHBOARD EXAMS:",
          examsData
        );


        setSummary(
          summaryData
        );


        // Backend directly returns array
        setExams(
          Array.isArray(examsData)
            ? examsData
            : []
        );


      } catch (err) {

        console.error(
          "DASHBOARD ERROR:",
          err
        );


        setError(
          err.message ||
            "Failed to load dashboard."
        );


      } finally {

        setLoading(false);

      }

    }


    if (user?.id) {
      load();
    }

  }, [user]);


  // =========================
  // LOADING
  // =========================

  if (loading) {

    return (
      <Loading
        text="Loading dashboard..."
      />
    );

  }


  // =========================
  // ERROR
  // =========================

  if (error) {

    return (
      <ErrorMessage
        message={error}
      />
    );

  }


  // =========================
  // OPEN EXAM
  // =========================

  function openExam(exam) {

    console.log(
      "OPENING EXAM:",
      exam
    );


    if (!exam?.id) {

      console.error(
        "Exam ID missing:",
        exam
      );

      return;
    }


    navigate(
      `/exams/${exam.id}/subjects`
    );

  }


  // =========================
  // UI
  // =========================

  return (

    <div className="space-y-8">

      {/* =========================
          HEADER
      ========================= */}

      <section>

        <p className="text-sm font-medium text-indigo-600">
          Overview
        </p>


        <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">

          Welcome,{" "}
          {user?.name || "Student"} 👋

        </h2>


        <p className="mt-2 text-slate-500">

          Here is your current learning
          performance.

        </p>

      </section>


      {/* =========================
          STATS
      ========================= */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Total Attempts"
          value={
            summary?.total_attempts ??
            0
          }
          description="Questions attempted"
          icon={Target}
        />


        <StatCard
          title="Accuracy"
          value={`${
            summary?.accuracy ??
            0
          }%`}
          description="Overall accuracy"
          icon={BarChart3}
        />


        <StatCard
          title="Quizzes"
          value={
            summary?.quizzes_attempted ??
            0
          }
          description="Quizzes attempted"
          icon={BookOpen}
        />


        <StatCard
          title="Correct"
          value={
            summary?.correct_attempts ??
            0
          }
          description="Correct answers"
          icon={Users}
        />

      </section>


      {/* =========================
          AVAILABLE EXAMS
      ========================= */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

        {/* HEADER */}

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>

            <p className="text-sm font-medium text-indigo-600">
              Practice
            </p>


            <h3 className="mt-1 text-xl font-bold text-slate-900">

              Available Exams

            </h3>


            <p className="mt-1 text-sm text-slate-500">

              Choose an exam to start
              your test.

            </p>

          </div>


          {/* COUNT */}

          <span className="w-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">

            {exams.length}{" "}
            {exams.length === 1
              ? "Exam"
              : "Exams"}{" "}
            available

          </span>

        </div>


        {/* =========================
            EXAM LIST
        ========================= */}

        {exams.length === 0 ? (

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">

            <BookOpen
              size={40}
              className="mx-auto text-slate-300"
            />


            <h4 className="mt-3 font-semibold text-slate-900">

              No exams available

            </h4>


            <p className="mt-1 text-sm text-slate-500">

              Please try again later.

            </p>

          </div>

        ) : (

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">

            {exams.map((exam) => (

              <button
                key={exam.id}
                type="button"
                onClick={() =>
                  openExam(exam)
                }
                className="group rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md"
              >

                {/* ICON + ARROW */}

                <div className="flex items-start justify-between">

                  <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">

                    <BookOpen
                      size={20}
                    />

                  </div>


                  <ArrowRight
                    size={20}
                    className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-600"
                  />

                </div>


                {/* NAME */}

                <h4 className="mt-5 text-lg font-bold text-slate-900">

                  {exam.name}

                </h4>


                {/* DESCRIPTION */}

                <p className="mt-2 text-sm leading-6 text-slate-500">

                  {exam.description ||
                    "Practice and improve your skills."}

                </p>


                {/* ACTION */}

                <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-indigo-600">

                  Start Practice

                  <ArrowRight
                    size={16}
                  />

                </div>

              </button>

            ))}

          </div>

        )}


        {/* =========================
            BROWSE ALL EXAMS
        ========================= */}

        {exams.length > 0 && (

          <div className="mt-6 border-t border-slate-100 pt-5">

            <button
              type="button"
              onClick={() =>
                navigate("/exams")
              }
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >

              Browse All Exams

              <ArrowRight
                size={17}
              />

            </button>

          </div>

        )}

      </section>

    </div>

  );
}
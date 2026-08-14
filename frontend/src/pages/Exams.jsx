import {
  ArrowRight,
  BookOpen,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

import { api } from "../services/api";


export default function Exams() {

  const navigate = useNavigate();

  const [exams, setExams] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // =========================
  // LOAD EXAMS
  // =========================

  useEffect(() => {

    async function loadExams() {

      try {

        setLoading(true);
        setError("");


        const data =
          await api.exams();


        console.log(
          "EXAMS RESPONSE:",
          data
        );


        // API response is directly an array
        setExams(
          Array.isArray(data)
            ? data
            : []
        );


      } catch (err) {

        console.error(
          "EXAMS ERROR:",
          err
        );


        setError(
          err.message ||
            "Failed to load exams."
        );


      } finally {

        setLoading(false);

      }
    }


    loadExams();

  }, []);


  // =========================
  // EXAM CLICK
  // =========================

  function handleExamClick(exam) {

    console.log(
      "CLICKED EXAM:",
      exam
    );


    if (!exam?.id) {

      setError(
        "Exam ID is missing."
      );

      return;
    }


    navigate(
      `/exams/${exam.id}/subjects`
    );
  }


  // =========================
  // LOADING
  // =========================

  if (loading) {

    return (
      <Loading
        text="Loading exams..."
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
  // UI
  // =========================

  return (

    <div>

      {/* HEADER */}

      <div>

        <p className="text-sm font-medium text-indigo-600">
          Practice
        </p>


        <h2 className="mt-1 text-3xl font-bold text-slate-900">
          Choose an Exam
        </h2>


        <p className="mt-2 text-slate-500">
          Select an exam to start your test.
        </p>

      </div>


      {/* EXAMS */}

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">

        {exams.map((exam) => (

          <button
            key={exam.id}
            type="button"
            onClick={() =>
              handleExamClick(exam)
            }
            className="group w-full cursor-pointer rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"
          >

            {/* ICON */}

            <div className="flex items-start justify-between">

              <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">

                <BookOpen
                  size={22}
                />

              </div>


              <ArrowRight
                size={20}
                className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-600"
              />

            </div>


            {/* NAME */}

            <h3 className="mt-6 text-lg font-bold text-slate-900">

              {exam.name}

            </h3>


            {/* DESCRIPTION */}

            <p className="mt-2 text-sm leading-6 text-slate-500">

              {exam.description}

            </p>


            {/* ACTION */}

            <div className="mt-6 flex items-center gap-2 font-semibold text-indigo-600">

              Start Practice

              <ArrowRight
                size={17}
              />

            </div>

          </button>

        ))}

      </div>

    </div>
  );
}
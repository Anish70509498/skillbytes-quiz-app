import {
  ArrowRight,
  FileQuestion,
  Play,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import { api } from "../services/api";


export default function Chapters() {
  const { subjectId } = useParams();

  const navigate = useNavigate();

  const [chapters, setChapters] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // =========================
  // LOAD CHAPTERS
  // =========================

  useEffect(() => {
    async function loadChapters() {
      try {
        setLoading(true);
        setError("");

        const data =
          await api.chapters(subjectId);

        console.log(
          "CHAPTERS API RESPONSE:",
          data
        );

        setChapters(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (err) {
        console.error(
          "CHAPTERS LOAD ERROR:",
          err
        );

        setError(
          err.message ||
            "Failed to load chapters."
        );

      } finally {
        setLoading(false);
      }
    }

    if (subjectId) {
      loadChapters();
    }
  }, [subjectId]);


  // =========================
  // START TEST
  // =========================

  function startTest(chapter) {
    console.log(
      "START TEST:",
      chapter
    );

    if (!chapter?.id) {
      setError(
        "Chapter ID is missing."
      );

      return;
    }

    navigate(
      `/quiz/${chapter.id}`
    );
  }


  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <Loading
        text="Loading chapters..."
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

      {/* Header */}

      <div>

        <p className="text-sm font-medium text-indigo-600">
          Practice
        </p>

        <h2 className="mt-1 text-3xl font-bold text-slate-900">
          Chapters
        </h2>

        <p className="mt-2 text-slate-500">
          Select a chapter and start your test.
        </p>

      </div>


      {/* Empty State */}

      {chapters.length === 0 ? (

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
          No chapters are available for this subject.
        </div>

      ) : (


        /* Chapters */

        <div className="mt-8 space-y-4">

          {chapters.map((chapter) => (

            <div
              key={chapter.id}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
            >

              {/* Chapter Information */}

              <div className="flex items-center gap-4">

                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                  <FileQuestion
                    size={21}
                  />
                </div>


                <div>

                  <h3 className="font-semibold text-slate-900">
                    {chapter.name}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Chapter {chapter.number}
                  </p>

                </div>

              </div>


              {/* Start Test Button */}

              <button
                type="button"
                onClick={() =>
                  startTest(chapter)
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-[0.98]"
              >

                <Play
                  size={17}
                  fill="currentColor"
                />

                Start Test

                <ArrowRight
                  size={17}
                />

              </button>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}
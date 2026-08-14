import {
  ArrowLeft,
  CheckCircle2,
  RotateCcw,
  Target,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import { api } from "../services/api";

export default function Result() {
  const { quizId } = useParams();

  const navigate = useNavigate();

  const [result, setResult] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!quizId) {
      setError("Quiz ID is missing.");
      setLoading(false);
      return;
    }

    api.result(quizId)
      .then((data) => {
        console.log(
          "Quiz result:",
          data
        );

        setResult(data);
      })
      .catch((err) => {
        console.error(
          "Result error:",
          err
        );

        setError(
          err.message ||
            "Failed to load quiz result."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [quizId]);

  if (loading) {
    return (
      <Loading
        text="Calculating your result..."
      />
    );
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
      />
    );
  }

  if (!result) {
    return (
      <ErrorMessage
        message="Result could not be loaded."
      />
    );
  }

  const totalQuestions =
    result.total_questions ?? 0;

  const answered =
    result.answered ?? 0;

  const correct =
    result.correct ?? 0;

  const wrong =
    Math.max(
      0,
      answered - correct
    );

  const score =
    result.score ?? correct;

  const accuracy =
    result.percentage ?? 0;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10">

        {/* Success Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 size={40} />
        </div>

        {/* Heading */}
        <p className="mt-6 text-sm font-medium text-indigo-600">
          Quiz Completed
        </p>

        <h2 className="mt-2 text-3xl font-bold text-slate-900">
          Great job!
        </h2>

        <p className="mt-2 text-slate-500">
          Here is your performance summary.
        </p>

        {/* Main Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">

          {/* Score */}
          <div className="rounded-2xl bg-slate-50 p-5">
            <Target
              className="mx-auto text-indigo-600"
              size={24}
            />

            <p className="mt-3 text-2xl font-bold">
              {score}/{totalQuestions}
            </p>

            <p className="text-xs text-slate-500">
              Score
            </p>
          </div>

          {/* Correct */}
          <div className="rounded-2xl bg-slate-50 p-5">
            <CheckCircle2
              className="mx-auto text-emerald-600"
              size={24}
            />

            <p className="mt-3 text-2xl font-bold">
              {correct}
            </p>

            <p className="text-xs text-slate-500">
              Correct
            </p>
          </div>

          {/* Wrong */}
          <div className="rounded-2xl bg-slate-50 p-5">
            <XCircle
              className="mx-auto text-red-500"
              size={24}
            />

            <p className="mt-3 text-2xl font-bold">
              {wrong}
            </p>

            <p className="text-xs text-slate-500">
              Wrong
            </p>
          </div>
        </div>

        {/* Accuracy */}
        <div className="mt-6 rounded-2xl bg-indigo-50 p-5">
          <p className="text-sm text-indigo-700">
            Accuracy
          </p>

          <p className="mt-1 text-4xl font-bold text-indigo-700">
            {accuracy}%
          </p>
        </div>

        {/* Answered */}
        <div className="mt-4 text-sm text-slate-500">
          Answered {answered} of{" "}
          {totalQuestions} questions
        </div>

        {/* Completed Status */}
        <div className="mt-2 text-sm font-medium">
          {result.completed ? (
            <span className="text-emerald-600">
              Quiz completed successfully
            </span>
          ) : (
            <span className="text-amber-600">
              Quiz is not completed yet
            </span>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

          <button
            type="button"
            onClick={() =>
              navigate("/dashboard")
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
            Dashboard
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/exams")
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
          >
            <RotateCcw size={18} />
            Practice Again
          </button>

        </div>
      </div>
    </div>
  );
}
import {
  ArrowRight,
  Layers3,
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

export default function Subjects() {
  const { examId } =
    useParams();

  const navigate =
    useNavigate();

  const [subjects, setSubjects] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    api.subjects(examId)
      .then(setSubjects)
      .catch((err) =>
        setError(err.message)
      )
      .finally(() =>
        setLoading(false)
      );
  }, [examId]);

  if (loading) {
    return (
      <Loading text="Loading subjects..." />
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-slate-900">
        Subjects
      </h2>

      <p className="mt-2 text-slate-500">
        Select a subject to view chapters.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() =>
              navigate(
                `/subjects/${subject.id}/chapters`
              )
            }
            className="group rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex justify-between">
              <div className="rounded-2xl bg-violet-50 p-3 text-violet-600">
                <Layers3 size={22} />
              </div>

              <ArrowRight
                size={19}
                className="text-slate-300 group-hover:text-violet-600"
              />
            </div>

            <h3 className="mt-6 font-bold text-slate-900">
              {subject.name}
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              View chapters and start a quiz.
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
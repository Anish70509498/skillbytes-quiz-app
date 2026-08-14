import {
  Activity,
  Brain,
  Gauge,
  Target,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import StatCard from "../components/StatCard";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Analytics() {
  const { user } = useAuth();

  const [summary, setSummary] =
    useState(null);

  const [velocity, setVelocity] =
    useState([]);

  const [difficulty, setDifficulty] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function load() {
      try {
        const [
          summaryData,
          velocityData,
          difficultyData,
        ] = await Promise.all([
          api.userSummary(user.id),
          api.learningVelocity(),
          api.questionDifficulty(),
        ]);

        setSummary(summaryData);
        setVelocity(velocityData);
        setDifficulty(
          difficultyData
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (user?.id) {
      load();
    }
  }, [user]);

  if (loading) {
    return (
      <Loading text="Analyzing your performance..." />
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  const userVelocity =
    velocity.find(
      (item) =>
        item.user_id === user.id
    );

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-indigo-600">
          Performance Intelligence
        </p>

        <h2 className="mt-1 text-3xl font-bold text-slate-900">
          Your Analytics
        </h2>

        <p className="mt-2 text-slate-500">
          Understand your accuracy, speed and learning performance.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Accuracy"
          value={`${summary?.accuracy ?? 0}%`}
          description="Overall performance"
          icon={Target}
        />

        <StatCard
          title="Learning Velocity"
          value={
            userVelocity
              ?.learning_velocity_index ??
            0
          }
          description="Learning velocity index"
          icon={Activity}
        />

        <StatCard
          title="Speed Score"
          value={
            userVelocity
              ?.speed_score ?? 0
          }
          description="Response speed"
          icon={Gauge}
        />

        <StatCard
          title="Difficulty Items"
          value={difficulty.length}
          description="Analyzed questions"
          icon={Brain}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">
            Learning Velocity
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Ranked learner performance.
          </p>

          <div className="mt-6 space-y-3">
            {velocity
              .slice(0, 8)
              .map((item) => (
                <div
                  key={item.user_id}
                  className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
                >
                  <div>
                    <p className="font-medium text-slate-800">
                      {item.user_id}
                    </p>

                    <p className="text-xs text-slate-500">
                      Rank #{item.rank}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-indigo-600">
                      {
                        item.learning_velocity_index
                      }
                    </p>

                    <p className="text-xs text-slate-500">
                      velocity
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">
            Question Difficulty
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Hardest questions based on performance.
          </p>

          <div className="mt-6 space-y-3">
            {difficulty
              .slice(0, 8)
              .map((item) => (
                <div
                  key={item.question_id}
                  className="rounded-xl bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="line-clamp-2 text-sm font-medium text-slate-800">
                      {item.question_text}
                    </p>

                    <span className="shrink-0 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600">
                      {
                        item.difficulty_score
                      }
                    </span>
                  </div>

                  <div className="mt-3 flex justify-between text-xs text-slate-500">
                    <span>
                      Accuracy:{" "}
                      {item.accuracy}%
                    </span>

                    <span>
                      Rank: #
                      {
                        item.difficulty_rank
                      }
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}
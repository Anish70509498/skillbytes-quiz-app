import {
  CheckCircle2,
  Circle,
  Clock3,
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
import { useAuth } from "../context/AuthContext";


export default function Quiz() {
  const { chapterId } = useParams();

  const navigate = useNavigate();

  const { user } = useAuth();


  // =========================
  // STATE
  // =========================

  const [quiz, setQuiz] = useState(null);

  const [current, setCurrent] = useState(0);

  const [selected, setSelected] = useState("");

  const [questionShownAt, setQuestionShownAt] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");


  // =========================
  // CREATE QUIZ
  // =========================

  useEffect(() => {
    if (!chapterId) {
      setError("Chapter ID is missing.");
      setLoading(false);
      return;
    }

    if (!user?.id) {
      setError("User is not logged in.");
      setLoading(false);
      return;
    }

    let cancelled = false;


    async function loadQuiz() {
      try {
        setLoading(true);
        setError("");

        console.log(
          "Creating quiz..."
        );

        console.log(
          "Chapter ID:",
          chapterId
        );

        console.log(
          "User ID:",
          user.id
        );


        const data =
          await api.createQuiz(
            chapterId,
            user.id
          );


        console.log(
          "QUIZ API RESPONSE:",
          data
        );


        if (cancelled) {
          return;
        }


        setQuiz(data);

        setCurrent(0);

        setSelected("");

        setQuestionShownAt(
          new Date()
        );

      } catch (err) {
        if (!cancelled) {
          console.error(
            "CREATE QUIZ ERROR:",
            err
          );

          setError(
            err.message ||
              "Failed to create quiz."
          );
        }

      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }


    loadQuiz();


    return () => {
      cancelled = true;
    };

  }, [chapterId, user?.id]);


  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <Loading
        text="Preparing your test..."
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
  // QUIZ VALIDATION
  // =========================

  if (!quiz) {
    return (
      <ErrorMessage
        message="Quiz could not be created."
      />
    );
  }


  const questions =
    quiz.questions || [];


  if (!questions.length) {
    return (
      <ErrorMessage
        message="No questions are available for this chapter."
      />
    );
  }


  const question =
    questions[current];


  if (!question) {
    return (
      <ErrorMessage
        message="Question could not be loaded."
      />
    );
  }


  // =========================
  // SUBMIT ANSWER
  // =========================

  async function handleNext() {

    if (
      !selected ||
      submitting
    ) {
      return;
    }


    if (!questionShownAt) {
      setError(
        "Question start time is missing."
      );

      return;
    }


    const quizId =
      quiz.quiz_id ||
      quiz.id;


    const questionId =
      question.id ||
      question.question_id;


    if (!quizId) {
      setError(
        "Quiz ID is missing."
      );

      return;
    }


    if (!questionId) {
      setError(
        "Question ID is missing."
      );

      return;
    }


    setSubmitting(true);

    setError("");


    try {

      const answerSubmittedAt =
        new Date();


      const payload = {
        quiz_id:
          quizId,

        question_id:
          questionId,

        selected_option:
          selected,

        question_shown_time:
          questionShownAt.toISOString(),

        answer_submitted_time:
          answerSubmittedAt.toISOString(),
      };


      console.log(
        "SUBMITTING ANSWER:",
        payload
      );


      const response =
        await api.submitAnswer(
          payload
        );


      console.log(
        "ANSWER RESPONSE:",
        response
      );


      const nextIndex =
        current + 1;


      // =========================
      // NEXT QUESTION
      // =========================

      if (
        nextIndex <
        questions.length
      ) {

        setCurrent(
          nextIndex
        );

        setSelected("");

        setQuestionShownAt(
          new Date()
        );

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        return;
      }


      // =========================
      // FINISH TEST
      // =========================

      console.log(
        "QUIZ COMPLETED:",
        quizId
      );


      navigate(
        `/result/${quizId}`
      );

    } catch (err) {

      console.error(
        "SUBMIT ANSWER ERROR:",
        err
      );

      setError(
        err.message ||
          "Failed to submit answer."
      );

    } finally {

      setSubmitting(false);

    }
  }


  // =========================
  // UI
  // =========================

  return (
    <div className="mx-auto max-w-4xl">

      {/* HEADER */}

      <div className="mb-6 flex items-center justify-between">

        <div>

          <p className="text-sm font-medium text-indigo-600">
            Test
          </p>


          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            Question{" "}
            {current + 1}{" "}
            of{" "}
            {questions.length}
          </h2>

        </div>


        <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">

          <Clock3
            size={17}
          />

          Test in progress

        </div>

      </div>


      {/* PROGRESS BAR */}

      <div className="h-2 overflow-hidden rounded-full bg-slate-200">

        <div
          className="h-full rounded-full bg-indigo-600 transition-all duration-300"
          style={{
            width: `${
              ((current + 1) /
                questions.length) *
              100
            }%`,
          }}
        />

      </div>


      {/* QUESTION CARD */}

      <div
        key={
          question.id ||
          current
        }
        className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      >

        {/* QUESTION NUMBER */}

        <div className="mb-4 text-sm font-semibold text-indigo-600">

          Question{" "}
          {current + 1}

        </div>


        {/* QUESTION */}

        <h3 className="text-xl font-bold leading-8 text-slate-900 sm:text-2xl">

          {question.text ||
            question.question}

        </h3>


        {/* OPTIONS */}

        <div className="mt-8 space-y-3">

          {Object.entries(
            question.options || {}
          ).map(
            ([key, value]) => {

              const active =
                selected === key;


              return (
                <button
                  key={key}
                  type="button"
                  disabled={
                    submitting
                  }
                  onClick={() =>
                    setSelected(
                      key
                    )
                  }
                  className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                    active
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-200 hover:border-indigo-200 hover:bg-slate-50"
                  } ${
                    submitting
                      ? "cursor-not-allowed opacity-60"
                      : ""
                  }`}
                >

                  {active ? (
                    <CheckCircle2
                      className="shrink-0 text-indigo-600"
                    />
                  ) : (
                    <Circle
                      className="shrink-0 text-slate-300"
                    />
                  )}


                  <span className="font-medium text-slate-800">

                    <span className="mr-2 font-bold">
                      {key}.
                    </span>

                    {value}

                  </span>

                </button>
              );
            }
          )}

        </div>


        {/* ERROR */}

        {error && (
          <div className="mt-5 whitespace-pre-line rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">

            {error}

          </div>
        )}


        {/* FOOTER */}

        <div className="mt-8 flex items-center justify-between">

          <div className="text-sm text-slate-500">

            {selected
              ? `Selected: ${selected}`
              : "Select an answer"}

          </div>


          <button
            type="button"
            disabled={
              !selected ||
              submitting
            }
            onClick={
              handleNext
            }
            className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >

            {submitting
              ? "Submitting..."
              : current ===
                  questions.length - 1
                ? "Finish Test"
                : "Next Question"}

          </button>

        </div>

      </div>

    </div>
  );
}
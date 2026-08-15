const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api";


async function request(endpoint, options = {}) {
  const response = await fetch(
    `${API_URL}/api${endpoint}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    }
  );


  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }


  if (!response.ok) {
    console.error(
      "API ERROR STATUS:",
      response.status
    );

    console.error(
      "API ERROR BODY:",
      data
    );


    let message =
      `Request failed with status ${response.status}`;


    if (Array.isArray(data?.detail)) {
      message = data.detail
        .map((item) => {
          const location =
            Array.isArray(item.loc)
              ? item.loc.join(" → ")
              : "";

          return `${location}: ${
            item.msg || "Validation error"
          }`;
        })
        .join("\n");

    } else if (
      typeof data?.detail === "string"
    ) {
      message = data.detail;

    } else if (
      typeof data?.message === "string"
    ) {
      message = data.message;
    }


    throw new Error(message);
  }


  return data;
}


export const api = {

  // =========================
  // AUTH
  // =========================

  users: () =>
    request("/auth/users"),


  register: (data) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),


  login: (data) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),


  // =========================
  // EXAMS
  // =========================

  exams: () =>
    request("/exams"),


  // =========================
  // SUBJECTS
  // =========================

  subjects: (examId) =>
    request(
      `/exams/${examId}/subjects`
    ),


  // =========================
  // CHAPTERS
  // =========================

  chapters: (subjectId) =>
    request(
      `/subjects/${subjectId}/chapters`
    ),


  // =========================
  // CREATE QUIZ
  // =========================

  createQuiz: (
    chapterId,
    userId
  ) =>
    request(
      `/chapters/${chapterId}/quiz?user_id=${encodeURIComponent(
        userId
      )}`,
      {
        method: "POST",
      }
    ),


  // =========================
  // SUBMIT ANSWER
  // =========================

  submitAnswer: (data) =>
    request("/quiz/submit", {
      method: "POST",
      body: JSON.stringify(data),
    }),


  // =========================
  // RESULT
  // =========================

  result: (quizId) =>
    request(
      `/quiz/${quizId}/result`
    ),


  // =========================
  // ANALYTICS
  // =========================

  learningVelocity: () =>
    request(
      "/analytics/learning-velocity"
    ),


  fatigueAnalysis: (
    userId,
    quizId
  ) =>
    request(
      `/analytics/fatigue/${userId}/${quizId}`
    ),


  questionDifficulty: () =>
    request(
      "/analytics/question-difficulty"
    ),


  userSummary: (userId) =>
    request(
      `/analytics/user-summary/${userId}`
    ),
};
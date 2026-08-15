# SkillBytes — Turning Quiz Attempts into Learning Insights

> A full-stack quiz analytics platform that goes beyond showing marks — it analyzes how a student answers, how fast they respond, and how their performance changes across a quiz.

##  What is SkillBytes?

SkillBytes lets students:

- Explore Exams → Subjects → Chapters
- Attempt quizzes
- Submit answers
- View results
- Analyze their learning performance

The core idea is simple:

**Don't just measure whether an answer is correct — understand the learning behavior behind it.**

---

## 📊 Analytics at the Core

Every submitted question creates a `question_attempts` event containing:

```text
user
quiz
question
exam
subject
chapter
response time
selected answer
correctness

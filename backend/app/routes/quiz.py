from fastapi import APIRouter, HTTPException

from ..db import db
from ..schemas import (
    SubmitAnswerRequest,
    SubmitAnswerResponse,
)
from ..utils import utc_now


router = APIRouter(
    tags=["Quiz"],
)


@router.post("/chapters/{chapter_id}/quiz")
async def create_quiz(
    chapter_id: str,
    user_id: str,
):
    chapter = await db.chapters.find_one(
        {"id": chapter_id},
        {"_id": 0},
    )

    if not chapter:
        raise HTTPException(
            status_code=404,
            detail="Chapter not found",
        )

    user = await db.users.find_one({
        "id": user_id,
    })

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    questions = await (
        db.questions
        .find(
            {"chapter_id": chapter_id},
            {
                "_id": 0,
                "correct_option": 0,
            },
        )
        .sort("number", 1)
        .limit(15)
        .to_list(length=15)
    )

    if len(questions) < 15:
        raise HTTPException(
            status_code=400,
            detail="Chapter has fewer than 15 questions",
        )

    quiz_id = (
        f"quiz_{chapter_id}_"
        f"{user_id}_"
        f"{int(utc_now().timestamp() * 1000)}"
    )

    quiz_document = {
        "id": quiz_id,
        "user_id": user_id,
        "exam_id": chapter["exam_id"],
        "subject_id": chapter["subject_id"],
        "chapter_id": chapter_id,
        "question_ids": [
            question["id"]
            for question in questions
        ],
        "started_at": utc_now(),
        "completed": False,
    }

    await db.quizzes.insert_one(
        quiz_document
    )

    return {
        "quiz_id": quiz_id,
        "chapter": chapter,
        "questions": questions,
        "total_questions": len(questions),
    }


@router.post(
    "/quiz/submit",
    response_model=SubmitAnswerResponse,
)
async def submit_answer(
    payload: SubmitAnswerRequest,
):
    quiz = await db.quizzes.find_one({
        "id": payload.quiz_id,
    })

    if not quiz:
        raise HTTPException(
            status_code=404,
            detail="Quiz session not found",
        )

    if payload.question_id not in quiz["question_ids"]:
        raise HTTPException(
            status_code=400,
            detail="Question does not belong to this quiz",
        )

    existing = await db.attempts.find_one({
        "quiz_id": payload.quiz_id,
        "question_id": payload.question_id,
    })

    if existing:
        raise HTTPException(
            status_code=409,
            detail="This question was already submitted",
        )

    question = await db.questions.find_one({
        "id": payload.question_id,
    })

    if not question:
        raise HTTPException(
            status_code=404,
            detail="Question not found",
        )

    duration_ms = max(
        0,
        int(
            (
                payload.answer_submitted_time
                - payload.question_shown_time
            ).total_seconds()
            * 1000
        ),
    )

    selected_option = (
        payload.selected_option
        .strip()
        .upper()
    )

    correct = (
        selected_option
        == question["correct_option"]
    )

    question_position = (
        quiz["question_ids"]
        .index(payload.question_id)
        + 1
    )

    event = {
        "user_id": quiz["user_id"],
        "quiz_id": payload.quiz_id,
        "question_id": payload.question_id,
        "exam_id": quiz["exam_id"],
        "subject_id": quiz["subject_id"],
        "chapter_id": quiz["chapter_id"],
        "question_shown_time": payload.question_shown_time,
        "answer_submitted_time": payload.answer_submitted_time,
        "response_duration_ms": duration_ms,
        "selected_option": selected_option,
        "correct": correct,
        "question_position": question_position,
    }

    await db.attempts.insert_one(event)

    attempt_count = await db.attempts.count_documents({
        "quiz_id": payload.quiz_id,
    })

    if attempt_count == len(
        quiz["question_ids"]
    ):
        await db.quizzes.update_one(
            {"id": payload.quiz_id},
            {
                "$set": {
                    "completed": True,
                    "completed_at": utc_now(),
                }
            },
        )

    return {
        "question_id": payload.question_id,
        "correct": correct,
        "response_duration_ms": duration_ms,
    }


@router.get("/quiz/{quiz_id}/result")
async def quiz_result(quiz_id: str):
    quiz = await db.quizzes.find_one(
        {"id": quiz_id},
        {"_id": 0},
    )

    if not quiz:
        raise HTTPException(
            status_code=404,
            detail="Quiz not found",
        )

    attempts = await (
        db.attempts
        .find(
            {"quiz_id": quiz_id},
            {"_id": 0},
        )
        .sort("question_position", 1)
        .to_list(length=100)
    )

    total = len(quiz["question_ids"])

    correct = sum(
        1
        for attempt in attempts
        if attempt["correct"]
    )

    return {
        "quiz_id": quiz_id,
        "user_id": quiz["user_id"],
        "total_questions": total,
        "answered": len(attempts),
        "correct": correct,
        "score": correct,
        "percentage": round(
            (correct / total) * 100,
            2,
        ) if total else 0,
        "completed": quiz.get(
            "completed",
            False,
        ),
    }
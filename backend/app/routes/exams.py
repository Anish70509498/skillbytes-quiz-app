from fastapi import APIRouter, HTTPException

from ..db import db


router = APIRouter(
    tags=["Exam / Subject / Chapter"],
)


@router.get("/exams")
async def get_exams():
    exams = await (
        db.exams
        .find({}, {"_id": 0})
        .sort("name", 1)
        .to_list(length=100)
    )

    return exams


@router.get("/exams/{exam_id}/subjects")
async def get_exam_subjects(exam_id: str):
    exam = await db.exams.find_one({
        "id": exam_id,
    })

    if not exam:
        raise HTTPException(
            status_code=404,
            detail="Exam not found",
        )

    subjects = await (
        db.subjects
        .find(
            {"exam_id": exam_id},
            {"_id": 0},
        )
        .sort("name", 1)
        .to_list(length=100)
    )

    return subjects


@router.get("/subjects/{subject_id}/chapters")
async def get_subject_chapters(subject_id: str):
    subject = await db.subjects.find_one({
        "id": subject_id,
    })

    if not subject:
        raise HTTPException(
            status_code=404,
            detail="Subject not found",
        )

    chapters = await (
        db.chapters
        .find(
            {"subject_id": subject_id},
            {"_id": 0},
        )
        .sort("number", 1)
        .to_list(length=100)
    )

    return chapters
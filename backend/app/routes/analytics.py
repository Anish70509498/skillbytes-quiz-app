from fastapi import APIRouter, HTTPException

from ..db import db


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


# ---------------------------------------------------------
# Helper
# ---------------------------------------------------------

async def aggregate_to_list(collection, pipeline, length=1000):
    """
    Run an aggregation using PyMongo Async and
    return the resulting documents as a list.
    """
    cursor = await collection.aggregate(pipeline)
    return await cursor.to_list(length=length)


# ---------------------------------------------------------
# 1. LEARNING VELOCITY INDEX
# ---------------------------------------------------------

@router.get("/learning-velocity")
async def learning_velocity():

    pipeline = [
        {
            "$group": {
                "_id": "$user_id",

                "total_attempts": {
                    "$sum": 1
                },

                "correct_attempts": {
                    "$sum": {
                        "$cond": [
                            "$correct",
                            1,
                            0,
                        ]
                    }
                },

                "avg_response_ms": {
                    "$avg": "$response_duration_ms"
                },

                "avg_squared_response": {
                    "$avg": {
                        "$multiply": [
                            "$response_duration_ms",
                            "$response_duration_ms",
                        ]
                    }
                },
            }
        },

        {
            "$match": {
                "total_attempts": {
                    "$gt": 0
                }
            }
        },
    ]

    rows = await aggregate_to_list(
        db.attempts,
        pipeline,
        1000,
    )

    if not rows:
        return []

    response_times = [
        row["avg_response_ms"]
        for row in rows
        if row.get("avg_response_ms") is not None
    ]

    if not response_times:
        return []

    min_time = min(response_times)
    max_time = max(response_times)

    results = []

    for row in rows:

        total = row["total_attempts"]
        correct = row["correct_attempts"]

        accuracy = (
            correct / total
        ) * 100

        avg_time = row["avg_response_ms"]

        # Speed score
        if max_time == min_time:
            speed_score = 100
        else:
            speed_score = (
                (max_time - avg_time)
                / (max_time - min_time)
            ) * 100

        # Consistency
        variance = max(
            0,
            row["avg_squared_response"]
            - (avg_time * avg_time),
        )

        std_dev = variance ** 0.5

        if avg_time == 0:
            consistency = 100
        else:
            coefficient = (
                std_dev / avg_time
            )

            consistency = max(
                0,
                min(
                    100,
                    100 * (
                        1 - coefficient
                    ),
                ),
            )

        # Learning Velocity Index
        lvi = (
            accuracy * 0.50
            + speed_score * 0.25
            + consistency * 0.25
        )

        results.append(
            {
                "user_id": row["_id"],

                "total_attempts": total,

                "accuracy": round(
                    accuracy,
                    2,
                ),

                "average_response_time_ms": round(
                    avg_time,
                    2,
                ),

                "consistency_score": round(
                    consistency,
                    2,
                ),

                "speed_score": round(
                    speed_score,
                    2,
                ),

                "learning_velocity_index": round(
                    lvi,
                    2,
                ),
            }
        )

    results.sort(
        key=lambda item: item[
            "learning_velocity_index"
        ],
        reverse=True,
    )

    for rank, result in enumerate(
        results,
        start=1,
    ):
        result["rank"] = rank

    return results


# ---------------------------------------------------------
# 2. FATIGUE ANALYSIS
# ---------------------------------------------------------

@router.get(
    "/fatigue/{user_id}/{quiz_id}"
)
async def fatigue_analysis(
    user_id: str,
    quiz_id: str,
):

    quiz = await db.quizzes.find_one(
        {
            "id": quiz_id,
            "user_id": user_id,
        },
        {
            "_id": 0,
        },
    )

    if not quiz:
        raise HTTPException(
            status_code=404,
            detail="Quiz not found for this user",
        )

    pipeline = [
        {
            "$match": {
                "user_id": user_id,
                "quiz_id": quiz_id,
            }
        },

        {
            "$set": {
                "range_group": {
                    "$switch": {
                        "branches": [

                            {
                                "case": {
                                    "$lte": [
                                        "$question_position",
                                        5,
                                    ]
                                },
                                "then": "1-5",
                            },

                            {
                                "case": {
                                    "$lte": [
                                        "$question_position",
                                        10,
                                    ]
                                },
                                "then": "6-10",
                            },

                            {
                                "case": {
                                    "$lte": [
                                        "$question_position",
                                        15,
                                    ]
                                },
                                "then": "11-15",
                            },

                        ],

                        "default": "other",
                    }
                }
            }
        },

        {
            "$match": {
                "range_group": {
                    "$ne": "other"
                }
            }
        },

        {
            "$group": {
                "_id": "$range_group",

                "total_questions": {
                    "$sum": 1
                },

                "correct_answers": {
                    "$sum": {
                        "$cond": [
                            "$correct",
                            1,
                            0,
                        ]
                    }
                },

                "average_response_time_ms": {
                    "$avg": "$response_duration_ms"
                },
            }
        },
    ]

    rows = await aggregate_to_list(
        db.attempts,
        pipeline,
        10,
    )

    order = {
        "1-5": 1,
        "6-10": 2,
        "11-15": 3,
    }

    rows.sort(
        key=lambda row: order.get(
            row["_id"],
            99,
        )
    )

    result = []

    for row in rows:

        total = row["total_questions"]
        correct = row["correct_answers"]

        accuracy = (
            correct / total
        ) * 100 if total else 0

        average_time = (
            row["average_response_time_ms"]
            if row["average_response_time_ms"] is not None
            else 0
        )

        result.append(
            {
                "question_range": row["_id"],

                "total_questions": total,

                "accuracy": round(
                    accuracy,
                    2,
                ),

                "average_response_time_ms": round(
                    average_time,
                    2,
                ),
            }
        )

    fatigue_signal = {
        "accuracy_declining": False,
        "response_time_increasing": False,
        "possible_fatigue": False,
    }

    if len(result) >= 2:

        first = result[0]
        last = result[-1]

        fatigue_signal[
            "accuracy_declining"
        ] = (
            last["accuracy"]
            < first["accuracy"]
        )

        fatigue_signal[
            "response_time_increasing"
        ] = (
            last[
                "average_response_time_ms"
            ]
            > first[
                "average_response_time_ms"
            ]
        )

        fatigue_signal[
            "possible_fatigue"
        ] = (
            fatigue_signal[
                "accuracy_declining"
            ]
            and fatigue_signal[
                "response_time_increasing"
            ]
        )

    return {
        "user_id": user_id,
        "quiz_id": quiz_id,
        "ranges": result,
        "fatigue_signal": fatigue_signal,
    }


# ---------------------------------------------------------
# 3. QUESTION DIFFICULTY INDEX
# ---------------------------------------------------------

@router.get(
    "/question-difficulty"
)
async def question_difficulty():

    pipeline = [
        {
            "$group": {
                "_id": "$question_id",

                "total_attempts": {
                    "$sum": 1
                },

                "correct_attempts": {
                    "$sum": {
                        "$cond": [
                            "$correct",
                            1,
                            0,
                        ]
                    }
                },

                "average_response_time_ms": {
                    "$avg": "$response_duration_ms"
                },
            }
        },

        {
            "$lookup": {
                "from": "questions",

                "localField": "_id",

                "foreignField": "id",

                "as": "question",
            }
        },

        {
            "$unwind": "$question"
        },

        {
            "$project": {
                "_id": 0,

                "question_id": "$_id",

                "question_text": "$question.text",

                "total_attempts": 1,

                "correct_attempts": 1,

                "average_response_time_ms": 1,
            }
        },
    ]

    rows = await aggregate_to_list(
        db.attempts,
        pipeline,
        1000,
    )

    if not rows:
        return []

    response_times = [
        row["average_response_time_ms"]
        for row in rows
        if row.get(
            "average_response_time_ms"
        ) is not None
    ]

    if not response_times:
        return []

    min_time = min(response_times)
    max_time = max(response_times)

    results = []

    for row in rows:

        total = row["total_attempts"]
        correct = row["correct_attempts"]

        accuracy = (
            correct / total
        ) * 100 if total else 0

        inverse_accuracy = (
            100 - accuracy
        )

        avg_time = (
            row["average_response_time_ms"]
        )

        if max_time == min_time:
            time_score = 0
        else:
            time_score = (
                (avg_time - min_time)
                / (max_time - min_time)
            ) * 100

        difficulty = (
            inverse_accuracy * 0.60
            + time_score * 0.40
        )

        results.append(
            {
                "question_id": row[
                    "question_id"
                ],

                "question_text": row[
                    "question_text"
                ],

                "total_attempts": total,

                "accuracy": round(
                    accuracy,
                    2,
                ),

                "average_response_time_ms": round(
                    avg_time,
                    2,
                ),

                "difficulty_score": round(
                    difficulty,
                    2,
                ),
            }
        )

    # Hardest first
    results.sort(
        key=lambda item: item[
            "difficulty_score"
        ],
        reverse=True,
    )

    for rank, result in enumerate(
        results,
        start=1,
    ):
        result["difficulty_rank"] = rank

    return results


# ---------------------------------------------------------
# 4. USER SUMMARY
# ---------------------------------------------------------

@router.get(
    "/user-summary/{user_id}"
)
async def user_summary(
    user_id: str,
):

    user = await db.users.find_one(
        {
            "id": user_id,
        },
        {
            "_id": 0,
        },
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    pipeline = [
        {
            "$match": {
                "user_id": user_id,
            }
        },

        {
            "$group": {
                "_id": "$user_id",

                "total_attempts": {
                    "$sum": 1
                },

                "correct_attempts": {
                    "$sum": {
                        "$cond": [
                            "$correct",
                            1,
                            0,
                        ]
                    }
                },

                "average_response_time_ms": {
                    "$avg": "$response_duration_ms"
                },

                "quizzes": {
                    "$addToSet": "$quiz_id"
                },
            }
        },
    ]

    rows = await aggregate_to_list(
        db.attempts,
        pipeline,
        1,
    )

    if not rows:
        return {
            "user": user,
            "total_attempts": 0,
            "correct_attempts": 0,
            "accuracy": 0,
            "average_response_time_ms": 0,
            "quizzes_attempted": 0,
        }

    row = rows[0]

    total = row["total_attempts"]
    correct = row["correct_attempts"]

    accuracy = (
        correct / total
    ) * 100 if total else 0

    average_time = (
        row["average_response_time_ms"]
        if row["average_response_time_ms"] is not None
        else 0
    )

    return {
        "user": user,

        "total_attempts": total,

        "correct_attempts": correct,

        "accuracy": round(
            accuracy,
            2,
        ),

        "average_response_time_ms": round(
            average_time,
            2,
        ),

        "quizzes_attempted": len(
            row["quizzes"]
        ),
    }
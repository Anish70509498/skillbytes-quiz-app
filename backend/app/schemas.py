from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr


class LoginResponse(BaseModel):
    user: UserOut


class RegisterResponse(BaseModel):
    user: UserOut


class SubmitAnswerRequest(BaseModel):
    quiz_id: str
    question_id: str

    selected_option: str = Field(
        min_length=1,
        max_length=1,
    )

    question_shown_time: datetime
    answer_submitted_time: datetime


class SubmitAnswerResponse(BaseModel):
    question_id: str
    correct: bool
    response_duration_ms: int
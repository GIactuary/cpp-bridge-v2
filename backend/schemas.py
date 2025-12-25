from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any
from datetime import datetime


class CalculatorData(BaseModel):
    gender: str
    current_age: int = Field(ge=30, le=69)
    cpp_estimate_at_65: float
    rrsp_savings: float
    health_status: str
    bridge_cost: float
    is_affordable: bool
    win_probability: float = Field(ge=0, le=1)
    breakeven_age: int


class LeadSubmission(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    partner_id: Optional[str] = None
    calculator_data: CalculatorData
    quiz_answers: Dict[str, Any]


class CategoryScore(BaseModel):
    points: int
    max: int
    rating: str  # "low", "medium", "high"


class QuizBreakdown(BaseModel):
    points: int
    income: CategoryScore
    assets: CategoryScore
    tax: CategoryScore
    psychology: CategoryScore


class CalculatorBreakdown(BaseModel):
    points: int
    affordable_points: int
    probability_points: int


class ScoreBreakdown(BaseModel):
    calculator: CalculatorBreakdown
    quiz: QuizBreakdown


class Score(BaseModel):
    total: int
    category: str  # "red", "amber", "green"
    label: str
    breakdown: ScoreBreakdown


class Insights(BaseModel):
    verdict: str
    weakest_category: str
    recommendations: list[str]


class PartnerInfo(BaseModel):
    id: str
    cta_text: str
    cta_url: str


class LeadResponse(BaseModel):
    success: bool
    uuid: str
    score: Score
    insights: Insights
    partner: PartnerInfo

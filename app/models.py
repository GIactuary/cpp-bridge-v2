from enum import Enum
from pydantic import BaseModel, Field


class HealthStatus(str, Enum):
    AVERAGE = "average"
    EXCELLENT = "excellent"  # Proxy: Age - 3
    POOR = "poor"            # Proxy: Age + 5


class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"


class CalculationRequest(BaseModel):
    current_age: int = Field(..., ge=30, le=75, description="Current Age")
    cpp_estimate_at_65: float = Field(..., gt=0, description="Monthly Estimate")
    rrsp_savings: float = Field(..., ge=0, description="Liquid Assets")
    gender: Gender = Gender.MALE
    health_status: HealthStatus = HealthStatus.AVERAGE

    # Assumptions
    real_rate_of_return: float = Field(0.01, ge=0.0, le=0.15)
    wage_growth: float = Field(0.011, ge=0.0, le=0.10)
    discount_pre_retirement_mortality: bool = True  # If False, assumes survival to 65
    inflation_rate: float = Field(0.021, ge=0.0, le=0.10)


class CalculationResponse(BaseModel):
    bridge_cost_lump_sum: float
    target_monthly_income_at_70: float
    is_affordable: bool
    shortfall_amount: float
    surplus_amount: float
    bonus_estate_value_at_85: float

    # Actuarial Metrics
    breakeven_age_economic: int
    probability_of_winning: float
    expected_lifetime_gain: float
    life_expectancy: float
    epv_early: float
    epv_delayed: float

    # UX
    recommendation: str
    recommendation_reasoning: str

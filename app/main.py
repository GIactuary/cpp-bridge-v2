from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models import CalculationRequest, CalculationResponse
from app.logic import calculate_bridge_scenario

app = FastAPI(title="Actuarial CPP Bridge API")

# Allow embedding on any site
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/v1/calculate", response_model=CalculationResponse)
def calculate(request: CalculationRequest):
    return calculate_bridge_scenario(request)


@app.get("/health")
def health_check():
    return {"status": "ok"}

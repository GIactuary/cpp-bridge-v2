from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from app.models import CalculationRequest, CalculationResponse
from app.logic import calculate_bridge_scenario
import os

app = FastAPI(title="Actuarial CPP Bridge API")

# Allow embedding on any site
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. API Routes
@app.post("/v1/calculate", response_model=CalculationResponse)
def calculate(request: CalculationRequest):
    return calculate_bridge_scenario(request)

@app.get("/health")
def health_check():
    return {"status": "ok"}

# 2. Static Files (Frontend)
# Ensure widget directory exists before mounting to avoid errors if missing
if os.path.exists("widget"):
    app.mount("/widget", StaticFiles(directory="widget"), name="widget")

    @app.get("/")
    async def read_index():
        return FileResponse('widget/index.html')

import os
import csv
import io
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv

from schemas import LeadSubmission, LeadResponse
from database import save_lead, mark_email_sent, get_all_leads, get_leads_by_partner
from scoring import calculate_score, generate_insights, get_partner_config
from email_service import send_report_email

load_dotenv()

app = FastAPI(
    title="Retirement Scorecard API",
    description="Backend API for CPP Bridge Lead Generation Funnel",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        # Add your production URLs here:
        # "https://yourusername.github.io",
        # "https://your-netlify-site.netlify.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "version": "1.0.0"}


@app.post("/v1/leads", response_model=LeadResponse)
async def submit_lead(lead: LeadSubmission):
    """
    Submit a lead with calculator and quiz data.
    Returns the calculated score and personalized insights.
    """
    try:
        # Calculate score
        score = calculate_score(
            lead.calculator_data.model_dump(),
            lead.quiz_answers
        )

        # Generate insights
        insights = generate_insights(score, lead.calculator_data.model_dump())

        # Get partner config
        partner = get_partner_config(lead.partner_id)

        # Save to database
        lead_uuid = save_lead(lead.model_dump(), score)

        # Send email (async in background ideally, but sync for MVP)
        try:
            send_report_email(
                name=lead.name,
                email=lead.email,
                score=score,
                insights=insights,
                partner=partner
            )
            mark_email_sent(lead_uuid)
        except Exception as e:
            print(f"Email send failed: {e}")
            # Don't fail the request if email fails

        return LeadResponse(
            success=True,
            uuid=lead_uuid,
            score=score,
            insights=insights,
            partner=partner
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/admin/leads")
async def export_leads(
    key: str = Query(..., description="Admin secret key"),
    partner: str = Query(None, description="Filter by partner ID"),
    format: str = Query("json", description="Export format: json or csv")
):
    """
    Export leads for admin purposes.
    Requires secret key for authentication.
    """
    admin_key = os.getenv("ADMIN_SECRET_KEY", "change-me-in-production")

    if key != admin_key:
        raise HTTPException(status_code=403, detail="Invalid admin key")

    if partner:
        leads = get_leads_by_partner(partner)
    else:
        leads = get_all_leads()

    if format == "csv":
        return export_csv(leads)

    return {"leads": leads, "count": len(leads)}


def export_csv(leads: list) -> StreamingResponse:
    """Generate CSV file from leads."""
    if not leads:
        return StreamingResponse(
            iter(["No leads found"]),
            media_type="text/csv"
        )

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=leads[0].keys())
    writer.writeheader()
    writer.writerows(leads)

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=leads.csv"}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

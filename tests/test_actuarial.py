from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_cia_paper_multiplier():
    """
    Validates against CIA Paper (2020) Benchmark:
    At 1.0% Real Return & 1.1% Wage Growth (proxy via config),
    Bridge Cost should be approx 7.35x Annual CPP.
    """
    # Note: Logic uses 1.0% wage growth from config.py.
    # We pass 1.0% real return here.

    resp = client.post("/v1/calculate", json={
        "current_age": 65,
        "cpp_estimate_at_65": 1000,
        "rrsp_savings": 200000,
        "real_rate_of_return": 0.01,
        "inflation_rate": 0.02,
        "gender": "male",
        "health_status": "average"
    })

    assert resp.status_code == 200
    data = resp.json()

    bridge_cost = data["bridge_cost_lump_sum"]
    annual_cpp = 12000
    multiplier = bridge_cost / annual_cpp

    print(f"\nComputed Multiplier: {multiplier}")

    # CIA Target is 7.35. Allow small variance for Annuity Due vs Immediate diffs
    assert 7.2 < multiplier < 7.5


def test_health_check():
    """Test health endpoint."""
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_affordability_check():
    """Test affordability logic."""
    # Test with insufficient savings
    resp = client.post("/v1/calculate", json={
        "current_age": 65,
        "cpp_estimate_at_65": 1000,
        "rrsp_savings": 50000,
        "real_rate_of_return": 0.03,
        "gender": "male",
        "health_status": "average"
    })

    assert resp.status_code == 200
    data = resp.json()
    assert data["is_affordable"] == False
    assert data["shortfall_amount"] > 0


def test_excellent_health_higher_probability():
    """Excellent health should give higher win probability."""
    base_resp = client.post("/v1/calculate", json={
        "current_age": 60,
        "cpp_estimate_at_65": 1000,
        "rrsp_savings": 200000,
        "real_rate_of_return": 0.03,
        "gender": "male",
        "health_status": "average"
    })

    excellent_resp = client.post("/v1/calculate", json={
        "current_age": 60,
        "cpp_estimate_at_65": 1000,
        "rrsp_savings": 200000,
        "real_rate_of_return": 0.03,
        "gender": "male",
        "health_status": "excellent"
    })

    base_prob = base_resp.json()["probability_of_winning"]
    excellent_prob = excellent_resp.json()["probability_of_winning"]

    assert excellent_prob >= base_prob

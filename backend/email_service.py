import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content
from typing import Dict, Any


def send_report_email(
    name: str,
    email: str,
    score: Dict[str, Any],
    insights: Dict[str, Any],
    partner: Dict[str, str]
) -> bool:
    """Send the retirement scorecard report email."""

    api_key = os.getenv("SENDGRID_API_KEY")
    if not api_key:
        print(f"[EMAIL STUB] SendGrid API key not configured")
        print(f"  Would send email to: {email}")
        print(f"  Score: {score['total']}/100 ({score['category']})")
        return True

    from_email = os.getenv("FROM_EMAIL", "noreply@cppbridge.com")
    from_name = os.getenv("FROM_NAME", "CPP Bridge")

    # Generate email HTML
    html_content = generate_email_html(name, score, insights, partner)

    message = Mail(
        from_email=Email(from_email, from_name),
        to_emails=To(email),
        subject=f"Your Retirement Readiness Score: {score['total']}/100",
        html_content=Content("text/html", html_content)
    )

    try:
        sg = SendGridAPIClient(api_key)
        response = sg.send(message)
        print(f"[EMAIL] Sent to {email}: {response.status_code}")
        return response.status_code == 202
    except Exception as e:
        print(f"[EMAIL ERROR] SendGrid error: {e}")
        return False


def generate_email_html(
    name: str,
    score: Dict[str, Any],
    insights: Dict[str, Any],
    partner: Dict[str, str]
) -> str:
    """Generate the HTML email content."""

    # Score color
    colors = {
        "red": "#EF4444",
        "amber": "#F59E0B",
        "green": "#10B981"
    }
    score_color = colors.get(score["category"], "#4F46E5")

    # Calculate percentages for progress bars
    quiz = score["breakdown"]["quiz"]
    income_pct = int(quiz["income"]["points"] / quiz["income"]["max"] * 100)
    assets_pct = int(quiz["assets"]["points"] / quiz["assets"]["max"] * 100)
    tax_pct = int(quiz["tax"]["points"] / quiz["tax"]["max"] * 100)
    psychology_pct = int(quiz["psychology"]["points"] / quiz["psychology"]["max"] * 100)

    # Generate recommendations HTML
    recommendations_html = "".join([
        f'<li style="margin-bottom: 8px; color: #10B981;">&#10003; <span style="color: #4b5563;">{rec}</span></li>'
        for rec in insights["recommendations"]
    ])

    return f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Retirement Scorecard</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

        <!-- Header -->
        <div style="background: linear-gradient(135deg, #4F46E5, #6366F1); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Your Retirement Scorecard</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 16px;">Personalized Analysis for {name}</p>
        </div>

        <!-- Score Circle -->
        <div style="padding: 32px; text-align: center; border-bottom: 1px solid #e5e7eb;">
            <div style="display: inline-block; width: 120px; height: 120px; border-radius: 50%; border: 8px solid {score_color}; position: relative;">
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                    <span style="font-size: 42px; font-weight: bold; color: #1f2937; display: block; line-height: 1;">{score['total']}</span>
                    <span style="font-size: 14px; color: #6b7280;">/100</span>
                </div>
            </div>
            <div style="margin-top: 16px;">
                <span style="display: inline-block; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 600; background-color: {score_color}; color: white;">
                    {score['label']}
                </span>
            </div>
        </div>

        <!-- Score Breakdown -->
        <div style="padding: 24px 32px; border-bottom: 1px solid #e5e7eb;">
            <h2 style="font-size: 18px; color: #1f2937; margin: 0 0 20px; font-weight: 600;">Score Breakdown</h2>

            <!-- Income Security -->
            <div style="margin-bottom: 16px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="color: #6b7280; font-size: 14px; padding-bottom: 6px;">&#128176; Income Security</td>
                        <td style="text-align: right; font-weight: 600; font-size: 14px; padding-bottom: 6px;">{quiz['income']['points']}/{quiz['income']['max']}</td>
                    </tr>
                </table>
                <div style="height: 8px; background-color: #e5e7eb; border-radius: 4px; overflow: hidden;">
                    <div style="height: 100%; width: {income_pct}%; background-color: #10B981; border-radius: 4px;"></div>
                </div>
            </div>

            <!-- Asset Longevity -->
            <div style="margin-bottom: 16px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="color: #6b7280; font-size: 14px; padding-bottom: 6px;">&#128202; Asset Longevity</td>
                        <td style="text-align: right; font-weight: 600; font-size: 14px; padding-bottom: 6px;">{quiz['assets']['points']}/{quiz['assets']['max']}</td>
                    </tr>
                </table>
                <div style="height: 8px; background-color: #e5e7eb; border-radius: 4px; overflow: hidden;">
                    <div style="height: 100%; width: {assets_pct}%; background-color: #3B82F6; border-radius: 4px;"></div>
                </div>
            </div>

            <!-- Tax Efficiency -->
            <div style="margin-bottom: 16px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="color: #6b7280; font-size: 14px; padding-bottom: 6px;">&#128203; Tax Efficiency</td>
                        <td style="text-align: right; font-weight: 600; font-size: 14px; padding-bottom: 6px;">{quiz['tax']['points']}/{quiz['tax']['max']}</td>
                    </tr>
                </table>
                <div style="height: 8px; background-color: #e5e7eb; border-radius: 4px; overflow: hidden;">
                    <div style="height: 100%; width: {tax_pct}%; background-color: #F59E0B; border-radius: 4px;"></div>
                </div>
            </div>

            <!-- Psychological Readiness -->
            <div>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="color: #6b7280; font-size: 14px; padding-bottom: 6px;">&#129504; Psychological Readiness</td>
                        <td style="text-align: right; font-weight: 600; font-size: 14px; padding-bottom: 6px;">{quiz['psychology']['points']}/{quiz['psychology']['max']}</td>
                    </tr>
                </table>
                <div style="height: 8px; background-color: #e5e7eb; border-radius: 4px; overflow: hidden;">
                    <div style="height: 100%; width: {psychology_pct}%; background-color: #8B5CF6; border-radius: 4px;"></div>
                </div>
            </div>
        </div>

        <!-- Insights -->
        <div style="padding: 24px 32px; border-bottom: 1px solid #e5e7eb;">
            <h2 style="font-size: 18px; color: #1f2937; margin: 0 0 12px; font-weight: 600;">&#128221; Your Personalized Insights</h2>
            <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px; padding: 16px; background-color: #f9fafb; border-radius: 8px; font-size: 14px;">
                {insights['verdict']}
            </p>
            <h3 style="font-size: 16px; color: #1f2937; margin: 0 0 12px; font-weight: 600;">Recommended Next Steps:</h3>
            <ul style="color: #4b5563; line-height: 1.8; margin: 0; padding-left: 0; list-style: none; font-size: 14px;">
                {recommendations_html}
            </ul>
        </div>

        <!-- CTA -->
        <div style="padding: 32px; text-align: center; background-color: #f9fafb;">
            <h3 style="font-size: 20px; color: #1f2937; margin: 0 0 8px; font-weight: 600;">Ready to Optimize Your Retirement?</h3>
            <p style="color: #6b7280; margin: 0 0 24px; font-size: 14px;">Get personalized guidance from our expert advisors</p>
            <a href="{partner['cta_url']}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #10B981, #059669); color: white; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px;">
                {partner['cta_text']} &#8594;
            </a>
        </div>

        <!-- Footer -->
        <div style="padding: 24px 32px; text-align: center; background-color: #1f2937;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0 0 8px;">
                &copy; 2024 CPP Bridge Calculator. For educational purposes only.
            </p>
            <p style="color: #6b7280; font-size: 11px; margin: 0;">
                This is not financial advice. Please consult a qualified financial advisor.
            </p>
        </div>

    </div>
</body>
</html>
"""

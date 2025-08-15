import json
import smtplib
import email.utils
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from os import environ

from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt


@require_POST
@csrf_exempt
def send_email(request):
    """
    Accepts POST from #formSelection (form-encoded or JSON),
    and sends an email via Mailer To Go using smtplib.
    """

    # Accept either JSON or x-www-form-urlencoded
    if request.content_type and request.content_type.startswith("application/json"):
        try:
            data = json.loads(request.body.decode("utf-8"))
        except json.JSONDecodeError:
            return JsonResponse({"ok": False, "error": "Invalid JSON"}, status=400)
    else:
        data = request.POST.dict()

    # --- Mailer To Go env vars ---
    host = environ.get("MAILERTOGO_SMTP_HOST")
    port = int(environ.get("MAILERTOGO_SMTP_PORT", 587))
    user = environ.get("MAILERTOGO_SMTP_USER")
    password = environ.get("MAILERTOGO_SMTP_PASSWORD")
    domain = environ.get("MAILERTOGO_DOMAIN", "example.com")

    if not all([host, user, password]):
        return JsonResponse(
            {"ok": False, "error": "Mailer To Go SMTP env vars are not set"},
            status=500,
        )

    # Sender/recipient
    # You can send to yourself, or to the form's email, or both.
    sender_name = "Form Filler"
    sender_email = f"noreply@{domain}"

    # Send to the submitter if provided, otherwise to yourself
    to_email = data.get("email") or sender_email
    to_name = data.get("name") or "Recipient"

    # Subject & body
    subject = data.get("subject") or "Form Submission"
    # Build a simple body from all submitted fields
    lines = [f"{k}: {v}" for k, v in sorted(data.items())]
    body_plain = "New submission:\n\n" + "\n".join(lines) + "\n"

    body_html = "<html><body><h3>New submission</h3><ul>"
    body_html += "".join(f"<li><b>{k}</b>: {v}</li>" for k, v in sorted(data.items()))
    body_html += "</ul></body></html>"

    # MIME message (plain + html)
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = email.utils.formataddr((sender_name, sender_email))
    msg["To"] = email.utils.formataddr((to_name, to_email))

    # Optional: also send yourself a copy
    # msg["Bcc"] = sender_email

    part1 = MIMEText(body_plain, "plain")
    part2 = MIMEText(body_html, "html")
    msg.attach(part1)
    msg.attach(part2)

    # Send
    try:
        with smtplib.SMTP(host, port, timeout=20) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(user, password)
            server.sendmail(sender_email, [to_email], msg.as_string())
        return JsonResponse({"ok": True, "message": "Email sent!"})
    except Exception as e:
        return JsonResponse({"ok": False, "error": str(e)}, status=500)

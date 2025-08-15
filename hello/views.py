import os
from django.conf import settings
from django.core.mail import send_mail
from django.shortcuts import render
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt


@require_http_methods(["POST"])
@csrf_exempt
def send_email(request):
    to_email = request.POST.get("email")
    subject = request.POST.get("subject", "Form submission")
    body = "New submission:\n\n" + "\n".join(f"{k}: {v}" for k, v in request.POST.items())

    if not to_email:
        return render(request, "index.html", {"error": "Email is required."}, status=400)

    send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, [to_email], fail_silently=False)
    return render(request, "success.html", {"email": to_email})

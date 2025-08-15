import os
from django.conf import settings
from django.core.mail import send_mail
from django.shortcuts import render
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt

def index(request):
    # Specify the directory path (e.g., current directory or a specific path)
    directory_path = '.'  # Current directory; replace with desired path, e.g., 'static'
    try:
        # List directory contents
        directory_contents = os.listdir(directory_path)
        # Filter out '.' and '..' (similar to PHP's condition)
        files = [f for f in directory_contents if f not in ['.', '..']]
        # Optionally separate files and directories
        files_only = [f for f in files if os.path.isfile(os.path.join(directory_path, f))]
        dirs_only = [f for f in files if os.path.isdir(os.path.join(directory_path, f))]
    except Exception as e:
        files_only = []
        dirs_only = [str(e)]  # Handle errors (e.g., permission denied)

    context = {
        'directory_path': directory_path,
        'files': files_only,
        'dirs': dirs_only,
    }
    return render(request, "index.html")


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

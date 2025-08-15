import os
from django.conf import settings
from django.core.mail import send_mail
from django.shortcuts import render
from .forms import EmailForm  # Import the form you created
from django.contrib import messages # Import the messages framework
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_protect
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

    if request.method == 'POST':
        form = EmailForm(request.POST)
        if form.is_valid():
            email_address = form.cleaned_data['email']
            # Here's where you'd "do something" with the email
            # For example, save it to a database, send an email, etc.
            print(f"Processing email: {email_address}")  # For demonstration

            messages.success(request, f'Email "{email_address}" received successfully!')
            # Clear the form by creating a new empty instance
            form = EmailForm()
    else:
        form = EmailForm()

    return render(request, "index.html", {'form': form})

from django.shortcuts import render

from .models import Greeting

# Create your views here.

"""
def index(request):
    return render(request, "index.html")
"""

def db(request):
    # If you encounter errors visiting the `/db/` page on the example app, check that:
    #
    # When running the app on Heroku:
    #   1. You have added the Postgres database to your app.
    #   2. You have uncommented the `psycopg` dependency in `requirements.txt`, and the `release`
    #      process entry in `Procfile`, git committed your changes and re-deployed the app.
    #
    # When running the app locally:
    #   1. You have run `./manage.py migrate` to create the `hello_greeting` database table.

    greeting = Greeting()
    greeting.save()

    greetings = Greeting.objects.all()

    return render(request, "db.html", {"greetings": greetings})

import os
from django.shortcuts import render

def directory_view(request):
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
    return render(request, 'form_filler/index.html', context)


from django.shortcuts import render
import os
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

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




@csrf_exempt
def test_ajax(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid method'}, status=400)

    try:
        # Parse JSON payload
        data = json.loads(request.body)
        # Log payload for debugging
        with open('/tmp/test_ajax_log.txt', 'a') as log:
            log.write(f"Received payload: {json.dumps(data, indent=2)}\n")
        
        # Return success response
        return JsonResponse({
            'success': True,
            'message': 'Test AJAX request received',
            'received_data': data
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
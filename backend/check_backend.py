import urllib.request
import json

try:
    req = urllib.request.Request('http://localhost:8000/api/health')
    with urllib.request.urlopen(req) as response:
        print("Backend is running:", response.getcode())
except Exception as e:
    print("Backend is down or error:", e)

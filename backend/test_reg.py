import urllib.request
import json

data = json.dumps({
    "username": "testuser",
    "email": "test@example.com",
    "password": "password",
    "role": "admin"
}).encode('utf-8')

req = urllib.request.Request('http://localhost:8000/api/users/register', data=data, headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as response:
        print(response.getcode())
        print(response.read().decode('utf-8'))
except Exception as e:
    print("Error:", e)

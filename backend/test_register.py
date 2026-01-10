import requests
import json

url = "http://localhost:8000/api/auth/register/"
data = {
    "company_name": "Test Company",
    "company_email": "test@company.com",
    "username": "testuser",
    "email": "test@user.com",
    "first_name": "Test",
    "last_name": "User",
    "password": "TestPass123!",
    "password2": "TestPass123!"
}

response = requests.post(url, json=data)
print(f"Status Code: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")

"""
API Testing Script for La HR System
Tests all API endpoints to ensure Phase 3 is working correctly.
"""
import requests
import json
from pprint import pprint

# Base URL
BASE_URL = "http://localhost:8000/api"

# Global variables for tokens
access_token = None
refresh_token = None
user_data = None

def print_section(title):
    """Print a section header"""
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)

def print_response(response):
    """Print API response"""
    print(f"\nStatus Code: {response.status_code}")
    try:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"Response Text: {response.text}")

def test_register():
    """Test company registration"""
    print_section("TEST 1: Company Registration")
    
    url = f"{BASE_URL}/auth/register/"
    data = {
        "company_name": "Tech Innovations Ltd",
        "company_email": "contact@techinnovations.ug",
        "company_phone": "+256 700 999 888",
        "company_address": "Plot 789, Innovation Street",
        "company_city": "Kampala",
        "company_country": "UG",
        "tax_id": "TIN-9999888877",
        "username": "admin_techinnovations",
        "email": "admin@techinnovations.ug",
        "password": "SecurePass123!",
        "password2": "SecurePass123!",
        "first_name": "David",
        "last_name": "Owuor",
        "phone": "+256 700 111 222"
    }
    
    response = requests.post(url, json=data)
    print_response(response)
    
    if response.status_code == 201:
        global access_token, refresh_token, user_data
        result = response.json()
        access_token = result['tokens']['access']
        refresh_token = result['tokens']['refresh']
        user_data = result['user']
        print("\n✅ Registration successful!")
        print(f"   Access Token: {access_token[:50]}...")
        return True
    else:
        print("\n❌ Registration failed!")
        return False


def test_login():
    """Test user login"""
    print_section("TEST 2: User Login")
    
    url = f"{BASE_URL}/auth/login/"
    data = {
        "username": "admin_companyA",  # From test data
        "password": "admin123"
    }
    
    response = requests.post(url, json=data)
    print_response(response)
    
    if response.status_code == 200:
        global access_token, refresh_token, user_data
        result = response.json()
        access_token = result['tokens']['access']
        refresh_token = result['tokens']['refresh']
        user_data = result['user']
        print("\n✅ Login successful!")
        print(f"   Logged in as: {user_data['full_name']}")
        print(f"   Company: {user_data['company_name']}")
        print(f"   Role: {user_data['role']}")
        return True
    else:
        print("\n❌ Login failed!")
        return False


def test_current_user():
    """Test getting current user profile"""
    print_section("TEST 3: Get Current User Profile")
    
    url = f"{BASE_URL}/auth/me/"
    headers = {"Authorization": f"Bearer {access_token}"}
    
    response = requests.get(url, headers=headers)
    print_response(response)
    
    if response.status_code == 200:
        print("\n✅ Successfully retrieved user profile!")
        return True
    else:
        print("\n❌ Failed to retrieve user profile!")
        return False


def test_companies():
    """Test company endpoints"""
    print_section("TEST 4: Company Endpoints")
    
    headers = {"Authorization": f"Bearer {access_token}"}
    
    # Get my company
    print("\n📋 GET /api/companies/my/ - Get my company")
    response = requests.get(f"{BASE_URL}/companies/my/", headers=headers)
    print_response(response)
    
    if response.status_code == 200:
        company = response.json()
        print(f"\n✅ Company: {company['name']}")
        
        # Get company stats
        print(f"\n📊 GET /api/companies/{company['id']}/stats/ - Get company stats")
        response = requests.get(f"{BASE_URL}/companies/{company['id']}/stats/", headers=headers)
        print_response(response)
        
        return True
    else:
        print("\n❌ Failed to get company!")
        return False


def test_departments():
    """Test department endpoints"""
    print_section("TEST 5: Department Endpoints")
    
    headers = {"Authorization": f"Bearer {access_token}"}
    
    # List departments
    print("\n📋 GET /api/departments/ - List departments")
    response = requests.get(f"{BASE_URL}/departments/", headers=headers)
    print_response(response)
    
    if response.status_code == 200:
        departments = response.json()
        print(f"\n✅ Found {len(departments.get('results', departments))} departments")
        
        # Try to get first department stats if exists
        dept_list = departments.get('results', departments)
        if dept_list and len(dept_list) > 0:
            dept_id = dept_list[0]['id']
            print(f"\n📊 GET /api/departments/{dept_id}/stats/ - Get department stats")
            response = requests.get(f"{BASE_URL}/departments/{dept_id}/stats/", headers=headers)
            print_response(response)
        
        return True
    else:
        print("\n❌ Failed to list departments!")
        return False


def test_employees():
    """Test employee endpoints"""
    print_section("TEST 6: Employee Endpoints")
    
    headers = {"Authorization": f"Bearer {access_token}"}
    
    # List employees
    print("\n📋 GET /api/employees/ - List employees")
    response = requests.get(f"{BASE_URL}/employees/", headers=headers)
    print_response(response)
    
    if response.status_code == 200:
        employees = response.json()
        emp_list = employees.get('results', employees)
        print(f"\n✅ Found {len(emp_list)} employees")
        
        # Get employee stats
        print(f"\n📊 GET /api/employees/stats/ - Get employee statistics")
        response = requests.get(f"{BASE_URL}/employees/stats/", headers=headers)
        print_response(response)
        
        # Get active employees
        print(f"\n📋 GET /api/employees/active/ - Get active employees")
        response = requests.get(f"{BASE_URL}/employees/active/", headers=headers)
        print_response(response)
        
        # Get employees by department
        print(f"\n📊 GET /api/employees/by_department/ - Get employees by department")
        response = requests.get(f"{BASE_URL}/employees/by_department/", headers=headers)
        print_response(response)
        
        return True
    else:
        print("\n❌ Failed to list employees!")
        return False


def test_token_refresh():
    """Test JWT token refresh"""
    print_section("TEST 7: Token Refresh")
    
    url = f"{BASE_URL}/auth/token/refresh/"
    data = {"refresh": refresh_token}
    
    response = requests.post(url, json=data)
    print_response(response)
    
    if response.status_code == 200:
        global access_token
        result = response.json()
        access_token = result['access']
        print("\n✅ Token refresh successful!")
        print(f"   New Access Token: {access_token[:50]}...")
        return True
    else:
        print("\n❌ Token refresh failed!")
        return False


def run_all_tests():
    """Run all API tests"""
    print("\n" + "🚀" * 40)
    print("\n   LahHR API Testing Suite - Phase 3")
    print("\n" + "🚀" * 40)
    
    results = []
    
    # Skip registration test if using existing user
    # results.append(("Company Registration", test_register()))
    
    # Test with existing user
    results.append(("User Login", test_login()))
    
    if not access_token:
        print("\n❌ Cannot continue tests without authentication token!")
        return
    
    results.append(("Current User Profile", test_current_user()))
    results.append(("Company Endpoints", test_companies()))
    results.append(("Department Endpoints", test_departments()))
    results.append(("Employee Endpoints", test_employees()))
    results.append(("Token Refresh", test_token_refresh()))
    
    # Print summary
    print_section("TEST SUMMARY")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}  {test_name}")
    
    print(f"\n📊 Results: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")
    
    if passed == total:
        print("\n🎉🎉🎉 ALL TESTS PASSED! 🎉🎉🎉")
        print("\n✅ Phase 3 API Development: COMPLETE!")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Please review the output above.")


if __name__ == "__main__":
    try:
        run_all_tests()
    except Exception as e:
        print(f"\n❌ Error running tests: {e}")
        import traceback
        traceback.print_exc()

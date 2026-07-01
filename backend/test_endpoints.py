import requests

BASE_URL = 'http://127.0.0.1:8000/api'

def test_endpoints():
    session1 = requests.Session()
    session2 = requests.Session()
    
    print("1. Signup user 1...")
    res = session1.post(f"{BASE_URL}/auth/signup/", json={"username": "user1", "password": "password123"})
    print("Status:", res.status_code, res.text)
    
    # Check if user already exists
    if res.status_code == 400 and 'already exists' in res.text:
        print("User 1 already exists, trying login...")
        res = session1.post(f"{BASE_URL}/auth/login/", json={"username": "user1", "password": "password123"})
        print("Login Status:", res.status_code, res.text)

    print("\n2. Signup user 2...")
    res = session2.post(f"{BASE_URL}/auth/signup/", json={"username": "user2", "password": "password123"})
    print("Status:", res.status_code, res.text)
    if res.status_code == 400 and 'already exists' in res.text:
        print("User 2 already exists, trying login...")
        res = session2.post(f"{BASE_URL}/auth/login/", json={"username": "user2", "password": "password123"})
        print("Login Status:", res.status_code, res.text)
        
    print("\n3. Get current user 1...")
    res = session1.get(f"{BASE_URL}/auth/me/")
    print("Status:", res.status_code, res.text)
    
    print("\n4. Start conversation from user 1 to user 2...")
    # Get CSRF token for the POST request
    session1.get(f"{BASE_URL}/auth/me/") # This sets the csrftoken cookie
    csrf_token = session1.cookies.get('csrftoken')
    
    res = session1.post(
        f"{BASE_URL}/conversations/start/", 
        json={"username": "user2"},
        headers={'X-CSRFToken': csrf_token}
    )
    print("Status:", res.status_code, res.text)
    conversation_id = res.json().get('id') if res.status_code in [200, 201] else None
    
    if conversation_id:
        print(f"\n5. Send message from user 1 in conversation {conversation_id}...")
        res = session1.post(
            f"{BASE_URL}/messages/",
            json={"conversation": conversation_id, "text": "Hello user 2!"},
            headers={'X-CSRFToken': csrf_token}
        )
        print("Status:", res.status_code, res.text)
        
        print("\n6. Fetch messages as user 2...")
        session2.get(f"{BASE_URL}/auth/me/") # ensure session is active
        res = session2.get(f"{BASE_URL}/messages/?conversation_id={conversation_id}")
        print("Status:", res.status_code, res.text)
        
    print("\n7. Fetch conversations for user 1...")
    res = session1.get(f"{BASE_URL}/conversations/")
    print("Status:", res.status_code, res.text)

    print("\n8. Logout user 1...")
    res = session1.post(f"{BASE_URL}/auth/logout/", headers={'X-CSRFToken': csrf_token})
    print("Status:", res.status_code, res.text)

if __name__ == '__main__':
    test_endpoints()

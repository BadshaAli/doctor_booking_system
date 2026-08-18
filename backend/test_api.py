import urllib.request
import json

try:
    url = "http://localhost:8000/api/doctors/"
    response = urllib.request.urlopen(url)
    data = json.loads(response.read().decode())
    print("STATUS: SUCCESS")
    print(f"Total Bangladeshi Doctors: {len(data['doctors'])}")
    print(f"Districts Covered: {', '.join(data['districts'])}")
    print(f"Specialties Available: {', '.join(data['specialties'])}")
    for doc in data['doctors'][:4]:
        print(f" - Dr. {doc['user']['first_name']} {doc['user']['last_name']} ({doc['specialty']}) | District: {doc['district']} | Chamber Fee: ৳{doc['consultation_fee']}")
except Exception as e:
    print(f"STATUS: ERROR ({e})")

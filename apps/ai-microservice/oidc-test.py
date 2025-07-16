import requests

url = "https://auth.etsecure.xyz/application/o/token/"
queryParams = {
    "grant_type": "client_credentials",
    "client_id": "REDACTED",
    "username": "aisystem",
    "password": "REDACTED",
    "scope": "profile",
}
headers = {"Content-Type": "application/x-www-form-urlencoded"}

url = requests.Request("POST", url, params=queryParams, headers=headers).prepare().url

print(url)

response = requests.post(url, headers=headers)
print(response.status_code)
print(response.json())

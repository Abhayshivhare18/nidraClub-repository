from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware  # Import CORS Middleware
import requests
import os
import json
import time

app = FastAPI()

# Enable CORS (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (or specify frontend URL)
    allow_credentials=False,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Define expected request body structure
class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/login")
async def login(request: LoginRequest):
    """Handles user login by forwarding credentials to third-party API."""
    url = "https://dataintegration.sleepiz.io/api/v1/data-integration/login"
    headers = {"Content-Type": "application/json"}

    try:
        # Forward request to third-party API
        loginResponse = requests.post(url, json=request.model_dump(), headers=headers,timeout=100000)

        # If login is successful, return the response
        if loginResponse.status_code == 200:
            return loginResponse.json()
        
        #  If user not found (404), return a custom error message
        elif loginResponse.status_code == 404:
            error_data = loginResponse.json()
            raise HTTPException(status_code=404, detail=error_data["message"])

        # For any other status code, return the third-party API error message
        else:
            raise HTTPException(status_code=loginResponse.status_code, detail=loginResponse.json())

    except requests.exceptions.RequestException:
        # If there's a network error, return a 500 error
        raise HTTPException(status_code=500, detail="Failed to reach the authentication server")


# get_study_logs
THIRD_PARTY_API_URL = "https://dataintegration.sleepiz.io/api/v1/data-integration/study-logs"

class TokenRequest(BaseModel):
    token: str

@app.post("/study-logs")
def get_study_logs(request: TokenRequest):
    """Fetches study logs from third-party API using 'Auth-Type' header."""
    
    headers = {
        "Authorization": f"Bearer {request.token}"  # Correct format
    } # Correct header placement

    try:
        responseStudy = requests.get(THIRD_PARTY_API_URL, headers=headers, timeout=10000)

        if responseStudy.status_code != 200:
            raise HTTPException(status_code=responseStudy.status_code, detail=responseStudy.json())

        return responseStudy.json()  # Return API response

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))
  
  
    
BASE_URL = "https://dataintegration.sleepiz.io/api/v1/data-integration/nightly-summary"

  

# Define request body model
class NightlyRequest(BaseModel):
    recording_date: int
    device_id: int
    token: str  # Token sent in request body

@app.post("/nightly-data")
def get_nightly_data(request: NightlyRequest):
    """
    Fetch nightly data from Sleepiz API.
    - `recording_date`: Timestamp in milliseconds.
    - `device_id`: Device ID.
    - `token`: Authorization token.
    """

    headers = {
        "Authorization": f"{request.token}"  # Correct header placement
    }
    
    params = {
        "recording_date": request.recording_date,
        "device_id": request.device_id,
         "sleep_stages": True 
        
    }

    try:
        response_nightly_summary = requests.get(BASE_URL, headers=headers, params=params, timeout=100000)

        if response_nightly_summary.status_code != 200:
            raise HTTPException(status_code=response_nightly_summary.status_code, detail=response_nightly_summary.text)
        
        
        json_data = response_nightly_summary.json()  # Parse JSON response

        # Define file path (saves in the project root folder)
        file_path = os.path.join(os.getcwd(), "nidraClub_updateData.json")

        # Save JSON data to a file
        with open(file_path, "w", encoding="utf-8") as json_file:
            json.dump(json_data, json_file, indent=4)

        return response_nightly_summary.json()

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))
    except IOError as e:
        raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")
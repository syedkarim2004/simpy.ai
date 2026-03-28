from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests as grequests

router = APIRouter()
GOOGLE_CLIENT_ID = "1031079203931-uaceb23a4uapd96k9p1m2f60buhgmc6m.apps.googleusercontent.com"

class TokenRequest(BaseModel):
    token: str

@router.post("/google")
async def google_auth(body: TokenRequest):
    try:
        # Verify the Google ID token
        idinfo = id_token.verify_oauth2_token(
            body.token,
            grequests.Request(),
            GOOGLE_CLIENT_ID
        )

        # Extract user information from the verified token
        user = {
            "name": idinfo.get("name"),
            "email": idinfo.get("email"),
            "picture": idinfo.get("picture"),
            "role": "medical"  # Defaulting to medical for this portal
        }

        return { "success": True, "user": user }
    except ValueError:
        # Invalid token
        raise HTTPException(status_code=400, detail="Invalid Google token")
    except Exception as e:
        # Other errors
        return { "success": False, "error": str(e) }

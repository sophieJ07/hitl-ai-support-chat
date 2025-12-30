from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwk, jwt
from jose.utils import base64url_decode
import requests
from typing import Optional
import time
import os
from dotenv import load_dotenv

# TOKEN VERIFIER 

load_dotenv()

REGION = os.getenv("AWS_REGION", "us-east-1")
USER_POOL_ID = os.getenv("COGNITO_USER_POOL_ID")
APP_CLIENT_ID = os.getenv("COGNITO_APP_CLIENT_ID")
COGNITO_ISSUER = f"https://cognito-idp.{REGION}.amazonaws.com/{USER_POOL_ID}"

# fetch cognito public keys 
JWKS_URL = f"{COGNITO_ISSUER}/.well-known/jwks.json"
jwks = requests.get(JWKS_URL).json()

security = HTTPBearer()

def verify_token(token: str) -> dict:
    """
    verify and decode cognito JWT token
    """

    try:
        # get key id from token header
        headers = jwt.get_unverified_headers(token)
        kid = headers['kid']
        
        # find correct public key
        key = next((k for k in jwks['keys'] if k['kid'] == kid), None)
        if not key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: Public key not found"
            )
        
        # make public key
        public_key = jwk.construct(key)
        
        # get the message and signature from token
        message, encoded_signature = token.rsplit('.', 1)
        decoded_signature = base64url_decode(encoded_signature.encode())
        
        # verify signature
        if not public_key.verify(message.encode(), decoded_signature):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: Signature verification failed"
            )
        
        # decode and validate claims
        claims = jwt.get_unverified_claims(token)
        
        # verify token expiration
        if time.time() > claims['exp']:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        
        # verify issuer
        if claims['iss'] != COGNITO_ISSUER:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: Wrong issuer"
            )
        
        # verify audience client_id 
        if 'client_id' in claims:
            if claims['client_id'] != APP_CLIENT_ID:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token: Wrong client_id"
                )
        elif claims.get('aud') != APP_CLIENT_ID:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: Wrong audience"
            )
        
        return claims
        
    except jwt.JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token validation failed: {str(e)}"
        )


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    dependency to get current authenticated user
    """
    token = credentials.credentials
    claims = verify_token(token)
    return claims
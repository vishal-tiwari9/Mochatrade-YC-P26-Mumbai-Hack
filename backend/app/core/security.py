from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from .firebase import verify_id_token
from ..store import store
bearer=HTTPBearer(auto_error=False)
def get_current_user(credentials:HTTPAuthorizationCredentials=Depends(bearer)):
    if not credentials: raise HTTPException(401,"Authentication required")
    try: claims=verify_id_token(credentials.credentials)
    except Exception: raise HTTPException(401,"Invalid Firebase ID token")
    uid=claims.get("uid") or claims.get("user_id"); user=store.users.get(uid,{})
    role=user.get("role") or claims.get("role")
    if role not in {"TEACHER","STUDENT"}: raise HTTPException(403,"User role is not configured")
    return {"userId":uid,"role":role,"email":user.get("email",claims.get("email")),"name":user.get("fullName",claims.get("name",uid))}
def require_role(role):
    def dep(user=Depends(get_current_user)):
        if user["role"]!=role: raise HTTPException(403,f"{role} access required")
        return user
    return dep


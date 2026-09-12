from .config import get_settings
from pathlib import Path
_initialized = False
_db = None
def initialize_firebase():
    global _initialized, _db
    s=get_settings()
    if _initialized or s.use_in_memory or not s.firebase_project_id: return False
    import firebase_admin
    from firebase_admin import credentials
    if s.firebase_credentials_file:
        credential_path = Path(s.firebase_credentials_file)
        if not credential_path.exists():
            raise RuntimeError(f"Firebase credentials file not found: {credential_path}")
        cred=credentials.Certificate(str(credential_path))
    else:
        cred=credentials.Certificate({"project_id":s.firebase_project_id,"client_email":s.firebase_client_email,"private_key":s.firebase_private_key.replace("\\n","\n"),"token_uri":"https://oauth2.googleapis.com/token"})
    firebase_admin.initialize_app(cred,{"storageBucket":s.firebase_storage_bucket})
    from firebase_admin import firestore
    _db=firestore.client(); _initialized=True; return True
def verify_id_token(token):
    s=get_settings()
    if s.use_in_memory:
        parts=token.split(":")
        if len(parts)==3 and parts[0]=="demo" and parts[1] and parts[2] in {"TEACHER","STUDENT"}:
            return {"uid":parts[1],"role":parts[2],"email":f"{parts[1]}@demo.local","name":parts[1]}
        raise ValueError("Invalid development token")
    if not s.firebase_project_id or (not s.firebase_credentials_file and (not s.firebase_client_email or not s.firebase_private_key)):
        raise ValueError("Firebase Admin credentials are not configured")
    initialize_firebase()
    from firebase_admin import auth
    return auth.verify_id_token(token)

def firestore_db():
    if not initialize_firebase(): return None
    return _db

from datetime import timedelta
from pathlib import Path

def _stored_url(path: str, local_url: str) -> str:
    from ..core.config import get_settings
    from ..core.firebase import initialize_firebase
    s=get_settings()
    if s.use_in_memory or not s.firebase_project_id: return local_url
    initialize_firebase()
    from firebase_admin import storage
    blob=storage.bucket().blob(path)
    return blob.generate_signed_url(expiration=timedelta(days=7),method="GET")

def upload_pdf(classroom_id: str, lecture_id: str, content: bytes) -> str:
    """Upload a final PDF without making the Storage bucket publicly readable."""
    from ..core.config import get_settings
    from ..core.firebase import initialize_firebase
    s=get_settings()
    if s.use_in_memory or not s.firebase_project_id: return f"/api/lectures/{lecture_id}/pdf"
    initialize_firebase()
    from firebase_admin import storage
    blob=storage.bucket().blob(f"classrooms/{classroom_id}/lecture-pdfs/{lecture_id}.pdf")
    blob.upload_from_string(content,content_type="application/pdf")
    return _stored_url(blob.name, f"/api/lectures/{lecture_id}/pdf")

def upload_resource_file(classroom_id: str, resource_id: str, filename: str, content: bytes, content_type: str | None) -> str:
    safe_name=Path(filename or "resource").name
    path=f"classrooms/{classroom_id}/resources/{resource_id}-{safe_name}"
    from ..core.config import get_settings
    from ..core.firebase import initialize_firebase
    s=get_settings()
    if s.use_in_memory or not s.firebase_project_id: return f"/api/resources/{resource_id}/file"
    initialize_firebase()
    from firebase_admin import storage
    blob=storage.bucket().blob(path)
    blob.upload_from_string(content,content_type=content_type or "application/octet-stream")
    return _stored_url(path, f"/api/resources/{resource_id}/file")

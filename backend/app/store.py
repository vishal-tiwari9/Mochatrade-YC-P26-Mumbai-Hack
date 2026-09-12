from datetime import datetime, timezone
from uuid import uuid4
class Store:
    def __init__(self):
        from .core.config import get_settings
        settings = get_settings()
        self.db=None
        if not settings.use_in_memory:
            try:
                from .core.firebase import firestore_db
                self.db=firestore_db()
            except Exception:
                self.db=None
        self.users=self._load("users"); self.classrooms=self._load("classrooms"); self.members=self._load("classMembers"); self.lectures=self._load("lectures"); self.sessions=self._load("attendanceSessions"); self.records=self._load("attendanceRecords"); self.resources=self._load("resources"); self.tests=self._load("tests"); self.questions=self._load("questions"); self.attempts=self._load("testAttempts"); self.answers=self._load("testAnswers"); self.notifications=self._load("notifications")
        if settings.use_in_memory and not self.db and not self.classrooms: self._seed_demo()
    def _load(self, collection):
        if not self.db: return {}
        return {x.id:x.to_dict() for x in self.db.collection(collection).stream()}
    def id(self): return str(uuid4())
    def now(self): return datetime.now(timezone.utc).isoformat()
    def save(self, collection, key, value):
        if not self.db: return
        clean={k:v for k,v in value.items() if not k.startswith("_") and not isinstance(v,bytes)}
        self.db.collection(collection).document(key).set(clean, merge=True)
    def _seed_demo(self):
        self.users.update({"teacher-1":{"userId":"teacher-1","fullName":"Prof. Sharma","email":"teacher@classai.local","role":"TEACHER"},"student-1":{"userId":"student-1","fullName":"Dev Kanojiya","email":"dev@classai.local","role":"STUDENT","rollNumber":"CS601"}})
        c={"classroomId":"demo-classroom","className":"Operating Systems","subjectName":"Operating Systems","subjectCode":"CS601","semester":"6","division":"A","teacherId":"teacher-1","teacherName":"Prof. Sharma","joinCode":"OS7X92","createdAt":self.now()};self.classrooms[c["classroomId"]]=c
        m={"membershipId":"student-1_demo-classroom","classroomId":"demo-classroom","studentId":"student-1","joinedAt":self.now()};self.members[m["membershipId"]]=m
        sid="demo-attendance";self.sessions[sid]={"sessionId":sid,"classroomId":"demo-classroom","lectureId":"cpu-scheduling","date":self.now()[:10],"markedBy":"teacher-1","createdAt":self.now()};rid="demo-record";self.records[rid]={"recordId":rid,"sessionId":sid,"lectureId":"cpu-scheduling","classroomId":"demo-classroom","studentId":"student-1","status":"ABSENT"}
store=Store()

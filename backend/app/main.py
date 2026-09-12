from datetime import datetime, timezone
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from .core.config import get_settings
from .core.security import get_current_user, require_role
from .core.logging import configure_logging
from .store import store
from .schemas.common import Success
from .schemas.models import *
from .services.groq_service import clean_transcript, generate_notes, generate_quiz
from .services.pdf_service import build_lecture_pdf
from .services.storage_service import upload_pdf, upload_resource_file
from .services.notification_service import notify_publication

configure_logging(); settings=get_settings(); app=FastAPI(title="ClassAI API", version="1.0.0")
app.add_middleware(CORSMiddleware,allow_origins=settings.origins,allow_credentials=True,allow_methods=["*"],allow_headers=["*"])
def ok(data=None,message=None): return {"success":True,"data":data,"message":message}
def err(status,message,code): raise HTTPException(status_code=status,detail={"success":False,"data":None,"message":message,"code":code})
def teacher(user=Depends(require_role("TEACHER"))): return user
def classroom_or_403(cid,user):
    c=store.classrooms.get(cid)
    if not c: err(404,"Classroom not found","CLASSROOM_NOT_FOUND")
    if user["role"]=="TEACHER" and c["teacherId"]!=user["userId"]: err(403,"You do not own this classroom","FORBIDDEN")
    if user["role"]=="STUDENT" and not any(m["classroomId"]==cid and m["studentId"]==user["userId"] for m in store.members.values()): err(403,"You are not a member of this classroom","FORBIDDEN")
    return c

@app.exception_handler(HTTPException)
async def http_error(_,exc):
    from fastapi.responses import JSONResponse
    detail=exc.detail if isinstance(exc.detail,dict) else {"success":False,"data":None,"message":str(exc.detail),"code":"HTTP_ERROR"}
    return JSONResponse(status_code=exc.status_code,content=detail)
@app.exception_handler(RequestValidationError)
async def validation_error(_,exc):
    from fastapi.responses import JSONResponse
    return JSONResponse(status_code=422,content={"success":False,"data":None,"message":"Invalid request payload","code":"VALIDATION_ERROR"})
@app.exception_handler(Exception)
async def unexpected_error(_,exc):
    from fastapi.responses import JSONResponse
    return JSONResponse(status_code=500,content={"success":False,"data":None,"message":"Internal server error","code":"INTERNAL_ERROR"})
@app.get("/health")
def health(): return ok({"status":"healthy"})
@app.get("/api/me")
def me(user=Depends(get_current_user)): return ok(user)
@app.put("/api/devices/fcm-token")
def register_fcm_token(body:FcmTokenUpdate,user=Depends(get_current_user)):
    token=body.token.strip()
    if not token or len(token)>4096: err(400,"Invalid FCM device token","INVALID_FCM_TOKEN")
    profile=store.users.get(user["userId"],{"userId":user["userId"],"fullName":user["name"],"email":user.get("email"),"role":user["role"],"createdAt":store.now()})
    profile["fcmToken"]=token; store.users[user["userId"]]=profile; store.save("users",user["userId"],profile)
    return ok({"registered":True})
@app.get("/api/classrooms")
def classrooms(user=Depends(get_current_user)):
    data=[c for c in store.classrooms.values() if c["teacherId"]==user["userId"] or any(m["classroomId"]==c["classroomId"] and m["studentId"]==user["userId"] for m in store.members.values())]
    return ok(data)
@app.post("/api/classrooms")
def create_classroom(body:ClassroomCreate,user=Depends(teacher)):
    import secrets,string
    code=''.join(secrets.choice(string.ascii_uppercase+string.digits) for _ in range(6)); cid=store.id(); c={"classroomId":cid,**body.model_dump(),"teacherId":user["userId"],"teacherName":user["name"],"joinCode":code,"createdAt":store.now()}; store.classrooms[cid]=c; store.save("classrooms",cid,c); return ok(c)
@app.post("/api/classrooms/join")
def join_classroom(body:JoinClassroom,user=Depends(require_role("STUDENT"))):
    c=next((x for x in store.classrooms.values() if x["joinCode"]==body.joinCode.upper()),None)
    if not c: err(404,"Invalid join code","INVALID_JOIN_CODE")
    if not any(m["classroomId"]==c["classroomId"] and m["studentId"]==user["userId"] for m in store.members.values()):
        mid=f"{user['userId']}_{c['classroomId']}"; store.members[mid]={"membershipId":mid,"classroomId":c["classroomId"],"studentId":user["userId"],"joinedAt":store.now()}; store.save("classMembers",mid,store.members[mid])
    return ok(c)
@app.get("/api/classrooms/{cid}")
def classroom(cid,user=Depends(get_current_user)): return ok(classroom_or_403(cid,user))
@app.get("/api/classrooms/{cid}/members")
def members(cid,user=Depends(get_current_user)):
    classroom_or_403(cid,user); return ok([store.users.get(m["studentId"],{"userId":m["studentId"]}) for m in store.members.values() if m["classroomId"]==cid])
@app.post("/api/classrooms/{cid}/members")
def add_member(cid,body:StudentCreate,user=Depends(teacher)):
    classroom_or_403(cid,user); existing=next((u for u in store.users.values() if u.get("email")==body.email),None); uid=existing["userId"] if existing else store.id(); password="ClassAI-"+uid[:6]+"!"; user_doc={"userId":uid,"fullName":body.fullName,"email":body.email,"role":"STUDENT","rollNumber":body.rollNumber,"createdAt":store.now(),"temporaryPassword":password}
    if not existing:
        from .core.config import get_settings
        if not get_settings().use_in_memory:
            try:
                from firebase_admin import auth
                auth.create_user(uid=uid,email=body.email,password=password,display_name=body.fullName)
            except Exception as e: err(400,"Could not create Firebase student account","STUDENT_CREATE_FAILED")
        store.users[uid]=user_doc; store.save("users",uid,user_doc)
    if not any(m["classroomId"]==cid and m["studentId"]==uid for m in store.members.values()): mid=f"{uid}_{cid}";store.members[mid]={"membershipId":mid,"classroomId":cid,"studentId":uid,"joinedAt":store.now()};store.save("classMembers",mid,store.members[mid])
    return ok({"student":user_doc,"temporaryPassword":password},"Student added. Share the temporary password securely.")
@app.delete("/api/classrooms/{cid}/members/{student_id}")
def remove_member(cid,student_id,user=Depends(teacher)):
    classroom_or_403(cid,user); key=next((k for k,m in store.members.items() if m["classroomId"]==cid and m["studentId"]==student_id),None)
    if not key: err(404,"Student is not a member of this classroom","MEMBER_NOT_FOUND")
    del store.members[key]
    if store.db: store.db.collection("classMembers").document(key).delete()
    return ok({"studentId":student_id})
@app.post("/api/classrooms/{cid}/members/bulk")
async def bulk_members(cid,file:UploadFile=File(...),user=Depends(teacher)):
    import csv,io
    classroom_or_403(cid,user); raw=await file.read()
    try: rows=list(csv.DictReader(io.StringIO(raw.decode("utf-8-sig"))))
    except Exception: err(400,"CSV must be UTF-8 text","INVALID_CSV")
    if not rows or not {"fullName","email"}.issubset(rows[0]): err(400,"CSV headers must include fullName,email and may include rollNumber","INVALID_CSV_HEADERS")
    created=[]
    for row in rows:
        try: result=add_member(cid,StudentCreate(fullName=row["fullName"].strip(),email=row["email"].strip(),rollNumber=(row.get("rollNumber") or row.get("rollNumber ") or None)),user); created.append(result["data"])
        except HTTPException as e: created.append({"email":row.get("email"),"error":e.detail})
    return ok({"imported":len([x for x in created if "error" not in x]),"students":created})
@app.get("/api/classrooms/{cid}/lectures")
def lectures(cid,user=Depends(get_current_user)):
    classroom_or_403(cid,user); data=[]
    for x in store.lectures.values():
        if x["classroomId"]!=cid: continue
        item={k:v for k,v in x.items() if user["role"]=="TEACHER" or k not in {"rawTranscript","cleanTranscript"}}
        if user["role"]=="STUDENT":
            item["attendanceStatus"]=next((r["status"] for r in store.records.values() if r.get("lectureId")==x["lectureId"] and r["studentId"]==user["userId"]),None)
            item["catchUpAvailable"]=item.get("status")=="PUBLISHED" and item.get("attendanceStatus")=="ABSENT"
        data.append(item)
    return ok(data)
@app.get("/api/classrooms/{cid}/upcoming-topic")
def upcoming_topic(cid,user=Depends(get_current_user)):
    classroom_or_403(cid,user); topic=next((x for x in store.resources.values() if x.get("classroomId")==cid and x.get("resourceType")=="UPCOMING_TOPIC"),None)
    return ok(topic)
@app.post("/api/classrooms/{cid}/upcoming-topic")
def set_upcoming_topic(cid,body:dict,user=Depends(teacher)):
    classroom_or_403(cid,user); tid=store.id(); x={"topicId":tid,"classroomId":cid,**body,"teacherId":user["userId"],"resourceType":"UPCOMING_TOPIC","createdAt":store.now()}; store.resources[tid]=x; store.save("resources",tid,x); return ok(x)
@app.get("/api/lectures/{lid}")
def lecture(lid,user=Depends(get_current_user)):
    x=store.lectures.get(lid)
    if not x: err(404,"Lecture not found","LECTURE_NOT_FOUND")
    classroom_or_403(x["classroomId"],user); out=dict(x)
    if user["role"]=="STUDENT": out.pop("rawTranscript",None); out.pop("cleanTranscript",None); out["attendanceStatus"]=next((r["status"] for r in store.records.values() if r.get("lectureId")==lid and r["studentId"]==user["userId"]),None); out["catchUpAvailable"]=out.get("status")=="PUBLISHED" and out.get("attendanceStatus")=="ABSENT"; out["resources"]=[r for r in store.resources.values() if r.get("lectureId")==lid]; related=next((t for t in store.tests.values() if t.get("lectureId")==lid and t.get("status")=="PUBLISHED"),None); out["relatedTest"]=student_test(related) if related else None
    return ok(out)
@app.post("/api/lectures")
def create_lecture(body:dict,user=Depends(teacher)):
    if not body.get("classroomId") or not body.get("rawTranscript"): err(400,"classroomId and rawTranscript are required","INVALID_LECTURE")
    classroom_or_403(body["classroomId"],user); lid=store.id(); x={"lectureId":lid,"teacherId":user["userId"],"createdAt":store.now(),"status":"PROCESSING",**body}; store.lectures[lid]=x
    x["cleanTranscript"]=clean_transcript(body["rawTranscript"]); x["structuredNotes"]=generate_notes(x["cleanTranscript"],body.get("title",body.get("topic","Lecture"))); x["summary"]=x["structuredNotes"].get("overview",""); x["status"]="READY_FOR_REVIEW"; store.save("lectures",lid,x); return ok(x)
@app.patch("/api/lectures/{lid}")
def update_lecture(lid,body:LectureUpdate,user=Depends(teacher)):
    x=store.lectures.get(lid); 
    if not x: err(404,"Lecture not found","LECTURE_NOT_FOUND")
    classroom_or_403(x["classroomId"],user); x.update({k:v for k,v in body.model_dump().items() if v is not None}); store.save("lectures",lid,x); return ok(x)
@app.post("/api/lectures/{lid}/regenerate-section")
def regenerate_lecture_section(lid,body:LectureSectionRegenerate,user=Depends(teacher)):
    x=store.lectures.get(lid)
    if not x: err(404,"Lecture not found","LECTURE_NOT_FOUND")
    classroom_or_403(x["classroomId"],user)
    regenerated=generate_notes(x.get("cleanTranscript") or x.get("rawTranscript", ""),x.get("title",x.get("topic","Lecture")))
    if body.section=="summary":
        x["summary"]=regenerated.get("overview",x.get("summary","")); value=x["summary"]
    else:
        x.setdefault("structuredNotes",{})[body.section]=regenerated.get(body.section,[] if body.section!="overview" else ""); value=x["structuredNotes"][body.section]
    store.save("lectures",lid,x); return ok({"section":body.section,"value":value})
@app.post("/api/lectures/{lid}/publish")
def publish(lid,user=Depends(teacher)):
    x=store.lectures.get(lid)
    if not x: err(404,"Lecture not found","LECTURE_NOT_FOUND")
    classroom=classroom_or_403(x["classroomId"],user); pdf=build_lecture_pdf(x,classroom); x.update({"status":"PUBLISHED","publishedAt":store.now()}); x["_pdf"]=pdf; x["pdfUrl"]=upload_pdf(x["classroomId"],lid,pdf); store.save("lectures",lid,x); rid=store.id(); store.resources[rid]={"resourceId":rid,"classroomId":x["classroomId"],"lectureId":lid,"title":x.get("title",x.get("topic","Lecture")),"description":"Reviewed lecture notes","resourceType":"LECTURE_PDF","fileUrl":x["pdfUrl"],"uploadedBy":user["userId"],"createdAt":store.now()}; store.save("resources",rid,store.resources[rid]); notify_publication(x["classroomId"],x,user["userId"]); return ok(x)
@app.get("/api/lectures/{lid}/pdf")
def pdf(lid,user=Depends(get_current_user)):
    from fastapi.responses import Response
    x=store.lectures.get(lid)
    if not x or "_pdf" not in x: err(404,"PDF not available","PDF_NOT_FOUND")
    classroom_or_403(x["classroomId"],user)
    return Response(x["_pdf"],media_type="application/pdf",headers={"Content-Disposition":f'inline; filename="{lid}.pdf"'})

@app.get("/api/classrooms/{cid}/resources")
def resources(cid,user=Depends(get_current_user)):
    classroom_or_403(cid,user)
    allowed={"PDF","IMAGE","DOCUMENT","LINK","LECTURE_PDF"}
    return ok([r for r in store.resources.values() if r["classroomId"]==cid and r.get("resourceType") in allowed])
@app.post("/api/resources")
def create_resource(body:ResourceCreate,user=Depends(teacher)):
    classroom_or_403(body.classroomId,user); rid=store.id(); x={"resourceId":rid,**body.model_dump(),"resourceType":body.resourceType.value,"uploadedBy":user["userId"],"createdAt":store.now()}; store.resources[rid]=x; store.save("resources",rid,x); return ok(x)
@app.post("/api/resources/upload")
async def upload_resource(classroomId:str=Form(...),file:UploadFile=File(...),title:str=Form(""),description:str=Form(""),resourceType:ResourceType=Form(ResourceType.DOCUMENT),lectureId:str|None=Form(None),user=Depends(teacher)):
    classroom_or_403(classroomId,user)
    if resourceType not in {ResourceType.PDF,ResourceType.IMAGE,ResourceType.DOCUMENT}: err(400,"Uploads must be PDF, IMAGE, or DOCUMENT resources","INVALID_RESOURCE_TYPE")
    content=await file.read()
    if not content: err(400,"The uploaded file is empty","EMPTY_FILE")
    if len(content)>50*1024*1024: err(413,"Files must be 50 MB or smaller","FILE_TOO_LARGE")
    rid=store.id(); file_url=upload_resource_file(classroomId,rid,file.filename or "resource",content,file.content_type)
    x={"resourceId":rid,"classroomId":classroomId,"lectureId":lectureId,"title":title.strip() or file.filename or "Classroom resource","description":description,"resourceType":resourceType.value,"fileUrl":file_url,"uploadedBy":user["userId"],"createdAt":store.now(),"_file":content,"_contentType":file.content_type or "application/octet-stream"}
    store.resources[rid]=x; store.save("resources",rid,x); return ok({k:v for k,v in x.items() if not k.startswith("_")})
@app.get("/api/resources/{rid}/file")
def download_resource(rid,user=Depends(get_current_user)):
    from fastapi.responses import Response
    x=store.resources.get(rid)
    if not x or "_file" not in x: err(404,"Resource file not available","RESOURCE_FILE_NOT_FOUND")
    classroom_or_403(x["classroomId"],user)
    return Response(x["_file"],media_type=x.get("_contentType","application/octet-stream"),headers={"Content-Disposition":f'inline; filename="{x.get("title","resource")}"'})
@app.delete("/api/resources/{rid}")
def delete_resource(rid,user=Depends(teacher)):
    x=store.resources.get(rid)
    if not x: err(404,"Resource not found","RESOURCE_NOT_FOUND")
    classroom_or_403(x["classroomId"],user); del store.resources[rid]
    if store.db: store.db.collection("resources").document(rid).delete()
    return ok({"resourceId":rid})
@app.post("/api/attendance/sessions")
def attendance(body:AttendanceSessionCreate,user=Depends(teacher)):
    classroom_or_403(body.classroomId,user); sid=store.id(); store.sessions[sid]={"sessionId":sid,**body.model_dump(exclude={"records"}),"markedBy":user["userId"],"createdAt":store.now()}; store.save("attendanceSessions",sid,store.sessions[sid])
    for record in body.records: rid=store.id(); store.records[rid]={"recordId":rid,"sessionId":sid,"lectureId":body.lectureId,"classroomId":body.classroomId,**record.model_dump()}; store.save("attendanceRecords",rid,store.records[rid])
    return ok(store.sessions[sid])
@app.get("/api/classrooms/{cid}/attendance")
def class_attendance(cid,user=Depends(get_current_user)):
    classroom_or_403(cid,user); return ok([dict(s,records=[r for r in store.records.values() if r["sessionId"]==s["sessionId"]]) for s in store.sessions.values() if s["classroomId"]==cid])
@app.get("/api/classrooms/{cid}/attendance/analytics")
def attendance_analytics(cid,user=Depends(teacher)):
    classroom=classroom_or_403(cid,user); students=[store.users.get(m["studentId"],{"userId":m["studentId"],"fullName":"Student","rollNumber":""}) for m in store.members.values() if m["classroomId"]==cid]
    sessions=[s for s in store.sessions.values() if s["classroomId"]==cid]; records=[r for r in store.records.values() if r["classroomId"]==cid]
    summary=[]
    for student in students:
        own=[r for r in records if r["studentId"]==student["userId"]]; total=len(own); present=sum(r["status"]=="PRESENT" for r in own); percentage=round(present/total*100,2) if total else 0
        summary.append({"studentId":student["userId"],"studentName":student.get("fullName","Student"),"rollNumber":student.get("rollNumber") or "","presentCount":present,"totalCount":total,"percentage":percentage,"isCritical":percentage<60})
    percentages=[x["percentage"] for x in summary]
    return ok({"classroomId":cid,"className":classroom["className"],"classAverage":round(sum(percentages)/len(percentages),2) if percentages else 0,"studentCount":len(students),"totalLecturesConducted":len(sessions),"below75Count":sum(x["percentage"]<75 for x in summary),"below60Count":sum(x["percentage"]<60 for x in summary),"students":summary})
@app.get("/api/students/me/attendance")
def student_attendance(user=Depends(require_role("STUDENT"))):
    rec=[r for r in store.records.values() if r["studentId"]==user["userId"]]; total=len(rec); present=sum(r["status"]=="PRESENT" for r in rec); absent=total-present; safe=max(0,int((present/0.75)-total)) if total else 0; needed=max(0,int(__import__('math').ceil((0.75*total-present)/0.25))) if total else 0; return ok({"totalLectures":total,"presentCount":present,"absentCount":absent,"attendancePercentage":round(present/total*100,2) if total else 0,"safeMisses":safe,"requiredConsecutiveClasses":needed})
@app.get("/api/classrooms/{cid}/tests")
def tests(cid,user=Depends(get_current_user)):
    classroom_or_403(cid,user); data=[t for t in store.tests.values() if t["classroomId"]==cid and (user["role"]=="TEACHER" or t.get("status")=="PUBLISHED")]
    return ok([student_test(t) if user["role"]=="STUDENT" else t for t in data])
def student_test(t):
    x=dict(t); x["questions"]=[{k:v for k,v in q.items() if k!="correctAnswers"} for q in t.get("questions",[])]; return x
@app.post("/api/tests")
def create_test(body:TestCreate,user=Depends(teacher)):
    classroom_or_403(body.classroomId,user); tid=store.id(); qs=[]
    for q in body.questions: qid=store.id(); item={"questionId":qid,"testId":tid,**q.model_dump(),"type":q.type.value}; qs.append(item)
    total=sum(q["marks"] for q in qs) or body.totalMarks
    x={"testId":tid,**body.model_dump(exclude={"questions"}),"questions":qs,"totalMarks":total,"startAt":body.startAt or "","deadlineAt":body.deadlineAt or "","status":"DRAFT","createdBy":user["userId"],"createdAt":store.now()}; store.tests[tid]=x; store.save("tests",tid,x)
    for q in qs: store.save("questions",q["questionId"],q)
    return ok(x)
@app.get("/api/tests/{tid}")
def get_test(tid,user=Depends(get_current_user)):
    t=store.tests.get(tid)
    if not t: err(404,"Test not found","TEST_NOT_FOUND")
    classroom_or_403(t["classroomId"],user)
    if user["role"]=="STUDENT" and t.get("status")!="PUBLISHED": err(404,"Test not found","TEST_NOT_FOUND")
    return ok(t if user["role"]=="TEACHER" else student_test(t))
@app.patch("/api/tests/{tid}")
def update_test(tid,body:TestUpdate,user=Depends(teacher)):
    t=store.tests.get(tid)
    if not t: err(404,"Test not found","TEST_NOT_FOUND")
    classroom_or_403(t["classroomId"],user); t["status"]=body.status.value; store.save("tests",tid,t); return ok(t)
@app.post("/api/tests/{tid}/attempts")
def start_attempt(tid,user=Depends(require_role("STUDENT"))):
    t=store.tests.get(tid)
    if not t: err(404,"Test not found","TEST_NOT_FOUND")
    classroom_or_403(t["classroomId"],user)
    if t.get("status")!="PUBLISHED": err(409,"This test is not available","TEST_NOT_AVAILABLE")
    if t.get("deadlineAt"):
        try:
            deadline=datetime.fromisoformat(t["deadlineAt"].replace("Z","+00:00"))
            if deadline.tzinfo is None: deadline=deadline.replace(tzinfo=timezone.utc)
            if deadline < datetime.now(timezone.utc): err(409,"This test has expired","TEST_EXPIRED")
        except ValueError: pass
    if t.get("oneAttemptOnly") and any(a["testId"]==tid and a["studentId"]==user["userId"] for a in store.attempts.values()): err(409,"Only one attempt is allowed","DUPLICATE_ATTEMPT")
    aid=store.id(); x={"attemptId":aid,"testId":tid,"studentId":user["userId"],"startedAt":store.now(),"submittedAt":None,"status":"IN_PROGRESS","score":0,"maxScore":t["totalMarks"]}; store.attempts[aid]=x; store.save("testAttempts",aid,x); return ok(x)
@app.post("/api/tests/{tid}/submit")
def submit(tid,body:SubmitAttempt,user=Depends(require_role("STUDENT"))):
    t=store.tests.get(tid); a=next((a for a in store.attempts.values() if a["testId"]==tid and a["studentId"]==user["userId"] and a["status"]=="IN_PROGRESS"),None)
    if not t or not a: err(404,"Active attempt not found","ATTEMPT_NOT_FOUND")
    score=0; qs={q["questionId"]:q for q in t["questions"]}
    for qid,answer in body.answers.items(): q=qs.get(qid); val=answer if isinstance(answer,list) else [answer]; correct=q and q["type"] in {"MCQ","MULTI_SELECT","TRUE_FALSE"} and set(val)==set(q["correctAnswers"]); score += q["marks"] if correct else 0; store.answers[store.id()]={"answerId":store.id(),"attemptId":a["attemptId"],"questionId":qid,"answer":answer}
    has_descriptive=any(q["type"] in {"SHORT_ANSWER","LONG_ANSWER"} and q["questionId"] in body.answers for q in t["questions"])
    a.update({"submittedAt":store.now(),"status":"SUBMITTED" if has_descriptive else "GRADED","score":score,"isDescriptivePending":has_descriptive}); store.save("testAttempts",a["attemptId"],a); return ok(a)
@app.get("/api/tests/{tid}/analytics")
def analytics(tid,user=Depends(teacher)):
    t=store.tests.get(tid)
    if not t: err(404,"Test not found","TEST_NOT_FOUND")
    classroom_or_403(t["classroomId"],user); arr=[a for a in store.attempts.values() if a["testId"]==tid and a["status"]!="IN_PROGRESS"]; scores=[a["score"] for a in arr]; return ok({"testId":tid,"title":t["title"],"totalStudents":len([m for m in store.members.values() if m["classroomId"]==t["classroomId"]]),"submitted":len(arr),"pending":len([m for m in store.members.values() if m["classroomId"]==t["classroomId"]])-len(arr),"averageScore":sum(scores)/len(scores) if scores else 0,"highestScore":max(scores) if scores else 0,"lowestScore":min(scores) if scores else 0,"questionStats":[]})
@app.post("/api/ai/lectures/{lid}/generate-quiz")
def ai_quiz(lid,body:QuizGenerate,user=Depends(teacher)):
    x=store.lectures.get(lid)
    if not x: err(404,"Lecture not found","LECTURE_NOT_FOUND")
    classroom_or_403(x["classroomId"],user); questions=[]
    for index,question in enumerate(generate_quiz(x,body),start=1):
        questions.append({"questionId":store.id(),"testId":"","order":index,**question})
    return ok({"questions":questions})
@app.get("/api/notifications")
def notifications(user=Depends(get_current_user)): return ok([n for n in store.notifications.values() if n["userId"]==user["userId"]])
@app.patch("/api/notifications/{nid}")
def read_notification(nid,user=Depends(get_current_user)):
    item=store.notifications.get(nid)
    if not item or item.get("userId")!=user["userId"]: err(404,"Notification not found","NOTIFICATION_NOT_FOUND")
    item["isRead"]=True; store.save("notifications",nid,item); return ok(item)

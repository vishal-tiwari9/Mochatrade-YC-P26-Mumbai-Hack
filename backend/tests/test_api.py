from fastapi.testclient import TestClient
from app.main import app
from app.store import store
from app.schemas.models import QuizGenerate, QuestionType
from app.services.groq_service import clean_transcript, generate_notes, generate_quiz
client=TestClient(app)
def h(role="TEACHER",uid="teacher-1"): return {"Authorization":f"Bearer demo:{uid}:{role}"}
def test_health(): assert client.get('/health').json()['success'] is True
def test_register_fcm_token():
    response=client.put('/api/devices/fcm-token',headers=h('STUDENT','student-1'),json={'token':'test-device-token'})
    assert response.status_code==200
    assert response.json()['data']=={'registered':True}
    assert store.users['student-1']['fcmToken']=='test-device-token'
def test_ai_fallbacks_match_the_structured_contract():
    assert clean_transcript('  Whisper raw text.  ')=='Whisper raw text.'
    notes=generate_notes('Today we discuss deadlocks and safe states.', 'Deadlocks')
    assert notes['title']=='Deadlocks'
    assert notes['detailedNotes'][0]['heading']=='Transcript'
    quiz=generate_quiz({'topic':'Deadlocks','cleanTranscript':'Safe states avoid deadlock.'},QuizGenerate(questionCount=2,types=[QuestionType.MCQ]))
    assert len(quiz)==2
    assert all(question['type']=='MCQ' and question['correctAnswers'] for question in quiz)
def test_teacher_can_regenerate_a_lecture_section():
    classroom=client.post('/api/classrooms',headers=h(),json={'className':'AI Notes','subjectName':'Operating Systems'}).json()['data']
    lecture=client.post('/api/lectures',headers=h(),json={'classroomId':classroom['classroomId'],'title':'Deadlocks','topic':'Deadlocks','rawTranscript':'A deadlock can involve a safe state discussion.'}).json()['data']
    response=client.post(f"/api/lectures/{lecture['lectureId']}/regenerate-section",headers=h(),json={'section':'overview'})
    assert response.status_code==200
    assert response.json()['data']['section']=='overview'
    assert response.json()['data']['value']
def test_classroom_and_student_safe_test():
    c=client.post('/api/classrooms',headers=h(),json={"className":"Operating Systems","subjectName":"Operating Systems","semester":"6","division":"A"}).json()['data']
    store.users['student-1']={"userId":"student-1","fullName":"Dev Kanojiya","role":"STUDENT"}
    assert client.post('/api/classrooms/join',headers=h('STUDENT','student-1'),json={"joinCode":c['joinCode']}).status_code==200
    t=client.post('/api/tests',headers=h(),json={"classroomId":c['classroomId'],"title":"Deadlocks","questions":[{"type":"MCQ","questionText":"x","options":["a"],"correctAnswers":["a"],"marks":2}]}).json()['data']
    assert client.patch('/api/tests/'+t['testId'],headers=h(),json={"status":"PUBLISHED"}).status_code==200
    student=client.get('/api/tests/'+t['testId'],headers=h('STUDENT','student-1')).json()['data']; assert 'correctAnswers' not in student['questions'][0]

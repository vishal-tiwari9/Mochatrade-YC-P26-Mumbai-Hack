# ClassAI

ClassAI is the teacher-side second half of the smart classroom system: a Vite/React recording studio, a local Faster-Whisper service, and a FastAPI backend using the exact shared routes and enum values from the Android contract.

For durable cross-session context, start with [memory/README.md](memory/README.md). It records architecture, status, verified checks, real blockers, and the next-session checklist.

## Run locally

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload --port 8000
```

Development mode accepts demo Firebase tokens such as `demo:teacher-1:TEACHER` and `demo:student-1:STUDENT`. For production, set `USE_IN_MEMORY=false` and provide the Firebase Admin values in `.env`. Set `GROQ_API_KEY` to enable Groq cleanup/notes; without it, the deterministic local fallback still produces reviewable notes.

### Local Whisper

```powershell
cd local-whisper
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

The first transcription downloads the selected Faster-Whisper model. `WHISPER_DEVICE=cuda` enables GPU mode; otherwise the service uses CPU/int8. Raw audio is written to a temporary file and deleted after transcription.

### Teacher web

```powershell
cd teacher-web
npm install
npm run dev
```

Optional `.env` values are `VITE_API_URL`, `VITE_WHISPER_URL`, and the `VITE_FIREBASE_*` browser configuration values in `teacher-web/.env.example`. The recording UI uses `MediaRecorder`, persists chunks to IndexedDB, stops tracks promptly, and never uploads audio to Firebase.

## End-to-end flow

Start Whisper, backend, and web. The teacher web includes Login, Recorder Dashboard, Lecture History, Lecture Detail/PDF Preview, Attendance, Resources, Quiz Studio, and Classroom management routes. In the recorder, select a classroom, enter a topic, click Start Lecture, then Stop & Process. The local service returns transcript segments; the backend creates a `READY_FOR_REVIEW` lecture and structured notes. Review the overview/transcript, save a draft, preview the server-generated PDF, and publish. Production Firebase mode loads and saves Firestore collections, uploads PDFs to Storage, and sends FCM notifications; local mode remains available for development.

## Contract and security

All JSON APIs return `{success,data,message}` and errors additionally include `code`. Firebase ID tokens are validated server-side. Student responses omit raw transcripts and question answer keys. Firestore and Storage rules are included at the repository root. No multilingual translation or personalized revision features are included.

## Firebase production setup

Use a Firebase/Google Cloud connector when one is attached to this chat; this avoids placing service-account credentials in conversation. The connector must enable Firebase Authentication (Email/Password), Firestore, Storage, and Cloud Messaging, deploy `firestore.rules` and `storage.rules`, and create the teacher/student user documents with server-owned `role` values. Then populate `backend/.env` and `teacher-web/.env` from their example files. Never place the Firebase Admin private key or Groq key in the web or Android app.

# dev

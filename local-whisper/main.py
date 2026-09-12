import os, tempfile, logging
from threading import Lock
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
app=FastAPI(title="ClassAI Local Whisper")
app.add_middleware(CORSMiddleware,allow_origins=os.getenv("WHISPER_ALLOWED_ORIGINS","http://localhost:5173,http://127.0.0.1:5173").split(","),allow_credentials=False,allow_methods=["GET","POST"],allow_headers=["*"])
logging.basicConfig(level=logging.INFO)
ALLOWED={"tiny","base","small","medium","large-v3"}
_models={}
_models_lock=Lock()
@app.exception_handler(HTTPException)
async def classai_error(_,exc): return JSONResponse(exc.status_code,{"success":False,"data":None,"message":str(exc.detail),"code":"WHISPER_ERROR"})
def get_model(model_size:str):
    """Load each model once per local service process; model files remain cached by Hugging Face."""
    with _models_lock:
        if model_size not in _models:
            from faster_whisper import WhisperModel
            device="cuda" if os.getenv("WHISPER_DEVICE","cpu")=="cuda" else "cpu"
            compute=os.getenv("WHISPER_COMPUTE_TYPE","int8" if device=="cpu" else "float16")
            logging.info("loading_whisper_model size=%s device=%s",model_size,device)
            _models[model_size]=WhisperModel(model_size,device=device,compute_type=compute)
        return _models[model_size]
@app.on_event("startup")
def preload_default_model():
    model_size=os.getenv("WHISPER_PRELOAD_MODEL","small")
    if model_size in ALLOWED:
        try: get_model(model_size)
        except Exception: logging.exception("whisper_model_preload_failed")
@app.get("/health")
def health(): return {"success":True,"data":{"status":"healthy"},"message":None}
@app.get("/models")
def models(): return {"success":True,"data":{"available":sorted(ALLOWED),"loaded":sorted(_models)},"message":None}
@app.post("/transcribe")
async def transcribe(audio:UploadFile=File(...),modelSize:str=Form("small"),language:str|None=Form(None)):
    if modelSize not in ALLOWED: raise HTTPException(400,"Unsupported modelSize")
    if not audio.filename: raise HTTPException(400,"Audio file is required")
    suffix=os.path.splitext(audio.filename)[1] or ".webm"
    path=None
    try:
        with tempfile.NamedTemporaryFile(delete=False,suffix=suffix) as f:
            path=f.name
            while chunk:=await audio.read(1024*1024): f.write(chunk)
        model=get_model(modelSize)
        segments,info=model.transcribe(path,language=language, vad_filter=True)
        data=[{"start":round(s.start,2),"end":round(s.end,2),"text":s.text.strip()} for s in segments if s.text.strip()]
        transcript=" ".join(x["text"] for x in data)
        if not transcript: raise HTTPException(422,"Empty transcript")
        return {"success":True,"data":{"language":info.language,"duration":info.duration,"transcript":transcript,"segments":data},"message":None}
    except HTTPException: raise
    except ImportError: raise HTTPException(503,"Faster-Whisper is not installed")
    except Exception as e: logging.exception("transcription_failed"); raise HTTPException(503,f"Transcription failed: {type(e).__name__}")
    finally:
        if path and os.path.exists(path): os.unlink(path)

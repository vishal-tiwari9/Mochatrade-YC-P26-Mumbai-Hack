import json
from pathlib import Path

from pydantic import ValidationError

from ..schemas.ai import GeneratedQuiz, StructuredLectureNotes
from ..schemas.models import QuestionType


PROMPT_DIR = Path(__file__).resolve().parents[1] / "prompts"


def _prompt(name: str) -> str:
    return (PROMPT_DIR / name).read_text(encoding="utf-8").strip()


def _fallback_notes(transcript: str, title: str) -> dict:
    return StructuredLectureNotes(title=title, overview=transcript[:1000], detailedNotes=[{"heading": "Transcript", "content": transcript}]).model_dump()


def _json_from_response(raw: str) -> str:
    text = raw.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[-1]
        if text.rstrip().endswith("```"):
            text = text.rstrip()[:-3]
    return text.strip()


def _complete(messages: list[dict]) -> str:
    from groq import Groq
    from ..core.config import get_settings
    result = Groq(api_key=get_settings().groq_api_key).chat.completions.create(
        model="llama-3.3-70b-versatile", messages=messages, temperature=0.1, response_format={"type": "json_object"}
    )
    return result.choices[0].message.content or "{}"


def _plain_complete(messages: list[dict]) -> str:
    from groq import Groq
    from ..core.config import get_settings
    result = Groq(api_key=get_settings().groq_api_key).chat.completions.create(
        model="llama-3.3-70b-versatile", messages=messages, temperature=0.1
    )
    return result.choices[0].message.content or ""


def clean_transcript(raw_transcript: str) -> str:
    """Clean Whisper output without substituting or inventing lecture content."""
    from ..core.config import get_settings
    raw = raw_transcript.strip()
    if not raw or not get_settings().groq_api_key:
        return raw
    try:
        cleaned = _plain_complete([
            {"role": "system", "content": _prompt("clean_transcript.txt")},
            {"role": "user", "content": raw},
        ]).strip()
        return cleaned or raw
    except Exception:
        return raw


def generate_notes(transcript: str, title: str) -> dict:
    """Generate Pydantic-validated notes; repair malformed model JSON once, then preserve the source transcript."""
    from ..core.config import get_settings
    if not get_settings().groq_api_key:
        return _fallback_notes(transcript, title)

    schema = StructuredLectureNotes.model_json_schema()
    raw = _complete([
        {"role": "system", "content": _prompt("generate_notes.txt")},
        {"role": "user", "content": f"Title: {title}\nSchema: {json.dumps(schema)}\nCleaned transcript:\n{transcript}"},
    ])
    for attempt in range(2):
        try:
            notes = StructuredLectureNotes.model_validate_json(_json_from_response(raw))
            if not notes.title:
                notes.title = title
            return notes.model_dump()
        except (ValidationError, ValueError, json.JSONDecodeError) as error:
            if attempt:
                break
            raw = _complete([
                {"role": "system", "content": "Repair this into valid JSON only. Do not add facts."},
                {"role": "user", "content": f"Schema: {json.dumps(schema)}\nValidation problem: {error}\nJSON to repair: {raw}"},
            ])
    return _fallback_notes(transcript, title)


def _fallback_quiz(lecture: dict, request) -> list[dict]:
    notes = lecture.get("structuredNotes") or {}
    text = notes.get("overview", "") or lecture.get("cleanTranscript", "")
    types = request.types or [QuestionType.MCQ]
    questions = []
    for index in range(request.questionCount):
        kind = types[index % len(types)]
        answer = text[:180] or "Review the lecture material."
        options = [answer] if kind in {QuestionType.MCQ, QuestionType.MULTI_SELECT, QuestionType.TRUE_FALSE} else []
        questions.append({"type": kind.value, "questionText": f"What did the lecture explain about {lecture.get('topic', lecture.get('title', 'this topic'))}?", "options": options, "correctAnswers": [answer] if options else [], "marks": 2})
    return questions


def generate_quiz(lecture: dict, request) -> list[dict]:
    from ..core.config import get_settings
    if not get_settings().groq_api_key:
        return _fallback_quiz(lecture, request)

    allowed = [item.value for item in (request.types or list(QuestionType))]
    source = {"cleanTranscript": lecture.get("cleanTranscript", ""), "structuredNotes": lecture.get("structuredNotes") or {}}
    raw = _complete([
        {"role": "system", "content": _prompt("generate_quiz.txt")},
        {"role": "user", "content": f"Question count: {request.questionCount}\nDifficulty: {request.difficulty}\nAllowed types: {allowed}\nSource material: {json.dumps(source)}"},
    ])
    try:
        quiz = GeneratedQuiz.model_validate_json(_json_from_response(raw))
        allowed_set = set(allowed)
        valid = [question.model_dump(mode="json") for question in quiz.questions if question.type.value in allowed_set]
        return valid[:request.questionCount] or _fallback_quiz(lecture, request)
    except (ValidationError, ValueError, json.JSONDecodeError):
        return _fallback_quiz(lecture, request)

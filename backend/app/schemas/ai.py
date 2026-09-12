from pydantic import BaseModel, Field
from .models import QuestionType


class KeyConcept(BaseModel):
    title: str
    explanation: str


class Definition(BaseModel):
    term: str
    definition: str


class DetailedNote(BaseModel):
    heading: str
    content: str


class StructuredLectureNotes(BaseModel):
    title: str = ""
    overview: str = ""
    topicsCovered: list[str] = Field(default_factory=list)
    keyConcepts: list[KeyConcept] = Field(default_factory=list)
    definitions: list[Definition] = Field(default_factory=list)
    detailedNotes: list[DetailedNote] = Field(default_factory=list)
    examples: list[str] = Field(default_factory=list)
    teacherImportantPoints: list[str] = Field(default_factory=list)
    quickSummary: list[str] = Field(default_factory=list)
    practiceQuestions: list[str] = Field(default_factory=list)


class GeneratedQuizQuestion(BaseModel):
    type: QuestionType
    questionText: str
    options: list[str] = Field(default_factory=list)
    correctAnswers: list[str] = Field(default_factory=list)
    marks: int = Field(default=1, ge=1)


class GeneratedQuiz(BaseModel):
    questions: list[GeneratedQuizQuestion] = Field(default_factory=list)

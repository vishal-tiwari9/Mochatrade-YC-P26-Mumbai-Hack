from typing import Any, Optional, Literal
from pydantic import BaseModel
from enum import Enum
class UserRole(str,Enum): TEACHER="TEACHER"; STUDENT="STUDENT"
class AttendanceStatus(str,Enum): PRESENT="PRESENT"; ABSENT="ABSENT"
class LectureStatus(str,Enum): DRAFT="DRAFT"; PROCESSING="PROCESSING"; READY_FOR_REVIEW="READY_FOR_REVIEW"; PUBLISHED="PUBLISHED"; FAILED="FAILED"
class TestStatus(str,Enum): DRAFT="DRAFT"; PUBLISHED="PUBLISHED"; CLOSED="CLOSED"
class QuestionType(str,Enum): MCQ="MCQ"; MULTI_SELECT="MULTI_SELECT"; TRUE_FALSE="TRUE_FALSE"; SHORT_ANSWER="SHORT_ANSWER"; LONG_ANSWER="LONG_ANSWER"
class AttemptStatus(str,Enum): IN_PROGRESS="IN_PROGRESS"; SUBMITTED="SUBMITTED"; GRADED="GRADED"
class ResourceType(str,Enum): PDF="PDF"; IMAGE="IMAGE"; DOCUMENT="DOCUMENT"; LINK="LINK"; LECTURE_PDF="LECTURE_PDF"
class ClassroomCreate(BaseModel): className:str; subjectName:str; subjectCode:str=""; semester:str=""; division:str=""
class JoinClassroom(BaseModel): joinCode:str
class StudentCreate(BaseModel): fullName:str; email:str; rollNumber:Optional[str]=None
class AttendanceRecordIn(BaseModel): studentId:str; status:AttendanceStatus
class AttendanceSessionCreate(BaseModel): classroomId:str; lectureId:Optional[str]=None; date:str=""; records:list[AttendanceRecordIn]
class ResourceCreate(BaseModel): classroomId:str; title:str; description:str=""; resourceType:ResourceType; fileUrl:Optional[str]=None; lectureId:Optional[str]=None
class QuestionIn(BaseModel): type:QuestionType; questionText:str; options:list[str]=[]; correctAnswers:list[str]=[]; marks:float=1; order:int=0
class TestCreate(BaseModel): classroomId:str; lectureId:Optional[str]=None; title:str; description:str=""; totalMarks:float=0; durationMinutes:Optional[int]=None; startAt:Optional[str]=None; deadlineAt:Optional[str]=None; showScoreImmediately:bool=True; shuffleQuestions:bool=False; oneAttemptOnly:bool=True; questions:list[QuestionIn]=[]
class TestUpdate(BaseModel): status:TestStatus
class FcmTokenUpdate(BaseModel): token:str
class AttemptAnswer(BaseModel): questionId:str; answer:Any=None
class SubmitAttempt(BaseModel): answers:dict[str,list[str]]={}
class QuizGenerate(BaseModel): questionCount:int=10; difficulty:str="MEDIUM"; types:list[QuestionType]=[QuestionType.MCQ,QuestionType.TRUE_FALSE]
class LectureUpdate(BaseModel): title:Optional[str]=None; structuredNotes:Optional[dict]=None; summary:Optional[str]=None
class LectureSectionRegenerate(BaseModel): section:Literal["overview","topicsCovered","keyConcepts","definitions","detailedNotes","examples","teacherImportantPoints","quickSummary","practiceQuestions","summary"]

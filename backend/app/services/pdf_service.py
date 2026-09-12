from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
def build_lecture_pdf(lecture, classroom):
    out=BytesIO(); doc=SimpleDocTemplate(out,pagesize=A4,rightMargin=18*mm,leftMargin=18*mm,topMargin=16*mm,bottomMargin=16*mm); styles=getSampleStyleSheet(); notes=lecture.get("structuredNotes") or {}; story=[Paragraph("ClassAI",styles["Title"]),Paragraph(classroom.get("subjectName","").upper(),styles["Heading2"]),Paragraph(lecture.get("title",lecture.get("topic","Lecture")).upper(),styles["Heading1"]),Paragraph(lecture.get("lectureDate","") ,styles["Normal"]),Spacer(1,8*mm)]
    sections=[("LECTURE OVERVIEW",[notes.get("overview",lecture.get("summary",""))]),("TOPICS COVERED",notes.get("topicsCovered",[])),("KEY CONCEPTS",[f"<b>{x.get('title','')}</b>: {x.get('explanation','')}" for x in notes.get("keyConcepts",[])]),("DETAILED NOTES",[f"<b>{x.get('heading','')}</b><br/>{x.get('content','')}" for x in notes.get("detailedNotes",[])]),("DEFINITIONS",[f"<b>{x.get('term','')}</b>: {x.get('definition','')}" for x in notes.get("definitions",[])]),("EXAMPLES DISCUSSED",notes.get("examples",[])),("TEACHER'S IMPORTANT POINTS",notes.get("teacherImportantPoints",[])),("QUICK SUMMARY",notes.get("quickSummary",[])),("PRACTICE QUESTIONS",notes.get("practiceQuestions",[]))]
    for heading,items in sections:
        if items: story += [Paragraph(heading,styles["Heading2"])] + [Paragraph(str(item),styles["BodyText"]) for item in items] + [Spacer(1,4*mm)]
    story.append(Paragraph("Generated from classroom lecture. Reviewed and published by teacher.",styles["Italic"])); doc.build(story); return out.getvalue()


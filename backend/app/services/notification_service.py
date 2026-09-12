def notify_publication(classroom_id: str, lecture: dict, teacher_id: str):
    from ..store import store
    students=[m["studentId"] for m in store.members.values() if m["classroomId"]==classroom_id]
    for uid in students:
        nid=store.id(); store.notifications[nid]={"notificationId":nid,"userId":uid,"type":"LECTURE_NOTES_PUBLISHED","title":"New Lecture Notes","body":f"{lecture.get('title',lecture.get('topic','Lecture'))} notes are now available.","createdAt":store.now(),"isRead":False}; store.save("notifications",nid,store.notifications[nid])
        absent=any(r.get("lectureId")==lecture["lectureId"] and r.get("studentId")==uid and r.get("status")=="ABSENT" for r in store.records.values())
        if absent:
            nid=store.id(); store.notifications[nid]={"notificationId":nid,"userId":uid,"type":"ABSENT_CATCHUP_READY","title":"Catch Up","body":f"You missed today's {lecture.get('title',lecture.get('topic','lecture'))} lecture. Notes are ready.","createdAt":store.now(),"isRead":False}; store.save("notifications",nid,store.notifications[nid])
    # FCM is intentionally best-effort: device tokens are stored by the Android app.
    from ..core.config import get_settings
    if not get_settings().use_in_memory:
        try:
            from firebase_admin import messaging
            tokens=[u.get("fcmToken") for u in store.users.values() if u.get("userId") in students and u.get("fcmToken")]
            if tokens: messaging.send_each([messaging.Message(notification=messaging.Notification("New Lecture Notes",f"{lecture.get('title','Lecture')} notes are now available."),token=t) for t in tokens])
        except Exception: pass

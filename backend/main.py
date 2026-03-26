from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import sqlite3
import hashlib

app = FastAPI(title="Vardhman School Management API v2")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "vardhman.db"

# ─────────────────────────────────────────────────────────
# DB Helpers
# ─────────────────────────────────────────────────────────

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()

# ─────────────────────────────────────────────────────────
# DB Init & Seed
# ─────────────────────────────────────────────────────────

def init_db():
    conn = get_db()
    cur  = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS students (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            name     TEXT    NOT NULL,
            email    TEXT    UNIQUE NOT NULL,
            class    TEXT    NOT NULL,
            password TEXT    NOT NULL
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS attendance (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
            date       TEXT    NOT NULL,
            status     TEXT    NOT NULL DEFAULT 'Present',
            UNIQUE(student_id, date)
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS results (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
            subject    TEXT    NOT NULL,
            marks      INTEGER NOT NULL,
            max_marks  INTEGER NOT NULL DEFAULT 100,
            exam_type  TEXT    NOT NULL DEFAULT 'Unit Test',
            UNIQUE(student_id, subject, exam_type)
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS notices (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            title      TEXT NOT NULL,
            body       TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (date('now'))
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS fees (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id  INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
            amount      INTEGER NOT NULL,
            status      TEXT    NOT NULL DEFAULT 'Pending',
            due_date    TEXT    NOT NULL,
            paid_date   TEXT,
            description TEXT    NOT NULL DEFAULT 'Tuition Fee'
        )
    """)

    # Seed students
    demo_students = [
        ("Aarav Patel",  "aarav@vardhman.edu",  "10-A", hash_pw("student123")),
        ("Priya Sharma", "priya@vardhman.edu",  "9-B",  hash_pw("student123")),
        ("Rohan Mehta",  "rohan@vardhman.edu",  "11-C", hash_pw("student123")),
    ]
    for s in demo_students:
        cur.execute("INSERT OR IGNORE INTO students (name,email,class,password) VALUES (?,?,?,?)", s)

    # Seed attendance
    dates    = ["2025-06-02","2025-06-03","2025-06-04","2025-06-05","2025-06-06",
                "2025-06-09","2025-06-10","2025-06-11","2025-06-12","2025-06-13"]
    statuses = ["Present","Present","Absent","Present","Present",
                "Present","Absent","Present","Present","Present"]
    for sid in [1,2,3]:
        for d, st in zip(dates, statuses):
            cur.execute("INSERT OR IGNORE INTO attendance (student_id,date,status) VALUES (?,?,?)",(sid,d,st))

    # Seed results
    subjects  = ["Mathematics","Science","English","Hindi","Social Studies"]
    marks_map = {1:[88,92,76,81,85], 2:[72,68,90,85,78], 3:[95,88,82,79,91]}
    for sid, mlist in marks_map.items():
        for subj, m in zip(subjects, mlist):
            cur.execute(
                "INSERT OR IGNORE INTO results (student_id,subject,marks,max_marks,exam_type) VALUES (?,?,?,100,'Half Yearly')",
                (sid, subj, m)
            )

    # Seed notices
    notices = [
        ("Annual Sports Day 🏅","Annual Sports Day will be held on 15th July 2025. All students must participate.","2025-06-01"),
        ("Fee Reminder 💰",     "Last date to submit Q2 fees is 30th June 2025. Contact admin for queries.",      "2025-06-05"),
        ("Exam Schedule 📝",    "Half-yearly exams begin 20th July 2025. Timetable issued to all classes.",        "2025-06-10"),
    ]
    for title, body, dt in notices:
        cur.execute(
            "INSERT OR IGNORE INTO notices (title,body,created_at) SELECT ?,?,? WHERE NOT EXISTS (SELECT 1 FROM notices WHERE title=?)",
            (title, body, dt, title)
        )

    # Seed fees
    fees = [
        (1,12000,"Paid",   "2025-04-30","2025-04-10","Q1 Tuition Fee"),
        (1, 5000,"Pending","2025-07-31", None,        "Q2 Tuition Fee"),
        (2,12000,"Paid",   "2025-04-30","2025-04-15","Q1 Tuition Fee"),
        (2, 5000,"Pending","2025-07-31", None,        "Q2 Tuition Fee"),
        (3,12000,"Paid",   "2025-04-30","2025-04-08","Q1 Tuition Fee"),
        (3, 5000,"Paid",   "2025-07-31","2025-06-01","Q2 Tuition Fee"),
    ]
    for sid, amt, st, due, paid, desc in fees:
        cur.execute(
            "INSERT OR IGNORE INTO fees (student_id,amount,status,due_date,paid_date,description) "
            "SELECT ?,?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM fees WHERE student_id=? AND description=?)",
            (sid,amt,st,due,paid,desc,sid,desc)
        )

    conn.commit()
    conn.close()


# ─────────────────────────────────────────────────────────
# Schemas
# ─────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str
    role: str

class StudentCreate(BaseModel):
    name: str
    email: str
    class_name: str
    password: str

class AttendanceRecord(BaseModel):
    student_id: int
    status: str

class AttendanceBulk(BaseModel):
    date: str
    records: List[AttendanceRecord]

class ResultCreate(BaseModel):
    student_id: int
    subject: str
    marks: int
    max_marks: int = 100
    exam_type: str = "Unit Test"

class NoticeCreate(BaseModel):
    title: str
    body: str

class FeeCreate(BaseModel):
    student_id: int
    amount: int
    due_date: str
    description: str = "Tuition Fee"

class FeeStatusUpdate(BaseModel):
    status: str
    paid_date: Optional[str] = None


# ─────────────────────────────────────────────────────────
# Auth
# ─────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "Vardhman School API v2 🎓"}

@app.post("/login")
def login(body: LoginRequest):
    if body.role == "admin":
        if body.email == "admin@vardhman.edu" and body.password == "admin123":
            return {"success":True,"role":"admin","name":"Administrator"}
        raise HTTPException(401,"Invalid admin credentials")
    if body.role == "student":
        conn = get_db()
        row  = conn.execute(
            "SELECT * FROM students WHERE email=? AND password=?",
            (body.email, hash_pw(body.password))
        ).fetchone()
        conn.close()
        if row:
            return {"success":True,"role":"student","id":row["id"],
                    "name":row["name"],"email":row["email"],"class":row["class"]}
        raise HTTPException(401,"Invalid student credentials")
    raise HTTPException(400,"Invalid role")


# ─────────────────────────────────────────────────────────
# Students
# ─────────────────────────────────────────────────────────

@app.get("/students")
def get_students():
    conn = get_db()
    rows = conn.execute("SELECT id,name,email,class FROM students").fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post("/students", status_code=201)
def add_student(body: StudentCreate):
    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO students (name,email,class,password) VALUES (?,?,?,?)",
            (body.name, body.email, body.class_name, hash_pw(body.password))
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(400,"Email already exists")
    conn.close()
    return {"message":"Student added"}

@app.delete("/students/{sid}")
def delete_student(sid: int):
    conn = get_db()
    cur  = conn.execute("DELETE FROM students WHERE id=?", (sid,))
    conn.commit()
    conn.close()
    if cur.rowcount == 0:
        raise HTTPException(404,"Student not found")
    return {"message":"Student deleted"}


# ─────────────────────────────────────────────────────────
# Attendance
# ─────────────────────────────────────────────────────────

@app.get("/attendance")
def get_attendance(student_id: Optional[int]=None, date: Optional[str]=None):
    conn   = get_db()
    q      = "SELECT a.*,s.name,s.class FROM attendance a JOIN students s ON a.student_id=s.id WHERE 1=1"
    params = []
    if student_id: q += " AND a.student_id=?"; params.append(student_id)
    if date:       q += " AND a.date=?";        params.append(date)
    q += " ORDER BY a.date DESC,s.name"
    rows = conn.execute(q, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post("/attendance/bulk")
def mark_attendance_bulk(body: AttendanceBulk):
    conn = get_db()
    for rec in body.records:
        conn.execute(
            "INSERT INTO attendance (student_id,date,status) VALUES (?,?,?) "
            "ON CONFLICT(student_id,date) DO UPDATE SET status=excluded.status",
            (rec.student_id, body.date, rec.status)
        )
    conn.commit()
    conn.close()
    return {"message":f"Attendance saved for {body.date}"}

@app.get("/attendance/summary/{sid}")
def attendance_summary(sid: int):
    conn  = get_db()
    rows  = conn.execute(
        "SELECT status,COUNT(*) as cnt FROM attendance WHERE student_id=? GROUP BY status",(sid,)
    ).fetchall()
    conn.close()
    s       = {r["status"]:r["cnt"] for r in rows}
    total   = sum(s.values())
    present = s.get("Present",0)
    return {"total":total,"present":present,"absent":s.get("Absent",0),
            "percentage": round((present/total)*100,1) if total else 0}


# ─────────────────────────────────────────────────────────
# Results
# ─────────────────────────────────────────────────────────

@app.get("/results")
def get_results(student_id: Optional[int]=None, exam_type: Optional[str]=None):
    conn   = get_db()
    q      = "SELECT r.*,s.name,s.class FROM results r JOIN students s ON r.student_id=s.id WHERE 1=1"
    params = []
    if student_id: q += " AND r.student_id=?"; params.append(student_id)
    if exam_type:  q += " AND r.exam_type=?";  params.append(exam_type)
    q += " ORDER BY s.name,r.subject"
    rows = conn.execute(q, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post("/results", status_code=201)
def add_result(body: ResultCreate):
    if not (0 <= body.marks <= body.max_marks):
        raise HTTPException(400,"Marks must be 0–max_marks")
    conn = get_db()
    conn.execute(
        "INSERT INTO results (student_id,subject,marks,max_marks,exam_type) VALUES (?,?,?,?,?) "
        "ON CONFLICT(student_id,subject,exam_type) DO UPDATE SET marks=excluded.marks,max_marks=excluded.max_marks",
        (body.student_id, body.subject, body.marks, body.max_marks, body.exam_type)
    )
    conn.commit()
    conn.close()
    return {"message":"Result saved"}

@app.delete("/results/{rid}")
def delete_result(rid: int):
    conn = get_db()
    cur  = conn.execute("DELETE FROM results WHERE id=?", (rid,))
    conn.commit()
    conn.close()
    if cur.rowcount == 0:
        raise HTTPException(404,"Result not found")
    return {"message":"Result deleted"}


# ─────────────────────────────────────────────────────────
# Notices
# ─────────────────────────────────────────────────────────

@app.get("/notices")
def get_notices():
    conn = get_db()
    rows = conn.execute("SELECT * FROM notices ORDER BY created_at DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post("/notices", status_code=201)
def add_notice(body: NoticeCreate):
    conn = get_db()
    conn.execute("INSERT INTO notices (title,body,created_at) VALUES (?,?,date('now'))",(body.title,body.body))
    conn.commit()
    conn.close()
    return {"message":"Notice posted"}

@app.delete("/notices/{nid}")
def delete_notice(nid: int):
    conn = get_db()
    cur  = conn.execute("DELETE FROM notices WHERE id=?", (nid,))
    conn.commit()
    conn.close()
    if cur.rowcount == 0:
        raise HTTPException(404,"Notice not found")
    return {"message":"Notice deleted"}


# ─────────────────────────────────────────────────────────
# Fees
# ─────────────────────────────────────────────────────────

@app.get("/fees")
def get_fees(student_id: Optional[int]=None):
    conn   = get_db()
    q      = "SELECT f.*,s.name,s.class FROM fees f JOIN students s ON f.student_id=s.id WHERE 1=1"
    params = []
    if student_id: q += " AND f.student_id=?"; params.append(student_id)
    q += " ORDER BY f.due_date DESC"
    rows = conn.execute(q, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post("/fees", status_code=201)
def add_fee(body: FeeCreate):
    conn = get_db()
    conn.execute(
        "INSERT INTO fees (student_id,amount,due_date,description) VALUES (?,?,?,?)",
        (body.student_id, body.amount, body.due_date, body.description)
    )
    conn.commit()
    conn.close()
    return {"message":"Fee record added"}

@app.patch("/fees/{fid}")
def update_fee(fid: int, body: FeeStatusUpdate):
    conn = get_db()
    conn.execute("UPDATE fees SET status=?,paid_date=? WHERE id=?",(body.status,body.paid_date,fid))
    conn.commit()
    conn.close()
    return {"message":"Fee updated"}

@app.delete("/fees/{fid}")
def delete_fee(fid: int):
    conn = get_db()
    cur  = conn.execute("DELETE FROM fees WHERE id=?", (fid,))
    conn.commit()
    conn.close()
    if cur.rowcount == 0:
        raise HTTPException(404,"Fee not found")
    return {"message":"Fee deleted"}


# ─────────────────────────────────────────────────────────
init_db()

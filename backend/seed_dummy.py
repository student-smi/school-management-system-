"""
Run once: python seed_dummy.py
Adds dummy subjects, teachers, students, exams, attendance, results, fees, timetable.
"""
from database import get_db, Base, engine
from models import Class, Student, Teacher, Subject, TimetableEntry
from models.user import User, UserRole
from models.exam import Exam
from models.attendance import Attendance, AttendanceStatus
from models.result import Result
from models.fee import FeePayment, FeeStatus, FeeType
from models.timetable import DayOfWeek
from auth.password import hash_password
import uuid
from datetime import date, timedelta
import random

Base.metadata.create_all(bind=engine)
db = next(get_db())

# ── Helpers ───────────────────────────────────────────────────
def get_or_create_user(email, password, role):
    u = db.query(User).filter(User.email == email).first()
    if not u:
        u = User(email=email, password=hash_password(password), role=role, is_active=True)
        db.add(u); db.flush()
    return u

# ── 1. Subjects ───────────────────────────────────────────────
SUBJECT_DATA = [
    ("Mathematics",        "MATH101"),
    ("Physics",            "PHY101"),
    ("Chemistry",          "CHEM101"),
    ("English",            "ENG101"),
    ("Computer Science",   "CS101"),
    ("Data Structures",    "CS201"),
    ("Electronics",        "EC101"),
    ("Mechanical Design",  "ME101"),
]

subject_objs = {}
for name, code in SUBJECT_DATA:
    s = db.query(Subject).filter(Subject.code == code).first()
    if not s:
        s = Subject(name=name, code=code)
        db.add(s); db.flush()
    subject_objs[code] = s
print(f"✅ Subjects: {len(subject_objs)}")

# ── 2. Teachers ───────────────────────────────────────────────
TEACHER_DATA = [
    ("Ramesh Patel",   "ramesh@school.com",   "MATH101", "9876501001"),
    ("Priya Shah",     "priya@school.com",    "PHY101",  "9876501002"),
    ("Anjali Mehta",   "anjali@school.com",   "CHEM101", "9876501003"),
    ("Vivek Joshi",    "vivek@school.com",    "ENG101",  "9876501004"),
    ("Suresh Kumar",   "suresh@school.com",   "CS101",   "9876501005"),
    ("Neha Gupta",     "neha@school.com",     "CS201",   "9876501006"),
    ("Deepak Verma",   "deepak@school.com",   "EC101",   "9876501007"),
    ("Kavita Singh",   "kavita@school.com",   "ME101",   "9876501008"),
]

teacher_objs = {}
for name, email, sub_code, phone in TEACHER_DATA:
    t = db.query(Teacher).filter(Teacher.email == email).first()
    if not t:
        user = get_or_create_user(email, "teacher123", UserRole.teacher)
        t = Teacher(
            name=name, email=email, phone=phone,
            qualification="M.Sc, B.Ed",
            subject_id=subject_objs[sub_code].id,
            user_id=user.id,
        )
        db.add(t); db.flush()
    teacher_objs[sub_code] = t
print(f"✅ Teachers: {len(teacher_objs)}")

# ── 3. Get classes ────────────────────────────────────────────
cs_class  = db.query(Class).filter(Class.name == "Computer Science").first()
ec_class  = db.query(Class).filter(Class.name == "Electronics").first()
me_class  = db.query(Class).filter(Class.name == "Mechanical").first()
classes   = [c for c in [cs_class, ec_class, me_class] if c]
print(f"✅ Classes found: {[c.name for c in classes]}")

# ── 4. Students ───────────────────────────────────────────────
CS_STUDENTS = [
    ("Aarav Sharma",  "aarav@student.com",   "CS001", "1"),
    ("Priya Patel",   "priya.s@student.com", "CS002", "2"),
    ("Rohan Mehta",   "rohan@student.com",   "CS003", "3"),
    ("Sneha Joshi",   "sneha@student.com",   "CS004", "4"),
    ("Karan Shah",    "karan@student.com",   "CS005", "5"),
]
EC_STUDENTS = [
    ("Ankit Verma",   "ankit@student.com",   "EC001", "1"),
    ("Pooja Gupta",   "pooja@student.com",   "EC002", "2"),
    ("Raj Kumar",     "raj@student.com",     "EC003", "3"),
]

student_objs = {}

def add_students(class_obj, student_list):
    for name, email, sid, roll in student_list:
        s = db.query(Student).filter(Student.student_id == sid).first()
        if not s:
            u = get_or_create_user(email, sid, UserRole.student)
            s = Student(
                name=name, email=email, student_id=sid,
                roll_number=roll, class_id=class_obj.id,
                gender=random.choice(["Male", "Female"]),
                user_id=u.id,
            )
            db.add(s); db.flush()
        student_objs[sid] = s

if cs_class: add_students(cs_class, CS_STUDENTS)
if ec_class: add_students(ec_class, EC_STUDENTS)
print(f"✅ Students added: {len(student_objs)}")

# ── 5. Timetable for CS class ─────────────────────────────────
if cs_class:
    db.query(TimetableEntry).filter(TimetableEntry.class_id == cs_class.id).delete(synchronize_session=False)
    TIMETABLE = [
        ("Monday",    1, "CS101",  "09:00", "09:45"),
        ("Monday",    2, "MATH101","09:45", "10:30"),
        ("Monday",    3, "PHY101", "10:45", "11:30"),
        ("Monday",    4, "ENG101", "11:30", "12:15"),
        ("Tuesday",   1, "CS201",  "09:00", "09:45"),
        ("Tuesday",   2, "CHEM101","09:45", "10:30"),
        ("Tuesday",   3, "MATH101","10:45", "11:30"),
        ("Tuesday",   4, "CS101",  "11:30", "12:15"),
        ("Wednesday", 1, "ENG101", "09:00", "09:45"),
        ("Wednesday", 2, "CS201",  "09:45", "10:30"),
        ("Wednesday", 3, "PHY101", "10:45", "11:30"),
        ("Thursday",  1, "MATH101","09:00", "09:45"),
        ("Thursday",  2, "CS101",  "09:45", "10:30"),
        ("Thursday",  3, "CHEM101","10:45", "11:30"),
        ("Friday",    1, "CS201",  "09:00", "09:45"),
        ("Friday",    2, "ENG101", "09:45", "10:30"),
        ("Friday",    3, "MATH101","10:45", "11:30"),
        ("Saturday",  1, "CS101",  "09:00", "09:45"),
        ("Saturday",  2, "PHY101", "09:45", "10:30"),
    ]
    for day, period, sub_code, st, et in TIMETABLE:
        sub = subject_objs.get(sub_code)
        tch = teacher_objs.get(sub_code)
        entry = TimetableEntry(
            class_id=cs_class.id,
            subject_id=sub.id if sub else None,
            teacher_id=tch.id if tch else None,
            day=day, period_number=period,
            start_time=st, end_time=et,
            room_number=f"A-10{period}",
        )
        db.add(entry)
    print("✅ CS Timetable added")

# ── 6. Exams for CS class ─────────────────────────────────────
if cs_class:
    EXAMS = [
        ("Mid-Term Exam",  "Mathematics",     date(2026, 8, 14), 100),
        ("Mid-Term Exam",  "Computer Science", date(2026, 8, 15), 100),
        ("Mid-Term Exam",  "Physics",         date(2026, 8, 16), 100),
        ("Unit Test 1",    "English",         date(2026, 7, 20), 50),
        ("Unit Test 1",    "Chemistry",       date(2026, 7, 22), 50),
    ]
    exam_objs = []
    for name, subject, exam_date, max_marks in EXAMS:
        e = db.query(Exam).filter(Exam.name == name, Exam.subject == subject, Exam.class_id == cs_class.id).first()
        if not e:
            e = Exam(name=name, subject=subject, exam_date=exam_date, max_marks=max_marks, class_id=cs_class.id)
            db.add(e); db.flush()
        exam_objs.append(e)
    print(f"✅ Exams added: {len(exam_objs)}")

# ── 7. Attendance for CS students (last 7 days) ───────────────
if cs_class and student_objs:
    cs_students = [s for sid, s in student_objs.items() if sid.startswith("CS")]
    for i in range(7):
        att_date = date.today() - timedelta(days=i)
        for s in cs_students:
            exists = db.query(Attendance).filter(
                Attendance.student_id == s.id,
                Attendance.date == att_date
            ).first()
            if not exists:
                status = random.choices(
                    [AttendanceStatus.present, AttendanceStatus.absent, AttendanceStatus.late],
                    weights=[75, 15, 10]
                )[0]
                db.add(Attendance(student_id=s.id, class_id=cs_class.id, date=att_date, status=status))
    print("✅ Attendance records added")

# ── 8. Results for past exams ─────────────────────────────────
if cs_class and student_objs and exam_objs:
    cs_students = [s for sid, s in student_objs.items() if sid.startswith("CS")]
    past_exams  = [e for e in exam_objs if e.exam_date < date.today()]
    for exam in past_exams:
        for s in cs_students:
            exists = db.query(Result).filter(Result.student_id == s.id, Result.exam_id == exam.id).first()
            if not exists:
                marks = random.randint(30, exam.max_marks)
                pct   = (marks / exam.max_marks) * 100
                grade = "A+" if pct>=90 else "A" if pct>=80 else "B+" if pct>=70 else "B" if pct>=60 else "C" if pct>=50 else "D" if pct>=35 else "F"
                db.add(Result(student_id=s.id, exam_id=exam.id, marks=marks, grade=grade))
    print("✅ Results added")

# ── 9. Fees for CS students ───────────────────────────────────
if cs_class and student_objs:
    cs_students = [s for sid, s in student_objs.items() if sid.startswith("CS")]
    FEE_LIST = [
        (FeeType.tuition, 15000, date(2026, 7, 31)),
        (FeeType.tuition, 2000,  date(2026, 8, 10)),
        (FeeType.tuition, 500,   date(2026, 8, 15)),
    ]
    for s in cs_students:
        for fee_type, amount, due_date in FEE_LIST:
            exists = db.query(FeePayment).filter(
                FeePayment.student_id == s.id,
                FeePayment.fee_type == fee_type
            ).first()
            if not exists:
                paid = random.choice([0, amount//2, amount])
                status = FeeStatus.paid if paid >= amount else FeeStatus.partial if paid > 0 else FeeStatus.pending
                db.add(FeePayment(
                    student_id=s.id, amount=amount, paid_amount=paid,
                    fee_type=fee_type, status=status, due_date=due_date,
                    payment_date=date(2026, 7, 25) if paid > 0 else None,
                ))
    print("✅ Fees added")

db.commit()
print("\n🎉 All dummy data seeded successfully!")
print("\n📋 Teacher Login Credentials (password: teacher123):")
for name, email, _, _ in TEACHER_DATA:
    print(f"  {name:20s} → {email}")
print("\n📋 Student Login Credentials (password: student_id):")
for sid, s in student_objs.items():
    print(f"  {s.name:20s} → {s.email:30s} password: {sid}")

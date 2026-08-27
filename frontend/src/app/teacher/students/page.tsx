"use client";

import {
  FormEvent,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminIcon from "@/components/admin/AdminIcon";
import { confirmAction } from "@/components/AppConfirmDialog";
import { authenticatedFetch } from "@/lib/api";
import { toast } from "sonner";
import styles from "../management.module.css";

type Classroom = {
  id: string;
  name: string;
  year: number;
  semester: number;
  isActive: boolean;
  studentCount: number;
};
type Membership = { classId: string; className: string; enrolledAt: string };
type Student = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  schoolName?: string | null;
  status: "active" | "inactive" | "pending";
  classrooms: Membership[];
  firstEnrolledAt: string;
  knowledge: number;
  skills: number;
  attitude: number;
  competency: number;
  overall: number;
  lessonsCompleted: number;
  timeSpentMinutes: number;
  sessions: number;
  lastActive?: string | null;
};
type StudentsResponse = { classrooms: Classroom[]; students: Student[] };

async function responseError(response: Response) {
  try {
    return (
      ((await response.json()) as { error?: string }).error ||
      "ไม่สามารถดำเนินการได้"
    );
  } catch {
    return "ไม่สามารถดำเนินการได้";
  }
}
function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "ST"
  );
}
function formatRelativeDate(value?: string | null) {
  if (!value) return "ยังไม่มีกิจกรรม";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "ยังไม่มีกิจกรรม"
    : new Intl.DateTimeFormat("th-TH", {
        day: "numeric",
        month: "short",
        year: "2-digit",
      }).format(date);
}
function statusLabel(status: Student["status"]) {
  return status === "active"
    ? "ใช้งาน"
    : status === "pending"
      ? "รออนุมัติ"
      : "ระงับใช้งาน";
}

export default function TeacherStudentsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const classesPath = pathname.startsWith("/admin") ? "/admin/classes" : "/teacher/classes";
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");
  const [addClassId, setAddClassId] = useState("");
  const [managedStudent, setManagedStudent] = useState<Student | null>(null);
  const [fromClassId, setFromClassId] = useState("");
  const [toClassId, setToClassId] = useState("");

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authenticatedFetch("/api/teacher/students", {
        cache: "no-store",
      });
      if (!response.ok) throw new Error(await responseError(response));
      const payload = (await response.json()) as StudentsResponse;
      setClassrooms(payload.classrooms || []);
      setStudents(payload.students || []);
      setAddClassId((current) => current || payload.classrooms?.[0]?.id || "");
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "โหลดข้อมูลนักเรียนไม่สำเร็จ",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadStudents(), 0);
    return () => window.clearTimeout(timer);
  }, [loadStudents]);

  const visibleStudents = useMemo(() => {
    const query = deferredSearch.trim().toLocaleLowerCase("th-TH");
    return students.filter((student) => {
      const matchesSearch =
        !query ||
        `${student.name} ${student.email} ${student.schoolName || ""}`
          .toLocaleLowerCase("th-TH")
          .includes(query);
      const matchesClass =
        classFilter === "all" ||
        student.classrooms.some((item) => item.classId === classFilter);
      const matchesStatus =
        statusFilter === "all" ||
        student.status === statusFilter ||
        (statusFilter === "attention" &&
          (student.status !== "active" || student.overall < 60));
      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [classFilter, deferredSearch, statusFilter, students]);

  const membershipCount = students.reduce(
    (total, student) => total + student.classrooms.length,
    0,
  );
  const scoredStudents = students.filter((student) => student.overall > 0);
  const averageScore = scoredStudents.length
    ? Math.round(
        scoredStudents.reduce((total, student) => total + student.overall, 0) /
          scoredStudents.length,
      )
    : 0;
  const attentionCount = students.filter(
    (student) => student.status !== "active" || student.overall < 60,
  ).length;
  const summary = [
    {
      key: "green",
      label: "นักเรียนที่ดูแล",
      value: students.length,
      detail: "นับรายบุคคล ไม่ซ้ำห้อง",
      icon: "student" as const,
    },
    {
      key: "blue",
      label: "การลงทะเบียน",
      value: membershipCount,
      detail: `จาก ${classrooms.length} ห้องเรียน`,
      icon: "school" as const,
    },
    {
      key: "gold",
      label: "คะแนนเฉลี่ย",
      value: scoredStudents.length ? `${averageScore}%` : "—",
      detail: scoredStudents.length
        ? `จาก ${scoredStudents.length} คนที่มีผลประเมิน`
        : "ยังไม่มีผลประเมิน",
      icon: "score" as const,
    },
    {
      key: "purple",
      label: "ควรติดตาม",
      value: attentionCount,
      detail: "คะแนนต่ำกว่า 60 หรือบัญชีไม่พร้อม",
      icon: "activity" as const,
    },
  ];

  function openAdd() {
    setStudentEmail("");
    setAddClassId(
      classFilter !== "all" ? classFilter : classrooms[0]?.id || "",
    );
    setAddOpen(true);
  }
  async function addStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!addClassId) {
      toast.warning("กรุณาเลือกห้องเรียน");
      return;
    }
    setBusy("add");
    try {
      const response = await authenticatedFetch("/api/teacher/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId: addClassId, studentEmail }),
      });
      if (!response.ok) throw new Error(await responseError(response));
      setAddOpen(false);
      await loadStudents();
      toast.success("เพิ่มนักเรียนเข้าห้องเรียนแล้ว");
    } catch (addError) {
      toast.error(
        addError instanceof Error ? addError.message : "เพิ่มนักเรียนไม่สำเร็จ",
      );
    } finally {
      setBusy(null);
    }
  }

  function openManage(student: Student) {
    const sourceId = student.classrooms[0]?.classId || "";
    setManagedStudent(student);
    setFromClassId(sourceId);
    setToClassId(classrooms.find((item) => item.id !== sourceId)?.id || "");
  }
  function changeSourceClass(classId: string) {
    setFromClassId(classId);
    if (toClassId === classId)
      setToClassId(classrooms.find((item) => item.id !== classId)?.id || "");
  }
  async function moveStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!managedStudent || !fromClassId || !toClassId) return;
    setBusy("move");
    try {
      const response = await authenticatedFetch("/api/teacher/students", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "move_student",
          studentId: managedStudent.id,
          fromClassId,
          toClassId,
        }),
      });
      if (!response.ok) throw new Error(await responseError(response));
      setManagedStudent(null);
      await loadStudents();
      toast.success("ย้ายนักเรียนไปยังห้องใหม่แล้ว", {
        description: managedStudent.name,
      });
    } catch (moveError) {
      toast.error(
        moveError instanceof Error
          ? moveError.message
          : "ย้ายห้องเรียนไม่สำเร็จ",
      );
    } finally {
      setBusy(null);
    }
  }
  async function removeMembership(student: Student, classId: string) {
    const classroom = student.classrooms.find(
      (item) => item.classId === classId,
    );
    if (!classroom) return;
    const confirmed = await confirmAction({
      title: "นำออกจากห้องเรียน?",
      description: `${student.name} จะถูกนำออกจาก “${classroom.className}” แต่บัญชีและข้อมูลการเรียนจะยังอยู่ในระบบ`,
      confirmText: "นำออกจากห้อง",
      tone: "danger",
    });
    if (!confirmed) return;
    setBusy("remove");
    try {
      const response = await authenticatedFetch(
        `/api/teacher/students?classId=${encodeURIComponent(classId)}&studentId=${encodeURIComponent(student.id)}`,
        { method: "DELETE" },
      );
      if (!response.ok) throw new Error(await responseError(response));
      setManagedStudent(null);
      await loadStudents();
      toast.success("นำนักเรียนออกจากห้องแล้ว");
    } catch (removeError) {
      toast.error(
        removeError instanceof Error
          ? removeError.message
          : "นำออกจากห้องไม่สำเร็จ",
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p>STUDENT OVERVIEW</p>
          <h1>นักเรียนและความก้าวหน้า</h1>
          <span>
            ดูภาพรวมนักเรียน ผลการเรียน และจัดการสมาชิกในห้องที่คุณรับผิดชอบ
          </span>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.secondaryButton}
            type="button"
            onClick={() => void loadStudents()}
            disabled={loading}
          >
            <AdminIcon name="refresh" size={16} />
            อัปเดตข้อมูล
          </button>
          <button
            className={styles.primaryButton}
            type="button"
            onClick={openAdd}
          >
            <AdminIcon name="plus" size={16} />
            เพิ่มนักเรียน
          </button>
        </div>
      </header>
      {error && (
        <div className={styles.error}>
          <AdminIcon name="activity" size={17} />
          <span>{error}</span>
          <button type="button" onClick={() => void loadStudents()}>
            ลองอีกครั้ง
          </button>
        </div>
      )}
      <section className={styles.metrics}>
        {summary.map((item) => (
          <article
            className={styles.metricCard}
            data-tone={item.key}
            key={item.label}
          >
            <span className={styles.metricIcon}>
              <AdminIcon name={item.icon} size={20} />
            </span>
            <span>
              <small>{item.label}</small>
              <strong>{loading ? "—" : item.value}</strong>
              <span>{item.detail}</span>
            </span>
          </article>
        ))}
      </section>

      <section className={styles.workspace}>
        <header className={styles.workspaceHeader}>
          <div>
            <h2>รายชื่อนักเรียน</h2>
            <p>
              {visibleStudents.length} จาก {students.length} คน
            </p>
          </div>
          <div className={styles.filters}>
            <label className={styles.searchBox}>
              <AdminIcon name="search" size={16} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ค้นหาชื่อ อีเมล หรือสถานศึกษา"
                aria-label="ค้นหานักเรียน"
              />
            </label>
            <label className={styles.selectBox}>
              <select
                value={classFilter}
                onChange={(event) => setClassFilter(event.target.value)}
                aria-label="กรองตามห้องเรียน"
              >
                <option value="all">ทุกห้องเรียน</option>
                {classrooms.map((item) => (
                  <option value={item.id} key={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.selectBox}>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="กรองตามสถานะ"
              >
                <option value="all">ทุกสถานะ</option>
                <option value="active">ใช้งาน</option>
                <option value="inactive">ระงับใช้งาน</option>
                <option value="pending">รออนุมัติ</option>
                <option value="attention">ควรติดตาม</option>
              </select>
            </label>
          </div>
        </header>
        <div className={styles.studentDirectory}>
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div className={styles.studentDirectorySkeleton} key={index} />
            ))
          ) : visibleStudents.length ? (
            visibleStudents.map((student) => (
              <article className={styles.studentDirectoryRow} key={student.id}>
                <div className={styles.studentIdentity}>
                  <span className={styles.studentAvatar}>
                    {initials(student.name)}
                  </span>
                  <div>
                    <strong>{student.name}</strong>
                    <small>{student.email}</small>
                    <span>{student.schoolName || "ไม่ระบุสถานศึกษา"}</span>
                  </div>
                </div>
                <div className={styles.classBadges}>
                  {student.classrooms.map((item) => (
                    <span key={item.classId}>{item.className}</span>
                  ))}
                </div>
                <div className={styles.scoreCell}>
                  <span
                    className={styles.scoreRing}
                    style={{
                      background: `conic-gradient(#397454 ${Math.min(100, Math.max(0, student.overall)) * 3.6}deg,#e3ebe6 0)`,
                    }}
                  >
                    <b>{student.overall || "—"}</b>
                  </span>
                  <div>
                    <strong>คะแนนรวม</strong>
                    <small>
                      {student.lessonsCompleted} บทเรียน · {student.sessions}{" "}
                      สถานการณ์
                    </small>
                  </div>
                </div>
                <div className={styles.ksaCell}>
                  {(
                    [
                      ["K", student.knowledge, "green"],
                      ["S", student.skills, "blue"],
                      ["A", student.attitude, "gold"],
                      ["C", student.competency, "purple"],
                    ] as const
                  ).map(([label, value, tone]) => (
                    <span key={label} data-tone={tone}>
                      <small>{label}</small>
                      <i>
                        <b style={{ width: `${Math.min(100, value)}%` }} />
                      </i>
                      <strong>{value || 0}</strong>
                    </span>
                  ))}
                </div>
                <div className={styles.studentState}>
                  <span
                    className={
                      student.status === "active"
                        ? styles.readyBadge
                        : styles.draftBadge
                    }
                  >
                    {statusLabel(student.status)}
                  </span>
                  <small>ล่าสุด {formatRelativeDate(student.lastActive)}</small>
                </div>
                <button
                  className={styles.manageButton}
                  type="button"
                  onClick={() => openManage(student)}
                >
                  <AdminIcon name="settings" size={15} />
                  จัดการ
                </button>
              </article>
            ))
          ) : (
            <div className={styles.emptyState}>
              <span>
                <AdminIcon name="student" size={25} />
              </span>
              <h3>
                {students.length
                  ? "ไม่พบนักเรียนตามตัวกรอง"
                  : "ยังไม่มีนักเรียนในห้องเรียน"}
              </h3>
              <p>
                {students.length
                  ? "ลองเปลี่ยนคำค้นหา ห้องเรียน หรือสถานะ"
                  : classrooms.length
                    ? "เพิ่มบัญชีนักเรียนที่เปิดใช้งานแล้วด้วยอีเมล"
                    : "สร้างห้องเรียนก่อน แล้วจึงเพิ่มนักเรียนเข้าเป็นสมาชิก"}
              </p>
              {!students.length && (
                <button type="button" onClick={openAdd}>
                  <AdminIcon name="plus" size={16} />
                  เพิ่มนักเรียน
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {addOpen && (
        <div
          className={styles.modalOverlay}
          onMouseDown={(event) =>
            event.target === event.currentTarget && !busy && setAddOpen(false)
          }
        >
          <section
            className={`${styles.modal} ${styles.compactModal}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-student-title"
          >
            <header className={styles.modalHeader}>
              <span>
                <AdminIcon name="student" size={21} />
              </span>
              <div>
                <h2 id="add-student-title">เพิ่มนักเรียนเข้าห้องเรียน</h2>
                <p>
                  {classrooms.length
                    ? "ใช้บัญชีนักเรียนที่แอดมินสร้างและเปิดใช้งานแล้ว"
                    : "ต้องมีห้องเรียนอย่างน้อยหนึ่งห้องก่อนเพิ่มนักเรียน"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                aria-label="ปิด"
              >
                <AdminIcon name="close" size={18} />
              </button>
            </header>
            {classrooms.length ? (
              <form onSubmit={addStudent}>
                <div className={styles.formGrid}>
                  <label className={styles.fullField}>
                    <span>อีเมลนักเรียน *</span>
                    <input
                      autoFocus
                      required
                      type="email"
                      value={studentEmail}
                      onChange={(event) => setStudentEmail(event.target.value)}
                      placeholder="student@example.com"
                    />
                  </label>
                  <label className={styles.fullField}>
                    <span>ห้องเรียน *</span>
                    <select
                      required
                      value={addClassId}
                      onChange={(event) => setAddClassId(event.target.value)}
                    >
                      {classrooms.map((item) => (
                        <option value={item.id} key={item.id}>
                          {item.name} · ปี {item.year} ภาคเรียน {item.semester}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <footer className={styles.modalFooter}>
                  <button type="button" onClick={() => setAddOpen(false)}>
                    ยกเลิก
                  </button>
                  <button
                    className={styles.primaryButton}
                    type="submit"
                    disabled={busy === "add"}
                  >
                    <AdminIcon
                      name={busy === "add" ? "clock" : "plus"}
                      size={16}
                    />
                    เพิ่มเข้าห้องเรียน
                  </button>
                </footer>
              </form>
            ) : (
              <div className={styles.missingClassState}>
                <span>
                  <AdminIcon name="school" size={25} />
                </span>
                <h3>ยังไม่มีห้องเรียน</h3>
                <p>
                  สร้างห้องเรียนและกำหนดปีการศึกษาก่อน
                  จากนั้นกลับมาเพิ่มนักเรียนด้วยอีเมล
                </p>
                <div>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => setAddOpen(false)}
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() => router.push(classesPath)}
                  >
                    <AdminIcon name="plus" size={16} />
                    สร้างห้องเรียน
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {managedStudent && (
        <div
          className={styles.modalOverlay}
          onMouseDown={(event) =>
            event.target === event.currentTarget &&
            !busy &&
            setManagedStudent(null)
          }
        >
          <section
            className={`${styles.modal} ${styles.compactModal}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="manage-student-title"
          >
            <header className={styles.modalHeader}>
              <span>
                <AdminIcon name="settings" size={21} />
              </span>
              <div>
                <h2 id="manage-student-title">
                  จัดการห้องเรียนของ {managedStudent.name}
                </h2>
                <p>ย้ายห้องหรือนำออกจากห้อง โดยไม่ลบบัญชีนักเรียน</p>
              </div>
              <button
                type="button"
                onClick={() => setManagedStudent(null)}
                aria-label="ปิด"
              >
                <AdminIcon name="close" size={18} />
              </button>
            </header>
            <form onSubmit={moveStudent}>
              <div className={styles.formGrid}>
                <label className={styles.fullField}>
                  <span>ห้องเรียนปัจจุบัน</span>
                  <select
                    value={fromClassId}
                    onChange={(event) => changeSourceClass(event.target.value)}
                  >
                    {managedStudent.classrooms.map((item) => (
                      <option value={item.classId} key={item.classId}>
                        {item.className}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={styles.fullField}>
                  <span>ย้ายไปยังห้องเรียน</span>
                  <select
                    value={toClassId}
                    onChange={(event) => setToClassId(event.target.value)}
                  >
                    <option value="">เลือกห้องเรียนใหม่</option>
                    {classrooms
                      .filter((item) => item.id !== fromClassId)
                      .map((item) => (
                        <option value={item.id} key={item.id}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                  <small>
                    หากนักเรียนอยู่ในห้องปลายทางแล้ว
                    ระบบจะคงสมาชิกเดิมไว้และนำออกจากห้องต้นทาง
                  </small>
                </label>
                <div className={styles.membershipNote}>
                  <AdminIcon name="shield" size={17} />
                  <span>
                    ครูจัดการได้เฉพาะสมาชิกในห้องเรียน
                    บัญชีผู้ใช้และบทบาทจัดการโดยผู้ดูแลระบบ
                  </span>
                </div>
              </div>
              <footer className={`${styles.modalFooter} ${styles.splitFooter}`}>
                <button
                  className={styles.removeMembershipButton}
                  type="button"
                  onClick={() =>
                    void removeMembership(managedStudent, fromClassId)
                  }
                  disabled={Boolean(busy)}
                >
                  <AdminIcon name="trash" size={15} />
                  นำออกจากห้อง
                </button>
                <span />
                <button type="button" onClick={() => setManagedStudent(null)}>
                  ยกเลิก
                </button>
                <button
                  className={styles.primaryButton}
                  type="submit"
                  disabled={busy === "move" || !toClassId}
                >
                  <AdminIcon
                    name={busy === "move" ? "clock" : "arrow"}
                    size={16}
                  />
                  ย้ายห้องเรียน
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

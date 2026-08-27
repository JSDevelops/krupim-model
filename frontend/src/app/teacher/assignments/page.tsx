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
import AdminIcon, { type AdminIconName } from "@/components/admin/AdminIcon";
import { confirmAction } from "@/components/AppConfirmDialog";
import { authenticatedFetch } from "@/lib/api";
import { toast } from "sonner";
import styles from "../management.module.css";

type ActivityType = "Familiarize" | "Interact" | "Navigate" | "Exhibit";
type Classroom = {
  id: string;
  name: string;
  year: number;
  semester: number;
  isActive: boolean;
  studentCount: number;
};
type Assignment = {
  id: string;
  title: string;
  description: string;
  activityType: ActivityType;
  classId: string;
  className: string;
  dueDate: string;
  maxScore: number;
  studentCount: number;
  submittedCount: number;
  gradedCount: number;
  averagePercent: number;
  createdAt: string;
  updatedAt: string;
};
type Submission = {
  studentId: string;
  studentName: string;
  email: string;
  submissionId?: string | null;
  status: "submitted" | "pending";
  score?: number | null;
  feedback?: string | null;
  attachmentName?: string | null;
  attachmentUrl?: string | null;
  submittedAt?: string | null;
  gradedAt?: string | null;
};
type AssignmentForm = {
  title: string;
  description: string;
  activityType: ActivityType;
  classId: string;
  dueDate: string;
  maxScore: string;
};
const emptyForm: AssignmentForm = {
  title: "",
  description: "",
  activityType: "Familiarize",
  classId: "",
  dueDate: "",
  maxScore: "100",
};
const activityMeta: Record<
  ActivityType,
  { label: string; detail: string; icon: AdminIconName; tone: string }
> = {
  Familiarize: {
    label: "Familiarize",
    detail: "เรียนรู้คำศัพท์และแนวคิด",
    icon: "scan",
    tone: "green",
  },
  Interact: {
    label: "Interact",
    detail: "ฝึกสนทนาและปฏิสัมพันธ์",
    icon: "users",
    tone: "gold",
  },
  Navigate: {
    label: "Navigate",
    detail: "แก้ปัญหาผ่านสถานการณ์",
    icon: "activity",
    tone: "blue",
  },
  Exhibit: {
    label: "Exhibit",
    detail: "สรุปผลงานและสมรรถนะ",
    icon: "archive",
    tone: "purple",
  },
};

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
function formatDate(value: string, includeTime = false) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "ไม่ระบุ";
  return new Intl.DateTimeFormat(
    "th-TH",
    includeTime
      ? {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      : { day: "numeric", month: "short", year: "numeric" },
  ).format(date);
}
function localDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
function assignmentState(item: Assignment) {
  if (item.studentCount > 0 && item.submittedCount >= item.studentCount)
    return "complete";
  if (new Date(item.dueDate).getTime() < Date.now()) return "overdue";
  return "active";
}
function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((item) => item[0])
      .join("")
      .toUpperCase() || "ST"
  );
}

export default function TeacherAssignmentsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const classesPath = pathname.startsWith("/admin") ? "/admin/classes" : "/teacher/classes";
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AssignmentForm>(emptyForm);
  const [reportAssignment, setReportAssignment] = useState<Assignment | null>(
    null,
  );
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [grading, setGrading] = useState<Submission | null>(null);
  const [gradeScore, setGradeScore] = useState("");
  const [gradeFeedback, setGradeFeedback] = useState("");

  const loadAssignments = useCallback(async () => {
    const response = await authenticatedFetch("/api/teacher/assignments", {
      cache: "no-store",
    });
    if (!response.ok) throw new Error(await responseError(response));
    const payload = (await response.json()) as {
      assignments?: Assignment[];
      classrooms?: Classroom[];
    };
    setAssignments(payload.assignments || []);
    setClassrooms(payload.classrooms || []);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(
      () =>
        void loadAssignments()
          .then(() => setError(""))
          .catch((loadError) =>
            setError(
              loadError instanceof Error
                ? loadError.message
                : "โหลดงานไม่สำเร็จ",
            ),
          )
          .finally(() => setLoading(false)),
      0,
    );
    return () => window.clearTimeout(timer);
  }, [loadAssignments]);

  const visibleAssignments = useMemo(() => {
    const keyword = deferredSearch.trim().toLocaleLowerCase("th-TH");
    return assignments.filter((item) => {
      const matchesKeyword =
        !keyword ||
        `${item.title} ${item.description} ${item.className} ${item.activityType}`
          .toLocaleLowerCase("th-TH")
          .includes(keyword);
      return (
        matchesKeyword &&
        (classFilter === "all" || item.classId === classFilter) &&
        (statusFilter === "all" || assignmentState(item) === statusFilter)
      );
    });
  }, [assignments, classFilter, deferredSearch, statusFilter]);

  const totalStudents = classrooms.reduce(
    (sum, item) => sum + item.studentCount,
    0,
  );
  const submittedTotal = assignments.reduce(
    (sum, item) => sum + item.submittedCount,
    0,
  );
  const waitingGrade = assignments.reduce(
    (sum, item) => sum + Math.max(0, item.submittedCount - item.gradedCount),
    0,
  );
  const overdueCount = assignments.filter(
    (item) => assignmentState(item) === "overdue",
  ).length;
  const summary = [
    {
      key: "green",
      label: "งานทั้งหมด",
      value: assignments.length,
      detail: "งานที่คุณเป็นผู้มอบหมาย",
      icon: "content" as const,
    },
    {
      key: "blue",
      label: "ส่งงานแล้ว",
      value: submittedTotal,
      detail: `จากผู้เรียนรวม ${totalStudents} คน`,
      icon: "check" as const,
    },
    {
      key: "gold",
      label: "รอตรวจคะแนน",
      value: waitingGrade,
      detail: "ชิ้นงานที่ส่งแล้วแต่ยังไม่ตรวจ",
      icon: "score" as const,
    },
    {
      key: "purple",
      label: "เลยกำหนด",
      value: overdueCount,
      detail: "งานที่ยังส่งไม่ครบ",
      icon: "clock" as const,
    },
  ];

  async function refresh() {
    setBusy("refresh");
    try {
      await loadAssignments();
      setError("");
      toast.success("อัปเดตงานมอบหมายแล้ว");
    } catch (refreshError) {
      setError(
        refreshError instanceof Error
          ? refreshError.message
          : "โหลดงานไม่สำเร็จ",
      );
    } finally {
      setBusy(null);
    }
  }
  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm, classId: classrooms[0]?.id || "" });
    setEditorOpen(true);
  }
  function openEdit(item: Assignment) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description || "",
      activityType: item.activityType,
      classId: item.classId,
      dueDate: localDateTime(item.dueDate),
      maxScore: String(item.maxScore),
    });
    setEditorOpen(true);
  }
  function updateField<Key extends keyof AssignmentForm>(
    key: Key,
    value: AssignmentForm[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }
  async function saveAssignment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("save");
    try {
      const response = await authenticatedFetch("/api/teacher/assignments", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editingId ? { id: editingId } : {}),
          ...form,
        }),
      });
      if (!response.ok) throw new Error(await responseError(response));
      setEditorOpen(false);
      await loadAssignments();
      toast.success(
        editingId ? "บันทึกการแก้ไขแล้ว" : "สร้างและมอบหมายงานแล้ว",
        { description: form.title },
      );
    } catch (saveError) {
      toast.error(
        saveError instanceof Error ? saveError.message : "บันทึกงานไม่สำเร็จ",
      );
    } finally {
      setBusy(null);
    }
  }
  async function deleteAssignment(item: Assignment) {
    const confirmed = await confirmAction({
      title: "ลบงานมอบหมายนี้?",
      description: `งาน “${item.title}” และข้อมูลการส่งงานที่เกี่ยวข้องจะถูกลบ`,
      confirmText: "ลบงาน",
      tone: "danger",
    });
    if (!confirmed) return;
    setBusy(`delete:${item.id}`);
    try {
      const response = await authenticatedFetch(
        `/api/teacher/assignments?id=${encodeURIComponent(item.id)}`,
        { method: "DELETE" },
      );
      if (!response.ok) throw new Error(await responseError(response));
      setAssignments((current) =>
        current.filter((candidate) => candidate.id !== item.id),
      );
      toast.success("ลบงานแล้ว");
    } catch (deleteError) {
      toast.error(
        deleteError instanceof Error ? deleteError.message : "ลบงานไม่สำเร็จ",
      );
    } finally {
      setBusy(null);
    }
  }
  async function openReport(item: Assignment) {
    setReportAssignment(item);
    setSubmissions([]);
    setReportLoading(true);
    try {
      const response = await authenticatedFetch(
        `/api/teacher/assignments?id=${encodeURIComponent(item.id)}`,
        { cache: "no-store" },
      );
      if (!response.ok) throw new Error(await responseError(response));
      const payload = (await response.json()) as { submissions?: Submission[] };
      setSubmissions(payload.submissions || []);
    } catch (reportError) {
      toast.error(
        reportError instanceof Error
          ? reportError.message
          : "โหลดรายงานไม่สำเร็จ",
      );
      setReportAssignment(null);
    } finally {
      setReportLoading(false);
    }
  }
  function openGrade(item: Submission) {
    setGrading(item);
    setGradeScore(item.score == null ? "" : String(item.score));
    setGradeFeedback(item.feedback || "");
  }
  async function saveGrade(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!grading || !reportAssignment) return;
    setBusy("grade");
    try {
      const response = await authenticatedFetch("/api/teacher/assignments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "grade_submission",
          assignmentId: reportAssignment.id,
          studentId: grading.studentId,
          score: gradeScore,
          feedback: gradeFeedback,
        }),
      });
      if (!response.ok) throw new Error(await responseError(response));
      setSubmissions((current) =>
        current.map((item) =>
          item.studentId === grading.studentId
            ? {
                ...item,
                score: Number(gradeScore),
                feedback: gradeFeedback,
                gradedAt: new Date().toISOString(),
              }
            : item,
        ),
      );
      setGrading(null);
      setAssignments((current) =>
        current.map((item) =>
          item.id === reportAssignment.id
            ? {
                ...item,
                gradedCount: item.gradedCount + (grading.score == null ? 1 : 0),
              }
            : item,
        ),
      );
      toast.success("บันทึกคะแนนแล้ว", { description: grading.studentName });
    } catch (gradeError) {
      toast.error(
        gradeError instanceof Error
          ? gradeError.message
          : "บันทึกคะแนนไม่สำเร็จ",
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p>ASSIGNMENT MANAGEMENT</p>
          <h1>งานและกิจกรรมการเรียนรู้</h1>
          <span>
            มอบหมายงาน ติดตามการส่ง และประเมินผลผู้เรียนตามกระบวนการ FINE Model
          </span>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => void refresh()}
            disabled={busy === "refresh"}
          >
            <AdminIcon name="refresh" size={16} />
            อัปเดตข้อมูล
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={openCreate}
          >
            <AdminIcon name="plus" size={16} />
            สร้างงานใหม่
          </button>
        </div>
      </header>
      {error && (
        <div className={styles.error}>
          <AdminIcon name="activity" size={17} />
          <span>{error}</span>
          <button type="button" onClick={() => void refresh()}>
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
            <h2>รายการงานมอบหมาย</h2>
            <p>
              {visibleAssignments.length} จาก {assignments.length} งาน
            </p>
          </div>
          <div className={styles.filters}>
            <label className={styles.searchBox}>
              <AdminIcon name="search" size={16} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ค้นหาชื่องาน ห้องเรียน หรือประเภท"
                aria-label="ค้นหางาน"
              />
            </label>
            <label className={styles.selectBox}>
              <select
                value={classFilter}
                onChange={(event) => setClassFilter(event.target.value)}
                aria-label="กรองห้องเรียน"
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
                aria-label="กรองสถานะ"
              >
                <option value="all">ทุกสถานะ</option>
                <option value="active">กำลังดำเนินการ</option>
                <option value="complete">ส่งครบแล้ว</option>
                <option value="overdue">เลยกำหนด</option>
              </select>
            </label>
          </div>
        </header>
        <div className={styles.assignmentList}>
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div className={styles.assignmentSkeleton} key={index} />
            ))
          ) : visibleAssignments.length ? (
            visibleAssignments.map((item) => {
              const meta =
                activityMeta[item.activityType] || activityMeta.Familiarize;
              const progress = item.studentCount
                ? Math.round((item.submittedCount / item.studentCount) * 100)
                : 0;
              const state = assignmentState(item);
              return (
                <article
                  className={styles.assignmentCard}
                  key={item.id}
                  data-tone={meta.tone}
                >
                  <span className={styles.assignmentIcon}>
                    <AdminIcon name={meta.icon} size={21} />
                  </span>
                  <div className={styles.assignmentMain}>
                    <div>
                      <span className={styles.modelBadge}>{meta.label}</span>
                      <span
                        className={
                          state === "overdue"
                            ? styles.assignmentOverdue
                            : state === "complete"
                              ? styles.readyBadge
                              : styles.neutralBadge
                        }
                      >
                        {state === "overdue"
                          ? "เลยกำหนด"
                          : state === "complete"
                            ? "ส่งครบแล้ว"
                            : "กำลังดำเนินการ"}
                      </span>
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.description || meta.detail}</p>
                    <span>
                      <AdminIcon name="school" size={13} />
                      {item.className}
                      <AdminIcon name="clock" size={13} />
                      กำหนดส่ง {formatDate(item.dueDate)}
                    </span>
                  </div>
                  <div className={styles.assignmentProgress}>
                    <div>
                      <strong>
                        {item.submittedCount}/{item.studentCount}
                      </strong>
                      <small>ส่งงานแล้ว</small>
                    </div>
                    <i>
                      <b style={{ width: `${progress}%` }} />
                    </i>
                    <span>{progress}%</span>
                  </div>
                  <div className={styles.assignmentScore}>
                    <small>คะแนนเฉลี่ย</small>
                    <strong>
                      {item.gradedCount ? `${item.averagePercent}%` : "—"}
                    </strong>
                    <span>ตรวจแล้ว {item.gradedCount} ชิ้น</span>
                  </div>
                  <div className={styles.assignmentActions}>
                    <button type="button" onClick={() => void openReport(item)}>
                      <AdminIcon name="analytics" size={15} />
                      รายงาน
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      aria-label={`แก้ไข ${item.title}`}
                    >
                      <AdminIcon name="edit" size={15} />
                    </button>
                    <button
                      type="button"
                      className={styles.dangerIconButton}
                      onClick={() => void deleteAssignment(item)}
                      disabled={Boolean(busy)}
                      aria-label={`ลบ ${item.title}`}
                    >
                      <AdminIcon name="trash" size={15} />
                    </button>
                  </div>
                </article>
              );
            })
          ) : (
            <div className={styles.emptyState}>
              <span>
                <AdminIcon name="content" size={25} />
              </span>
              <h3>
                {assignments.length
                  ? "ไม่พบงานตามตัวกรอง"
                  : "ยังไม่มีงานมอบหมาย"}
              </h3>
              <p>
                {assignments.length
                  ? "ลองเปลี่ยนคำค้นหา ห้องเรียน หรือสถานะ"
                  : classrooms.length
                    ? "สร้างงานแรกและมอบหมายให้ผู้เรียนในห้องของคุณ"
                    : "สร้างห้องเรียนก่อนเริ่มมอบหมายงาน"}
              </p>
              <button
                type="button"
                onClick={
                  classrooms.length
                    ? openCreate
                    : () => router.push(classesPath)
                }
              >
                <AdminIcon name="plus" size={16} />
                {classrooms.length ? "สร้างงานแรก" : "สร้างห้องเรียน"}
              </button>
            </div>
          )}
        </div>
      </section>

      {editorOpen && (
        <div
          className={styles.modalOverlay}
          onMouseDown={(event) =>
            event.target === event.currentTarget &&
            !busy &&
            setEditorOpen(false)
          }
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="assignment-editor-title"
          >
            <header className={styles.modalHeader}>
              <span>
                <AdminIcon name={editingId ? "edit" : "plus"} size={21} />
              </span>
              <div>
                <h2 id="assignment-editor-title">
                  {editingId ? "แก้ไขงานมอบหมาย" : "สร้างงานมอบหมายใหม่"}
                </h2>
                <p>กำหนดกิจกรรม ห้องเรียน คะแนน และวันส่งงาน</p>
              </div>
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                aria-label="ปิด"
              >
                <AdminIcon name="close" size={18} />
              </button>
            </header>
            {classrooms.length ? (
              <form onSubmit={saveAssignment}>
                <div className={styles.formGrid}>
                  <label className={styles.fullField}>
                    <span>ชื่องานหรือกิจกรรม *</span>
                    <input
                      autoFocus
                      required
                      maxLength={240}
                      value={form.title}
                      onChange={(event) =>
                        updateField("title", event.target.value)
                      }
                      placeholder="เช่น ฝึกสนทนาต้อนรับลูกค้าภาษาอังกฤษ"
                    />
                  </label>
                  <label className={styles.fullField}>
                    <span>รายละเอียด</span>
                    <textarea
                      rows={3}
                      maxLength={4000}
                      value={form.description}
                      onChange={(event) =>
                        updateField("description", event.target.value)
                      }
                      placeholder="อธิบายสิ่งที่ผู้เรียนต้องปฏิบัติและเกณฑ์สำคัญ"
                    />
                  </label>
                  <label>
                    <span>ขั้นการเรียนรู้ *</span>
                    <select
                      value={form.activityType}
                      onChange={(event) =>
                        updateField(
                          "activityType",
                          event.target.value as ActivityType,
                        )
                      }
                    >
                      {Object.entries(activityMeta).map(([key, value]) => (
                        <option value={key} key={key}>
                          {value.label} — {value.detail}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>ห้องเรียน *</span>
                    <select
                      required
                      value={form.classId}
                      onChange={(event) =>
                        updateField("classId", event.target.value)
                      }
                    >
                      {classrooms.map((item) => (
                        <option value={item.id} key={item.id}>
                          {item.name} · {item.studentCount} คน
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>กำหนดส่ง *</span>
                    <input
                      required
                      type="datetime-local"
                      value={form.dueDate}
                      onChange={(event) =>
                        updateField("dueDate", event.target.value)
                      }
                    />
                  </label>
                  <label>
                    <span>คะแนนเต็ม *</span>
                    <input
                      required
                      type="number"
                      min="1"
                      max="1000"
                      value={form.maxScore}
                      onChange={(event) =>
                        updateField("maxScore", event.target.value)
                      }
                    />
                  </label>
                </div>
                <footer className={styles.modalFooter}>
                  <button type="button" onClick={() => setEditorOpen(false)}>
                    ยกเลิก
                  </button>
                  <button
                    className={styles.primaryButton}
                    type="submit"
                    disabled={busy === "save"}
                  >
                    <AdminIcon
                      name={busy === "save" ? "clock" : "check"}
                      size={16}
                    />
                    {editingId ? "บันทึกการแก้ไข" : "สร้างและมอบหมาย"}
                  </button>
                </footer>
              </form>
            ) : (
              <div className={styles.missingClassState}>
                <span>
                  <AdminIcon name="school" size={25} />
                </span>
                <h3>ยังไม่มีห้องเรียน</h3>
                <p>สร้างห้องเรียนและเพิ่มนักเรียนก่อนเริ่มมอบหมายงาน</p>
                <div>
                  <button
                    className={styles.secondaryButton}
                    type="button"
                    onClick={() => setEditorOpen(false)}
                  >
                    ยกเลิก
                  </button>
                  <button
                    className={styles.primaryButton}
                    type="button"
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

      {reportAssignment && (
        <div
          className={styles.modalOverlay}
          onMouseDown={(event) =>
            event.target === event.currentTarget &&
            !busy &&
            setReportAssignment(null)
          }
        >
          <section
            className={`${styles.modal} ${styles.assignmentReport}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="assignment-report-title"
          >
            <header className={styles.modalHeader}>
              <span>
                <AdminIcon name="analytics" size={21} />
              </span>
              <div>
                <h2 id="assignment-report-title">รายงานการส่งงาน</h2>
                <p>
                  {reportAssignment.title} · {reportAssignment.className}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReportAssignment(null)}
                aria-label="ปิด"
              >
                <AdminIcon name="close" size={18} />
              </button>
            </header>
            <div className={styles.reportSummary}>
              <span>
                <small>ผู้เรียน</small>
                <strong>{reportAssignment.studentCount}</strong>
              </span>
              <span>
                <small>ส่งแล้ว</small>
                <strong>{reportAssignment.submittedCount}</strong>
              </span>
              <span>
                <small>ตรวจแล้ว</small>
                <strong>{reportAssignment.gradedCount}</strong>
              </span>
              <span>
                <small>คะแนนเต็ม</small>
                <strong>{reportAssignment.maxScore}</strong>
              </span>
            </div>
            <div className={styles.submissionList}>
              {reportLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div className={styles.rowSkeleton} key={index} />
                ))
              ) : submissions.length ? (
                submissions.map((item) => (
                  <article
                    className={styles.submissionRow}
                    key={item.studentId}
                  >
                    <span className={styles.studentAvatar}>
                      {initials(item.studentName)}
                    </span>
                    <div>
                      <strong>{item.studentName}</strong>
                      <small>{item.email}</small>
                    </div>
                    <span
                      className={
                        item.status === "submitted"
                          ? styles.readyBadge
                          : styles.draftBadge
                      }
                    >
                      {item.status === "submitted" ? "ส่งแล้ว" : "ยังไม่ส่ง"}
                    </span>
                    <div>
                      <strong>
                        {item.score == null
                          ? "—"
                          : `${item.score}/${reportAssignment.maxScore}`}
                      </strong>
                      <small>
                        {item.status === "submitted"
                          ? `ส่ง ${formatDate(item.submittedAt || "", true)}`
                          : "รอชิ้นงาน"}
                      </small>
                    </div>
                    <button
                      type="button"
                      disabled={item.status !== "submitted"}
                      onClick={() => openGrade(item)}
                    >
                      <AdminIcon
                        name={item.score == null ? "score" : "edit"}
                        size={15}
                      />
                      {item.score == null ? "ให้คะแนน" : "แก้คะแนน"}
                    </button>
                  </article>
                ))
              ) : (
                <div className={styles.compactEmpty}>
                  ห้องเรียนนี้ยังไม่มีนักเรียน
                </div>
              )}
            </div>
            <footer className={styles.modalFooter}>
              <button type="button" onClick={() => setReportAssignment(null)}>
                ปิดรายงาน
              </button>
            </footer>
          </section>
        </div>
      )}

      {grading && reportAssignment && (
        <div className={`${styles.modalOverlay} ${styles.gradeOverlay}`}>
          <section
            className={`${styles.modal} ${styles.compactModal}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="grade-title"
          >
            <header className={styles.modalHeader}>
              <span>
                <AdminIcon name="score" size={21} />
              </span>
              <div>
                <h2 id="grade-title">ประเมิน {grading.studentName}</h2>
                <p>คะแนนเต็ม {reportAssignment.maxScore} คะแนน</p>
              </div>
              <button
                type="button"
                onClick={() => setGrading(null)}
                aria-label="ปิด"
              >
                <AdminIcon name="close" size={18} />
              </button>
            </header>
            <form onSubmit={saveGrade}>
              <div className={styles.formGrid}>
                <label className={styles.fullField}>
                  <span>คะแนน *</span>
                  <input
                    autoFocus
                    required
                    type="number"
                    min="0"
                    max={reportAssignment.maxScore}
                    value={gradeScore}
                    onChange={(event) => setGradeScore(event.target.value)}
                  />
                </label>
                <label className={styles.fullField}>
                  <span>ข้อเสนอแนะ</span>
                  <textarea
                    rows={4}
                    maxLength={2000}
                    value={gradeFeedback}
                    onChange={(event) => setGradeFeedback(event.target.value)}
                    placeholder="ระบุจุดเด่นและสิ่งที่ควรปรับปรุง"
                  />
                </label>
              </div>
              <footer className={styles.modalFooter}>
                <button type="button" onClick={() => setGrading(null)}>
                  ยกเลิก
                </button>
                <button
                  className={styles.primaryButton}
                  type="submit"
                  disabled={busy === "grade"}
                >
                  <AdminIcon
                    name={busy === "grade" ? "clock" : "check"}
                    size={16}
                  />
                  บันทึกคะแนน
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

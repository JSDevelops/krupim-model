"use client";

import {
  FormEvent,
  Suspense,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import AdminIcon, { type AdminIconName } from "@/components/admin/AdminIcon";
import { confirmAction } from "@/components/AppConfirmDialog";
import { authenticatedFetch } from "@/lib/api";
import { exportSubmissionsToExcel, exportSubmissionsToPDF } from "@/lib/export";
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
type LessonPlanItem = {
  id: string;
  title: string;
  subject?: string;
  targetClass?: string;
  classId?: string;
  concept?: string;
  activitiesF?: string;
  activitiesI?: string;
  activitiesN?: string;
  activitiesE?: string;
};
type Assignment = {
  id: string;
  title: string;
  description: string;
  activityType: ActivityType;
  classId: string;
  className: string;
  lessonPlanId?: string | null;
  lessonPlanTitle?: string | null;
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
  status: "submitted" | "pending" | "returned" | "resubmitted";
  score?: number | null;
  feedback?: string | null;
  attachmentName?: string | null;
  attachmentUrl?: string | null;
  returnReason?: string | null;
  returnedAt?: string | null;
  rubricLevelK?: number | null;
  rubricLevelS?: number | null;
  rubricLevelA?: number | null;
  rubricLevelC?: number | null;
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
  lessonPlanId?: string;
};
const emptyForm: AssignmentForm = {
  title: "",
  description: "",
  activityType: "Familiarize",
  classId: "",
  dueDate: "",
  maxScore: "100",
  lessonPlanId: "",
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

const FEEDBACK_CHIPS = [
  "โมเดล 3D มีความละเอียดและสัดส่วนสมบูรณ์ 🌟",
  "การจัดแสงและ Texture สวยงามสมจริง 👍",
  "ควรปรับแต่ง Topology และลด polygon ที่ซ้ำซ้อน 💡",
  "ออกแบบสร้างสรรค์ ตรงตามเกณฑ์ KSA-C ครบถ้วน ✅",
  "ส่งงานตรงต่อเวลา มีวินัยในการทำงานยอดเยี่ยม 👏",
  "ควรระมัดระวังเรื่อง Scale และแกนหมุนของโมเดล ⚙️",
];

function getSubmissionFileType(
  url?: string | null,
  name?: string | null,
): "model" | "image" | "file" | "none" {
  if (!url) return "none";
  const str = (name || url).toLowerCase().split("?")[0];
  if (str.endsWith(".glb") || str.endsWith(".gltf") || str.endsWith(".usdz")) {
    return "model";
  }
  if (
    str.endsWith(".png") ||
    str.endsWith(".jpg") ||
    str.endsWith(".jpeg") ||
    str.endsWith(".webp") ||
    str.endsWith(".gif") ||
    str.endsWith(".svg")
  ) {
    return "image";
  }
  return "file";
}

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

function TeacherAssignmentsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const classesPath = pathname.startsWith("/admin") ? "/admin/classes" : "/teacher/classes";
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [lessonPlans, setLessonPlans] = useState<LessonPlanItem[]>([]);
  const handledFromPlanRef = useRef(false);
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
  const [ksaScores, setKsaScores] = useState({
    knowledge: 80,
    skills: 75,
    attitude: 85,
    competency: 70,
  });
  // Phase 2: Rubric levels (1-4) per KSA dimension
  const [rubricLevels, setRubricLevels] = useState<{
    knowledge: number | null;
    skills: number | null;
    attitude: number | null;
    competency: number | null;
  }>({ knowledge: null, skills: null, attitude: null, competency: null });
  // Phase 2: Return for Revision
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  // Phase 2: Export busy state
  const [exporting, setExporting] = useState<"excel" | "pdf" | null>(null);

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

  const loadLessons = useCallback(async () => {
    try {
      const response = await authenticatedFetch("/api/teacher/lessons", {
        cache: "no-store",
      });
      if (response.ok) {
        const payload = (await response.json()) as { lessons?: LessonPlanItem[] };
        setLessonPlans(payload.lessons || []);
      }
    } catch {
      // silent fallback
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(
      () =>
        void Promise.all([loadAssignments(), loadLessons()])
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
  }, [loadAssignments, loadLessons]);

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
      await Promise.all([loadAssignments(), loadLessons()]);
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

  function applyPlanActivity(plan: LessonPlanItem, step: ActivityType) {
    let activityDetail = "";
    if (step === "Familiarize") activityDetail = plan.activitiesF || "";
    else if (step === "Interact") activityDetail = plan.activitiesI || "";
    else if (step === "Navigate") activityDetail = plan.activitiesN || "";
    else if (step === "Exhibit") activityDetail = plan.activitiesE || "";

    let targetClassId = form.classId;
    if (plan.classId && classrooms.some((c) => c.id === plan.classId)) {
      targetClassId = plan.classId;
    } else if (plan.targetClass) {
      const found = classrooms.find(
        (c) =>
          c.name.includes(plan.targetClass!) ||
          plan.targetClass!.includes(c.name),
      );
      if (found) targetClassId = found.id;
    }

    const stepLabels: Record<ActivityType, string> = {
      Familiarize: "กิจกรรม F: สำรวจคำศัพท์และโมเดล 3D (Familiarize)",
      Interact: "กิจกรรม I: ฝึกสื่อสารและโต้ตอบ (Interact)",
      Navigate: "กิจกรรม N: แก้ปัญหาผ่านสถานการณ์ AR (Navigate)",
      Exhibit: "กิจกรรม E: สรุปผลงานและประเมินผล (Exhibit)",
    };

    setForm((prev) => ({
      ...prev,
      lessonPlanId: plan.id,
      classId: targetClassId || prev.classId,
      activityType: step,
      title: `${plan.title} - ${stepLabels[step]}`,
      description: activityDetail || plan.concept || prev.description,
      maxScore: step === "Exhibit" ? "20" : prev.maxScore || "10",
    }));
    toast.info(`ดึงกิจกรรม [${step[0]}] จากแผนการสอนเรียบร้อย`);
  }

  function openCreate(initialPlanId?: unknown, initialStep?: ActivityType) {
    setEditingId(null);
    const planId = typeof initialPlanId === "string" ? initialPlanId : "";
    const plan = lessonPlans.find((p) => p.id === planId);
    let classId = classrooms[0]?.id || "";
    if (plan?.classId && classrooms.some((c) => c.id === plan.classId)) {
      classId = plan.classId;
    } else if (plan?.targetClass) {
      const found = classrooms.find(
        (c) =>
          c.name.includes(plan.targetClass!) ||
          plan.targetClass!.includes(c.name),
      );
      if (found) classId = found.id;
    }

    let defaultDate = "";
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(23, 59, 0, 0);
    defaultDate = localDateTime(nextWeek.toISOString());

    const step = initialStep || "Familiarize";
    const stepLabels: Record<ActivityType, string> = {
      Familiarize: "กิจกรรม F: สำรวจคำศัพท์และโมเดล 3D (Familiarize)",
      Interact: "กิจกรรม I: ฝึกสื่อสารและโต้ตอบ (Interact)",
      Navigate: "กิจกรรม N: แก้ปัญหาผ่านสถานการณ์ AR (Navigate)",
      Exhibit: "กิจกรรม E: สรุปผลงานและประเมินผล (Exhibit)",
    };

    let activityDetail = "";
    if (plan) {
      if (step === "Familiarize") activityDetail = plan.activitiesF || "";
      else if (step === "Interact") activityDetail = plan.activitiesI || "";
      else if (step === "Navigate") activityDetail = plan.activitiesN || "";
      else if (step === "Exhibit") activityDetail = plan.activitiesE || "";
    }

    setForm({
      ...emptyForm,
      classId,
      lessonPlanId: planId,
      activityType: step,
      title: plan ? `${plan.title} - ${stepLabels[step]}` : "",
      description: plan ? activityDetail || plan.concept || "" : "",
      dueDate: defaultDate,
      maxScore: plan ? (step === "Exhibit" ? "20" : "10") : "100",
    });
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
      lessonPlanId: item.lessonPlanId || "",
    });
    setEditorOpen(true);
  }

  useEffect(() => {
    const fromPlan = searchParams.get("fromPlan");
    if (
      fromPlan &&
      !handledFromPlanRef.current &&
      lessonPlans.length > 0 &&
      classrooms.length > 0
    ) {
      handledFromPlanRef.current = true;
      const matched = lessonPlans.find((p) => p.id === fromPlan);
      if (matched) {
        openCreate(matched.id, "Familiarize");
        toast.success(`พร้อมมอบหมายงานจากแผน: ${matched.title}`);
      }
    }
  }, [searchParams, lessonPlans, classrooms]);
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
  const submittedList = useMemo(
    () => submissions.filter((s) => s.status === "submitted" || s.status === "resubmitted"),
    [submissions],
  );
  const currentGradeIndex = useMemo(
    () =>
      grading
        ? submittedList.findIndex((s) => s.studentId === grading.studentId)
        : -1,
    [grading, submittedList],
  );
  const nextStudent = useMemo(
    () =>
      currentGradeIndex >= 0 && currentGradeIndex < submittedList.length - 1
        ? submittedList[currentGradeIndex + 1]
        : null,
    [currentGradeIndex, submittedList],
  );
  const studentPositionText =
    currentGradeIndex >= 0
      ? `คนที่ ${currentGradeIndex + 1} จาก ${submittedList.length} คนที่ส่งงาน`
      : "";

  function openGrade(item: Submission) {
    setGrading(item);
    const max = reportAssignment?.maxScore || 100;
    if (item.score != null) {
      setGradeScore(String(item.score));
      const pct = Math.min(
        100,
        Math.max(0, Math.round((item.score / max) * 100)),
      );
      setKsaScores({
        knowledge: pct,
        skills: pct,
        attitude: Math.min(100, pct + 5),
        competency: pct,
      });
    } else {
      setGradeScore(String(Math.round(max * 0.75)));
      setKsaScores({
        knowledge: 80,
        skills: 75,
        attitude: 85,
        competency: 70,
      });
    }
    setGradeFeedback(item.feedback || "");
    setRubricLevels({
      knowledge: item.rubricLevelK ?? null,
      skills: item.rubricLevelS ?? null,
      attitude: item.rubricLevelA ?? null,
      competency: item.rubricLevelC ?? null,
    });
    setShowReturnDialog(false);
    setReturnReason("");
  }

  function handleKsaChange(key: keyof typeof ksaScores, val: number) {
    const clamped = Math.min(100, Math.max(0, val));
    setKsaScores((prev) => {
      const updated = { ...prev, [key]: clamped };
      if (reportAssignment && reportAssignment.maxScore > 0) {
        const overallPct =
          updated.knowledge * 0.2 +
          updated.skills * 0.3 +
          updated.attitude * 0.1 +
          updated.competency * 0.4;
        const calculatedScore = Math.round(
          (overallPct / 100) * reportAssignment.maxScore,
        );
        setGradeScore(String(calculatedScore));
      }
      return updated;
    });
  }

  function handleScoreInputChange(val: string) {
    setGradeScore(val);
    const num = Number(val);
    if (!isNaN(num) && reportAssignment && reportAssignment.maxScore > 0) {
      const pct = Math.min(
        100,
        Math.max(0, Math.round((num / reportAssignment.maxScore) * 100)),
      );
      setKsaScores({
        knowledge: pct,
        skills: pct,
        attitude: pct,
        competency: pct,
      });
    }
  }

  function addFeedbackChip(chip: string) {
    setGradeFeedback((prev) => {
      if (!prev.trim()) return chip;
      if (prev.includes(chip)) return prev;
      return `${prev}\n${chip}`;
    });
  }

  async function saveGrade(
    event?: FormEvent<HTMLFormElement> | React.MouseEvent,
    andNext: boolean = false,
  ) {
    if (event) event.preventDefault();
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
          knowledge: ksaScores.knowledge,
          skills: ksaScores.skills,
          attitude: ksaScores.attitude,
          competency: ksaScores.competency,
          rubricLevelK: rubricLevels.knowledge,
          rubricLevelS: rubricLevels.skills,
          rubricLevelA: rubricLevels.attitude,
          rubricLevelC: rubricLevels.competency,
        }),
      });
      if (!response.ok) throw new Error(await responseError(response));

      const updatedScore = Number(gradeScore);
      const gradedStudentName = grading.studentName;

      setSubmissions((current) =>
        current.map((item) =>
          item.studentId === grading.studentId
            ? {
                ...item,
                score: updatedScore,
                feedback: gradeFeedback,
                gradedAt: new Date().toISOString(),
              }
            : item,
        ),
      );
      setAssignments((current) =>
        current.map((item) =>
          item.id === reportAssignment.id
            ? {
                ...item,
                gradedCount:
                  item.gradedCount + (grading.score == null ? 1 : 0),
              }
            : item,
        ),
      );
      toast.success("บันทึกคะแนนแล้ว", { description: gradedStudentName });

      if (andNext && nextStudent) {
        openGrade(nextStudent);
      } else if (andNext && !nextStudent) {
        setGrading(null);
        toast.info("ตรวจครบทุกคนที่ส่งงานแล้ว 🎉");
      } else {
        setGrading(null);
      }
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

  // Phase 2: Rubric selection helper
  const RUBRIC_PCT: Record<number, number> = { 4: 95, 3: 85, 2: 70, 1: 50 };
  function handleRubricSelect(
    key: "knowledge" | "skills" | "attitude" | "competency",
    level: number,
  ) {
    const isCurrent = rubricLevels[key] === level;
    const newLevel = isCurrent ? null : level;
    setRubricLevels((prev) => ({ ...prev, [key]: newLevel }));
    if (!isCurrent) {
      handleKsaChange(key, RUBRIC_PCT[level] ?? 80);
    }
  }

  // Phase 2: Return for Revision handler
  async function returnSubmission() {
    if (!grading || !reportAssignment) return;
    if (!returnReason.trim()) {
      toast.error("กรุณาระบุสิ่งที่ต้องการให้นักเรียนแก้ไข");
      return;
    }
    setBusy("return");
    try {
      const response = await authenticatedFetch("/api/teacher/assignments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "return_submission",
          assignmentId: reportAssignment.id,
          studentId: grading.studentId,
          returnReason: returnReason.trim(),
        }),
      });
      if (!response.ok) throw new Error(await responseError(response));
      const returnedStudentName = grading.studentName;
      setSubmissions((current) =>
        current.map((item) =>
          item.studentId === grading.studentId
            ? {
                ...item,
                status: "returned",
                returnReason: returnReason.trim(),
                score: null,
                gradedAt: null,
              }
            : item,
        ),
      );
      toast.success("ส่งกลับให้แก้ไขแล้ว", { description: returnedStudentName });
      setShowReturnDialog(false);
      setReturnReason("");
      setGrading(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "ส่งกลับให้แก้ไขไม่สำเร็จ",
      );
    } finally {
      setBusy(null);
    }
  }

  // Phase 2: Export handlers
  async function handleExportExcel() {
    if (!reportAssignment || submissions.length === 0) return;
    setExporting("excel");
    try {
      await exportSubmissionsToExcel(
        submissions.map((s) => ({
          studentName: s.studentName,
          email: s.email,
          class: reportAssignment.className,
          status: s.status,
          score: s.score ?? null,
          maxScore: reportAssignment.maxScore,
          feedback: s.feedback,
          rubricLevelK: s.rubricLevelK,
          rubricLevelS: s.rubricLevelS,
          rubricLevelA: s.rubricLevelA,
          rubricLevelC: s.rubricLevelC,
          submittedAt: s.submittedAt ? formatDate(s.submittedAt, true) : null,
          gradedAt: s.gradedAt ? formatDate(s.gradedAt, true) : null,
        })),
        {
          title: reportAssignment.title,
          className: reportAssignment.className,
          activityType: reportAssignment.activityType,
          maxScore: reportAssignment.maxScore,
          dueDate: reportAssignment.dueDate,
        },
      );
      toast.success("ดาวน์โหลด Excel เรียบร้อยแล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ส่งออก Excel ไม่สำเร็จ");
    } finally {
      setExporting(null);
    }
  }

  async function handleExportPDF() {
    if (!reportAssignment || submissions.length === 0) return;
    setExporting("pdf");
    try {
      await exportSubmissionsToPDF(
        submissions.map((s) => ({
          studentName: s.studentName,
          email: s.email,
          class: reportAssignment.className,
          status: s.status,
          score: s.score ?? null,
          maxScore: reportAssignment.maxScore,
          feedback: s.feedback,
          rubricLevelK: s.rubricLevelK,
          rubricLevelS: s.rubricLevelS,
          rubricLevelA: s.rubricLevelA,
          rubricLevelC: s.rubricLevelC,
          submittedAt: s.submittedAt ? formatDate(s.submittedAt, true) : null,
          gradedAt: s.gradedAt ? formatDate(s.gradedAt, true) : null,
        })),
        {
          title: reportAssignment.title,
          className: reportAssignment.className,
          activityType: reportAssignment.activityType,
          maxScore: reportAssignment.maxScore,
          dueDate: reportAssignment.dueDate,
        },
      );
      toast.success("ดาวน์โหลด PDF เรียบร้อยแล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ส่งออก PDF ไม่สำเร็จ");
    } finally {
      setExporting(null);
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
                      {item.lessonPlanTitle && (
                        <span
                          className={styles.planBadge}
                          title={`อ้างอิงจากแผนการสอน: ${item.lessonPlanTitle}`}
                        >
                          📘 แผน: {item.lessonPlanTitle}
                        </span>
                      )}
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
                  <div
                    className={styles.fullField}
                    style={{
                      background: "#f4f9f6",
                      padding: "12px",
                      borderRadius: "12px",
                      border: "1px solid #d4e7dc",
                      display: "grid",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "6px",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: "11px",
                          color: "#214e36",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <AdminIcon name="content" size={15} />
                        อ้างอิงจากแผนการสอน FINE Model (Smart Template)
                      </span>
                      {form.lessonPlanId && (
                        <span style={{ fontSize: "10px", color: "#37704e" }}>
                          ⚡ คลิกปุ่มลัดด้านล่างเพื่อดึงกิจกรรม
                        </span>
                      )}
                    </div>

                    <select
                      value={form.lessonPlanId || ""}
                      onChange={(event) => {
                        const planId = event.target.value;
                        updateField("lessonPlanId", planId);
                        if (planId) {
                          const p = lessonPlans.find((lp) => lp.id === planId);
                          if (p) applyPlanActivity(p, form.activityType);
                        }
                      }}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "8px",
                        border: "1px solid #c9dfd2",
                        background: "#ffffff",
                        fontSize: "10px",
                        color: "#244336",
                        fontWeight: 600,
                      }}
                    >
                      <option value="">-- ไม่ผูกกับแผนการสอน (กรอกข้อมูลเองอิสระ) --</option>
                      {lessonPlans.map((lp) => (
                        <option value={lp.id} key={lp.id}>
                          📘 {lp.title} {lp.targetClass ? `(${lp.targetClass})` : ""}
                        </option>
                      ))}
                    </select>

                    {form.lessonPlanId && (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                          gap: "6px",
                        }}
                      >
                        {(
                          ["Familiarize", "Interact", "Navigate", "Exhibit"] as ActivityType[]
                        ).map((step) => {
                          const isActive = form.activityType === step;
                          return (
                            <button
                              key={step}
                              type="button"
                              onClick={() => {
                                const p = lessonPlans.find(
                                  (lp) => lp.id === form.lessonPlanId,
                                );
                                if (p) applyPlanActivity(p, step);
                              }}
                              style={{
                                padding: "6px 8px",
                                fontSize: "10px",
                                fontWeight: 700,
                                borderRadius: "8px",
                                border: isActive
                                  ? "2px solid #2d7a55"
                                  : "1px solid #d0e2d7",
                                background: isActive ? "#e3f3ea" : "#ffffff",
                                color: isActive ? "#1c5e3d" : "#4a6355",
                                cursor: "pointer",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "2px",
                                transition: "all 0.15s ease",
                              }}
                            >
                              <span>[{step[0]}] {step}</span>
                              <small
                                style={{
                                  fontSize: "8px",
                                  opacity: 0.85,
                                  fontWeight: 400,
                                }}
                              >
                                {activityMeta[step].detail}
                              </small>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
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
            {/* Phase 2: Export Bar */}
            <div className={styles.exportBar}>
              <span>ส่งออกข้อมูลผลการเรียน ({submissions.length} คน)</span>
              <button
                type="button"
                className={styles.exportBtn}
                onClick={handleExportExcel}
                disabled={exporting !== null || submissions.length === 0}
              >
                <AdminIcon name="download" size={14} />
                {exporting === "excel" ? "กำลังส่งออก..." : "Export Excel (.xlsx)"}
              </button>
              <button
                type="button"
                className={styles.exportBtn}
                data-variant="pdf"
                onClick={handleExportPDF}
                disabled={exporting !== null || submissions.length === 0}
              >
                <AdminIcon name="download" size={14} />
                {exporting === "pdf" ? "กำลังส่งออก..." : "Export PDF"}
              </button>
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
                        item.status === "returned"
                          ? styles.returnedBadge
                          : item.status === "resubmitted"
                          ? styles.resubmittedBadge
                          : item.status === "submitted"
                          ? styles.readyBadge
                          : styles.draftBadge
                      }
                    >
                      {item.status === "returned"
                        ? "ส่งกลับแก้ไข"
                        : item.status === "resubmitted"
                        ? "ส่งใหม่แล้ว"
                        : item.status === "submitted"
                        ? "ส่งแล้ว"
                        : "ยังไม่ส่ง"}
                    </span>
                    <div>
                      <strong>
                        {item.score == null
                          ? "—"
                          : `${item.score}/${reportAssignment.maxScore}`}
                      </strong>
                      <small>
                        {item.status === "returned"
                          ? `ส่งกลับ ${formatDate(item.returnedAt || "", true)}`
                          : item.status === "submitted" || item.status === "resubmitted"
                          ? `ส่ง ${formatDate(item.submittedAt || "", true)}`
                          : "รอชิ้นงาน"}
                      </small>
                    </div>
                    <button
                      type="button"
                      disabled={item.status === "pending"}
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
            className={`${styles.modal} ${styles.gradeModal}`}
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
                <p>
                  คะแนนเต็ม {reportAssignment.maxScore} คะแนน • {grading.email}
                  {studentPositionText ? ` (${studentPositionText})` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setGrading(null)}
                aria-label="ปิด"
              >
                <AdminIcon name="close" size={18} />
              </button>
            </header>
            <form onSubmit={(e) => saveGrade(e, false)}>
              <div className={styles.formGrid}>
                {/* 1. In-App 3D & Media Previewer */}
                {(() => {
                  const fileType = getSubmissionFileType(
                    grading.attachmentUrl,
                    grading.attachmentName,
                  );
                  if (fileType === "model") {
                    return (
                      <div className={`${styles.fullField} ${styles.mediaPreviewBox}`}>
                        <div
                          style={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 8,
                          }}
                        >
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 800,
                              color: "#1e4d35",
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <AdminIcon name="cube" size={16} /> ผลงานโมเดล 3D (หมุน / ซูม 360°)
                          </span>
                          {grading.attachmentUrl && (
                            <a
                              href={grading.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              style={{
                                fontSize: "10px",
                                color: "#1f573c",
                                textDecoration: "underline",
                                fontWeight: 600,
                              }}
                            >
                              ดาวน์โหลดไฟล์ ({grading.attachmentName || "model.glb"}) ⬇
                            </a>
                          )}
                        </div>
                        <model-viewer
                          src={grading.attachmentUrl || undefined}
                          alt={grading.attachmentName || "โมเดล 3D ผลงานนักเรียน"}
                          camera-controls=""
                          auto-rotate=""
                          shadow-intensity="1.2"
                          exposure="1.0"
                          class={styles.modelViewerElement}
                        />
                      </div>
                    );
                  }
                  if (fileType === "image") {
                    return (
                      <div className={`${styles.fullField} ${styles.mediaPreviewBox}`}>
                        <div
                          style={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 8,
                          }}
                        >
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 800,
                              color: "#1e4d35",
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <AdminIcon name="content" size={16} /> ภาพผลงานที่นักเรียนแนบมา
                          </span>
                          {grading.attachmentUrl && (
                            <a
                              href={grading.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontSize: "10px",
                                color: "#1f573c",
                                textDecoration: "underline",
                                fontWeight: 600,
                              }}
                            >
                              เปิดดูภาพเต็มจอ ↗
                            </a>
                          )}
                        </div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={grading.attachmentUrl || ""}
                          alt={grading.attachmentName || "ภาพผลงาน"}
                          className={styles.imagePreviewElement}
                        />
                      </div>
                    );
                  }
                  if (fileType === "file") {
                    return (
                      <div className={styles.fullField}>
                        <div className={styles.fileDownloadBox}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <AdminIcon name="content" size={20} />
                            <div>
                              <strong>{grading.attachmentName || "ไฟล์ผลงานของนักเรียน"}</strong>
                              <p style={{ margin: "2px 0 0", fontSize: "9px", color: "#6a7b72" }}>
                                แนบเมื่อ {formatDate(grading.submittedAt || "", true)}
                              </p>
                            </div>
                          </div>
                          <a
                            href={grading.attachmentUrl || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                          >
                            ดาวน์โหลดไฟล์ ⬇
                          </a>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div
                      className={styles.fullField}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "8px",
                        background: "#f4f7f5",
                        color: "#6b7a72",
                        fontSize: "10px",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <AdminIcon name="activity" size={14} />
                      <span>นักเรียนส่งงานแบบข้อความ / ไม่มีไฟล์แนบ 3D</span>
                    </div>
                  );
                })()}

                {/* 2. Unified KSA-C Assessment */}
                <div className={`${styles.fullField} ${styles.ksaSection}`}>
                  <div className={styles.ksaHeader}>
                    <h4>
                      <AdminIcon name="analytics" size={15} /> เกณฑ์ประเมินสมรรถนะ KSA-C (คำนวณคะแนนรวมอัตโนมัติ)
                    </h4>
                    <span>
                      สมรรถนะรวม:{" "}
                      {Math.round(
                        ksaScores.knowledge * 0.2 +
                          ksaScores.skills * 0.3 +
                          ksaScores.attitude * 0.1 +
                          ksaScores.competency * 0.4,
                      )}
                      %
                    </span>
                  </div>
                  <div className={styles.ksaGrid}>
                    <div className={styles.ksaItem}>
                      <div className={styles.ksaItemTop}>
                        <span>
                          <b style={{ background: "#2563eb" }}>K</b> ความรู้ความเข้าใจ (Knowledge 20%)
                        </span>
                        <strong>{ksaScores.knowledge}/100</strong>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={ksaScores.knowledge}
                        onChange={(e) =>
                          handleKsaChange("knowledge", Number(e.target.value))
                        }
                        className={styles.ksaSlider}
                      />
                      <div className={styles.rubricLevels}>
                        {[
                          { level: 4, label: "ดีเยี่ยม (4)" },
                          { level: 3, label: "ดี (3)" },
                          { level: 2, label: "พอใช้ (2)" },
                          { level: 1, label: "ปรับปรุง (1)" },
                        ].map(({ level, label }) => (
                          <button
                            key={level}
                            type="button"
                            className={styles.rubricBtn}
                            data-level={level}
                            data-active={rubricLevels.knowledge === level}
                            onClick={() => handleRubricSelect("knowledge", level)}
                            title={`เกณฑ์ระดับ ${level}`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className={styles.ksaItem}>
                      <div className={styles.ksaItemTop}>
                        <span>
                          <b style={{ background: "#059669" }}>S</b> ทักษะปฏิบัติ 3D (Skills 30%)
                        </span>
                        <strong>{ksaScores.skills}/100</strong>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={ksaScores.skills}
                        onChange={(e) =>
                          handleKsaChange("skills", Number(e.target.value))
                        }
                        className={styles.ksaSlider}
                      />
                      <div className={styles.rubricLevels}>
                        {[
                          { level: 4, label: "ดีเยี่ยม (4)" },
                          { level: 3, label: "ดี (3)" },
                          { level: 2, label: "พอใช้ (2)" },
                          { level: 1, label: "ปรับปรุง (1)" },
                        ].map(({ level, label }) => (
                          <button
                            key={level}
                            type="button"
                            className={styles.rubricBtn}
                            data-level={level}
                            data-active={rubricLevels.skills === level}
                            onClick={() => handleRubricSelect("skills", level)}
                            title={`เกณฑ์ระดับ ${level}`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className={styles.ksaItem}>
                      <div className={styles.ksaItemTop}>
                        <span>
                          <b style={{ background: "#d97706" }}>A</b> วินัยและความรับผิดชอบ (Attitude 10%)
                        </span>
                        <strong>{ksaScores.attitude}/100</strong>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={ksaScores.attitude}
                        onChange={(e) =>
                          handleKsaChange("attitude", Number(e.target.value))
                        }
                        className={styles.ksaSlider}
                      />
                      <div className={styles.rubricLevels}>
                        {[
                          { level: 4, label: "ดีเยี่ยม (4)" },
                          { level: 3, label: "ดี (3)" },
                          { level: 2, label: "พอใช้ (2)" },
                          { level: 1, label: "ปรับปรุง (1)" },
                        ].map(({ level, label }) => (
                          <button
                            key={level}
                            type="button"
                            className={styles.rubricBtn}
                            data-level={level}
                            data-active={rubricLevels.attitude === level}
                            onClick={() => handleRubricSelect("attitude", level)}
                            title={`เกณฑ์ระดับ ${level}`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className={styles.ksaItem}>
                      <div className={styles.ksaItemTop}>
                        <span>
                          <b style={{ background: "#7c3aed" }}>C</b> สมรรถนะสำคัญ (Competency 40%)
                        </span>
                        <strong>{ksaScores.competency}/100</strong>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={ksaScores.competency}
                        onChange={(e) =>
                          handleKsaChange("competency", Number(e.target.value))
                        }
                        className={styles.ksaSlider}
                      />
                      <div className={styles.rubricLevels}>
                        {[
                          { level: 4, label: "ดีเยี่ยม (4)" },
                          { level: 3, label: "ดี (3)" },
                          { level: 2, label: "พอใช้ (2)" },
                          { level: 1, label: "ปรับปรุง (1)" },
                        ].map(({ level, label }) => (
                          <button
                            key={level}
                            type="button"
                            className={styles.rubricBtn}
                            data-level={level}
                            data-active={rubricLevels.competency === level}
                            onClick={() => handleRubricSelect("competency", level)}
                            title={`เกณฑ์ระดับ ${level}`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Score Input */}
                <label className={styles.fullField}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>คะแนนที่ได้รับ (เต็ม {reportAssignment.maxScore} คะแนน) *</span>
                    <span style={{ fontSize: "10px", color: "#52665a", fontWeight: 700 }}>
                      {reportAssignment.maxScore > 0
                        ? `${Math.round((Number(gradeScore || 0) / reportAssignment.maxScore) * 100)}% ของคะแนนเต็ม`
                        : ""}
                    </span>
                  </div>
                  <input
                    required
                    type="number"
                    min="0"
                    max={reportAssignment.maxScore}
                    value={gradeScore}
                    onChange={(event) => handleScoreInputChange(event.target.value)}
                  />
                </label>

                {/* 4. Feedback & Quick Feedback Chips */}
                <label className={styles.fullField}>
                  <span>ข้อเสนอแนะและคำติชม</span>
                  <div className={styles.chipsContainer}>
                    {FEEDBACK_CHIPS.map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={styles.chipBtn}
                        onClick={() => addFeedbackChip(chip)}
                      >
                        + {chip}
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={3}
                    maxLength={2000}
                    value={gradeFeedback}
                    onChange={(event) => setGradeFeedback(event.target.value)}
                    placeholder="ระบุจุดเด่น ข้อเสนอแนะ หรือคลิกชิปข้อเสนอแนะด่วนด้านบน"
                    style={{ marginTop: 6 }}
                  />
                </label>
              </div>

              {/* Phase 2: Return for Revision Dialog */}
              {showReturnDialog && (
                <div className={styles.returnDialog}>
                  <p>↩️ ส่งกลับให้นักเรียนแก้ไขชิ้นงาน</p>
                  <small>
                    สถานะการส่งงานจะเปลี่ยนเป็น &quot;ส่งกลับแก้ไข&quot; และระบบจะแจ้งเตือนไปยังนักเรียนพร้อมข้อความนี้
                  </small>
                  <textarea
                    rows={2}
                    maxLength={1000}
                    placeholder="ระบุสิ่งที่ต้องการให้นักเรียนปรับปรุง เช่น แก้ไขรูปทรง 3D, ปรับขนาด หรือแนบรูปเพิ่มเติม..."
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                  />
                  <div className={styles.returnDialogActions}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowReturnDialog(false);
                        setReturnReason("");
                      }}
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      className={styles.returnConfirmBtn}
                      disabled={busy === "return" || !returnReason.trim()}
                      onClick={returnSubmission}
                    >
                      {busy === "return" ? "กำลังส่งกลับ..." : "ยืนยันส่งกลับให้แก้ไข"}
                    </button>
                  </div>
                </div>
              )}

              {/* 5. Continuous Grading Footer */}
              <footer className={styles.modalFooter}>
                <div className={styles.continuousNav}>
                  {studentPositionText && <span>{studentPositionText}</span>}
                </div>
                <button
                  type="button"
                  className={styles.returnBtn}
                  disabled={busy === "grade" || busy === "return"}
                  onClick={() => setShowReturnDialog((prev) => !prev)}
                >
                  ↩️ ส่งกลับแก้ไข
                </button>
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
                {nextStudent && (
                  <button
                    type="button"
                    className={styles.nextBtn}
                    disabled={busy === "grade"}
                    onClick={(e) => saveGrade(e, true)}
                    title={`บันทึกและตรวจต่อ: ${nextStudent.studentName}`}
                  >
                    บันทึก & ตรวจคนถัดไป ➔
                  </button>
                )}
              </footer>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default function TeacherAssignmentsPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "40px", textAlign: "center", color: "#66766d" }}>
          กำลังโหลดข้อมูลงานมอบหมาย...
        </div>
      }
    >
      <TeacherAssignmentsContent />
    </Suspense>
  );
}

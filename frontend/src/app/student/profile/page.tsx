"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useRole } from "@/context/RoleContext";
import { authenticatedFetch } from "@/lib/api";
import { passwordPolicyError } from "@/lib/passwordPolicy";
import { toast } from "sonner";
import StudentIcon, { type StudentIconName } from "../StudentIcon";
import styles from "../studentPages.module.css";

type Profile = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatarUrl: string;
  schoolId: string;
  schoolName: string;
  phone: string;
  bio: string;
};
type Stats = {
  knowledgeScore: number;
  skillsScore: number;
  attitudeScore: number;
  competencyScore: number;
  overallScore: number;
  lessonsCompleted: number;
  timeSpentMinutes: number;
  sessions: number;
};
type Task = {
  id: string;
  title: string;
  description: string;
  activityType: string;
  dueDate: string | null;
  maxScore: number;
  className: string;
  status: "pending" | "submitted";
  score: number | null;
  feedback: string | null;
};
type ProfileForm = {
  name: string;
  schoolName: string;
  phone: string;
  bio: string;
  avatarUrl: string;
};
type Certificate = {
  certificateCode: string;
  issuedName: string;
  schoolName: string | null;
  overallScore: number;
  issuedAt: string;
};

const emptyStats: Stats = {
  knowledgeScore: 0,
  skillsScore: 0,
  attitudeScore: 0,
  competencyScore: 0,
  overallScore: 0,
  lessonsCompleted: 0,
  timeSpentMinutes: 0,
  sessions: 0,
};
const manuals: Array<{
  icon: StudentIconName;
  title: string;
  content: string;
}> = [
  {
    icon: "target",
    title: "F — Familiarize: สำรวจและเรียนรู้คำศัพท์",
    content:
      "เริ่มจากหน้า Explore เพื่อดูอุปกรณ์ คำศัพท์ คำอ่าน และประโยคตัวอย่าง ก่อนนำไปฝึกในขั้นถัดไป",
  },
  {
    icon: "message",
    title: "I — Interact: ฝึกฟังและพูดตาม",
    content:
      "ฟังเสียงต้นแบบ พูดตาม และดูผลประเมินรายคำ ระบบจะช่วยชี้คำที่ควรกลับไปฝึกเพิ่มเติม",
  },
  {
    icon: "task",
    title: "N — Navigate: ฝึกตามสถานการณ์",
    content:
      "เลือกสถานการณ์จากแผนการสอน เตรียมคำศัพท์และประโยค แล้วทดลองใช้ในห้องจำลองเสมือนจริง",
  },
  {
    icon: "exhibit",
    title: "E — Exhibit: ทดสอบและทบทวนผล",
    content:
      "ตรวจประวัติการฝึก ทำแบบทดสอบ และติดตามคะแนนที่ได้รับจากกิจกรรมและการประเมินของคุณครู",
  },
];

function formatDate(value: string | null) {
  if (!value) return "ไม่กำหนด";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("th-TH", { dateStyle: "medium" }).format(date);
}

function taskPath(type: string) {
  const value = type.toLocaleLowerCase("en");
  if (value.includes("interact")) return "/student/interact";
  if (value.includes("navigate")) return "/student/navigate";
  if (value.includes("exhibit")) return "/student/exhibit";
  return "/student/explore";
}

async function resizeAvatar(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("กรุณาเลือกไฟล์รูปภาพ");
  if (file.size > 8_000_000) throw new Error("รูปภาพต้องมีขนาดไม่เกิน 8 MB");
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const item = new Image();
      item.onload = () => resolve(item);
      item.onerror = reject;
      item.src = url;
    });
    const scale = Math.min(1, 420 / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    canvas
      .getContext("2d")
      ?.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/webp", 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function StudentProfilePage() {
  const router = useRouter();
  const { user, setUser, logout } = useRole();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState(emptyStats);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "tasks" | "manual">(
    "overview",
  );
  const [expandedManual, setExpandedManual] = useState<number | null>(null);
  const [profileModal, setProfileModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [certificateModal, setCertificateModal] = useState(false);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [submitTask, setSubmitTask] = useState<Task | null>(null);
  const [submission, setSubmission] = useState({
    attachmentName: "",
    attachmentUrl: "",
  });
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    name: "",
    schoolName: "",
    phone: "",
    bio: "",
    avatarUrl: "",
  });
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await authenticatedFetch("/api/student/profile", {
          signal: controller.signal,
        });
        if (!response.ok) return;
        const payload = (await response.json()) as {
          profile: Profile;
          stats: Stats;
          tasks: Task[];
        };
        setProfile(payload.profile);
        setStats(payload.stats || emptyStats);
        setTasks(payload.tasks || []);
        setForm({
          name: payload.profile.name || "",
          schoolName: payload.profile.schoolName || "",
          phone: payload.profile.phone || "",
          bio: payload.profile.bio || "",
          avatarUrl: payload.profile.avatarUrl || "",
        });
      } catch (error) {
        if (!controller.signal.aborted)
          console.warn("Unable to load student profile:", error);
      }
    }
    void load();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    authenticatedFetch("/api/student/certificates", {
      signal: controller.signal,
    })
      .then(async (response) =>
        response.ok
          ? (response.json() as Promise<{ certificate: Certificate | null }>)
          : null,
      )
      .then((payload) => {
        if (payload?.certificate) setCertificate(payload.certificate);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  const pendingTasks = useMemo(
    () => tasks.filter((task) => task.status === "pending"),
    [tasks],
  );
  const completedTasks = tasks.length - pendingTasks.length;
  const overall =
    stats.overallScore ||
    Math.round(
      stats.knowledgeScore * 0.2 +
        stats.skillsScore * 0.3 +
        stats.attitudeScore * 0.1 +
        stats.competencyScore * 0.4,
    );
  const certified =
    overall >= 70 &&
    [
      stats.knowledgeScore,
      stats.skillsScore,
      stats.attitudeScore,
      stats.competencyScore,
    ].every((score) => score >= 60);
  const displayName = profile?.name || user?.name || "นักเรียน";
  const avatarUrl =
    form.avatarUrl || profile?.avatarUrl || user?.avatar_url || "";

  async function openCertificate() {
    if (!certified && !certificate) return;
    if (certificate) {
      setCertificateModal(true);
      return;
    }
    setSaving(true);
    try {
      const response = await authenticatedFetch("/api/student/certificates", {
        method: "POST",
      });
      const payload = (await response.json()) as {
        certificate?: Certificate;
        error?: string;
      };
      if (!response.ok || !payload.certificate)
        throw new Error(payload.error || "ไม่สามารถออกใบรับรองได้");
      setCertificate(payload.certificate);
      setCertificateModal(true);
      toast.success("ออกเลขที่ใบรับรองเรียบร้อยแล้ว");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "ไม่สามารถออกใบรับรองได้",
      );
    } finally {
      setSaving(false);
    }
  }

  async function avatarChanged(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setSaving(true);
      const dataUrl = await resizeAvatar(file);
      const response = await authenticatedFetch("/api/profile/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl }),
      });
      const payload = (await response.json()) as {
        avatarUrl?: string;
        error?: string;
      };
      if (!response.ok || !payload.avatarUrl)
        throw new Error(payload.error || "อัปโหลดรูปโปรไฟล์ไม่สำเร็จ");
      const avatarUrl = payload.avatarUrl;
      setForm((value) => ({ ...value, avatarUrl }));
      setProfile((value) => (value ? { ...value, avatarUrl } : value));
      if (user) setUser({ ...user, avatar_url: avatarUrl, avatar: avatarUrl });
      setProfileModal(true);
      toast.success("บันทึกรูปโปรไฟล์แล้ว");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "ไม่สามารถอ่านรูปภาพได้",
      );
    } finally {
      setSaving(false);
    }
    event.target.value = "";
  }

  async function saveProfile() {
    if (!form.name.trim()) {
      toast.warning("กรุณากรอกชื่อ–นามสกุล");
      return;
    }
    setSaving(true);
    try {
      const response = await authenticatedFetch("/api/student/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_profile", ...form }),
      });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload.error || "บันทึกโปรไฟล์ไม่สำเร็จ");
      setProfile(payload.profile);
      setUser({
        ...user!,
        name: payload.profile.name,
        avatar_url: payload.profile.avatarUrl,
        school: payload.profile.schoolName,
        school_id: payload.profile.schoolId,
      });
      setProfileModal(false);
      toast.success("บันทึกโปรไฟล์แล้ว");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "บันทึกโปรไฟล์ไม่สำเร็จ",
      );
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    const policyError = passwordPolicyError(passwords.next);
    if (policyError) {
      toast.warning(policyError);
      return;
    }
    if (passwords.next !== passwords.confirm) {
      toast.warning("ยืนยันรหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }
    setSaving(true);
    try {
      const response = await authenticatedFetch("/api/student/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change_password",
          currentPassword: passwords.current,
          newPassword: passwords.next,
        }),
      });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload.error || "เปลี่ยนรหัสผ่านไม่สำเร็จ");
      setPasswords({ current: "", next: "", confirm: "" });
      setPasswordModal(false);
      toast.success("เปลี่ยนรหัสผ่านแล้ว กรุณาเข้าสู่ระบบใหม่");
      window.setTimeout(() => router.replace("/role-select"), 600);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "เปลี่ยนรหัสผ่านไม่สำเร็จ",
      );
    } finally {
      setSaving(false);
    }
  }

  async function submitAssignment() {
    if (!submitTask) return;
    setSaving(true);
    try {
      let attachmentName = submission.attachmentName;
      let attachmentUrl = submission.attachmentUrl;
      if (submissionFile) {
        const upload = new FormData();
        upload.set("assignmentId", submitTask.id);
        upload.set("file", submissionFile);
        const uploadResponse = await authenticatedFetch("/api/student/files", {
          method: "POST",
          body: upload,
        });
        const uploadPayload = (await uploadResponse.json()) as {
          file?: { name: string; url: string };
          error?: string;
        };
        if (!uploadResponse.ok || !uploadPayload.file)
          throw new Error(uploadPayload.error || "อัปโหลดไฟล์ไม่สำเร็จ");
        attachmentName = attachmentName || uploadPayload.file.name;
        attachmentUrl = uploadPayload.file.url;
      }
      const response = await authenticatedFetch("/api/student/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: submitTask.id,
          attachmentName,
          attachmentUrl,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "ส่งงานไม่สำเร็จ");
      setTasks((items) =>
        items.map((item) =>
          item.id === submitTask.id ? { ...item, status: "submitted" } : item,
        ),
      );
      setSubmitTask(null);
      setSubmission({ attachmentName: "", attachmentUrl: "" });
      setSubmissionFile(null);
      toast.success("ส่งงานเรียบร้อยแล้ว");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ส่งงานไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  function closeSubmission() {
    setSubmitTask(null);
    setSubmission({ attachmentName: "", attachmentUrl: "" });
    setSubmissionFile(null);
  }

  const tabs = [
    {
      id: "overview" as const,
      label: "สมรรถนะ",
      icon: "chart" as StudentIconName,
    },
    {
      id: "tasks" as const,
      label: "งาน",
      icon: "task" as StudentIconName,
      count: pendingTasks.length,
    },
    { id: "manual" as const, label: "คู่มือ", icon: "book" as StudentIconName },
  ];

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={`${styles.hero} ${styles.profileHero}`}>
          <div className={styles.profileIdentity}>
            <label
              className={styles.avatarButton}
              aria-label="เลือกรูปโปรไฟล์ใหม่"
            >
              {avatarUrl ? (
                <span
                  className={styles.avatarImage}
                  style={{
                    backgroundImage: `url(${JSON.stringify(avatarUrl).slice(1, -1)})`,
                  }}
                />
              ) : (
                <StudentIcon name="user" size={31} />
              )}
              <span className={styles.avatarOverlay}>
                <StudentIcon name="camera" size={14} />
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={avatarChanged}
              />
            </label>
            <div className={styles.profileCopy}>
              <div className={styles.eyebrow}>Student portfolio</div>
              <h1>{displayName}</h1>
              <p>{profile?.email || user?.email}</p>
              <span className={styles.meta}>
                <StudentIcon name="school" size={13} />
                {profile?.schoolName || "ยังไม่ได้ระบุสถานศึกษา"}
              </span>
            </div>
          </div>
          <div className={styles.profileActions}>
            <button
              type="button"
              className={styles.heroAction}
              onClick={() => setProfileModal(true)}
            >
              <StudentIcon name="edit" size={15} />
              แก้ไขโปรไฟล์
            </button>
            <button
              type="button"
              className={styles.heroAction}
              onClick={() => setPasswordModal(true)}
            >
              <StudentIcon name="lock" size={15} />
              เปลี่ยนรหัสผ่าน
            </button>
          </div>
        </section>

        <nav className={styles.tabs} aria-label="ข้อมูลโปรไฟล์นักเรียน">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <StudentIcon name={tab.icon} size={15} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={styles.badge}>{tab.count}</span>
              )}
            </button>
          ))}
        </nav>

        <section className={styles.content}>
          {activeTab === "overview" && (
            <div className={`${styles.grid} ${styles.two}`}>
              <div>
                {certified || certificate ? (
                  <button
                    type="button"
                    className={styles.certificateBanner}
                    onClick={() => void openCertificate()}
                    disabled={saving}
                  >
                    <span className={`${styles.iconBox} ${styles.goldIcon}`}>
                      <StudentIcon name="award" />
                    </span>
                    <span>
                      <strong>
                        {certificate
                          ? "ใบรับรองสมรรถนะของคุณ"
                          : "ปลดล็อกใบรับรองสมรรถนะแล้ว"}
                      </strong>
                      <span>
                        {certificate
                          ? `เลขที่ ${certificate.certificateCode}`
                          : "คะแนนรวมผ่านเกณฑ์ แตะเพื่อออกใบรับรอง"}
                      </span>
                    </span>
                    <StudentIcon name="chevron" size={18} />
                  </button>
                ) : (
                  <div className={styles.notice}>
                    <StudentIcon name="info" size={18} />
                    <span>
                      คะแนนรวมปัจจุบัน {overall}%
                      ใบรับรองต้องมีคะแนนรวมอย่างน้อย 70% และทุกด้านไม่ต่ำกว่า
                      60%
                    </span>
                  </div>
                )}
                <div className={styles.card} style={{ marginTop: 10 }}>
                  <div className={styles.cardTitle}>
                    <span className={styles.iconBox}>
                      <StudentIcon name="chart" />
                    </span>
                    <div>
                      <h2>สมรรถนะ KSA-C</h2>
                      <p>คะแนนล่าสุดจากระบบประเมิน</p>
                    </div>
                  </div>
                  <div className={styles.breakdown}>
                    {[
                      ["Knowledge — ความรู้", stats.knowledgeScore, "#39745d"],
                      ["Skills — ทักษะ", stats.skillsScore, "#4d7896"],
                      ["Attitude — เจตคติ", stats.attitudeScore, "#c19a42"],
                      [
                        "Competency — สมรรถนะ",
                        stats.competencyScore,
                        "#915363",
                      ],
                    ].map(([label, value, color]) => (
                      <div key={String(label)}>
                        <div className={styles.metricTop}>
                          <span>{label}</span>
                          <strong>{value}%</strong>
                        </div>
                        <div className={styles.metricTrack}>
                          <div
                            className={styles.metricBar}
                            style={{
                              width: `${value}%`,
                              background: String(color),
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className={styles.card}>
                <div className={styles.cardTitle}>
                  <span className={`${styles.iconBox} ${styles.blueIcon}`}>
                    <StudentIcon name="profile" />
                  </span>
                  <div>
                    <h2>ภาพรวมการเรียนรู้</h2>
                    <p>ข้อมูลกิจกรรมสะสมของคุณ</p>
                  </div>
                </div>
                <div className={styles.factGrid}>
                  <div className={styles.fact}>
                    <span>คะแนนรวม</span>
                    <strong>{overall}%</strong>
                  </div>
                  <div className={styles.fact}>
                    <span>จำนวนเซสชัน</span>
                    <strong>{stats.sessions} ครั้ง</strong>
                  </div>
                  <div className={styles.fact}>
                    <span>บทเรียนสำเร็จ</span>
                    <strong>{stats.lessonsCompleted} บท</strong>
                  </div>
                  <div className={styles.fact}>
                    <span>เวลาเรียน</span>
                    <strong>{stats.timeSpentMinutes} นาที</strong>
                  </div>
                </div>
                <Link
                  className={`${styles.button} ${styles.full}`}
                  href="/student/dashboard"
                >
                  ไปยังแดชบอร์ด <StudentIcon name="arrowRight" size={16} />
                </Link>
                <button
                  type="button"
                  className={`${styles.dangerButton} ${styles.full}`}
                  style={{ marginTop: 8 }}
                  onClick={logout}
                >
                  <StudentIcon name="logout" size={16} />
                  ออกจากระบบ
                </button>
              </div>
            </div>
          )}

          {activeTab === "tasks" && (
            <>
              <header className={styles.sectionHeader}>
                <h2>งานที่ได้รับมอบหมาย</h2>
                <p>
                  {pendingTasks.length} งานคงค้าง และ {completedTasks}{" "}
                  งานที่ส่งแล้ว
                </p>
              </header>
              {tasks.length ? (
                <div className={styles.taskList}>
                  {tasks.map((task) => (
                    <article className={styles.taskCard} key={task.id}>
                      <div className={styles.taskTop}>
                        <span className={styles.taskIcon}>
                          <StudentIcon name="task" />
                        </span>
                        <div className={styles.taskCopy}>
                          <strong>{task.title}</strong>
                          <p>
                            {task.description || `งานจากห้อง ${task.className}`}
                          </p>
                          <div className={styles.taskMeta}>
                            <span>
                              <StudentIcon name="school" size={13} />
                              {task.className}
                            </span>
                            <span>
                              <StudentIcon name="calendar" size={13} />
                              {formatDate(task.dueDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className={styles.taskFooter}>
                        <span
                          className={`${styles.taskStatus} ${task.status === "submitted" ? styles.done : ""}`}
                        >
                          {task.status === "submitted"
                            ? `ส่งแล้ว${task.score !== null ? ` · ${task.score}/${task.maxScore}` : ""}`
                            : "รอดำเนินการ"}
                        </span>
                        {task.status === "pending" && (
                          <>
                            <Link
                              className={styles.outlineButton}
                              href={taskPath(task.activityType)}
                            >
                              เปิดกิจกรรม
                            </Link>
                            <button
                              type="button"
                              className={styles.button}
                              onClick={() => setSubmitTask(task)}
                            >
                              ส่งงาน
                            </button>
                          </>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className={`${styles.card} ${styles.empty}`}>
                  <StudentIcon name="task" size={26} />
                  <strong>ยังไม่มีงานที่ได้รับมอบหมาย</strong>
                  <span>งานจากห้องเรียนของคุณจะแสดงในส่วนนี้</span>
                </div>
              )}
            </>
          )}

          {activeTab === "manual" && (
            <>
              <header className={styles.sectionHeader}>
                <h2>คู่มือการเรียนด้วย FINE Model</h2>
                <p>เลือกหัวข้อเพื่อดูแนวทางใช้งานแต่ละขั้น</p>
              </header>
              <div className={styles.manualList}>
                {manuals.map((item, index) => (
                  <article
                    className={`${styles.manualItem} ${expandedManual === index ? styles.expanded : ""}`}
                    key={item.title}
                  >
                    <button
                      type="button"
                      className={styles.manualHeader}
                      onClick={() =>
                        setExpandedManual(
                          expandedManual === index ? null : index,
                        )
                      }
                      aria-expanded={expandedManual === index}
                    >
                      <span className={styles.iconBox}>
                        <StudentIcon name={item.icon} />
                      </span>
                      <strong>{item.title}</strong>
                      <span className={styles.chevron}>
                        <StudentIcon name="chevron" size={17} />
                      </span>
                    </button>
                    {expandedManual === index && (
                      <div className={styles.manualDetail}>{item.content}</div>
                    )}
                  </article>
                ))}
              </div>
            </>
          )}
        </section>

        {profileModal && (
          <div
            className={styles.modalBackdrop}
            onMouseDown={(event) =>
              event.target === event.currentTarget && setProfileModal(false)
            }
          >
            <section
              className={styles.modal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-profile-title"
            >
              <header className={styles.modalHeader}>
                <span className={`${styles.iconBox} ${styles.blueIcon}`}>
                  <StudentIcon name="edit" />
                </span>
                <div>
                  <h2 id="edit-profile-title">แก้ไขโปรไฟล์</h2>
                  <p>ข้อมูลจะบันทึกลง PostgreSQL และใช้ทั้งระบบ</p>
                </div>
                <button
                  type="button"
                  className={styles.modalClose}
                  onClick={() => setProfileModal(false)}
                >
                  <StudentIcon name="x" size={17} />
                </button>
              </header>
              <div className={`${styles.modalBody} ${styles.two}`}>
                <label className={`${styles.field} ${styles.wide}`}>
                  <span>ชื่อ–นามสกุล</span>
                  <input
                    className={styles.input}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    maxLength={160}
                  />
                </label>
                <label className={styles.field}>
                  <span>สถานศึกษา</span>
                  <input
                    className={styles.input}
                    value={form.schoolName}
                    onChange={(e) =>
                      setForm({ ...form, schoolName: e.target.value })
                    }
                    maxLength={240}
                  />
                </label>
                <label className={styles.field}>
                  <span>หมายเลขโทรศัพท์</span>
                  <input
                    className={styles.input}
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    maxLength={40}
                  />
                </label>
                <label className={`${styles.field} ${styles.wide}`}>
                  <span>แนะนำตัว</span>
                  <textarea
                    className={styles.textarea}
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    maxLength={1500}
                  />
                </label>
              </div>
              <footer className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.outlineButton}
                  onClick={() => setProfileModal(false)}
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  className={styles.button}
                  disabled={saving}
                  onClick={saveProfile}
                >
                  {saving ? "กำลังบันทึก..." : "บันทึกโปรไฟล์"}
                </button>
              </footer>
            </section>
          </div>
        )}

        {passwordModal && (
          <div
            className={styles.modalBackdrop}
            onMouseDown={(event) =>
              event.target === event.currentTarget && setPasswordModal(false)
            }
          >
            <section
              className={styles.modal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="password-title"
            >
              <header className={styles.modalHeader}>
                <span className={styles.iconBox}>
                  <StudentIcon name="lock" />
                </span>
                <div>
                  <h2 id="password-title">เปลี่ยนรหัสผ่าน</h2>
                  <p>
                    รหัสผ่านใหม่ต้องมีอย่างน้อย 10 ตัวอักษร พร้อมตัวพิมพ์ใหญ่
                    ตัวพิมพ์เล็ก และตัวเลข
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.modalClose}
                  onClick={() => setPasswordModal(false)}
                >
                  <StudentIcon name="x" size={17} />
                </button>
              </header>
              <div className={styles.modalBody}>
                {[
                  ["รหัสผ่านปัจจุบัน", "current"],
                  ["รหัสผ่านใหม่", "next"],
                  ["ยืนยันรหัสผ่านใหม่", "confirm"],
                ].map(([label, key]) => (
                  <label className={styles.field} key={key}>
                    <span>{label}</span>
                    <div className={styles.passwordWrap}>
                      <input
                        className={styles.input}
                        type={showPasswords ? "text" : "password"}
                        value={passwords[key as keyof typeof passwords]}
                        onChange={(e) =>
                          setPasswords({ ...passwords, [key]: e.target.value })
                        }
                      />
                      <button
                        type="button"
                        className={styles.eyeButton}
                        onClick={() => setShowPasswords(!showPasswords)}
                      >
                        <StudentIcon
                          name={showPasswords ? "eyeOff" : "eye"}
                          size={16}
                        />
                      </button>
                    </div>
                  </label>
                ))}
              </div>
              <footer className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.outlineButton}
                  onClick={() => setPasswordModal(false)}
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  className={styles.button}
                  disabled={saving}
                  onClick={changePassword}
                >
                  {saving ? "กำลังบันทึก..." : "ยืนยันการเปลี่ยน"}
                </button>
              </footer>
            </section>
          </div>
        )}

        {submitTask && (
          <div
            className={styles.modalBackdrop}
            onMouseDown={(event) =>
              event.target === event.currentTarget && closeSubmission()
            }
          >
            <section
              className={styles.modal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="submit-task-title"
            >
              <header className={styles.modalHeader}>
                <span className={`${styles.iconBox} ${styles.goldIcon}`}>
                  <StudentIcon name="task" />
                </span>
                <div>
                  <h2 id="submit-task-title">ส่งงาน</h2>
                  <p>{submitTask.title}</p>
                </div>
                <button
                  type="button"
                  className={styles.modalClose}
                  onClick={closeSubmission}
                  aria-label="ปิดหน้าต่างส่งงาน"
                >
                  <StudentIcon name="x" size={17} />
                </button>
              </header>
              <div className={styles.modalBody}>
                <label className={styles.field}>
                  <span>ชื่อผลงานหรือหมายเหตุ</span>
                  <input
                    className={styles.input}
                    value={submission.attachmentName}
                    onChange={(event) =>
                      setSubmission((value) => ({
                        ...value,
                        attachmentName: event.target.value,
                      }))
                    }
                    maxLength={240}
                    placeholder="เช่น แบบฝึกหัดบทที่ 1"
                  />
                </label>
                <label className={styles.field}>
                  <span>อัปโหลดไฟล์จากเครื่อง (ไม่เกิน 12 MB)</span>
                  <input
                    className={styles.input}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.txt,.doc,.docx,.ppt,.pptx"
                    onChange={(event) =>
                      setSubmissionFile(event.target.files?.[0] || null)
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span>หรือลิงก์ผลงาน</span>
                  <input
                    className={styles.input}
                    type="url"
                    inputMode="url"
                    value={submission.attachmentUrl}
                    onChange={(event) =>
                      setSubmission((value) => ({
                        ...value,
                        attachmentUrl: event.target.value,
                      }))
                    }
                    maxLength={2000}
                    placeholder="https://..."
                  />
                </label>
                <div className={styles.notice}>
                  <StudentIcon name="info" size={17} />
                  <span>
                    {submissionFile
                      ? `เลือกไฟล์ ${submissionFile.name}`
                      : "เลือกอัปโหลดไฟล์เข้าเครื่อง local หรือระบุลิงก์ภายนอกอย่างใดอย่างหนึ่ง"}
                  </span>
                </div>
              </div>
              <footer className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.outlineButton}
                  onClick={closeSubmission}
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  className={styles.button}
                  disabled={saving}
                  onClick={submitAssignment}
                >
                  {saving ? "กำลังส่งงาน..." : "ยืนยันการส่งงาน"}
                </button>
              </footer>
            </section>
          </div>
        )}

        {certificateModal && certificate && (
          <div
            className={styles.modalBackdrop}
            onMouseDown={(event) =>
              event.target === event.currentTarget && setCertificateModal(false)
            }
          >
            <section
              className={`${styles.modal} ${styles.certificate}`}
              role="dialog"
              aria-modal="true"
            >
              <div className={styles.certificateSheet}>
                <small>Certificate of competency</small>
                <h2>เกียรติบัตรรับรองสมรรถนะ F&amp;B Service</h2>
                <p>มอบให้แก่</p>
                <div className={styles.certificateName}>
                  {certificate.issuedName}
                </div>
                <p>
                  ผ่านเกณฑ์การฝึกทักษะตามกรอบ FINE Model ด้วยคะแนนรวม{" "}
                  {certificate.overallScore}%
                </p>
                <div className={styles.certificateMeta}>
                  <span>{certificate.schoolName || "FINE Model"}</span>
                  <span>{certificate.certificateCode}</span>
                </div>
              </div>
              <div className={styles.certificateActions}>
                <Link
                  className={styles.outlineButton}
                  href={`/verify/${certificate.certificateCode}`}
                  target="_blank"
                >
                  ตรวจสอบใบรับรอง
                </Link>
                <button
                  type="button"
                  className={styles.button}
                  onClick={() => window.print()}
                >
                  พิมพ์ใบรับรอง
                </button>
                <button
                  type="button"
                  className={styles.outlineButton}
                  onClick={() => setCertificateModal(false)}
                >
                  ปิด
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

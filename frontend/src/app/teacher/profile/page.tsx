"use client";

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import AdminIcon from "@/components/admin/AdminIcon";
import { authenticatedFetch } from "@/lib/api";
import { useRole } from "@/context/RoleContext";
import { toast } from "sonner";
import styles from "./page.module.css";

type Profile = {
  id: string;
  name: string;
  email: string;
  role: "teacher" | "developer";
  status: "active" | "inactive" | "pending";
  avatarUrl?: string | null;
  schoolId?: string | null;
  schoolName?: string | null;
  phone?: string | null;
  bio?: string | null;
  createdAt: string;
  updatedAt: string;
};
type Stats = {
  classes: number;
  students: number;
  assignments: number;
  lessons: number;
};
type ProfileForm = {
  name: string;
  schoolName: string;
  phone: string;
  bio: string;
  avatarUrl: string;
};
const emptyForm: ProfileForm = {
  name: "",
  schoolName: "",
  phone: "",
  bio: "",
  avatarUrl: "",
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
function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((item) => item[0])
      .join("")
      .toUpperCase() || "TC"
  );
}
function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "ไม่ระบุ"
    : new Intl.DateTimeFormat("th-TH", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date);
}
function resizeAvatar(file: File) {
  return new Promise<string>((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("กรุณาเลือกไฟล์รูปภาพ"));
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      reject(new Error("ไฟล์ต้นฉบับต้องมีขนาดไม่เกิน 8 MB"));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("อ่านไฟล์รูปภาพไม่สำเร็จ"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("รูปภาพไม่ถูกต้อง"));
      image.onload = () => {
        const maxSize = 512;
        const ratio = Math.min(
          1,
          maxSize / Math.max(image.width, image.height),
        );
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * ratio));
        canvas.height = Math.max(1, Math.round(image.height * ratio));
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("ไม่สามารถประมวลผลรูปภาพได้"));
          return;
        }
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export default function TeacherProfilePage() {
  const router = useRouter();
  const { user, setUser } = useRole();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats>({
    classes: 0,
    students: 0,
    assignments: 0,
    lessons: 0,
  });
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const loadProfile = useCallback(async () => {
    const response = await authenticatedFetch("/api/teacher/profile", {
      cache: "no-store",
    });
    if (!response.ok) throw new Error(await responseError(response));
    const payload = (await response.json()) as {
      profile: Profile;
      stats: Stats;
    };
    setProfile(payload.profile);
    setStats(payload.stats);
    setForm({
      name: payload.profile.name || "",
      schoolName: payload.profile.schoolName || "",
      phone: payload.profile.phone || "",
      bio: payload.profile.bio || "",
      avatarUrl: payload.profile.avatarUrl || "",
    });
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(
      () =>
        void loadProfile()
          .then(() => setError(""))
          .catch((loadError) =>
            setError(
              loadError instanceof Error
                ? loadError.message
                : "โหลดโปรไฟล์ไม่สำเร็จ",
            ),
          )
          .finally(() => setLoading(false)),
      0,
    );
    return () => window.clearTimeout(timer);
  }, [loadProfile]);

  useEffect(() => {
    if (!profileModalOpen && !passwordModalOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape" || busy) return;
      setProfileModalOpen(false);
      setPasswordModalOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [busy, passwordModalOpen, profileModalOpen]);

  function updateField<Key extends keyof ProfileForm>(
    key: Key,
    value: ProfileForm[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }
  function openProfileEditor() {
    if (profile)
      setForm({
        name: profile.name || "",
        schoolName: profile.schoolName || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        avatarUrl: profile.avatarUrl || "",
      });
    setProfileModalOpen(true);
  }
  function openPasswordEditor() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setPasswordModalOpen(true);
  }
  async function chooseAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy("avatar");
    try {
      const dataUrl = await resizeAvatar(file);
      const response = await authenticatedFetch("/api/profile/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl }),
      });
      if (!response.ok) throw new Error(await responseError(response));
      const payload = (await response.json()) as { avatarUrl: string };
      updateField("avatarUrl", payload.avatarUrl);
      setProfile((current) =>
        current ? { ...current, avatarUrl: payload.avatarUrl } : current,
      );
      if (user)
        setUser({
          ...user,
          avatar: payload.avatarUrl,
          avatar_url: payload.avatarUrl,
        });
      toast.success("บันทึกรูปโปรไฟล์แล้ว");
    } catch (avatarError) {
      toast.error(
        avatarError instanceof Error
          ? avatarError.message
          : "เลือกรูปไม่สำเร็จ",
      );
    } finally {
      setBusy(null);
    }
  }
  async function removeAvatar() {
    setBusy("avatar");
    try {
      const response = await authenticatedFetch("/api/profile/avatar", {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(await responseError(response));
      updateField("avatarUrl", "");
      setProfile((current) =>
        current ? { ...current, avatarUrl: null } : current,
      );
      if (user) setUser({ ...user, avatar: undefined, avatar_url: undefined });
      toast.success("นำรูปโปรไฟล์ออกแล้ว");
    } catch (avatarError) {
      toast.error(
        avatarError instanceof Error
          ? avatarError.message
          : "นำรูปโปรไฟล์ออกไม่สำเร็จ",
      );
    } finally {
      setBusy(null);
    }
  }
  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("profile");
    try {
      const response = await authenticatedFetch("/api/teacher/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_profile", ...form }),
      });
      if (!response.ok) throw new Error(await responseError(response));
      const payload = (await response.json()) as { profile: Profile };
      setProfile(payload.profile);
      if (user)
        setUser({
          ...user,
          name: payload.profile.name,
          email: payload.profile.email,
          avatar: payload.profile.avatarUrl || undefined,
          avatar_url: payload.profile.avatarUrl || undefined,
          school: payload.profile.schoolName || undefined,
          school_id: payload.profile.schoolId || undefined,
        });
      setProfileModalOpen(false);
      toast.success("บันทึกข้อมูลโปรไฟล์แล้ว");
    } catch (saveError) {
      toast.error(
        saveError instanceof Error
          ? saveError.message
          : "บันทึกโปรไฟล์ไม่สำเร็จ",
      );
    } finally {
      setBusy(null);
    }
  }
  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.warning("รหัสผ่านใหม่และช่องยืนยันไม่ตรงกัน");
      return;
    }
    setBusy("password");
    try {
      const response = await authenticatedFetch("/api/teacher/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change_password",
          currentPassword,
          newPassword,
        }),
      });
      if (!response.ok) throw new Error(await responseError(response));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordModalOpen(false);
      toast.success("เปลี่ยนรหัสผ่านแล้ว กรุณาเข้าสู่ระบบใหม่");
      window.setTimeout(() => router.replace("/role-select"), 600);
    } catch (passwordError) {
      toast.error(
        passwordError instanceof Error
          ? passwordError.message
          : "เปลี่ยนรหัสผ่านไม่สำเร็จ",
      );
    } finally {
      setBusy(null);
    }
  }

  const metricCards = [
    {
      key: "green",
      label: "ห้องเรียน",
      value: stats.classes,
      detail: "ห้องที่รับผิดชอบ",
      icon: "school" as const,
    },
    {
      key: "blue",
      label: "นักเรียน",
      value: stats.students,
      detail: "ผู้เรียนไม่ซ้ำห้อง",
      icon: "student" as const,
    },
    {
      key: "gold",
      label: "งานมอบหมาย",
      value: stats.assignments,
      detail: "งานที่สร้างทั้งหมด",
      icon: "score" as const,
    },
    {
      key: "purple",
      label: "แผนการสอน",
      value: stats.lessons,
      detail: "แผน FINE Model",
      icon: "content" as const,
    },
  ];

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p>ACCOUNT & PROFILE</p>
          <h1>โปรไฟล์ครูผู้สอน</h1>
          <span>จัดการข้อมูลส่วนตัว รูปโปรไฟล์ และความปลอดภัยของบัญชี</span>
        </div>
        <button
          type="button"
          className={styles.refreshButton}
          onClick={() => void loadProfile()}
          disabled={loading || Boolean(busy)}
        >
          <AdminIcon name="refresh" size={16} />
          อัปเดตข้อมูล
        </button>
      </header>
      {error && (
        <div className={styles.error}>
          <AdminIcon name="activity" size={17} />
          <span>{error}</span>
          <button type="button" onClick={() => void loadProfile()}>
            ลองอีกครั้ง
          </button>
        </div>
      )}

      <section className={styles.profileHero}>
        <div className={styles.avatarArea}>
          <span
            className={styles.avatar}
            style={
              profile?.avatarUrl
                ? { backgroundImage: `url(${profile.avatarUrl})` }
                : undefined
            }
          >
            {!profile?.avatarUrl && initials(profile?.name || "")}
          </span>
          <button
            type="button"
            className={styles.avatarButton}
            onClick={openProfileEditor}
          >
            <AdminIcon name="edit" size={15} />
            แก้ไขโปรไฟล์
          </button>
        </div>
        <div className={styles.profileIdentity}>
          <span className={styles.roleBadge}>
            <AdminIcon name="teacher" size={15} />
            ครูผู้สอน
          </span>
          <h2>
            {loading ? "กำลังโหลดข้อมูล" : profile?.name || "ยังไม่ระบุชื่อ"}
          </h2>
          <p>{profile?.email || user?.email || "ไม่ระบุอีเมล"}</p>
          <div>
            <span>
              <AdminIcon name="school" size={14} />
              {profile?.schoolName || "ยังไม่ระบุสถานศึกษา"}
            </span>
            <span>
              <AdminIcon name="check" size={14} />
              {profile?.status === "active"
                ? "บัญชีพร้อมใช้งาน"
                : "บัญชีอยู่ระหว่างตรวจสอบ"}
            </span>
          </div>
        </div>
        <aside className={styles.accountMeta}>
          <span>
            <small>รหัสบัญชี</small>
            <strong>
              {profile?.id ? profile.id.slice(0, 8).toUpperCase() : "—"}
            </strong>
          </span>
          <span>
            <small>เป็นสมาชิกตั้งแต่</small>
            <strong>
              {profile?.createdAt ? formatDate(profile.createdAt) : "—"}
            </strong>
          </span>
        </aside>
      </section>

      <section className={styles.metrics}>
        {metricCards.map((item) => (
          <article data-tone={item.key} key={item.label}>
            <span>
              <AdminIcon name={item.icon} size={20} />
            </span>
            <div>
              <small>{item.label}</small>
              <strong>{loading ? "—" : item.value}</strong>
              <p>{item.detail}</p>
            </div>
          </article>
        ))}
      </section>

      <div className={styles.settingsGrid}>
        <section className={styles.panel}>
          <header>
            <span>
              <AdminIcon name="users" size={18} />
            </span>
            <div>
              <h2>ข้อมูลส่วนตัว</h2>
              <p>ข้อมูลที่แสดงใน Teacher Console</p>
            </div>
            <button type="button" onClick={openProfileEditor}>
              <AdminIcon name="edit" size={15} />
              แก้ไข
            </button>
          </header>
          <div className={styles.profileDetails}>
            <article>
              <small>ชื่อ–นามสกุล</small>
              <strong>{profile?.name || "ยังไม่ระบุ"}</strong>
            </article>
            <article>
              <small>อีเมลเข้าสู่ระบบ</small>
              <strong>{profile?.email || "ยังไม่ระบุ"}</strong>
            </article>
            <article>
              <small>สถานศึกษา</small>
              <strong>{profile?.schoolName || "ยังไม่ระบุ"}</strong>
            </article>
            <article>
              <small>หมายเลขโทรศัพท์</small>
              <strong>{profile?.phone || "ยังไม่ระบุ"}</strong>
            </article>
            <article className={styles.bioDetail}>
              <small>ข้อมูลแนะนำตัว</small>
              <p>
                {profile?.bio ||
                  "ยังไม่ได้เพิ่มข้อมูลแนะนำตัวหรือความเชี่ยวชาญ"}
              </p>
            </article>
          </div>
        </section>

        <section className={styles.panel}>
          <header>
            <span>
              <AdminIcon name="shield" size={18} />
            </span>
            <div>
              <h2>ความปลอดภัย</h2>
              <p>สถานะและรหัสผ่านของบัญชี</p>
            </div>
            <button type="button" onClick={openPasswordEditor}>
              <AdminIcon name="key" size={15} />
              เปลี่ยนรหัสผ่าน
            </button>
          </header>
          <div className={styles.securityOverview}>
            <span>
              <AdminIcon name="check" size={18} />
              <div>
                <strong>บัญชีพร้อมใช้งาน</strong>
                <small>ผ่านการยืนยันสิทธิ์ครูผู้สอนแล้ว</small>
              </div>
            </span>
            <span>
              <AdminIcon name="key" size={18} />
              <div>
                <strong>รหัสผ่านถูกเข้ารหัส</strong>
                <small>จัดเก็บด้วย bcrypt password hash</small>
              </div>
            </span>
            <span>
              <AdminIcon name="clock" size={18} />
              <div>
                <strong>อัปเดตล่าสุด</strong>
                <small>
                  {profile?.updatedAt
                    ? formatDate(profile.updatedAt)
                    : "ไม่ระบุ"}
                </small>
              </div>
            </span>
            <aside>
              <AdminIcon name="shield" size={17} />
              <p>
                ไม่เปิดเผยรหัสผ่านกับผู้อื่น และควรใช้รหัสที่ไม่ซ้ำกับบริการอื่น
              </p>
            </aside>
          </div>
        </section>
      </div>

      {profileModalOpen && (
        <div
          className={styles.modalOverlay}
          onMouseDown={(event) =>
            event.target === event.currentTarget &&
            !busy &&
            setProfileModalOpen(false)
          }
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-editor-title"
          >
            <header>
              <span>
                <AdminIcon name="edit" size={20} />
              </span>
              <div>
                <h2 id="profile-editor-title">แก้ไขข้อมูลส่วนตัว</h2>
                <p>ปรับข้อมูลและรูปที่แสดงใน Teacher Console</p>
              </div>
              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                disabled={Boolean(busy)}
                aria-label="ปิด"
              >
                <AdminIcon name="close" size={18} />
              </button>
            </header>
            <form onSubmit={saveProfile}>
              <div className={styles.formGrid}>
                <div className={styles.avatarEditor}>
                  <span
                    className={styles.avatarPreview}
                    style={
                      form.avatarUrl
                        ? { backgroundImage: `url(${form.avatarUrl})` }
                        : undefined
                    }
                  >
                    {!form.avatarUrl && initials(form.name)}
                  </span>
                  <div>
                    <label className={styles.uploadButton}>
                      <AdminIcon
                        name={busy === "avatar" ? "clock" : "edit"}
                        size={15}
                      />
                      {busy === "avatar" ? "กำลังเตรียมรูป" : "เลือกรูปใหม่"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(event) => void chooseAvatar(event)}
                        disabled={Boolean(busy)}
                      />
                    </label>
                    {form.avatarUrl && (
                      <button
                        type="button"
                        onClick={() => void removeAvatar()}
                        disabled={Boolean(busy)}
                      >
                        นำรูปออก
                      </button>
                    )}
                    <small>
                      รองรับ JPEG, PNG, WebP ระบบจะลดขนาดและบันทึกใน local
                      storage อัตโนมัติ
                    </small>
                  </div>
                </div>
                <label>
                  <span>ชื่อ–นามสกุล *</span>
                  <input
                    autoFocus
                    required
                    maxLength={160}
                    value={form.name}
                    onChange={(event) =>
                      updateField("name", event.target.value)
                    }
                  />
                </label>
                <label>
                  <span>อีเมลเข้าสู่ระบบ</span>
                  <input value={profile?.email || ""} disabled />
                  <small>แก้ไขโดยผู้ดูแลระบบ</small>
                </label>
                <label>
                  <span>สถานศึกษา</span>
                  <input
                    maxLength={240}
                    value={form.schoolName}
                    onChange={(event) =>
                      updateField("schoolName", event.target.value)
                    }
                  />
                </label>
                <label>
                  <span>หมายเลขโทรศัพท์</span>
                  <input
                    type="tel"
                    maxLength={40}
                    value={form.phone}
                    onChange={(event) =>
                      updateField("phone", event.target.value)
                    }
                  />
                </label>
                <label className={styles.fullField}>
                  <span>ข้อมูลแนะนำตัว</span>
                  <textarea
                    rows={3}
                    maxLength={1500}
                    value={form.bio}
                    onChange={(event) => updateField("bio", event.target.value)}
                  />
                  <small>{form.bio.length}/1,500 ตัวอักษร</small>
                </label>
              </div>
              <footer>
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(false)}
                  disabled={Boolean(busy)}
                >
                  ยกเลิก
                </button>
                <button type="submit" disabled={busy === "profile"}>
                  <AdminIcon
                    name={busy === "profile" ? "clock" : "check"}
                    size={16}
                  />
                  บันทึกข้อมูล
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}

      {passwordModalOpen && (
        <div
          className={styles.modalOverlay}
          onMouseDown={(event) =>
            event.target === event.currentTarget &&
            !busy &&
            setPasswordModalOpen(false)
          }
        >
          <section
            className={`${styles.modal} ${styles.compactModal}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="password-editor-title"
          >
            <header>
              <span>
                <AdminIcon name="key" size={20} />
              </span>
              <div>
                <h2 id="password-editor-title">เปลี่ยนรหัสผ่าน</h2>
                <p>ยืนยันรหัสเดิมก่อนกำหนดรหัสผ่านใหม่</p>
              </div>
              <button
                type="button"
                onClick={() => setPasswordModalOpen(false)}
                disabled={Boolean(busy)}
                aria-label="ปิด"
              >
                <AdminIcon name="close" size={18} />
              </button>
            </header>
            <form onSubmit={changePassword}>
              <div className={styles.securityBody}>
                <label>
                  <span>รหัสผ่านปัจจุบัน *</span>
                  <div>
                    <input
                      autoFocus
                      required
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(event) =>
                        setCurrentPassword(event.target.value)
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword((current) => !current)
                      }
                      aria-label={
                        showCurrentPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"
                      }
                    >
                      <AdminIcon
                        name={showCurrentPassword ? "eyeOff" : "eye"}
                        size={17}
                      />
                    </button>
                  </div>
                </label>
                <label>
                  <span>รหัสผ่านใหม่ *</span>
                  <div>
                    <input
                      required
                      minLength={10}
                      maxLength={128}
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      placeholder="อย่างน้อย 10 ตัวอักษร พร้อมตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก และตัวเลข"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((current) => !current)}
                      aria-label={
                        showNewPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"
                      }
                    >
                      <AdminIcon
                        name={showNewPassword ? "eyeOff" : "eye"}
                        size={17}
                      />
                    </button>
                  </div>
                </label>
                <label>
                  <span>ยืนยันรหัสผ่านใหม่ *</span>
                  <div>
                    <input
                      required
                      minLength={10}
                      maxLength={128}
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((current) => !current)
                      }
                      aria-label={
                        showConfirmPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"
                      }
                    >
                      <AdminIcon
                        name={showConfirmPassword ? "eyeOff" : "eye"}
                        size={17}
                      />
                    </button>
                  </div>
                </label>
                <aside>
                  <AdminIcon name="shield" size={17} />
                  <span>
                    รหัสผ่านใหม่ต้องมีอย่างน้อย 10 ตัวอักษร พร้อมตัวพิมพ์ใหญ่
                    ตัวพิมพ์เล็ก และตัวเลขและไม่ซ้ำกับรหัสเดิม
                  </span>
                </aside>
              </div>
              <footer>
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  disabled={Boolean(busy)}
                >
                  ยกเลิก
                </button>
                <button type="submit" disabled={busy === "password"}>
                  <AdminIcon
                    name={busy === "password" ? "clock" : "key"}
                    size={16}
                  />
                  เปลี่ยนรหัสผ่าน
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

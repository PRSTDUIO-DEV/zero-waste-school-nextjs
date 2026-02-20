"use client";

import LogoutButton from "@/components/LogoutButton";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const dynamic = "force-dynamic";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  grade: number | null;
  classSection: string | null;
  totalPoints: number;
  totalRecords: number;
  totalWeight: number;
  badges: { name: string; description: string | null; awardedDt: string }[];
}

function getGradeLabel(grade: number | null): string {
  if (!grade) return "";
  if (grade < 0) return `อนุบาล ${grade + 4}`;
  if (grade > 6) return `ประถมศึกษาปีที่ ${grade - 6}`;
  return `มัธยมศึกษาปีที่ ${grade}`;
}

export default function ProfilePage() {
  const { status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setEditName(data.name);
      }
    } catch {
      setMessage({ type: "error", text: "ไม่สามารถโหลดข้อมูลได้" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async () => {
    if (!editName.trim()) return;
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "อัปเดตชื่อสำเร็จ" });
        setEditing(false);
        fetchProfile();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error });
      }
    } catch {
      setMessage({ type: "error", text: "เกิดข้อผิดพลาด" });
    }
  };

  const handleChangePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ type: "error", text: "รหัสผ่านใหม่ไม่ตรงกัน" });
      return;
    }
    if (passwords.newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร",
      });
      return;
    }
    try {
      const res = await fetch("/api/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "เปลี่ยนรหัสผ่านสำเร็จ" });
        setShowPasswordForm(false);
        setPasswords({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch {
      setMessage({ type: "error", text: "เกิดข้อผิดพลาด" });
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-emerald-900 dark:to-teal-900 bg-pattern flex items-center justify-center">
        <div className="glass-card p-12 text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-emerald-500 mx-auto mb-6"></div>
          <h2 className="text-3xl font-bold text-gradient mb-4">
            กำลังโหลด...
          </h2>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-emerald-900 dark:to-teal-900 bg-pattern">
      {/* Header */}
      <header className="glass-header sticky top-0 z-50 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-4xl animate-float">
                🌱
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gradient">โปรไฟล์</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  จัดการข้อมูลส่วนตัว
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/dashboard"
                className="glass-button px-4 py-2 text-sm font-semibold"
              >
                ← กลับ
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Messages */}
        {message.text && (
          <div
            className={`p-4 rounded-2xl text-center font-semibold ${
              message.type === "success"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Profile Card */}
        <div className="glass-card">
          <div className="bg-gradient-primary text-white px-8 py-6 rounded-t-3xl">
            <h2 className="text-3xl font-bold flex items-center">
              <span className="mr-4 animate-float">👤</span>
              ข้อมูลส่วนตัว
            </h2>
          </div>
          <div className="p-8 space-y-6">
            {/* Name */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">ชื่อ</p>
                {editing ? (
                  <div className="flex items-center space-x-2 mt-1">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="form-input px-3 py-1"
                    />
                    <button
                      onClick={handleUpdateName}
                      className="glass-button px-3 py-1 text-sm bg-emerald-500 text-white"
                    >
                      บันทึก
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="glass-button px-3 py-1 text-sm"
                    >
                      ยกเลิก
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <p className="text-xl font-bold text-gradient">
                      {profile.name}
                    </p>
                    <button
                      onClick={() => setEditing(true)}
                      className="text-sm text-emerald-600 hover:underline"
                    >
                      ✏️ แก้ไข
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">อีเมล</p>
              <p className="text-lg font-semibold">{profile.email}</p>
            </div>

            {/* Role */}
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">ประเภท</p>
              <span className="glass-button px-3 py-1 text-sm">
                {profile.role === "STUDENT"
                  ? "🎓 นักเรียน"
                  : profile.role === "TEACHER"
                    ? "👨‍🏫 ครู"
                    : "👨‍💼 ผู้ดูแลระบบ"}
              </span>
            </div>

            {/* Grade */}
            {profile.grade && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ชั้นเรียน
                </p>
                <p className="text-lg font-semibold">
                  {getGradeLabel(profile.grade)}
                  {profile.classSection && ` ห้อง ${profile.classSection}`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Card */}
        <div className="glass-card">
          <div className="bg-gradient-secondary text-white px-8 py-6 rounded-t-3xl">
            <h2 className="text-3xl font-bold flex items-center">
              <span className="mr-4 animate-float">📊</span>
              สถิติของฉัน
            </h2>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="stat-card text-center">
                <div className="text-4xl mb-3">⭐</div>
                <p className="stat-number text-emerald-600 dark:text-emerald-400">
                  {profile.totalPoints.toLocaleString()}
                </p>
                <p className="stat-label">คะแนนรวม</p>
              </div>
              <div className="stat-card text-center">
                <div className="text-4xl mb-3">📝</div>
                <p className="stat-number text-blue-600 dark:text-blue-400">
                  {profile.totalRecords}
                </p>
                <p className="stat-label">บันทึกรวม</p>
              </div>
              <div className="stat-card text-center">
                <div className="text-4xl mb-3">⚖️</div>
                <p className="stat-number text-purple-600 dark:text-purple-400">
                  {profile.totalWeight.toLocaleString()}
                </p>
                <p className="stat-label">กรัม</p>
              </div>
            </div>
          </div>
        </div>

        {/* Badges */}
        {profile.badges.length > 0 && (
          <div className="glass-card">
            <div className="bg-gradient-accent text-white px-8 py-6 rounded-t-3xl">
              <h2 className="text-3xl font-bold flex items-center">
                <span className="mr-4 animate-float">🏅</span>
                เหรียญรางวัล ({profile.badges.length})
              </h2>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {profile.badges.map((badge, i) => (
                  <div key={i} className="stat-card text-center p-4">
                    <div className="text-4xl mb-2">🏆</div>
                    <p className="font-bold text-gradient">{badge.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {badge.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Change Password */}
        <div className="glass-card">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center">
                <span className="mr-3">🔒</span>
                เปลี่ยนรหัสผ่าน
              </h2>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="glass-button px-4 py-2 text-sm font-semibold"
              >
                {showPasswordForm ? "ยกเลิก" : "เปลี่ยน"}
              </button>
            </div>

            {showPasswordForm && (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="form-label">รหัสผ่านปัจจุบัน</label>
                  <input
                    type="password"
                    value={passwords.currentPassword}
                    onChange={(e) =>
                      setPasswords((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="form-label">รหัสผ่านใหม่</label>
                  <input
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) =>
                      setPasswords((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="form-label">ยืนยันรหัสผ่านใหม่</label>
                  <input
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) =>
                      setPasswords((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className="form-input w-full"
                  />
                </div>
                <button
                  onClick={handleChangePassword}
                  className="btn-primary w-full"
                >
                  เปลี่ยนรหัสผ่าน
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

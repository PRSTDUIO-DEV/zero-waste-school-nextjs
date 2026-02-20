"use client";

import LogoutButton from "@/components/LogoutButton";
import { ThemeToggle } from "@/components/ThemeProvider";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const dynamic = "force-dynamic";

interface DashboardStats {
  recycleWeight: number;
  generalWeight: number;
  totalPoints: number;
  rank: number | string;
  userRank: number;
  recentActivities: {
    id: number;
    type: "RECYCLABLE" | "GENERAL";
    weight: number;
    points: number;
    createdAt: string;
  }[];
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    recycleWeight: 0,
    generalWeight: 0,
    totalPoints: 0,
    rank: "-",
    userRank: 0,
    recentActivities: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingActivity, setEditingActivity] = useState<{
    id: number;
    weight: number;
    description: string;
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [actionMessage, setActionMessage] = useState("");
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchDashboardData();
      fetchNotifCount();
    }
  }, [status, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/dashboard/stats", {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifCount = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifCount(data.unreadCount || 0);
      }
    } catch {
      /* ignore */
    }
  };

  const handleEditRecord = async () => {
    if (!editingActivity) return;
    try {
      const res = await fetch("/api/waste/record", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordId: editingActivity.id,
          weightG: editingActivity.weight,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage("✅ แก้ไขสำเร็จ");
        setEditingActivity(null);
        fetchDashboardData();
      } else {
        setActionMessage(`❌ ${data.error}`);
      }
    } catch {
      setActionMessage("❌ เกิดข้อผิดพลาด");
    }
    setTimeout(() => setActionMessage(""), 3000);
  };

  const handleDeleteRecord = async (recordId: number) => {
    try {
      const res = await fetch(`/api/waste/record?id=${recordId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage("✅ ลบสำเร็จ");
        setDeleteConfirm(null);
        fetchDashboardData();
      } else {
        setActionMessage(`❌ ${data.error}`);
      }
    } catch {
      setActionMessage("❌ เกิดข้อผิดพลาด");
    }
    setTimeout(() => setActionMessage(""), 3000);
  };

  const isWithin24h = (dateStr: string) => {
    return Date.now() - new Date(dateStr).getTime() < 24 * 60 * 60 * 1000;
  };

  const handleRetry = () => {
    fetchDashboardData();
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-emerald-900 dark:to-teal-900 bg-pattern flex items-center justify-center">
        <div className="glass-card p-12 text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-emerald-500 mx-auto mb-6"></div>
          <h2 className="text-3xl font-bold text-gradient mb-4">
            กำลังโหลด...
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            กรุณารอสักครู่
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-emerald-900 dark:to-teal-900 bg-pattern flex items-center justify-center">
        <div className="glass-card p-12 text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-emerald-500 mx-auto mb-6"></div>
          <h2 className="text-3xl font-bold text-gradient mb-4">
            กำลังโหลดข้อมูล...
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            กรุณารอสักครู่
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-emerald-900 dark:to-teal-900 bg-pattern flex items-center justify-center">
        <div className="glass-card p-12 text-center">
          <div className="text-8xl mb-6">❌</div>
          <h2 className="text-3xl font-bold text-red-600 mb-4">
            เกิดข้อผิดพลาด
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            {error}
          </p>
          <button
            onClick={handleRetry}
            className="btn btn-primary px-8 py-4 text-lg"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const { user } = session;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-emerald-900 dark:to-teal-900 bg-pattern">
      {/* Luxury Header with Glass Effect */}
      <header className="glass-header sticky top-0 z-50 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-luxury rounded-3xl flex items-center justify-center shadow-2xl animate-pulse-luxury">
                <span className="text-3xl">🌱</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gradient-luxury">
                  EEP School Dashboard
                </h1>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold tracking-wide">
                  🌍 Premium Eco Management System
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-xl font-bold text-shimmer">
                  สวัสดี, {user.name}
                </p>
                {user.role === "STUDENT" && user.grade && (
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                    ชั้น
                    {Number(user.grade) < 0
                      ? `อนุบาล ${Number(user.grade) + 4}`
                      : Number(user.grade) > 6
                        ? `ประถมศึกษาปีที่ ${Number(user.grade) - 6}`
                        : `มัธยมศึกษาปีที่ ${user.grade}`}
                    {user.classSection && ` ห้อง ${user.classSection}`}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <Link
                  href="/profile"
                  className="glass-button px-3 py-2 text-sm font-bold"
                  title="โปรไฟล์"
                >
                  👤
                </Link>
                <Link
                  href="/badges"
                  className="glass-button px-3 py-2 text-sm font-bold"
                  title="เหรียญรางวัล"
                >
                  🏅
                </Link>
                <Link
                  href="/api/notifications"
                  className="glass-button px-3 py-2 text-sm font-bold relative"
                  title="แจ้งเตือน"
                >
                  🔔
                  {notifCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notifCount}
                    </span>
                  )}
                </Link>
                <ThemeToggle />
                <span className="glass-button px-4 py-2 text-sm font-bold">
                  {user.role === "STUDENT"
                    ? "🎓 นักเรียน"
                    : user.role === "TEACHER"
                      ? "👨‍🏫 ครู"
                      : "👨‍💼 ผู้ดูแลระบบ"}
                </span>
                <LogoutButton />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Action Message Toast */}
      {actionMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 glass-card px-6 py-3 text-lg font-semibold shadow-xl animate-float">
          {actionMessage}
        </div>
      )}

      {/* Edit Modal */}
      {editingActivity && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="glass-card p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gradient mb-6">
              ✏️ แก้ไขบันทึก
            </h3>
            <div className="space-y-4">
              <div>
                <label className="form-label">น้ำหนัก (กรัม)</label>
                <input
                  type="number"
                  value={editingActivity.weight}
                  onChange={(e) =>
                    setEditingActivity({
                      ...editingActivity,
                      weight: Number(e.target.value),
                    })
                  }
                  className="form-input w-full"
                  min={1}
                  max={100000}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleEditRecord}
                  className="btn-primary flex-1"
                >
                  บันทึก
                </button>
                <button
                  onClick={() => setEditingActivity(null)}
                  className="glass-button flex-1 py-2"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="glass-card p-8 max-w-md w-full text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold mb-4">ยืนยันการลบ?</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              ข้อมูลนี้จะถูกลบถาวร ไม่สามารถกู้คืนได้
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleDeleteRecord(deleteConfirm)}
                className="btn-danger flex-1 py-2"
              >
                ลบเลย
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="glass-button flex-1 py-2"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content with Glass Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Premium Welcome Section */}
          <div className="text-center py-12">
            <h2 className="text-5xl font-bold text-gradient-luxury mb-6 animate-shimmer">
              ยินดีต้อนรับสู่ระบบ EEP School
            </h2>
            <p className="text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-medium">
              ร่วมกันสร้างโรงเรียนที่ปลอดขยะ เพื่อโลกที่ยั่งยืน
            </p>
            <div className="mt-6 flex justify-center space-x-2 text-3xl">
              <span className="animate-float">🌍</span>
              <span className="animate-float animation-delay-1000">♻️</span>
              <span className="animate-float animation-delay-2000">🌱</span>
              <span className="animate-float animation-delay-3000">💚</span>
            </div>
          </div>

          {/* Premium Stats Grid */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="stat-card group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-label text-emerald-600 dark:text-emerald-400">
                    ขยะรีไซเคิล
                  </p>
                  <p className="stat-number">
                    {(stats.recycleWeight || 0).toLocaleString()}
                  </p>
                  <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                    กรัม
                  </p>
                </div>
                <div className="text-6xl group-hover:scale-110 transition-transform animate-float">
                  ♻️
                </div>
              </div>
            </div>

            <div className="stat-card group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-label text-orange-600 dark:text-orange-400">
                    ขยะทั่วไป
                  </p>
                  <p className="stat-number text-orange-600 dark:text-orange-400">
                    {(stats.generalWeight || 0).toLocaleString()}
                  </p>
                  <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                    กรัม
                  </p>
                </div>
                <div className="text-6xl group-hover:scale-110 transition-transform animate-float animation-delay-1000">
                  🗑️
                </div>
              </div>
            </div>

            <div className="stat-card group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-label text-blue-600 dark:text-blue-400">
                    คะแนนรวม
                  </p>
                  <p className="stat-number text-blue-600 dark:text-blue-400">
                    {(stats.totalPoints || 0).toLocaleString()}
                  </p>
                  <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                    คะแนน
                  </p>
                </div>
                <div className="text-6xl group-hover:scale-110 transition-transform animate-float animation-delay-2000">
                  ⭐
                </div>
              </div>
            </div>

            <div className="stat-card group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-label text-purple-600 dark:text-purple-400">
                    อันดับ
                  </p>
                  <p className="stat-number text-purple-600 dark:text-purple-400">
                    #{stats.userRank || 0}
                  </p>
                  <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                    ของโรงเรียน
                  </p>
                </div>
                <div className="text-6xl group-hover:scale-110 transition-transform animate-float animation-delay-3000">
                  🏆
                </div>
              </div>
            </div>
          </div>

          {/* Premium Action Cards */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/waste/record"
              className="glass-card p-8 text-center group hover:scale-105 transition-all duration-500"
            >
              <div className="text-7xl mb-6 group-hover:scale-110 transition-transform animate-float">
                📝
              </div>
              <h3 className="text-2xl font-bold text-gradient mb-3">
                บันทึกขยะ
              </h3>
              <p className="text-gray-600 dark:text-gray-300 font-medium mb-4">
                เพิ่มข้อมูลขยะใหม่
              </p>
              <div className="glass-button px-4 py-2 text-sm font-semibold">
                เริ่มบันทึก →
              </div>
            </Link>

            <Link
              href="/statistics"
              className="glass-card p-8 text-center group hover:scale-105 transition-all duration-500"
            >
              <div className="text-7xl mb-6 group-hover:scale-110 transition-transform animate-float animation-delay-1000">
                📊
              </div>
              <h3 className="text-2xl font-bold text-gradient mb-3">สถิติ</h3>
              <p className="text-gray-600 dark:text-gray-300 font-medium mb-4">
                ดูข้อมูลและกราฟ
              </p>
              <div className="glass-button px-4 py-2 text-sm font-semibold">
                ดูสถิติ →
              </div>
            </Link>

            <Link
              href="/leaderboard"
              className="glass-card p-8 text-center group hover:scale-105 transition-all duration-500"
            >
              <div className="text-7xl mb-6 group-hover:scale-110 transition-transform animate-float animation-delay-2000">
                🏆
              </div>
              <h3 className="text-2xl font-bold text-gradient mb-3">อันดับ</h3>
              <p className="text-gray-600 dark:text-gray-300 font-medium mb-4">
                ดูอันดับและแข่งขัน
              </p>
              <div className="glass-button px-4 py-2 text-sm font-semibold">
                ดูอันดับ →
              </div>
            </Link>

            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                className="glass-card p-8 text-center group hover:scale-105 transition-all duration-500"
              >
                <div className="text-7xl mb-6 group-hover:scale-110 transition-transform animate-float animation-delay-3000">
                  ⚙️
                </div>
                <h3 className="text-2xl font-bold text-gradient mb-3">
                  จัดการ
                </h3>
                <p className="text-gray-600 dark:text-gray-300 font-medium mb-4">
                  Admin Panel
                </p>
                <div className="glass-button px-4 py-2 text-sm font-semibold">
                  เข้าจัดการ →
                </div>
              </Link>
            )}
          </div>

          {/* Premium Recent Activities */}
          <div className="glass-card">
            <div className="bg-gradient-luxury text-white px-8 py-6 rounded-t-3xl">
              <h3 className="text-3xl font-bold flex items-center">
                <span className="mr-4 animate-float">📋</span>
                กิจกรรมล่าสุด
              </h3>
            </div>
            <div className="p-8">
              {(stats.recentActivities || []).length > 0 ? (
                <div className="space-y-6">
                  {(stats.recentActivities || []).map((activity, index) => (
                    <div
                      key={index}
                      className="glass-card p-6 hover:scale-102 transition-all duration-300"
                    >
                      <div className="flex items-center space-x-6">
                        <div className="text-5xl animate-float">
                          {activity.type === "RECYCLABLE" ? "♻️" : "🗑️"}
                        </div>
                        <div className="flex-1">
                          <p className="text-xl font-bold text-gradient">
                            บันทึกขยะ
                            {activity.type === "RECYCLABLE"
                              ? "รีไซเคิล"
                              : "ทั่วไป"}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            {new Date(
                              activity.createdAt || new Date(),
                            ).toLocaleDateString("th-TH", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gradient">
                            +{activity.points || 0} คะแนน
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            {(activity.weight || 0).toLocaleString()} กรัม
                          </p>
                          {isWithin24h(activity.createdAt) && (
                            <div className="flex space-x-2 mt-2 justify-end">
                              <button
                                onClick={() =>
                                  setEditingActivity({
                                    id: activity.id,
                                    weight: activity.weight,
                                    description: "",
                                  })
                                }
                                className="text-xs glass-button px-2 py-1 text-blue-600"
                              >
                                ✏️ แก้ไข
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(activity.id)}
                                className="text-xs glass-button px-2 py-1 text-red-600"
                              >
                                🗑️ ลบ
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="text-9xl mb-8 animate-float">📝</div>
                  <h4 className="text-3xl font-bold text-gradient mb-6">
                    ยังไม่มีกิจกรรม
                  </h4>
                  <p className="text-xl text-gray-400 dark:text-gray-500 mb-10">
                    เริ่มต้นด้วยการบันทึกขยะของคุณ
                  </p>
                  <Link
                    href="/waste/record"
                    className="btn btn-primary px-10 py-4 text-xl"
                  >
                    <span className="mr-3">🚀</span>
                    เริ่มบันทึกขยะ
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Premium Motivational Footer */}
          <div className="text-center py-12 glass-card">
            <h3 className="text-4xl font-bold text-gradient-luxury mb-6">
              <span className="animate-float">🌍</span> ร่วมกันรักษ์โลก{" "}
              <span className="animate-float animation-delay-1000">🌱</span>
            </h3>
            <p className="text-2xl font-medium text-gray-600 dark:text-gray-300">
              ทุกการกระทำเล็กๆ ของคุณ มีส่วนช่วยสร้างโลกที่ยั่งยืน
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

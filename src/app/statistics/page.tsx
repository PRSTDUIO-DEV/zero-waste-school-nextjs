"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface StatisticsData {
  personalStats: {
    totalRecords: number;
    totalWeight: number;
    totalPoints: number;
    recycleWeight: number;
    generalWeight: number;
    averagePerDay: number;
    rank: number;
    percentile: number;
  };
  schoolStats: {
    totalUsers: number;
    totalRecords: number;
    totalWeight: number;
    totalPoints: number;
    topPerformers: Array<{
      name: string;
      points: number;
      weight: number;
    }>;
  };
  monthlyData: Array<{
    month: string;
    recycleWeight: number;
    generalWeight: number;
    points: number;
  }>;
  weeklyData: Array<{
    day: string;
    weight: number;
    points: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    weight: number;
    percentage: number;
  }>;
}

export default function StatisticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<
    "week" | "month" | "year"
  >("month");

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/statistics?period=${selectedPeriod}`,
        );
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          setError("ไม่สามารถโหลดข้อมูลสถิติได้");
        }
      } catch {
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [session, status, selectedPeriod, router]);

  if (status === "loading" || loading) {
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
            onClick={() => window.location.reload()}
            className="btn btn-primary px-8 py-4 text-lg"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-emerald-900 dark:to-teal-900 bg-pattern">
      {/* Premium Header */}
      <header className="glass-header sticky top-0 z-50 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="glass-button p-3 hover:scale-110 transition-transform"
              >
                <span className="text-2xl">←</span>
              </Link>
              <div className="w-16 h-16 bg-gradient-luxury rounded-3xl flex items-center justify-center shadow-2xl animate-pulse-luxury">
                <span className="text-3xl">📊</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gradient-luxury">
                  สถิติและข้อมูล
                </h1>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold tracking-wide">
                  📈 Analytics & Insights
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) =>
                  setSelectedPeriod(e.target.value as "week" | "month" | "year")
                }
                className="glass-button px-4 py-2 font-semibold"
              >
                <option value="week">สัปดาห์นี้</option>
                <option value="month">เดือนนี้</option>
                <option value="year">ปีนี้</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Personal Performance Overview */}
          <div className="glass-card">
            <div className="bg-gradient-luxury text-white px-8 py-6 rounded-t-3xl">
              <h2 className="text-3xl font-bold flex items-center">
                <span className="mr-4 animate-float">🎯</span>
                ผลงานส่วนตัว
              </h2>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="stat-card group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="stat-label text-emerald-600 dark:text-emerald-400">
                        จำนวนครั้ง
                      </p>
                      <p className="stat-number">
                        {stats.personalStats.totalRecords}
                      </p>
                      <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                        บันทึก
                      </p>
                    </div>
                    <div className="text-6xl group-hover:scale-110 transition-transform animate-float">
                      📝
                    </div>
                  </div>
                </div>

                <div className="stat-card group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="stat-label text-blue-600 dark:text-blue-400">
                        น้ำหนักรวม
                      </p>
                      <p className="stat-number text-blue-600 dark:text-blue-400">
                        {stats.personalStats.totalWeight.toLocaleString()}
                      </p>
                      <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                        กรัม
                      </p>
                    </div>
                    <div className="text-6xl group-hover:scale-110 transition-transform animate-float animation-delay-1000">
                      ⚖️
                    </div>
                  </div>
                </div>

                <div className="stat-card group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="stat-label text-purple-600 dark:text-purple-400">
                        คะแนนรวม
                      </p>
                      <p className="stat-number text-purple-600 dark:text-purple-400">
                        {stats.personalStats.totalPoints.toLocaleString()}
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
                      <p className="stat-label text-orange-600 dark:text-orange-400">
                        อันดับ
                      </p>
                      <p className="stat-number text-orange-600 dark:text-orange-400">
                        #{stats.personalStats.rank}
                      </p>
                      <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                        Top {stats.personalStats.percentile}%
                      </p>
                    </div>
                    <div className="text-6xl group-hover:scale-110 transition-transform animate-float animation-delay-3000">
                      🏆
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Waste Type Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-card">
              <div className="bg-gradient-primary text-white px-8 py-6 rounded-t-3xl">
                <h3 className="text-2xl font-bold flex items-center">
                  <span className="mr-3 animate-float">♻️</span>
                  ประเภทขยะ
                </h3>
              </div>
              <div className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 glass-card">
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl">♻️</div>
                      <div>
                        <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                          ขยะรีไซเคิล
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {(
                            (stats.personalStats.recycleWeight /
                              stats.personalStats.totalWeight) *
                            100
                          ).toFixed(1)}
                          %
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {stats.personalStats.recycleWeight.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        กรัม
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 glass-card">
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl">🗑️</div>
                      <div>
                        <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                          ขยะทั่วไป
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {(
                            (stats.personalStats.generalWeight /
                              stats.personalStats.totalWeight) *
                            100
                          ).toFixed(1)}
                          %
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {stats.personalStats.generalWeight.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        กรัม
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card">
              <div className="bg-gradient-secondary text-white px-8 py-6 rounded-t-3xl">
                <h3 className="text-2xl font-bold flex items-center">
                  <span className="mr-3 animate-float">📈</span>
                  ค่าเฉลี่ยต่อวัน
                </h3>
              </div>
              <div className="p-8">
                <div className="text-center">
                  <div className="text-8xl mb-6 animate-pulse-luxury">📊</div>
                  <p className="text-4xl font-bold text-gradient mb-4">
                    {stats.personalStats.averagePerDay.toLocaleString()}
                  </p>
                  <p className="text-xl text-gray-600 dark:text-gray-300 font-semibold">
                    กรัม/วัน
                  </p>
                  <div className="mt-6 p-4 glass-card">
                    <p className="text-lg text-gray-500 dark:text-gray-400">
                      {stats.personalStats.averagePerDay > 1000
                        ? "🎉 ยอดเยี่ยม! คุณมีส่วนร่วมมาก"
                        : "💪 ดีมาก! เพิ่มความพยายามต่อไป"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* School Statistics */}
          <div className="glass-card">
            <div className="bg-gradient-accent text-white px-8 py-6 rounded-t-3xl">
              <h2 className="text-3xl font-bold flex items-center">
                <span className="mr-4 animate-float">🏫</span>
                สถิติโรงเรียน
              </h2>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="stat-card">
                  <div className="text-center">
                    <div className="text-5xl mb-4 animate-float">👥</div>
                    <p className="stat-number text-blue-600 dark:text-blue-400">
                      {stats.schoolStats.totalUsers}
                    </p>
                    <p className="stat-label">ผู้ใช้งาน</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="text-center">
                    <div className="text-5xl mb-4 animate-float animation-delay-1000">
                      📝
                    </div>
                    <p className="stat-number text-emerald-600 dark:text-emerald-400">
                      {stats.schoolStats.totalRecords}
                    </p>
                    <p className="stat-label">บันทึกรวม</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="text-center">
                    <div className="text-5xl mb-4 animate-float animation-delay-2000">
                      ⚖️
                    </div>
                    <p className="stat-number text-purple-600 dark:text-purple-400">
                      {stats.schoolStats.totalWeight.toLocaleString()}
                    </p>
                    <p className="stat-label">กรัม</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="text-center">
                    <div className="text-5xl mb-4 animate-float animation-delay-3000">
                      ⭐
                    </div>
                    <p className="stat-number text-orange-600 dark:text-orange-400">
                      {stats.schoolStats.totalPoints.toLocaleString()}
                    </p>
                    <p className="stat-label">คะแนนรวม</p>
                  </div>
                </div>
              </div>

              {/* Top Performers */}
              <div className="glass-card">
                <div className="bg-gradient-luxury text-white px-6 py-4 rounded-t-2xl">
                  <h4 className="text-xl font-bold flex items-center">
                    <span className="mr-3">🏆</span>
                    ผู้ทำคะแนนสูงสุด
                  </h4>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {stats.schoolStats.topPerformers.map((performer, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-4 p-4 glass-card hover:scale-102 transition-transform"
                      >
                        <div className="text-3xl">
                          {index === 0
                            ? "🥇"
                            : index === 1
                              ? "🥈"
                              : index === 2
                                ? "🥉"
                                : "🏅"}
                        </div>
                        <div className="flex-1">
                          <p className="text-lg font-bold text-gradient">
                            {performer.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {performer.weight.toLocaleString()} กรัม
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gradient">
                            {performer.points.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            คะแนน
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Trend Chart (Placeholder) */}
          <div className="glass-card">
            <div className="bg-gradient-primary text-white px-8 py-6 rounded-t-3xl">
              <h2 className="text-3xl font-bold flex items-center">
                <span className="mr-4 animate-float">📊</span>
                แนวโน้มรายเดือน
              </h2>
            </div>
            <div className="p-8">
              <div className="text-center py-20">
                <div className="text-9xl mb-8 animate-float">📈</div>
                <h3 className="text-3xl font-bold text-gradient mb-6">
                  กราฟแนวโน้ม
                </h3>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                  กำลังพัฒนาระบบแสดงกราฟ
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {stats.monthlyData.slice(0, 3).map((month, index) => (
                    <div key={index} className="glass-card p-6">
                      <h4 className="text-xl font-bold text-gradient mb-4">
                        {month.month}
                      </h4>
                      <div className="space-y-2">
                        <p className="text-lg">
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            ♻️ {(month.recycleWeight / 1000).toFixed(2)} กก.
                          </span>
                        </p>
                        <p className="text-lg">
                          <span className="text-orange-600 dark:text-orange-400 font-semibold">
                            🗑️ {(month.generalWeight / 1000).toFixed(2)} กก.
                          </span>
                        </p>
                        <p className="text-lg">
                          <span className="text-purple-600 dark:text-purple-400 font-semibold">
                            ⭐ {month.points} คะแนน
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-center">
            <div className="flex justify-center space-x-6">
              <Link
                href="/dashboard"
                className="btn btn-secondary px-8 py-4 text-lg"
              >
                <span className="mr-3">🏠</span>
                กลับหน้าหลัก
              </Link>
              <Link
                href="/waste/record"
                className="btn btn-primary px-8 py-4 text-lg"
              >
                <span className="mr-3">📝</span>
                บันทึกขยะใหม่
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

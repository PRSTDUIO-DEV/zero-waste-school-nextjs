"use client";

import LogoutButton from "@/components/LogoutButton";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const dynamic = "force-dynamic";

interface Badge {
  id: number;
  name: string;
  description: string | null;
  thresholdPts: number;
  earned: boolean;
  awardedDt: string | null;
}

export default function BadgesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchBadges();
    }
  }, [status, router]);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/badges");
      if (res.ok) {
        const data = await res.json();
        setBadges(data.badges);
        setCurrentPoints(data.currentPoints);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
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

  const earnedCount = badges.filter((b) => b.earned).length;
  const nextBadge = badges.find((b) => !b.earned);
  const progressToNext = nextBadge
    ? Math.min((currentPoints / nextBadge.thresholdPts) * 100, 99)
    : 100;

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
                <h1 className="text-2xl font-bold text-gradient">
                  เหรียญรางวัล
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  ได้รับ {earnedCount}/{badges.length} เหรียญ
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Current Points & Progress */}
        <div className="glass-card p-8">
          <div className="text-center mb-6">
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
              คะแนนปัจจุบัน
            </p>
            <p className="text-5xl font-bold text-gradient mb-4">
              {currentPoints.toLocaleString()} ⭐
            </p>
          </div>
          {nextBadge && (
            <div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                <span>เหรียญถัดไป: {nextBadge.name}</span>
                <span>
                  {currentPoints.toLocaleString()} /{" "}
                  {nextBadge.thresholdPts.toLocaleString()} คะแนน
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-400 to-teal-500 h-4 rounded-full transition-all duration-1000"
                  style={{ width: `${progressToNext}%` }}
                ></div>
              </div>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                อีก {(nextBadge.thresholdPts - currentPoints).toLocaleString()}{" "}
                คะแนน
              </p>
            </div>
          )}
        </div>

        {/* Badge Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`glass-card p-6 text-center transition-all duration-300 ${
                badge.earned
                  ? "ring-2 ring-emerald-500 hover:scale-105"
                  : "opacity-60 grayscale"
              }`}
            >
              <div
                className={`text-7xl mb-4 ${badge.earned ? "animate-float" : ""}`}
              >
                {badge.earned ? "🏆" : "🔒"}
              </div>
              <h3 className="text-xl font-bold text-gradient mb-2">
                {badge.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {badge.description}
              </p>
              <div className="glass-button px-3 py-1 text-sm inline-block">
                {badge.earned
                  ? `✅ ได้รับแล้ว`
                  : `🎯 ต้องการ ${badge.thresholdPts.toLocaleString()} คะแนน`}
              </div>
              {badge.earned && badge.awardedDt && (
                <p className="text-xs text-gray-400 mt-2">
                  ได้รับเมื่อ{" "}
                  {new Date(badge.awardedDt).toLocaleDateString("th-TH")}
                </p>
              )}
            </div>
          ))}
        </div>

        {badges.length === 0 && (
          <div className="glass-card p-12 text-center">
            <div className="text-8xl mb-6">🎖️</div>
            <h3 className="text-2xl font-bold text-gradient mb-4">
              ยังไม่มีเหรียญรางวัล
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              ระบบเหรียญรางวัลยังไม่ได้ตั้งค่า กรุณาติดต่อผู้ดูแลระบบ
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

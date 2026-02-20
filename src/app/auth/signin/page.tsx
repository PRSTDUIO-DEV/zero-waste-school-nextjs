"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export const dynamic = "force-dynamic";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      } else {
        // Use window.location for reliable redirect after auth state change
        window.location.href = "/dashboard";
      }
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-900 dark:to-emerald-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-96 h-96 bg-gradient-to-br from-teal-400 to-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000"></div>

        {/* Floating elements */}
        <div className="absolute top-20 right-20 w-4 h-4 bg-green-500 rounded-full animate-float"></div>
        <div className="absolute bottom-20 left-20 w-6 h-6 bg-emerald-500 rounded-full animate-float animation-delay-1000"></div>
        <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-teal-500 rounded-full animate-float animation-delay-2000"></div>
      </div>

      <div className="relative max-w-md w-full z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-float">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-eco rounded-3xl flex items-center justify-center shadow-2xl animate-pulse-green">
              <span className="text-3xl">🌱</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gradient-eco mb-3">
            เข้าสู่ระบบ
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
            EEP School System
          </p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-2">
            รักษ์โลก เริ่มต้นที่โรงเรียน
          </p>
        </div>

        {/* Main Card */}
        <div className="card bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-8 shadow-2xl border-2 border-green-200 dark:border-green-700">
          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="form-label text-green-800 dark:text-green-200">
                อีเมล
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input w-full border-green-300 dark:border-green-600 focus:border-green-500 dark:focus:border-green-400 bg-green-50 dark:bg-green-900/20"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="form-label text-green-800 dark:text-green-200">
                รหัสผ่าน
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input w-full border-green-300 dark:border-green-600 focus:border-green-500 dark:focus:border-green-400 bg-green-50 dark:bg-green-900/20"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-4 text-xl font-bold shadow-2xl hover:shadow-green-500/25 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-3 border-white mr-3"></div>
                  กำลังเข้าสู่ระบบ...
                </div>
              ) : (
                <>
                  <span className="mr-2">🚀</span>
                  เข้าสู่ระบบ
                </>
              )}
            </button>

            {error && (
              <div className="bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 text-red-800 dark:text-red-300 px-6 py-4 rounded-xl text-base font-semibold">
                <span className="mr-2">⚠️</span>
                {error}
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-base">
              ยังไม่มีบัญชี?{" "}
              <Link
                href="/auth/signup"
                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-bold hover:underline transition-colors"
              >
                สมัครสมาชิก
              </Link>
            </p>
            <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-green-600 dark:text-green-400">
              <span>🌍</span>
              <span>ร่วมกันรักษ์โลก</span>
              <span>🌱</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

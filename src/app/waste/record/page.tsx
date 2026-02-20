"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface WasteType {
  id: number;
  name: string;
  pointFactor: number;
  description?: string;
}

interface WasteRecord {
  wasteTypeId: number;
  weight: number;
  description?: string;
}

export default function WasteRecordPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [wasteTypes, setWasteTypes] = useState<WasteType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [formData, setFormData] = useState<WasteRecord>({
    wasteTypeId: 0,
    weight: 0,
    description: "",
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    fetchWasteTypes();
  }, [session, status, router]);

  const fetchWasteTypes = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/waste/types");
      if (response.ok) {
        const data = await response.json();
        setWasteTypes(data);
      } else {
        setError("ไม่สามารถโหลดประเภทขยะได้");
      }
    } catch {
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.wasteTypeId <= 0 || formData.weight <= 0) {
      setError("กรุณาเลือกประเภทขยะและใส่น้ำหนักที่ถูกต้อง");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/waste/record", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          records: [
            {
              typeId: formData.wasteTypeId,
              weightG: Math.round(formData.weight), // Already in grams
              description: formData.description || null,
            },
          ],
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const baseMessage = `✅ ${data.message || "บันทึกสำเร็จ"}`;
        const pointsMessage = data.totalPoints
          ? ` คุณได้รับ ${data.totalPoints} คะแนน`
          : "";
        const badgeMessage =
          data.newBadges && data.newBadges.length > 0
            ? ` 🏆 ได้รับเหรียญใหม่: ${data.newBadges.map((b: { name: string }) => b.name).join(", ")}`
            : "";

        setSuccess(baseMessage + pointsMessage + badgeMessage);

        // Reset form
        setFormData({
          wasteTypeId: 0,
          weight: 0,
          description: "",
        });

        // Auto-hide success message after 5 seconds
        setTimeout(() => setSuccess(""), 5000);
      } else {
        setError(data.error || "เกิดข้อผิดพลาดในการบันทึก");
      }
    } catch (error) {
      console.error("Submit error:", error);
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefresh = () => {
    setError("");
    setSuccess("");
    fetchWasteTypes();
  };

  const getCategoryFromName = (name: string): string => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("รีไซเคิล") || lowerName.includes("recycle")) {
      return "รีไซเคิล";
    } else if (
      lowerName.includes("อินทรีย์") ||
      lowerName.includes("organic")
    ) {
      return "อินทรีย์";
    } else if (lowerName.includes("อันตราย") || lowerName.includes("hazard")) {
      return "อันตราย";
    } else {
      return "ทั่วไป";
    }
  };

  const getFilteredWasteTypes = () => {
    if (selectedCategory === "all") return wasteTypes;
    return wasteTypes.filter(
      (type) => getCategoryFromName(type.name) === selectedCategory,
    );
  };

  const getCategories = () => {
    const categories = [
      ...new Set(wasteTypes.map((type) => getCategoryFromName(type.name))),
    ];
    return categories;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "รีไซเคิล":
        return "♻️";
      case "อินทรีย์":
        return "🌱";
      case "อันตราย":
        return "☢️";
      case "ทั่วไป":
      default:
        return "🗑️";
    }
  };

  const getSelectedWasteType = () => {
    return wasteTypes.find((type) => type.id === formData.wasteTypeId);
  };

  const calculatePoints = () => {
    const selectedType = getSelectedWasteType();
    if (!selectedType || !formData.weight) return 0;
    return Math.round(formData.weight * Number(selectedType.pointFactor));
  };

  if (status === "loading" || loading) {
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

  if (error && !wasteTypes.length) {
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

  const user = session?.user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-emerald-900 dark:to-teal-900 bg-pattern p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gradient mb-4 animate-float">
            📝 บันทึกขยะ
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            บันทึกการทิ้งขยะของคุณเพื่อสะสมคะแนน
          </p>
          <div className="flex justify-center mt-4">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="btn btn-glass px-6 py-2 text-sm"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  กำลังโหลด...
                </>
              ) : (
                <>
                  <span className="mr-2">🔄</span>
                  รีเฟรชข้อมูล
                </>
              )}
            </button>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="glass-card bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 mb-6 p-6 rounded-2xl">
            <div className="flex items-center">
              <div className="text-4xl mr-4">🎉</div>
              <div>
                <h3 className="text-lg font-bold text-green-800 dark:text-green-200">
                  สำเร็จ!
                </h3>
                <p className="text-green-700 dark:text-green-300 whitespace-pre-line">
                  {success}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="glass-card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 mb-6 p-6 rounded-2xl">
            <div className="flex items-center">
              <div className="text-4xl mr-4">❌</div>
              <div>
                <h3 className="text-lg font-bold text-red-800 dark:text-red-200">
                  เกิดข้อผิดพลาด
                </h3>
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

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
                  <span className="text-3xl">📝</span>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gradient-luxury">
                    บันทึกขยะ
                  </h1>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold tracking-wide">
                    📊 Waste Recording System
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="glass-button px-4 py-2 font-semibold">
                  👋 {user?.name}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="text-center py-8">
              <h2 className="text-4xl font-bold text-gradient-luxury mb-4 animate-shimmer">
                บันทึกขยะของคุณ
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-medium">
                ช่วยกันสร้างโรงเรียนที่ปลอดขยะ เพื่อโลกที่ยั่งยืน
              </p>
              <div className="mt-6 flex justify-center space-x-2 text-2xl">
                <span className="animate-float">🌍</span>
                <span className="animate-float animation-delay-1000">♻️</span>
                <span className="animate-float animation-delay-2000">🌱</span>
              </div>
            </div>

            {/* Category Filter */}
            <div className="glass-card p-6">
              <h3 className="text-2xl font-bold text-gradient mb-4">
                เลือกประเภทขยะ
              </h3>
              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`btn ${selectedCategory === "all" ? "btn-primary" : "btn-glass"} px-6 py-3`}
                >
                  <span className="mr-2">📦</span>
                  ทั้งหมด
                </button>
                {getCategories().map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`btn ${selectedCategory === category ? "btn-primary" : "btn-glass"} px-6 py-3`}
                  >
                    <span className="mr-2">{getCategoryIcon(category)}</span>
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Recording Form */}
            <div className="glass-card">
              <div className="bg-gradient-luxury text-white px-8 py-6 rounded-t-3xl">
                <h2 className="text-3xl font-bold flex items-center">
                  <span className="mr-4 animate-float">📝</span>
                  ฟอร์มบันทึกขยะ
                </h2>
              </div>
              <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Waste Type Selection */}
                  <div>
                    <label className="form-label">ประเภทขยะ *</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {getFilteredWasteTypes().map((type) => (
                        <div
                          key={type.id}
                          className={`glass-card p-4 cursor-pointer transition-all duration-300 hover:scale-105 ${
                            formData.wasteTypeId === type.id
                              ? "ring-4 ring-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                              : ""
                          }`}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              wasteTypeId: type.id,
                            }))
                          }
                        >
                          <div className="flex items-center space-x-4">
                            <div className="text-4xl">
                              {getCategoryIcon(getCategoryFromName(type.name))}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-bold text-gradient">
                                {type.name}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                {type.description || "ไม่มีคำอธิบาย"}
                              </p>
                              <div className="flex items-center space-x-4">
                                <span className="glass-button px-2 py-1 text-xs">
                                  {getCategoryFromName(type.name)}
                                </span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                  {Number(type.pointFactor)} คะแนน/กรัม
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Weight Input */}
                  <div>
                    <label htmlFor="weight" className="form-label">
                      น้ำหนัก (กรัม) *
                    </label>
                    <input
                      id="weight"
                      type="number"
                      step="1"
                      min="1"
                      max="100000"
                      value={formData.weight || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          weight: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="form-input w-full text-2xl font-bold text-center"
                      placeholder="0.00"
                      required
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                      ใส่น้ำหนักเป็นกรัม (เช่น 500 กรัม)
                    </p>
                  </div>

                  {/* Points Preview */}
                  {formData.wasteTypeId > 0 && formData.weight > 0 && (
                    <div className="glass-card p-6 text-center">
                      <h3 className="text-2xl font-bold text-gradient mb-4">
                        คะแนนที่จะได้รับ
                      </h3>
                      <div className="text-6xl font-bold text-gradient mb-4 animate-pulse-luxury">
                        {calculatePoints().toLocaleString()}
                      </div>
                      <p className="text-xl text-gray-600 dark:text-gray-300">
                        คะแนน
                      </p>
                      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                        {formData.weight.toLocaleString()} กรัม ×{" "}
                        {Number(getSelectedWasteType()?.pointFactor)} คะแนน/กรัม
                        = {calculatePoints().toLocaleString()} คะแนน
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="form-label">
                      รายละเอียดเพิ่มเติม (ไม่บังคับ)
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="form-input w-full h-32 resize-none"
                      placeholder="ระบุรายละเอียดเพิ่มเติม เช่น สถานที่ เวลา หรือข้อมูลอื่นๆ"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="text-center">
                    <button
                      type="submit"
                      disabled={
                        submitting ||
                        !formData.wasteTypeId ||
                        formData.weight <= 0
                      }
                      className="btn btn-primary px-12 py-4 text-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                          กำลังบันทึก...
                        </div>
                      ) : (
                        <>
                          <span className="mr-3">💾</span>
                          บันทึกขยะ
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Tips Section */}
            <div className="glass-card p-8">
              <h3 className="text-2xl font-bold text-gradient mb-6 flex items-center">
                <span className="mr-3 animate-float">💡</span>
                เคล็ดลับการบันทึกขยะ
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                  <h4 className="text-lg font-bold text-gradient mb-3">
                    📏 การชั่งน้ำหนัก
                  </h4>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                    <li>• ใช้เครื่องชั่งที่มีความแม่นยำ</li>
                    <li>• ชั่งขยะหลังจากทำความสะอาดแล้ว</li>
                    <li>• แยกประเภทขยะก่อนชั่ง</li>
                  </ul>
                </div>
                <div className="glass-card p-6">
                  <h4 className="text-lg font-bold text-gradient mb-3">
                    ♻️ การแยกขยะ
                  </h4>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                    <li>• ขยะรีไซเคิล: กระดาษ พลาสติก แก้ว</li>
                    <li>• ขยะอินทรีย์: เศษอาหาร ใบไม้</li>
                    <li>• ขยะทั่วไป: ขยะที่ไม่สามารถรีไซเคิลได้</li>
                  </ul>
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
                  href="/statistics"
                  className="btn btn-glass px-8 py-4 text-lg"
                >
                  <span className="mr-3">📊</span>
                  ดูสถิติ
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

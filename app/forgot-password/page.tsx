"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";

type Step = "email" | "reset";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const BASE_API_URL =
    process.env.NEXT_PUBLIC_BASE_API_URL || "https://kantinklik.up.railway.app";

  const [step, setStep] = useState<Step>("email");

  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loadingSendOtp, setLoadingSendOtp] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);

  async function handleSendOtp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email.trim()) {
      alert("Email wajib diisi");
      return;
    }

    if (!email.trim().endsWith("@student.smktelkom-mlg.sch.id")) {
      alert("Gunakan email sekolah @student.smktelkom-mlg.sch.id");
      return;
    }

    try {
      setLoadingSendOtp(true);

      const response = await fetch(`${BASE_API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      const data = await response.json().catch(() => null);
      console.log("FORGOT PASSWORD RESPONSE:", data);

      if (!response.ok) {
        alert(
          Array.isArray(data?.message)
            ? data.message.join(", ")
            : data?.message || "Gagal mengirim OTP reset password"
        );
        return;
      }

      alert(data?.message || "OTP reset password berhasil dikirim ke email");
      setStep("reset");
    } catch (error) {
      console.error("FORGOT PASSWORD ERROR:", error);
      alert("Gagal terhubung ke server");
    } finally {
      setLoadingSendOtp(false);
    }
  }

  async function handleResetPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email.trim()) {
      alert("Email wajib diisi");
      return;
    }

    if (!otpCode.trim()) {
      alert("Kode OTP wajib diisi");
      return;
    }

    if (!newPassword.trim()) {
      alert("Password baru wajib diisi");
      return;
    }

    if (!confirmPassword.trim()) {
      alert("Konfirmasi password wajib diisi");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Konfirmasi password tidak sama");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password minimal 6 karakter");
      return;
    }

    try {
      setLoadingReset(true);

      const response = await fetch(`${BASE_API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        // INI YANG BENAR SESUAI ERROR BACKEND:
        // bukan code, bukan otp, tapi otpCode
        body: JSON.stringify({
          email: email.trim(),
          otpCode: otpCode.trim(),
          newPassword: newPassword.trim(),
        }),
      });

      const data = await response.json().catch(() => null);
      console.log("RESET PASSWORD RESPONSE:", data);

      if (!response.ok) {
        alert(
          Array.isArray(data?.message)
            ? data.message.join(", ")
            : data?.message || "Gagal reset password"
        );
        return;
      }

      alert(data?.message || "Password berhasil direset. Silakan login.");
      router.push("/sign-in");
    } catch (error) {
      console.error("RESET PASSWORD ERROR:", error);
      alert("Gagal terhubung ke server");
    } finally {
      setLoadingReset(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fff7f7] px-6 py-8 text-gray-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-120px] top-[-120px] h-[420px] w-[420px] rounded-full bg-[#7f1d1d]/20 blur-3xl" />
        <div className="absolute right-[-140px] top-[80px] h-[480px] w-[480px] rounded-full bg-[#991b1b]/20 blur-3xl" />
        <div className="absolute bottom-[-180px] left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#450a0a]/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2.5rem] border border-[#7f1d1d]/10 bg-white shadow-2xl shadow-red-900/10 lg:grid-cols-2">
          <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#991b1b] via-[#7f1d1d] to-[#450a0a] p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute right-[-80px] top-[-80px] h-72 w-72 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-[-120px] left-[-120px] h-80 w-80 rounded-full bg-black/20 blur-3xl" />

            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl font-black text-[#7f1d1d] shadow-xl shadow-black/10">
                  K
                </div>

                <div>
                  <h1 className="text-2xl font-black">KantinKlik</h1>
                  <p className="text-sm font-medium text-red-100">
                    Kantin sekolah digital
                  </p>
                </div>
              </div>

              <div className="mt-16">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-red-50 backdrop-blur">
                  <ShieldCheck className="h-4 w-4" />
                  Reset Password Customer
                </div>

                <h2 className="max-w-md text-5xl font-black leading-tight tracking-tight">
                  Lupa password akun customer?
                </h2>

                <p className="mt-5 max-w-md text-base leading-8 text-red-100">
                  Masukkan email sekolah, ambil kode OTP dari email, lalu buat
                  password baru.
                </p>
              </div>
            </div>

            <div className="relative rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="font-black">Khusus Customer</p>
              <p className="mt-1 text-sm leading-6 text-red-100">
                OTP akan dikirim ke email sekolah customer yang terdaftar.
              </p>
            </div>
          </section>

          <section className="p-6 sm:p-10">
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#7f1d1d] transition hover:text-[#450a0a]"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Login
            </Link>

            {step === "email" ? (
              <>
                <div className="mt-8">
                  <div className="inline-flex rounded-full bg-[#fff0f0] px-4 py-2 text-sm font-black text-[#7f1d1d]">
                    Lupa Password
                  </div>

                  <h2 className="mt-8 text-4xl font-black tracking-tight text-gray-950">
                    Kirim OTP Reset
                  </h2>

                  <p className="mt-3 max-w-md text-sm leading-6 text-gray-500">
                    Masukkan email sekolah customer. Kode OTP akan dikirim ke
                    email tersebut.
                  </p>
                </div>

                <form onSubmit={handleSendOtp} className="mt-8 space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-black text-gray-700">
                      Email Sekolah
                    </label>

                    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-4 transition focus-within:border-[#7f1d1d] focus-within:ring-4 focus-within:ring-[#7f1d1d]/10">
                      <Mail className="h-5 w-5 text-gray-400" />

                      <input
                        type="email"
                        placeholder="email@student.smktelkom-mlg.sch.id"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loadingSendOtp}
                    className="w-full rounded-2xl bg-gradient-to-r from-[#991b1b] to-[#450a0a] px-5 py-4 text-sm font-black text-white shadow-lg shadow-red-900/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loadingSendOtp ? "Mengirim OTP..." : "Kirim OTP"}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="mt-8">
                  <div className="inline-flex rounded-full bg-[#fff0f0] px-4 py-2 text-sm font-black text-[#7f1d1d]">
                    Reset Password
                  </div>

                  <h2 className="mt-8 text-4xl font-black tracking-tight text-gray-950">
                    Buat Password Baru
                  </h2>

                  <p className="mt-3 max-w-md text-sm leading-6 text-gray-500">
                    OTP sudah dikirim ke:
                  </p>

                  <p className="mt-1 break-all text-sm font-black text-[#7f1d1d]">
                    {email}
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="mt-8 space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-black text-gray-700">
                      Kode OTP
                    </label>

                    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-4 transition focus-within:border-[#7f1d1d] focus-within:ring-4 focus-within:ring-[#7f1d1d]/10">
                      <ShieldCheck className="h-5 w-5 text-gray-400" />

                      <input
                        type="text"
                        placeholder="Masukkan kode OTP"
                        value={otpCode}
                        onChange={(e) =>
                          setOtpCode(e.target.value.replace(/\D/g, ""))
                        }
                        className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-black text-gray-700">
                      Password Baru
                    </label>

                    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-4 transition focus-within:border-[#7f1d1d] focus-within:ring-4 focus-within:ring-[#7f1d1d]/10">
                      <Lock className="h-5 w-5 text-gray-400" />

                      <input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Masukkan password baru"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-gray-400"
                      />

                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="text-gray-400 transition hover:text-[#7f1d1d]"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-black text-gray-700">
                      Konfirmasi Password
                    </label>

                    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-4 transition focus-within:border-[#7f1d1d] focus-within:ring-4 focus-within:ring-[#7f1d1d]/10">
                      <Lock className="h-5 w-5 text-gray-400" />

                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Ulangi password baru"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-gray-400"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="text-gray-400 transition hover:text-[#7f1d1d]"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loadingReset}
                    className="w-full rounded-2xl bg-gradient-to-r from-[#991b1b] to-[#450a0a] px-5 py-4 text-sm font-black text-white shadow-lg shadow-red-900/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loadingReset ? "Mereset Password..." : "Reset Password"}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="mt-5 w-full rounded-2xl border border-[#7f1d1d]/20 bg-white px-5 py-4 text-sm font-black text-[#7f1d1d] transition hover:bg-[#7f1d1d]/5"
                >
                  Ganti Email
                </button>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
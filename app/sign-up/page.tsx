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
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();

  const BASE_API_URL =
    process.env.NEXT_PUBLIC_BASE_API_URL || "https://kantinklik.up.railway.app";

  const [step, setStep] = useState<"register" | "otp">("register");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [loadingResend, setLoadingResend] = useState(false);

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !whatsappNumber.trim() || !password) {
      alert("Semua field wajib diisi");
      return;
    }

    if (!email.trim().endsWith("@student.smktelkom-mlg.sch.id")) {
      alert("Gunakan email sekolah @student.smktelkom-mlg.sch.id");
      return;
    }

    try {
      setLoadingRegister(true);

      const response = await fetch(
        `${BASE_API_URL}/api/auth/register-customer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            name: name.trim(),
            whatsappNumber: whatsappNumber.trim(),
            password: password.trim(),
          }),
        }
      );

      const data = await response.json().catch(() => null);
      console.log("REGISTER RESPONSE:", data);

      if (!response.ok) {
        alert(data?.message || "Gagal daftar akun");
        return;
      }

      alert(data?.message || "OTP berhasil dikirim ke email");
      setStep("otp");
    } catch (error) {
      console.error("REGISTER ERROR:", error);
      alert("Gagal terhubung ke server");
    } finally {
      setLoadingRegister(false);
    }
  }

  async function handleVerifyOtp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!otpCode.trim()) {
      alert("Kode OTP wajib diisi");
      return;
    }

    try {
      setLoadingVerify(true);

      const response = await fetch(`${BASE_API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          code: otpCode.trim(),
        }),
      });

      const data = await response.json().catch(() => null);
      console.log("VERIFY OTP RESPONSE:", data);

      if (!response.ok) {
        alert(data?.message || "OTP salah atau expired");
        return;
      }

      const token = data?.data?.accessToken || data?.accessToken;
      const user = data?.data?.user || data?.user;
      const role = user?.role || "CUSTOMER";

      if (!token) {
        alert("Verifikasi berhasil, tapi token tidak ditemukan");
        router.push("/sign-in");
        return;
      }

      document.cookie = "accessToken=; path=/; max-age=0";
      document.cookie = "accesstoken=; path=/; max-age=0";
      document.cookie = "role=; path=/; max-age=0";

      document.cookie = `accessToken=${token}; path=/`;
      document.cookie = `accesstoken=${token}; path=/`;
      document.cookie = `role=${role}; path=/`;

      localStorage.setItem("accessToken", token);
      localStorage.setItem("role", role);

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      alert("Akun berhasil diverifikasi");
      router.push("/customers/dashboard");
    } catch (error) {
      console.error("VERIFY OTP ERROR:", error);
      alert("Gagal terhubung ke server");
    } finally {
      setLoadingVerify(false);
    }
  }

  async function handleResendOtp() {
    if (!email.trim()) {
      alert("Email tidak ditemukan");
      return;
    }

    try {
      setLoadingResend(true);

      const response = await fetch(`${BASE_API_URL}/api/auth/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      const data = await response.json().catch(() => null);
      console.log("RESEND OTP RESPONSE:", data);

      if (!response.ok) {
        alert(data?.message || "Gagal kirim ulang OTP");
        return;
      }

      alert(data?.message || "OTP berhasil dikirim ulang");
    } catch (error) {
      console.error("RESEND OTP ERROR:", error);
      alert("Gagal terhubung ke server");
    } finally {
      setLoadingResend(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fff7f7] px-4 py-10 text-gray-900">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-red-900/10 lg:grid-cols-2">
          <section className="hidden bg-gradient-to-br from-[#991b1b] via-[#7f1d1d] to-[#450a0a] p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl font-black text-[#7f1d1d]">
                  K
                </div>

                <div>
                  <h1 className="text-2xl font-black">KantinKlik</h1>
                  <p className="text-sm text-red-100">
                    Kantin sekolah digital
                  </p>
                </div>
              </div>

              <div className="mt-20">
                <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-3 text-sm font-bold backdrop-blur">
                  <ShieldCheck className="h-4 w-4" />
                  Verifikasi Email Sekolah
                </div>

                <h2 className="max-w-lg text-5xl font-black leading-tight">
                  Daftar akun customer baru.
                </h2>

                <p className="mt-8 max-w-xl text-lg leading-8 text-red-50">
                  Buat akun menggunakan email sekolah, masukkan OTP, lalu masuk
                  ke halaman customer.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur">
              <h3 className="text-lg font-black">KantinKlik</h3>
              <p className="mt-2 text-sm leading-6 text-red-100">
                Satu website untuk pesan makanan kantin sekolah dengan akun
                customer terverifikasi.
              </p>
            </div>
          </section>

          <section className="p-8 md:p-12">
            <Link
              href="/sign-in"
              className="mb-10 inline-flex items-center gap-2 text-sm font-bold text-[#7f1d1d] hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Link>

            {step === "register" ? (
              <>
                <div className="mb-8">
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#7f1d1d]/10 px-4 py-2 text-sm font-black text-[#7f1d1d]">
                    <User className="h-4 w-4" />
                    Daftar Customer
                  </div>

                  <h2 className="text-4xl font-black tracking-tight text-gray-950">
                    Buat Akun Baru
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-gray-500">
                    Isi data berikut untuk membuat akun customer KantinKlik.
                  </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-800">
                      Nama
                    </label>

                    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-4 focus-within:border-[#7f1d1d]">
                      <User className="h-5 w-5 text-gray-400" />
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        type="text"
                        placeholder="Masukkan nama lengkap"
                        className="w-full bg-transparent text-sm outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-800">
                      Email Sekolah
                    </label>

                    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-4 focus-within:border-[#7f1d1d]">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        placeholder="email@student.smktelkom-mlg.sch.id"
                        className="w-full bg-transparent text-sm outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-800">
                      No WhatsApp
                    </label>

                    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-4 focus-within:border-[#7f1d1d]">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <input
                        value={whatsappNumber}
                        onChange={(e) =>
                          setWhatsappNumber(e.target.value.replace(/\D/g, ""))
                        }
                        type="text"
                        placeholder="085xxxxxxxxx"
                        className="w-full bg-transparent text-sm outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-800">
                      Password
                    </label>

                    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-4 focus-within:border-[#7f1d1d]">
                      <Lock className="h-5 w-5 text-gray-400" />

                      <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type={showPassword ? "text" : "password"}
                        placeholder="Masukkan password"
                        className="w-full bg-transparent text-sm outline-none"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loadingRegister}
                    className="w-full rounded-2xl bg-[#7f1d1d] px-5 py-4 text-sm font-black text-white shadow-lg shadow-red-900/20 transition hover:bg-[#991b1b] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loadingRegister ? "Mendaftarkan..." : "Daftar Customer"}
                  </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-500">
                  Sudah punya akun?{" "}
                  <Link
                    href="/sign-in"
                    className="font-black text-[#7f1d1d] hover:underline"
                  >
                    Login di sini
                  </Link>
                </p>
              </>
            ) : (
              <>
                <div className="mb-8">
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#7f1d1d]/10 px-4 py-2 text-sm font-black text-[#7f1d1d]">
                    <ShieldCheck className="h-4 w-4" />
                    Verifikasi OTP
                  </div>

                  <h2 className="text-4xl font-black tracking-tight text-gray-950">
                    Masukkan Kode OTP
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-gray-500">
                    Kode OTP sudah dikirim ke email:
                  </p>

                  <p className="mt-1 text-sm font-black text-[#7f1d1d]">
                    {email}
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-800">
                      Kode OTP
                    </label>

                    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-4 focus-within:border-[#7f1d1d]">
                      <ShieldCheck className="h-5 w-5 text-gray-400" />

                      <input
                        value={otpCode}
                        onChange={(e) =>
                          setOtpCode(e.target.value.replace(/\D/g, ""))
                        }
                        type="text"
                        placeholder="Masukkan kode OTP"
                        className="w-full bg-transparent text-sm outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loadingVerify}
                    className="w-full rounded-2xl bg-[#7f1d1d] px-5 py-4 text-sm font-black text-white shadow-lg shadow-red-900/20 transition hover:bg-[#991b1b] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loadingVerify ? "Memverifikasi..." : "Verifikasi OTP"}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loadingResend}
                  className="mt-5 w-full rounded-2xl border border-[#7f1d1d]/20 bg-white px-5 py-4 text-sm font-black text-[#7f1d1d] transition hover:bg-[#7f1d1d]/5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loadingResend ? "Mengirim ulang..." : "Kirim Ulang OTP"}
                </button>

                <button
                  type="button"
                  onClick={() => setStep("register")}
                  className="mt-4 w-full text-center text-sm font-bold text-gray-500 hover:text-[#7f1d1d]"
                >
                  Ubah data daftar
                </button>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}